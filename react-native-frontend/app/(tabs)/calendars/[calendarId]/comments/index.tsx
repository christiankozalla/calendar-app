import { Fragment, useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	RefreshControl,
	SafeAreaView,
} from "react-native";
import { Link, useGlobalSearchParams } from "expo-router";
import { pb } from "@/api/pocketbase";
import {
	Collections,
	type EventsByMessageResponse,
} from "@/api/pocketbase-types";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";
import { Header } from "@/components/Header";

/**
 * 1. Fetch events that have recent/newest messages
 * 2. Display a list of these events: title, persons, date, most recent message
 * 3. When an event is clicked, display a chat view with messages -> route /(tabs)/calendars/[calendarId]/commments/[eventId] (can be accessed from an EventDetailsPanel, too)
 *
 * So this page only displays a list of events with recent messages, and when an event is clicked, it opens a chat view with messages.
 * This list is not reactive, so it doesn't update in real-time when new messages are added. But we could add a subscription to messages to refetch the list when a new message of that calendar is added.
 */

// OR use toDateString and toTimeString from react-native-frontend/utils/date.ts
const formatDate = (isoString: string): string => {
	const date = new Date(isoString);
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export default function CommentsScreen() {
	const { calendarId } = useGlobalSearchParams<{ calendarId: string }>();
	const [events, setEvents] = useState<EventsByMessageResponse<string>[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const loadEvents = async () => {
		const response = await pb
			.collection(Collections.EventsByMessage)
			.getList<EventsByMessageResponse<string>>(undefined, 100, {
				// TODO: define a filter: what events should a user see in the comments list?
				// 1. Events that he/she is part of?
				// 2. Events that he/she owns (only)?
				filter: pb.filter("calendar = {:calendarId}", { calendarId }),
			});

		setEvents(response.items);
	};

	useEffect(() => {
		loadEvents();
	}, [calendarId]);

	const onRefresh = async () => {
		setRefreshing(true);
		await loadEvents();
		setRefreshing(false);
	};

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />

			<View style={globalstyles.container}>
				<Header style={styles.header}>
					<Text style={styles.headerText}>Comments</Text>
				</Header>

				<FlatList
					data={events}
					contentContainerStyle={styles.eventList}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					renderItem={({ item: event }) => (
						<Link
							href={`/(tabs)/calendars/${calendarId}/comments/${event.id}`}
							style={styles.eventCard}
						>
							<Text style={styles.eventTitle}>
								{event.title || "Untitled Event"}
							</Text>
							{event.most_recent_message_time && (
								<View>
									<Text style={styles.messageTime}>
										{formatDate(event.most_recent_message_time)}
									</Text>
									<Text
										style={styles.messagePreview}
										numberOfLines={3}
										ellipsizeMode="tail"
									>
										{event.most_recent_message_text}
									</Text>
								</View>
							)}
						</Link>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	flex: {
		flex: 1,
	},
	header: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		flexGrow: 0,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 2,
	},
	eventList: {
		padding: 16,
	},
	separator: {
		height: 8,
	},
	eventCard: {
		flexDirection: "column",
		padding: 16,
		backgroundColor: "white",
		borderRadius: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 3,
		gap: 6,
	},
	eventTitle: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 4,
	},
	messageTime: {
		fontSize: 12,
		color: "#666",
		marginBottom: 2,
	},
	messagePreview: {
		fontSize: 14,
		color: "#333",
		lineHeight: 20,
	},
});
