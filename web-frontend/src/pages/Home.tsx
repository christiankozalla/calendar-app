import { useEffect, useState, type FormEventHandler } from "react";
import {
	Box,
	Container,
	Text,
	TextField,
	Button,
	Heading,
	Select,
} from "@radix-ui/themes";
import { pb } from "@/api/pocketbase";
import {
	type CalendarsResponse,
	Collections,
	type EventsResponse,
} from "@/api/pocketbase-types";
import { Link } from "react-router-dom";
import { formatEventDate } from "@/utils/dateFormatting";
import { CreateInvitationPanel } from "@/components/CreateInvitationPanel";
// List next events

// show calendar for manipulation

const CalendarItem = ({
	calendar,
	nextEvents,
}: { calendar: CalendarsResponse; nextEvents?: EventsResponse[] }) => {
	return (
		<Box className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
			<div className="bg-green-100 px-4 py-3 border-b border-gray-200">
				<h2 className="text-xl font-semibold text-green-800">
					{calendar.name}
				</h2>
			</div>
			<ul className="divide-y divide-gray-200">
				{Array.isArray(nextEvents) && nextEvents.length ? (
					nextEvents.map((event) => (
						<li key={event.id} className="px-4 py-3">
							<p className="font-medium">{event.title}</p>
							<p className="text-sm text-gray-600">
								{formatEventDate(event.datetime)}
							</p>
						</li>
					))
				) : (
					<li className="px-4 py-3">No upcoming events...</li>
				)}
			</ul>
		</Box>
	);
};

const CalendarList = ({
	calendars,
}: { calendars: CalendarsResponse[] | null }) => {
	const [events, setEvents] = useState<EventsResponse[]>();

	useEffect(() => {
		const calendarIds = calendars?.map((c) => c.id);
		if (calendarIds) {
			const filter = pb.filter(
				`calendar = '${calendarIds?.join("' || calendar = ")}' && datetime > {:now}`,
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
		<ul>
			{calendars?.map((c) => (
				<li key={c.id}>
					<Link className="cursor-pointer" to={`/calendars/${c.id}`}>
						<CalendarItem
							calendar={c}
							nextEvents={events?.filter((e) => e.calendar === c.id)}
						/>
					</Link>
				</li>
			))}
		</ul>
	);
};

export const Component = () => {
	const [calendars, setCalendars] = useState<CalendarsResponse[]>([]);

	useEffect(() => {
		pb.collection("calendars")
			.getFullList({
				filter: pb.filter("users ~ {:userId}", {
					userId: pb.authStore.model?.id,
				}),
			})
			.then((r) => {
				setCalendars(r);
			});
	}, []);

	return (
		<Container>
			<Heading as="h1" size="7" className="mb-4">
				Welcome {pb.authStore.model?.name ?? "friend"}!
			</Heading>
			<Heading size="6" className="mb-6">
				Your Calendars
			</Heading>

			<CalendarList calendars={calendars} />

			<CreateInvitationPanel calendars={calendars} />

			<Box>
				<Text>Add people in your family</Text>
			</Box>
		</Container>
	);
};
