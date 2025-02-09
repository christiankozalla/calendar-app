import { globalstyles } from "@/utils/globalstyles";
import { pb } from "@/api/pocketbase";
import type { MessagesResponse } from "@/api/pocketbase-types";
import { useGlobalSearchParams } from "expo-router";
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
import { useEffect, useState, useRef } from "react";

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	messageList: {
		flex: 1,
		padding: 10,
	},
	messageContainer: {
		maxWidth: "80%",
		marginVertical: 5,
		padding: 10,
		borderRadius: 15,
	},
	myMessage: {
		alignSelf: "flex-end",
		backgroundColor: "#007AFF",
	},
	otherMessage: {
		alignSelf: "flex-start",
		backgroundColor: "#E5E5EA",
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
	timestamp: {
		fontSize: 12,
		color: "#8E8E93",
		marginTop: 5,
	},
});

export default function EventChat() {
	const { eventId } = useGlobalSearchParams();
	const [messages, setMessages] = useState<MessagesResponse[]>([]);
	const [inputText, setInputText] = useState("");
	const flatListRef = useRef<FlatList>(null);

	useEffect(() => {
		// Fetch initial messages
		fetchMessages();

		const unsubscribePromise = pb.collection("messages").subscribe(
			"*",
			(collection) => {
				console.log("new incoming message", collection);
				if (collection.action === "create") {
					setMessages((prev) => [
						...prev,
						collection.record as MessagesResponse,
					]);
				}
				// Scroll to bottom on new message
				flatListRef.current?.scrollToEnd({ animated: true });
			},
			{
				filter: `event = ${eventId}`,
			},
		);

		return () => {
			unsubscribePromise.then((unsubscribe) => unsubscribe?.());
		};
	}, [eventId]);

	const fetchMessages = async () => {
		try {
			const response = await pb.collection("messages").getList(1, 50, {
				filter: `event = "${eventId}"`,
				sort: "created",
			});
			setMessages(response.items);
		} catch (error) {
			console.error("Error fetching messages:", error);
		}
	};

	const sendMessage = async () => {
		if (!inputText.trim()) return;

		try {
			const data = {
				text: inputText.trim(),
				event: eventId,
				// author will be set by the backend based on the authenticated user
			};
			await pb.collection("messages").create(data);
			setInputText("");
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const renderMessage = ({ item }: { item: MessagesResponse }) => {
		const isMyMessage = item.author === pb.authStore.record?.id;
		const messageDate = new Date(item.created);
		const timeString = messageDate.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});

		return (
			<View
				style={[
					styles.messageContainer,
					isMyMessage ? styles.myMessage : styles.otherMessage,
				]}
			>
				<Text
					style={isMyMessage ? styles.myMessageText : styles.otherMessageText}
				>
					{item.text}
				</Text>
				<Text style={styles.timestamp}>{timeString}</Text>
			</View>
		);
	};

	return (
		<SafeAreaView style={[globalstyles.safeArea, styles.container]}>
			<StatusBar style="dark" />
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
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
		</SafeAreaView>
	);
}
