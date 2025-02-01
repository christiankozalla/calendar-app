import {
	useRef,
	useEffect,
	useState,
	type ReactNode,
	type Dispatch,
	type SetStateAction,
	type RefObject,
} from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	SectionList,
	type SectionListData,
} from "react-native";
import { PbOperations } from "@/api/pocketbase";
import type { CalendarsResponse } from "@/api/pocketbase-types";
import { Redirect, Link } from "expo-router";
import { useRecoilValue } from "recoil";
import { AuthState, UserState } from "@/store/Authentication";
import { Header } from "@/components/Header";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { ConfigureCalendarPanel } from "@/components/ConfigureCalendarPanel";
import { CreateCalendarPanel } from "@/components/CreateCalendarPanel";
import { Button } from "@/components/Button";
import { typography } from "@/utils/typography";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { CreateInvitationPanel } from "@/components/CreateInvitationPanel";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";
import { ProfileInfoPanel } from "@/components/ProfileInfoPanel";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

type CalendarListProps = {
	userId: string;
	calendars?: CalendarsResponse<never>[];
	setCalendars: Dispatch<SetStateAction<CalendarsResponse<never>[]>>;
	bottomSheetRef: RefObject<BottomSheetModal>;
	setBottomSheetContent: Dispatch<SetStateAction<ReactNode>>;
};

const EmptyCalendarList = () => (
	<Text>
		You don't have any calendars yet.{"\n"}Click the "Create" button to create
		one.
	</Text>
);

const CalendarList = ({
	userId,
	calendars,
	setCalendars,
	bottomSheetRef,
	setBottomSheetContent,
}: CalendarListProps) => {
	const groupSections = (
		calendars: CalendarsResponse<never>[],
	): SectionListData<CalendarsResponse<never>>[] => {
		const sections = [
			{ title: "Calendars you own", data: [] as CalendarsResponse<never>[] },
			{
				title: "Calendars you're part of",
				data: [] as CalendarsResponse<never>[],
			},
		];

		return calendars.reduce((acc, curr) => {
			if (curr.owner === userId) {
				acc[0].data.push(curr);
			} else {
				acc[1].data.push(curr);
			}
			return acc;
		}, sections);
	};

	if (!calendars || calendars.length === 0) {
		return <EmptyCalendarList />;
	}

	return (
		<View style={styles.container}>
			<SectionList
				sections={groupSections(calendars)}
				keyExtractor={(item) => item.id}
				renderSectionHeader={({ section: { title } }) => (
					<Text style={styles.sectionHeader}>{title}</Text>
				)}
				renderItem={({ item: c }) => (
					<View style={styles.calendarItem}>
						<View style={styles.calendarHeader}>
							<View style={[styles.flexRow, styles.buttons]}>
								<View style={styles.flexRow}>
									<Text style={styles.calendarTitle}>{c.name}</Text>
									<TouchableOpacity
										onPress={() => {
											setBottomSheetContent(
												<ConfigureCalendarPanel calendarId={c.id} setCalendars={setCalendars} />,
											);
											bottomSheetRef.current?.present();
										}}
									>
										<TabBarIcon name="settings-outline" size={18} />
									</TouchableOpacity>
								</View>
								<Link href={`/calendars/${c.id}`}>
									<TabBarIcon name="arrow-forward" size={18} />
								</Link>
							</View>
						</View>
					</View>
				)}
			/>
		</View>
	);
};

export default function HomeScreen() {
	const isAuthenticated = useRecoilValue(AuthState);
	const user = useRecoilValue(UserState);
	const [calendars, setCalendars] = useState<CalendarsResponse<never>[]>([]);
	const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	useEffect(() => {
		if (user?.id) {
			PbOperations.getAllCalendarsOwnedByAndUserIsPartOf(user?.id).then(
				(calendarsResponse) => {
					if ("error" in calendarsResponse) {
						// show error screen
						console.error(calendarsResponse.error);
					} else {
						setCalendars(calendarsResponse.items);
					}
				},
			);
		}
	}, []);

	const createCalendar = async () => {
		const { promise, resolve, reject } =
			Promise.withResolvers<CalendarsResponse<never>>();
			
		setBottomSheetContent(
			<CreateCalendarPanel onSuccess={resolve} onFailure={reject} />,
		);
		bottomSheetRef.current?.present();
		try {
			const newCalendar = await promise;
			setCalendars((prev) => [newCalendar, ...prev]);
			setBottomSheetContent(
				<BottomSheetView
					style={[
						bottomsheetStyles.paddingTop,
						bottomsheetStyles.paddingHorizontal,
						bottomsheetStyles.paddingBottom,
					]}
				>
					<CreateInvitationPanel calendar={newCalendar} />
				</BottomSheetView>,
			);
		} catch (err) {
			// show error screen
		}
	};

	if (!isAuthenticated || !user) {
		return <Redirect href="/login-signup" />;
	}

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />
			<View style={styles.container}>
				<Header style={styles.header}>
					<ProfileInfoPanel />
				</Header>

				<View style={styles.createCalendar}>
					<Text style={typography.h2Light}>Your Calendars</Text>
					<Button
						label="Create"
						size="small"
						textColor="white"
						style={{ backgroundColor: "#006600", borderWidth: 0 }}
						onPress={createCalendar}
					/>
				</View>

				<CalendarList
					userId={user.id}
					calendars={calendars}
					setCalendars={setCalendars}
					setBottomSheetContent={setBottomSheetContent}
					bottomSheetRef={bottomSheetRef}
				/>

				<BottomSheetModal
					ref={bottomSheetRef}
					style={bottomsheetStyles.container}
					enablePanDownToClose
				>
					{bottomSheetContent}
				</BottomSheetModal>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 8,
		backgroundColor: "white",
	},
	header: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		flexGrow: 0,
		marginBottom: 8,
		marginHorizontal: -8,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 2,
	},
	buttons: {
		justifyContent: "space-between",
	},
	flexRow: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	calendarItem: {
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 16,
		overflow: "hidden",
	},
	calendarHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#e6ffe6",
		padding: 12,
	},
	calendarTitle: { fontSize: 18, fontWeight: "bold", color: "#006600" },
	eventItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
	eventTitle: { fontWeight: "500" },
	eventDate: { fontSize: 12, color: "#666" },
	icon: {
		fontSize: 24,
	},
	createCalendar: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 12,
		marginBottom: 12,
	},
	sectionHeader: {
		marginBottom: 12,
	},
});
