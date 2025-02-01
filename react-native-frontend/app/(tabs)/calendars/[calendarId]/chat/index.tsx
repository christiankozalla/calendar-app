import { Fragment, useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	RefreshControl,
	SafeAreaView,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { pb } from "@/api/pocketbase";
import {
	Collections,
	type EventsByMessageResponse,
	type MessagesResponse,
} from "@/api/pocketbase-types";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";

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
	const { calendarId } = useLocalSearchParams<{ calendarId: string }>();
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

	useEffect(() => {
		const unsubscribePromise = pb
			.collection(Collections.Messages)
			.subscribe<MessagesResponse<never>>(
				"*",
				(collection) => {
					console.log(
						"messages for this calendar have changed",
						collection.action,
						collection.record,
					);
					console.log("updating event list");
					onRefresh();
				},
				{
					filter: pb.filter("event.calendar = {:calendarId}", { calendarId }),
				},
			);

		return () => {
			unsubscribePromise.then((unsubscribe) => unsubscribe?.());
		};
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
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Chat</Text>
				</View>

				<FlatList
					data={events}
					contentContainerStyle={styles.eventList}
					ItemSeparatorComponent={() => <View style={styles.separator} />}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					renderItem={({ item: event }) => (
						<Link
							style={styles.eventCard}
							href={`/(tabs)/calendars/${calendarId}/chat/${event.id}`}
						>
							<Text style={styles.eventTitle}>
								{event.title || "Untitled Event"}
							</Text>
							{event.most_recent_message_time ? (
								<Fragment>
									<Text>{formatDate(event.most_recent_message_time)}</Text>
									<Text>{event.most_recent_message_text}</Text>
								</Fragment>
							) : (
								<Text>No messages yet</Text>
							)}
						</Link>
					)}
				/>
			</View>
		</SafeAreaView>
	);
}

// function ChatView({
// 	messages,
// 	eventId,
// 	eventTitle,
// }: {
// 	messages: MessagesResponse<{ author: UsersRecord }>[];
// 	eventId: string;
// 	eventTitle?: string;
// }) {
// 	const [messageText, setMessageText] = useState("");
// 	const flatListRef = useRef<FlatList>(null);

// 	const sendMessage = async () => {
// 		if (!messageText.trim()) return;

// 		await pb.collection("messages").create({
// 			text: messageText.trim(),
// 			author: pb.authStore.model?.id,
// 			event: eventId,
// 		});

// 		setMessageText("");
// 	};

// 	useEffect(() => {
// 		flatListRef.current?.scrollToEnd({ animated: true });
// 	}, [messages]);

// 	return (
// 		<KeyboardAvoidingView
// 			behavior={Platform.OS === "ios" ? "padding" : "height"}
// 			style={styles.flex}
// 		>
// 			<View style={styles.chatContainer}>
// 				<Text style={styles.chatTitle}>{eventTitle || "Untitled Event"}</Text>

// 				<FlatList
// 					ref={flatListRef}
// 					data={messages}
// 					style={styles.flex}
// 					contentContainerStyle={styles.messageList}
// 					ItemSeparatorComponent={() => (
// 						<View style={styles.messageSeparator} />
// 					)}
// 					renderItem={({ item: message }) => (
// 						<View style={styles.messageContainer}>
// 							<Text style={styles.authorName}>
// 								{message.expand?.author?.name || "Unknown User"}
// 							</Text>
// 							<Text style={styles.messageText}>{message.text}</Text>
// 							<Text style={styles.messageTime}>
// 								{formatDate(message.created)}
// 							</Text>
// 						</View>
// 					)}
// 				/>

// 				<View style={styles.inputContainer}>
// 					<TextInput
// 						style={styles.input}
// 						value={messageText}
// 						onChangeText={setMessageText}
// 						placeholder="Type your message..."
// 						multiline
// 					/>
// 					<TouchableOpacity
// 						style={[
// 							styles.sendButton,
// 							!messageText.trim() && styles.sendButtonDisabled,
// 						]}
// 						disabled={!messageText.trim()}
// 						onPress={sendMessage}
// 					>
// 						<Text style={styles.sendButtonText}>Send</Text>
// 					</TouchableOpacity>
// 				</View>
// 			</View>
// 		</KeyboardAvoidingView>
// 	);
// }

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	flex: {
		flex: 1,
	},
	header: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "600",
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
	},
	eventTitle: {
		fontSize: 16,
		fontWeight: "500",
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
	messageTime: {
		fontSize: 12,
		color: "#666",
		marginTop: 4,
		textAlign: "right",
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
