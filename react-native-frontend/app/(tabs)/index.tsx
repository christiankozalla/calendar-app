import { useEffect } from "react";
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
import { useRouter } from "expo-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { authenticatedState } from "@/store/Authentication";
import { Header } from "@/components/Header";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import { ConfigureCalendarPanel } from "@/components/ConfigureCalendarPanel";
import { CalendarsState } from "@/store/Calendars";
import { CreateCalendarPanel } from "@/components/CreateCalendarPanel";
import Button from "react-native-ui-lib/button";
import { typography } from "@/utils/typography";

const CalendarList = ({
	calendars,
}: { calendars: CalendarsResponse[] | null }) => {
	const router = useRouter();
	const { push, update } = useSlidingDrawer();

	const createCalendar = () => {
		push({
			state: { isOpen: true },
			component: CreateCalendarPanel,
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.createCalendar}>
				<Text style={typography.h2Light}>Your Calendars</Text>
				<Button
					label="Create"
					size="small"
					backgroundColor="#006600"
					onPress={createCalendar}
				/>
			</View>
			<FlatList
				data={calendars}
				keyExtractor={(item) => item.id}
				renderItem={({ item: c }) => (
					<View style={styles.calendarItem}>
						<View style={styles.calendarHeader}>
							<Text style={styles.calendarTitle}>{c.name}</Text>
							<View style={styles.buttons}>
								<TouchableOpacity
									onPress={() => {
										push({
											state: { isOpen: true },
											props: { calendarId: c.id },
											component: ConfigureCalendarPanel,
										});
									}}
								>
									<Text>Configure</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => {
										router.push(`/${c.id}`);
									}}
								>
									<Text>View</Text>
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
	const isAuthenticated = useRecoilValue(authenticatedState);
	const [calendars, setCalendars] = useRecoilState(CalendarsState);

	useEffect(() => {
		isAuthenticated &&
			pb.authStore.model?.id &&
			pb
				.collection(Collections.Calendars)
				.getFullList<CalendarsResponse<{ users: UsersResponse[] }>>({
					filter: pb.filter("users ~ {:userId}", {
						userId: pb.authStore.model.id,
						expand: "users",
					}),
				})
				.then((r) => {
					setCalendars(r);
				})
				.catch((e) => {
					console.error(e);
				});
	}, []);

	return (
		<View style={styles.container}>
			<Header style={styles.header}>
				<Text style={styles.headerText}>
					Hey {pb.authStore.model?.name ?? "friend"}!
				</Text>
			</Header>
			<CalendarList calendars={calendars} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		flexDirection: "column",
		paddingHorizontal: 8,
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
		flexDirection: "row",
		gap: 8,
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
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
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
