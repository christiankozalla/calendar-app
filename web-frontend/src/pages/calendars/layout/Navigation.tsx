import { Button, Flex } from "@radix-ui/themes";
import { Link, Outlet, useParams } from "react-router-dom";
import { CalendarIcon } from "@/components/svg/CalendarIcon";
import { SettingsIcon } from "@/components/svg/SettingsIcon";

export const Navigation = () => {
	const params = useParams();
	return (
		<>
			<Outlet />
			<nav className="fixed bottom-0 left-0 right-0 pb-2 text-gray-600 bg-white">
				<Flex className="mx-4" justify="between">
					<Link to={`/calendars/${params.calendarId}`}>
						<CalendarIcon className="w-8 h-8" />
					</Link>
					<Link to={`/calendars/${params.calendarId}/chat-notes`}>
						{/* <SettingsIcon className="w-8 h-8" /> */}
						Chat Notes
					</Link>
					<Link to="">
						<Button radius="full">+</Button>
					</Link>
					<Link to={`/calendars/${params.calendarId}/activity`}>
						{/* <SettingsIcon className="w-8 h-8" /> */}
						Activity
					</Link>
					<Link to={`/calendars/${params.calendarId}/settings`}>
						<SettingsIcon className="w-8 h-8" />
					</Link>
				</Flex>
			</nav>
		</>
	);
};
