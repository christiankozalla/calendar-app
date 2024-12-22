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
	FlatList,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { pb } from "@/api/pocketbase";
import {
	type CalendarsResponse,
	Collections,
	type UsersResponse,
} from "@/api/pocketbase-types";
import { Redirect, useRouter } from "expo-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { AuthState } from "@/store/Authentication";
import { Header } from "@/components/Header";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { ConfigureCalendarPanel } from "@/components/ConfigureCalendarPanel";
import { CalendarsState } from "@/store/Calendars";
import { CreateCalendarPanel } from "@/components/CreateCalendarPanel";
import Button from "react-native-ui-lib/button";
import { typography } from "@/utils/typography";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateInvitationPanel } from "@/components/CreateInvitationPanel";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";
import { ProfileInfoPanel } from "@/components/ProfileInfoPanel";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

type CalendarListProps = {
	calendars: CalendarsResponse[] | null;
	bottomSheetRef: RefObject<BottomSheetModal>;
	setBottomSheetContent: Dispatch<SetStateAction<ReactNode>>;
};

type CalendarsWithUsers = CalendarsResponse<{ users: UsersResponse[] }>;

const CalendarList = ({
	calendars,
	bottomSheetRef,
	setBottomSheetContent,
}: CalendarListProps) => {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<FlatList
				data={calendars}
				keyExtractor={(item) => item.id}
				renderItem={({ item: c }) => (
					<View style={styles.calendarItem}>
						<View style={styles.calendarHeader}>
							<View style={[styles.flexRow, styles.buttons]}>
								<View style={styles.flexRow}>
									<Text style={styles.calendarTitle}>{c.name}</Text>
									<TouchableOpacity
										onPress={() => {
											setBottomSheetContent(
												<ConfigureCalendarPanel calendarId={c.id} />,
											);
											bottomSheetRef.current?.present();
										}}
									>
										<TabBarIcon name="settings-outline" size={18} />
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									onPress={() => {
										router.push(`/calendars/${c.id}`);
									}}
								>
									<TabBarIcon name="arrow-forward" size={18} />
								</TouchableOpacity>
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
	const [calendars, setCalendars] = useRecoilState(CalendarsState);
	const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	useEffect(() => {
		isAuthenticated &&
			pb.authStore.record?.id &&
			pb
				.collection(Collections.Calendars)
				.getFullList<CalendarsWithUsers>({
					filter: pb.filter("users ~ {:userId}", {
						userId: pb.authStore.record.id,
					}),
					expand: "users",
				})
				.then((r) => {
					setCalendars(r);
				})
				.catch((e) => {
					console.error(e);
				});
	}, []);

	const createCalendar = async () => {
		const { promise, resolve, reject } =
			Promise.withResolvers<CalendarsWithUsers>();
		setBottomSheetContent(
			<CreateCalendarPanel onSuccess={resolve} onFailure={reject} />,
		);
		bottomSheetRef.current?.present();
		try {
			const newCalendar = await promise;
			setBottomSheetContent(<CreateInvitationPanel calendar={newCalendar} />);
		} catch (err) {
			// show error dialog
		}
	};

	if (!isAuthenticated) {
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
						backgroundColor="#006600"
						onPress={createCalendar}
					/>
				</View>

				<CalendarList
					calendars={calendars}
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
	noEvents: { padding: 12 },
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
});
