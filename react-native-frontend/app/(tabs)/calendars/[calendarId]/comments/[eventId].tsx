import { globalstyles } from "@/utils/globalstyles";
import { pb } from "@/api/pocketbase";
import {
	Collections,
	type EventsResponse,
	type MessagesResponse,
	type PersonsResponse,
} from "@/api/pocketbase-types";
import { Link, useGlobalSearchParams } from "expo-router";
import {
	View,
	Text,
	SafeAreaView,
	FlatList,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef, Fragment } from "react";
import { Header } from "@/components/Header";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Avatar } from "@/components/Avatar";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	messageList: {
		flex: 1,
		padding: 10,
	},
	messageContainer: {
		position: "relative",
		maxWidth: "80%",
		marginTop: 6,
		marginBottom: 16,
		padding: 10,
		borderRadius: 15,
	},
	myMessage: {
		alignSelf: "flex-end",
		backgroundColor: "#007AFF",
		marginRight: 6,
	},
	otherMessage: {
		alignSelf: "flex-start",
		backgroundColor: "#E5E5EA",
		marginLeft: 6,
	},
	myMessageText: {
		color: "white",
	},
	otherMessageText: {
		color: "black",
	},
	inputContainer: {
		flexDirection: "row",
		padding: 10,
		borderTopWidth: 1,
		borderTopColor: "#E5E5EA",
		backgroundColor: "white",
	},
	input: {
		flex: 1,
		marginRight: 10,
		padding: 10,
		borderWidth: 1,
		borderColor: "#E5E5EA",
		borderRadius: 20,
		backgroundColor: "white",
	},
	sendButton: {
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
	},
	sendButtonText: {
		color: "#007AFF",
		fontWeight: "bold",
	},
	messageMetaInfoContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	messageMetaInfo: {
		fontSize: 10,
		marginTop: 5,
		color: "#aaa",
	},
	myMetaMessageInfoContainer: {
		justifyContent: "flex-end",
		marginRight: 24,
	},
	otherMetaMessageInfoContainer: {
		justifyContent: "flex-start",
		marginLeft: 24,
	},
	avatar: {
		position: "absolute",
		zIndex: 1,
	},
	myAvatar: {
		top: -15,
		right: -6,
		left: undefined,
	},
	otherAvatar: {
		top: -15,
		left: -6,
		right: undefined,
	},
	header: {
		justifyContent: "flex-start",
		gap: 12,
	},
	link: {
		marginTop: 4,
		paddingHorizontal: 12,
	},
});

type PersonsState = { [userId: string]: PersonsResponse };

export default function EventComments() {
	const { calendarId, eventId } = useGlobalSearchParams();
	const [event, setEvent] =
		useState<EventsResponse<{ persons: PersonsResponse[] }>>();
	const [messages, setMessages] = useState<MessagesResponse[]>([]);
	const [persons, setPersons] = useState<PersonsState>({});
	const [inputText, setInputText] = useState("");
	const flatListRef = useRef<FlatList>(null);

	useEffect(() => {
		// Fetch initial messages
		if (typeof eventId === "string") {
			fetchMessages();
			fetchEvent(eventId).then((event) => {
				if (event) {
					setPersons(
						event?.expand?.persons.reduce((state, person) => {
							if (person.user)
								// is a UserPerson, i.e. a person representing a user account.
								state[person.user] = person;
							return state;
						}, {} as PersonsState) ?? {},
					);
					setEvent(event);
				}
			});
			const unsubscribePromise = pb
				.collection("messages")
				.subscribe<MessagesResponse>(
					"*",
					(collection) => {
						if (collection.action === "create") {
							setMessages((prev) => [
								...prev.filter((m) => m.id !== collection.record.id),
								collection.record,
							]);
						}
						// Scroll to bottom on new message
						flatListRef.current?.scrollToEnd({ animated: true });
					},
					{
						filter: pb.filter("event = {:eventId}", { eventId }),
					},
				);

			flatListRef.current?.scrollToEnd({ animated: true });

			return () => {
				unsubscribePromise.then((unsubscribe) => unsubscribe?.());
			};
		}
	}, [eventId]);

	const fetchMessages = async () => {
		try {
			const response = await pb
				.collection(Collections.Messages)
				.getList(1, 50, {
					filter: pb.filter("event = {:eventId}", { eventId }),
					sort: "created",
				});
			setMessages(response.items);
		} catch (error) {
			console.error("Error fetching messages:", error);
		}
	};

	const fetchEvent = async (eventId: string) => {
		try {
			return await pb
				.collection(Collections.Events)
				.getOne<EventsResponse<{ persons: PersonsResponse[] }>>(eventId, {
					expand: "persons",
				});
		} catch (error) {
			console.error("Error fetching user persons:", error);
		}
	};

	const sendMessage = async () => {
		if (!inputText.trim()) return;

		try {
			await pb.collection(Collections.Messages).create({
				text: inputText.trim(),
				event: eventId,
				author: pb.authStore.record?.id,
			});
			setInputText("");
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const renderMessage = ({ item }: { item: MessagesResponse }) => {
		const isMyMessage = item.author === pb.authStore.record?.id;
		const userName = isMyMessage
			? "You"
			: persons[item.author]?.name || "Anonymous"; //  maybe we could show the email address as a fallback (or only the first part of the email address...)
		const avatarUri = persons[item.author]?.avatar;
		const messageDate = new Date(item.created);
		const timeString = messageDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

		return (
			<Fragment>
				<View
					style={[
						styles.messageMetaInfoContainer,
						isMyMessage
							? styles.myMetaMessageInfoContainer
							: styles.otherMetaMessageInfoContainer,
					]}
				>
					<Text style={styles.messageMetaInfo}>
						{userName} {timeString}
					</Text>
				</View>
				<View
					style={[
						styles.messageContainer,
						isMyMessage ? styles.myMessage : styles.otherMessage,
					]}
				>
					<Avatar
						uri={avatarUri}
						size="small"
						style={[
							styles.avatar,
							isMyMessage ? styles.myAvatar : styles.otherAvatar,
						]}
					/>
					<Text
						style={isMyMessage ? styles.myMessageText : styles.otherMessageText}
					>
						{item.text}
					</Text>
				</View>
			</Fragment>
		);
	};

	return (
		<SafeAreaView style={[globalstyles.safeArea, styles.container]}>
			<StatusBar style="dark" />
			<View style={globalstyles.container}>
				<Header style={[globalstyles.header, styles.header]}>
					<Link
						href={`/calendars/${calendarId as string}/chat`}
						style={styles.link}
					>
						<TabBarIcon name="arrow-back" size={18} />
					</Link>
					<Text style={globalstyles.headerText}>{event?.title}</Text>
				</Header>
				<KeyboardAvoidingView
					behavior="padding"
					style={styles.container}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					<FlatList
						ref={flatListRef}
						data={messages}
						renderItem={renderMessage}
						keyExtractor={(item) => item.id}
						style={styles.messageList}
						onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
						onLayout={() => flatListRef.current?.scrollToEnd()}
					/>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							value={inputText}
							onChangeText={setInputText}
							placeholder="Type a message..."
							placeholderTextColor="#999"
							multiline
						/>
						<TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
							<Text style={styles.sendButtonText}>Send</Text>
						</TouchableOpacity>
					</View>
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	);
}
