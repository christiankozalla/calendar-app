import { Button, Flex, Text } from "@radix-ui/themes";
import { Link, Outlet, useParams } from "react-router-dom";
import { CalendarIcon } from "@/components/svg/CalendarIcon";
import { SettingsIcon } from "@/components/svg/SettingsIcon";
import { ChatbubblesIcon } from "@/components/svg/ChatbubblesIcon";
import { NotificationIcon } from "@/components/svg/NotificationIcon";

export const Navigation = () => {
	const params = useParams();
	return (
		<>
			<Outlet />
			<nav className="fixed bottom-0 left-0 right-0 py-1 text-gray-600 bg-white border-t border-gray-200">
				<Flex className="mx-4" align="center" justify="between">
					<Link to={`/calendars/${params.calendarId}`}>
						<CalendarIcon className="w-5 h-5 mx-auto" />
						<Text size="1">Calendar</Text>
					</Link>
					<Link to={`/calendars/${params.calendarId}/chat`}>
						<ChatbubblesIcon className="w-5 h-5 mx-auto" />
						<Text size="1">Chat</Text>
					</Link>
					<Button
						className="absolute right-1/2 -top-2 w-10 h-10"
						style={{ transform: "translateX(50%)" }}
						onClick={() => {
							console.log("plus button");
						}}
						radius="full"
					>
						<Text size="4" weight="bold">
							+
						</Text>
					</Button>
					<div />
					<Link to={`/calendars/${params.calendarId}/activity`}>
						<NotificationIcon className="w-5 h-5 mx-auto" />
						<Text size="1">Activity</Text>
					</Link>
					<Link to={`/calendars/${params.calendarId}/settings`}>
						<SettingsIcon className="w-5 h-5 mx-auto" />
						<Text size="1">Settings</Text>
					</Link>
				</Flex>
			</nav>
		</>
	);
};
