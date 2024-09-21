import { useEffect, useState, type FormEventHandler } from "react";
import {
	Box,
	Container,
	Text,
	TextField,
	Button,
	Heading,
} from "@radix-ui/themes";
import { pb } from "@/api/pocketbase";
import {
	type CalendarsResponse,
	Collections,
	type EventsResponse,
} from "@/api/pocketbase-types";
import { Link } from "react-router-dom";
import { formatEventDate } from "@/utils/dateFormatting";
// List next events

// show calendar for manipulation

// Invitation flow
// 1. Inviter sends email address to collection("invitations")
// 2. collection("invitations") has an onBefore or an onAfter hook that:
// 2.1 generates a JWT token
// 2.2. sends out an email with a signup link /login-signup?email=<URLENCODED_EMAIL>&token=<TOKEN>
// 3. The login page hides the login feature
// 3.1 The login page prefills the email address in a disabled field
// 3.2 Explains who was the inviter
// 3.3. When the invitee signs up with the token, an onAfter hook is called in Users-Create
// 4. OnAfter in Users-Create does
// 4.1 verify and decode the token
// 4.2 check the invitation entity for whether it is a legitimate request (do token and emails match?)
// 4.3 add invitee email address to Calendar to which they were invited
// 4.4 set their own User status to verified (because they already received the invitation as email)
const inviteNewUser: FormEventHandler<HTMLFormElement> = (e) => {
	e.preventDefault();
	const fd = new FormData(e.target as HTMLFormElement);
};

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

			<Box mt="6">
				<Text>Invite people to share your calendar with (exclusively)</Text>
				<form onSubmit={inviteNewUser}>
					Email:
					<TextField.Root
						type="email"
						name="email"
						placeholder="Who do you want to invite to your calendar?"
						required
					/>
					<Button type="submit">Invite</Button>
				</form>
			</Box>
			<Box>
				<Text>Add people in your family</Text>
			</Box>
		</Container>
	);
};
