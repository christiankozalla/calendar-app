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
 * 3. When an event is clicked, display a chat view with messages -> route /(tabs)/calendars/[calendarId]/chat/[eventId] (can be accessed from an EventDetailsPanel, too)
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

export default function ChatScreen() {
	const { calendarId } = useGlobalSearchParams<{ calendarId: string }>();
	const [events, setEvents] = useState<EventsByMessageResponse<string>[]>([]);
	const [refreshing, setRefreshing] = useState(false);

	const loadEvents = async () => {
		const response = await pb
			.collection(Collections.EventsByMessage)
			.getList<EventsByMessageResponse<string>>(undefined, 100, {
				// TODO: define a filter: what events should a user see in the chat list?
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

			<View style={styles.container}>
				<Header style={styles.header}>
					<Text style={styles.headerText}>Chat</Text>
				</Header>

				<FlatList
					data={events}
					contentContainerStyle={styles.eventList}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					renderItem={({ item: event }) => (
						<View style={styles.eventCard}>
							<Link
								style={styles.eventTitle}
								href={`/(tabs)/calendars/${calendarId}/chat/${event.id}`}
							>
								{event.title || "Untitled Event"}
							</Link>
							{event.most_recent_message_time && (
								<View>
									<Link
										style={styles.messageTime}
										href={`/(tabs)/calendars/${calendarId}/chat/${event.id}`}
									>
										{formatDate(event.most_recent_message_time)}
									</Link>
									<Link
										style={styles.messagePreview}
										numberOfLines={3}
										ellipsizeMode="tail"
										href={`/(tabs)/calendars/${calendarId}/chat/${event.id}`}
									>
										{event.most_recent_message_text}
									</Link>
								</View>
							)}
						</View>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
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
	messageSeparator: {
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
	chatContainer: {
		flex: 1,
		padding: 16,
	},
	chatTitle: {
		fontSize: 20,
		fontWeight: "600",
		marginBottom: 16,
	},
	messageList: {
		paddingBottom: 16,
	},
	messageContainer: {
		padding: 12,
		backgroundColor: "#f2f2f2",
		borderRadius: 8,
	},
	authorName: {
		fontSize: 14,
		fontWeight: "600",
	},
	messageText: {
		fontSize: 14,
		marginTop: 4,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 16,
		gap: 8,
	},
	input: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		padding: 8,
		maxHeight: 100,
	},
	sendButton: {
		backgroundColor: "#007AFF",
		padding: 12,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	sendButtonDisabled: {
		backgroundColor: "#ccc",
	},
	sendButtonText: {
		color: "white",
		fontWeight: "600",
	},
});
