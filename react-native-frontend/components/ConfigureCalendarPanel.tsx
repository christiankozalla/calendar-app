import {
	View,
	Text,
	ActivityIndicator,
	StyleSheet,
	TouchableOpacity,
	Alert,
} from "react-native";
import {
	Collections,
	type PersonsResponse,
	type CalendarsResponse,
} from "@/api/pocketbase-types";
import { pb, PbOperations } from "@/api/pocketbase";
import { Fragment, useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useRecoilState } from "recoil";
import { CalendarsState, type CalendarsStateType } from "@/store/Calendars";
import { CreateInvitationPanel } from "./CreateInvitationPanel";
import {
	BottomSheetTextInput,
	BottomSheetFlatList,
	useBottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

type Props = {
	calendarId: string;
	setCalendars: Dispatch<SetStateAction<CalendarsResponse<never>[]>>;
};

type PersonWithUserId = PersonsResponse & { user: string };

export const ConfigureCalendarPanel = ({
	calendarId,
	setCalendars: setLocalCalendars,
}: Props) => {
	const [calendars, setCalendars] = useRecoilState(CalendarsState);
	const [calendarName, setCalendarName] = useState(
		calendars[calendarId]?.name || "",
	);
	const [loading, setLoading] = useState(false);
	const { dismiss } = useBottomSheetModal();

	useEffect(() => {
		(async () => {
			setLoading(true);
			const calendarFromState = calendars[calendarId];

			if (
				!calendarFromState?.expand ||
				!hasRequiredProperties(calendarFromState.expand)
			) {
				const calendarResponse = await PbOperations.getCalendarDetails(
					calendarId,
					setCalendars,
				);

				if ("error" in calendarResponse) {
					// show error screen
					console.error("ConfigureCalendarPanel", calendarResponse.error);
					setCalendars((prev) => {
						const { [calendarId]: _, ...rest } = prev;
						return rest;
					});
				}
			}
			setLoading(false);
		})();
	}, [calendarId]);

	const updateCalendar = useCallback(async () => {
		try {
			setLoading(true);
			const updatedCalendar = await pb
				.collection(Collections.Calendars)
				.update<CalendarsStateType[string]>(
					calendarId,
					{ name: calendarName },
					{ expand: "users,owner,persons" },
				);
			setCalendars((prev) => ({ ...prev, [calendarId]: updatedCalendar }));
		} catch (err) {
			console.error("ConfigureCalendarPanel", err);
		} finally {
			setLoading(false);
		}
	}, [calendars, calendarId, calendarName]);

	const deleteCalendarHandler = useCallback(() => {
		Alert.alert(
			"Confirm Delete",
			`Are you sure you want to delete ${calendars[calendarId]?.name || "this calendar"}?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					onPress: () =>
						PbOperations.deleteCalendar(calendarId, setCalendars).then(() => {
							setLocalCalendars((prev) =>
								prev.filter((c) => c.id !== calendarId),
							);
							dismiss();
						}),
					style: "destructive",
				},
			],
			{ cancelable: true },
		);
	}, [calendarId]);

	const removePersonFromCalendarHandler = (p: PersonsResponse) => () => {
		Alert.alert(
			"Confirm Remove",
			`Are you sure you want to remove ${p.name || p.user ? "this user" : "this person"} from the calendar?`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Remove",
					onPress: () => removePersonFromCalendar(p),
					style: "destructive",
				},
			],
			{ cancelable: true },
		);
	};

	const removePersonFromCalendar = async (p: PersonsResponse) => {
		setLoading(true);
		if (p.user) {
			PbOperations.removeUserFromCalendar(
				calendars[calendarId].id,
				p.user,
				p.id,
				setCalendars,
			).finally(() => {
				setLoading(false);
			});
		} else {
			// if it is an ordinary person
			PbOperations.removePersonFromCalendar(
				calendars[calendarId].id,
				p.id,
				setCalendars,
			).finally(() => {
				setLoading(false);
			});
		}
	};

	if (loading) {
		return <ActivityIndicator />;
	}

	if (!calendars[calendarId]) {
		return <Text>Calendar not found</Text>;
	}

	const ownersName =
		calendars[calendarId]?.expand?.owner?.id === pb.authStore.record?.id // is the owner the current user?
			? "you"
			: (calendars[calendarId].expand?.persons?.find(
					(p) => p.user === calendars[calendarId]?.expand?.owner?.id,
				)?.name ?? // or found in the persons list?
				"a user without a name");

	return (
		<BottomSheetView
			style={[
				bottomsheetStyles.paddingTop,
				bottomsheetStyles.paddingHorizontal,
				bottomsheetStyles.paddingBottom,
			]}
		>
			<View style={styles.header}>
				<BottomSheetTextInput
					style={styles.title}
					value={calendars[calendarId]?.name}
					onChangeText={setCalendarName}
					autoCorrect={false}
					onBlur={updateCalendar}
				/>
				<TouchableOpacity
					style={styles.deleteButton}
					onPress={deleteCalendarHandler}
				>
					<TabBarIcon name="trash-outline" style={styles.icon} />
				</TouchableOpacity>
			</View>
			<Fragment>
				<Text style={styles.owner}>Created by {ownersName}</Text>

				<BottomSheetFlatList
					ListEmptyComponent={<Text>No persons in the calendar yet...</Text>}
					keyExtractor={(p) => p.id}
					data={calendars[calendarId].expand?.persons}
					renderItem={({ item: p }: { item: PersonWithUserId }) => (
						<View style={styles.userListItem}>
							<Text style={styles.userName}>
								{p.name}{" "}
								{p.user && p.user === calendars[calendarId].owner
									? "(owner)"
									: pb.authStore.record?.id === p.user
										? "(you)"
										: "(user)"}
							</Text>
							{/* if dont display the delete button if it is the owners person - but maybe we want to allow the owner of a calendar to decide not to "participate" in a calendar, i.e. not have its userPerson in the calendar...! */}
							{p.user !== calendars[calendarId].owner && (
								<TouchableOpacity
									style={styles.deleteButton}
									onPress={removePersonFromCalendarHandler(p)}
								>
									<TabBarIcon name="remove-circle" style={styles.icon} />
								</TouchableOpacity>
							)}
						</View>
					)}
				/>
			</Fragment>

			<CreateInvitationPanel calendar={calendars[calendarId]} />
		</BottomSheetView>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	owner: {
		fontWeight: "bold",
		marginBottom: 16,
	},
	userName: {
		marginLeft: 16,
	},
	userListItem: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		fontSize: 24,
		padding: 4,
	},
	icon: {
		fontSize: 16,
	},
	button: {
		marginTop: 16,
		backgroundColor: "blue",
		padding: 8,
		borderRadius: 4,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	saveButton: {
		backgroundColor: "blue",
		color: "white",
	},
	saveButtonText: {
		fontWeight: "bold",
		textAlign: "center",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 8,
		marginBottom: 12,
	},
	deleteButton: {
		paddingLeft: 12,
		paddingBottom: 12,
	},
});

function hasRequiredProperties(obj: unknown): boolean {
	return (
		typeof obj === "object" &&
		obj !== null &&
		"users" in obj &&
		"owner" in obj &&
		"persons" in obj
	);
}
