import React, { useEffect, useState } from "react";
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
	type EventsResponse,
} from "@/api/pocketbase-types";
import { formatEventDate } from "@/utils/dateFormatting";
import { CreateInvitationPanel } from "@/components/CreateInvitationPanel";

const CalendarItem = ({
	calendar,
	nextEvents,
}: {
	calendar: CalendarsResponse;
	nextEvents?: EventsResponse[];
}) => (
	<View style={styles.calendarItem}>
		<View style={styles.calendarHeader}>
			<Text style={styles.calendarTitle}>{calendar.name}</Text>
		</View>
		<FlatList
			data={nextEvents}
			renderItem={({ item: event }) => (
				<View style={styles.eventItem}>
					<Text style={styles.eventTitle}>{event.title}</Text>
					<Text style={styles.eventDate}>
						{formatEventDate(event.startDatetime)}
					</Text>
				</View>
			)}
			ListEmptyComponent={
				<Text style={styles.noEvents}>No upcoming events...</Text>
			}
			keyExtractor={(item) => item.id}
		/>
	</View>
);

const CalendarList = ({
	calendars,
}: { calendars: CalendarsResponse[] | null }) => {
	const [events, setEvents] = useState<EventsResponse[]>();

    useEffect(() => {
		const calendarIds = calendars?.map((c) => c.id);
		if (calendarIds) {
			const filter = pb.filter(
				`calendar = '${calendarIds?.join("' || calendar = ")}' && startDatetime > {:now}`,
				{ now: new Date() },
			);
			pb.collection(Collections.Events)
				.getList(1, 3, { filter })
				.then((res) => {
					setEvents(res.items);
				});
		}
	}, [calendars]);


	return (
		<FlatList
			data={calendars}
			renderItem={({ item: c }) => (
				<TouchableOpacity
					onPress={() => {
						/* Navigate to calendar */
					}}
				>
					<CalendarItem
						calendar={c}
						nextEvents={events?.filter((e) => e.calendar === c.id)}
					/>
				</TouchableOpacity>
			)}
			keyExtractor={(item) => item.id}
		/>
	);
};

export const HomeScreen = () => {
	const [calendars, setCalendars] = useState<CalendarsResponse[]>([]);

	useEffect(() => {
		pb.collection(Collections.Calendars)
			.getFullList({
				filter: pb.filter("users ~ {:userId}", {
					userId: pb.authStore.record?.id,
				}),
			})
			.then((r) => {
				setCalendars(r);
			});
	}, []);

	return (
		<View style={styles.container}>
			<Text style={styles.heading}>
				Welcome {pb.authStore.record?.name ?? "friend"}!
			</Text>
			<Text style={styles.subheading}>Your Calendars</Text>

			<CalendarList calendars={calendars} />

			<CreateInvitationPanel calendars={calendars} />

			<View>
				<Text>Add people in your family</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { padding: 16 },
	heading: { fontSize: 28, fontWeight: "bold", marginBottom: 16 },
	subheading: { fontSize: 24, marginBottom: 24 },
	calendarItem: {
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 16,
		overflow: "hidden",
	},
	calendarHeader: {
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
});
