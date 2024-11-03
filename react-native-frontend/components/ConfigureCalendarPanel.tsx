import {
	View,
	Text,
	ActivityIndicator,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	TextInput,
} from "react-native";
import {
	Collections,
	type UsersResponse,
	type CalendarsResponse,
} from "@/api/pocketbase-types";
import { pb } from "@/api/pocketbase";
import { useCallback, useEffect, useState } from "react";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { useRecoilState, useSetRecoilState } from "recoil";
import { CalendarsState } from "@/store/Calendars";
import { CreateInvitationPanel } from "./CreateInvitationPanel";
import { updateCalendarState } from "@/utils/calendar";
import Button from "react-native-ui-lib/button";

type Props = {
	calendarId: string;
	closeSlidingDrawer?: () => void;
};

const removeUserFromCalendar = async (
	calendar: CalendarsResponse<{ users: UsersResponse[] }>,
	userId: string,
) => {
	if (!calendar.expand) {
		return;
	}
	return await pb
		.collection(Collections.Calendars)
		.update<CalendarsResponse<{ users: UsersResponse[] }>>(calendar.id, {
			users: calendar.expand?.users.filter((u) => u.id !== userId),
		});
};

const deleteCalendar = async (calendarId: string) => {
	await pb.collection(Collections.Calendars).delete(calendarId);
};

export const ConfigureCalendarPanel = ({ calendarId, closeSlidingDrawer }: Props) => {
	const [calendars, setCalendars] = useRecoilState(CalendarsState);
	const [loading, setLoading] = useState(false);
	const [calendar, setCalendar] = useState<
		| CalendarsResponse<{
				users: UsersResponse[];
		  }>
		| undefined
		| null
	>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const calendarFromState = calendars.find((c) => c.id === calendarId);
				if (calendarFromState) {
					setCalendar(calendarFromState);
				} else {
					const calendar = await pb
						.collection<CalendarsResponse<{ users: UsersResponse[] }>>(
						Collections.Calendars,
					)
					.getOne(calendarId, { expand: "users" });

					setCalendar(calendar);
					setCalendars((prev) => updateCalendarState(prev, calendar));
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		})();
	}, [calendarId]);

	const updateCalendar = useCallback(async () => {
		if (!calendar) {
			return;
		}
		try {
			const updatedCalendar = await pb
				.collection(Collections.Calendars)
				.update<CalendarsResponse<{ users: UsersResponse[] }>>(
					calendar.id,
					{ name: calendar.name },
					{ expand: "users" },
				);
			setCalendar(updatedCalendar);
			setCalendars((prev) => updateCalendarState(prev, updatedCalendar));
		} catch (err) {
			console.error(err);
		} finally {
		}
	}, [calendar]);

	if (loading) {
		return <ActivityIndicator />;
	}

	if (!calendar) {
		return <Text>Calendar not found</Text>;
	}

	const owner = calendar.expand?.users.find((u) => u.id === calendar.owner);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TextInput
					style={styles.title}
					value={calendar?.name}
					onChangeText={(text) => {
						setCalendar((prev) => (prev ? { ...prev, name: text } : null));
					}}
					autoCorrect={false}
					onBlur={updateCalendar}
				/>
			</View>
			<Text style={styles.owner}>Created by {owner?.name}</Text>
			{owner &&
				(calendar.expand?.users || []).filter((u) => u.id !== owner?.id)
					.length > 0 && (
					<FlatList
						keyExtractor={(u) => u.id}
						data={calendar?.expand?.users.filter((u) => u.id !== owner?.id)}
						renderItem={({ item: u }: { item: UsersResponse }) => (
							<View style={styles.userListItem}>
								<Text style={styles.userName}>{u.name}</Text>
								{owner && owner.id !== u.id && (
									<TouchableOpacity
										onPress={() => {
											setLoading(true);
											removeUserFromCalendar(calendar, u.id)
												.then((updatedCalendar) => {
													setCalendar(updatedCalendar);
												})
												.finally(() => {
													setLoading(false);
												});
										}}
									>
										<TabBarIcon name="remove-circle" style={styles.icon} />
									</TouchableOpacity>
								)}
							</View>
						)}
					/>
				)}

			<CreateInvitationPanel calendar={calendar} />

			<Button
				label="Delete Calendar"
				backgroundColor="#900"
				onPress={() =>
					deleteCalendar(calendarId)
						.then(() =>
							setCalendars((prev) => prev.filter((c) => c.id !== calendarId)),
						)
						.finally(() => {
							closeSlidingDrawer?.();
						})
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: 4,
	},
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
	},
	userName: {
		marginLeft: 16,
	},
	userListItem: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		fontSize: 16,
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
});
