import { pb } from "@/api/pocketbase";
import {
	Collections,
	type EventsByMessageResponse,
	type ChatResponse,
	type MessagesResponse,
	type UsersRecord,
} from "@/api/pocketbase-types";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Heading, TextArea, Text, Strong } from "@radix-ui/themes";
import { Header } from "@/components/Header";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";

type MessagesGroupedByEventId = {
	[eventId: string]: Partial<ChatResponse<{ author: UsersRecord }>>[];
};

const groupMessagesByEventId = (
	messages: ChatResponse<{ author: UsersRecord }>[],
): MessagesGroupedByEventId => {
	return messages.reduce(
		(
			acc: MessagesGroupedByEventId,
			message: ChatResponse<{ author: UsersRecord }>,
		) => {
			const { event_id } = message;
			if (!acc[event_id]) {
				acc[event_id] = [];
			}
			acc[event_id].push(message);
			return acc;
		},
		{},
	);
};

const formatDate = (isoString: string): string => {
	const date = new Date(isoString);
	return date.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
};

export const Component = () => {
	const calendarId = useParams().calendarId;

	const [events, setEvents] = useState<EventsByMessageResponse[]>([]);
	const [messages, setMessages] = useState<MessagesGroupedByEventId>({});
	const [activeEvent, setActiveEvent] = useState<EventsByMessageResponse>();
	const { push, update } = useSlidingDrawer();
	const slidingDrawerRef = useRef<string>();

	useEffect(() => {
		pb.collection(Collections.EventsByMessage)
			.getList(undefined, 100, {
				filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				expand: "author", // the users can be expanded in the global calendar store and then referenced here. so expand on every single message is not necessary
			})
			.then((response) => {
				setEvents(response.items);
			});
	}, [calendarId]);

	// I need to manage messages on the page-level, so that new messages pop up even if not chat drawer is opened/active...
	useEffect(() => {
		pb.collection(Collections.Messages).subscribe<
			MessagesResponse<{ author: UsersRecord }>
		>(
			"*",
			(collection) => {
				switch (collection.action) {
					case "create":
						setMessages((messages) => {
							messages[collection.record.event] = [
								...(messages[collection.record.event] || []).filter(
									(m) => m.id !== collection.record.id,
								),
								collection.record,
							];
							return { ...messages };
						});
						break;

					case "update":
						console.log("todo: implement update messages");
						break;

					case "delete":
						console.log("todo: implement delete messages");
						break;

					default:
						console.error("Unhandled action:", collection.action);
				}
			},
			{
				filter: pb.filter("event.calendar = {:calendarId}", { calendarId }),
				expand: "author",
			},
		);

		return () => {
			pb.collection(Collections.Messages).unsubscribe("*");
		};
	}, [calendarId]);

	const handleEventClick = (eventId: string, eventTitle?: string) => {
		pb.collection(Collections.Messages)
			.getList<MessagesResponse<{ author: UsersRecord }>>(undefined, 20, {
				filter: pb.filter("event = {:eventId}", { eventId }),
				expand: "author",
			})
			.then((response) => {
				setMessages((messages) => {
					messages[eventId] = response.items.sort(
						(a, b) => +new Date(a.created) - +new Date(b.created),
					);

					return { ...messages };
				});
				setActiveEvent(events.find((event) => event.id === eventId));
			});
	};

	useEffect(() => {
		if (activeEvent?.id) {
			if (slidingDrawerRef.current) {
				update({
					id: slidingDrawerRef.current,
					state: { isOpen: true },
					props: {
						messages: messages[activeEvent.id],
						eventId: activeEvent?.id,
						eventTitle: activeEvent?.title,
					},
					component: Chat,
				});
			} else {
				slidingDrawerRef.current = push({
					state: { isOpen: true },
					props: {
						messages: messages[activeEvent.id],
						eventId: activeEvent?.id,
						eventTitle: activeEvent?.title,
					},
					component: Chat,
				});
			}
		}
	}, [messages, activeEvent, push, update]);

	return (
		<div className="px-2 mb-32">
			<Header className="-mx-2">
				<Heading size="3">Chat</Heading>
			</Header>

			{/* Event List */}
			<div className="space-y-2 mt-2">
				{events.map((event) => (
					<button
						type="button"
						key={event.id}
						className="block w-full p-4 border rounded-lg shadow text-left"
						onClick={() => handleEventClick(event.id, event.title)}
					>
						<h2 className="text-xl font-semibold">
							{event.title || "Untitled Event"}
						</h2>
					</button>
				))}
			</div>
		</div>
	);
};

const Chat = ({
	messages,
	eventId,
	eventTitle,
}: {
	messages: MessagesResponse<{ author: UsersRecord }>[];
	eventId: string;
	eventTitle?: string;
}) => {
	const [messageText, setMessageText] = useState("");

	const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessageText(e.target.value);
	};

	return (
		<>
			<h3 className="text-xl font-semibold">
				{eventTitle || "Untitled Event"}
			</h3>
			<ol className="mt-2 space-y-2">
				{messages?.map((message) => (
					<li
						key={message.id}
						className="flex flex-col gap-0.5 ml-4 rounded p-2 bg-gray-200"
					>
						<Text size="2" as="div">
							<Strong>
								{message.expand?.author?.name || "User, has no name"}
							</Strong>
						</Text>

						<Text size="2" as="div">
							{message.text}
						</Text>
						<Text size="2" as="div" className="self-end">
							{formatDate(message.created)}
						</Text>
					</li>
				))}
			</ol>

			<div className="mt-4">
				<TextArea
					value={messageText}
					onChange={handleTextAreaChange}
					placeholder="Type your message..."
					className="w-full p-2 border rounded"
				/>
			</div>
			<Button
				variant="solid"
				className="mt-2"
				onClick={() => {
					if (messageText) {
						pb.collection("messages")
							.create({
								text: messageText,
								author: pb.authStore.model?.id,
								event: eventId,
							})
							.then(() => {
								setMessageText("");
							});
					}
				}}
			>
				Send Message
			</Button>
		</>
	);
};
