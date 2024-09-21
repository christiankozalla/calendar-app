import { Fragment, useState } from "react";
import { pb } from "@/api/pocketbase";
import type {
	EventsResponse,
	CalendarsResponse,
	PersonsResponse,
} from "@/api/pocketbase-types";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Day, useLilius } from "use-lilius";
import { isToday, format, startOfMonth, endOfMonth, isSameDay } from "date-fns";
import {
	Card,
	Heading,
	Text,
	Flex,
	IconButton,
	Select,
	Spinner,
} from "@radix-ui/themes";
import { SlidingDrawer } from "@/components/SlidingDrawer";
import { EventList } from "@/components/EventList";
import { CreateEventPanel } from "@/components/CreateEventPanel";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const findEventsForDay = (
	events: EventsResponse[],
	day: Date,
): EventsResponse[] => events?.filter((e) => isSameDay(e.datetime, day));

export const Component = () => {
	const calendarId = useParams().calendarId;

	const [calendarFromBackend, setCalendar] = useState<CalendarsResponse>();
	const [events, setEvents] = useState<EventsResponse[]>([]);
	const [persons, setPersons] = useState<PersonsResponse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (calendarId) {
			setLoading(true);
			const calendarsRequest = pb.collection("calendars").getOne(calendarId);

			const eventsRequest = pb
				.collection("events")
				.getList(undefined, undefined, {
					// TODO: enhance filter with viewing month (from useLilius)
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				});

			const personsRequest = pb
				.collection("persons")
				.getList(undefined, undefined, {
					// TODO: enhance filter with viewing month (from useLilius)
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				});

			Promise.allSettled([calendarsRequest, eventsRequest, personsRequest])
				.then(([c, e, p]) => {
					if (c.status === "fulfilled") {
						setCalendar(c.value);
					}
					if (e.status === "fulfilled") {
						setEvents(e.value.items);
					}
					if (p.status === "fulfilled") {
						setPersons(p.value.items);
					}
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					setLoading(false);
				});

			pb.collection("events").subscribe(
				"*",
				(collection) => {
					switch (collection.action) {
						case "create":
							setEvents((events) => [...(events ?? []), collection.record]);
							break;

						case "update":
							setEvents((events) => [
								...(events ?? []).filter((e) => e.id !== collection.record.id),
								collection.record,
							]);
							break;

						case "delete":
							setEvents((events) => [
								...(events ?? []).filter((e) => e.id !== collection.record.id),
							]);
							break;

						default:
							console.error("Unhandled action:", collection.action);
					}
				},
				{
					// TODO: enhance filter with viewing month (from useLilius)
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				},
			);

			return () => {
				pb.collection("events").unsubscribe("*");
			};
		}
	}, [calendarId]);

	const {
		calendar,
		selected,
		isSelected,
		inRange,
		// toggle,
		select,
		viewing,
		viewMonth,
		viewYear,
		viewPreviousMonth,
		viewNextMonth,
	} = useLilius({
		weekStartsOn: Day.MONDAY,
	});

	const yearsRange = Array.from(
		{ length: 10 },
		(_, i) => viewing.getFullYear() - 5 + i,
	);

	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	const [drawerContent, setDrawerContent] = useState<EventsResponse[]>([]);
	useEffect(() => {
		if (selected.length > 0) {
			const eventsForSelectedDay = findEventsForDay(events, selected[0]);
			setDrawerContent(eventsForSelectedDay);
			setIsDrawerOpen(Boolean(eventsForSelectedDay.length));
		}
	}, [selected, events]); // do I want to re-run this effect when new events are pushed into the state (by the backend realtime api)?

	if (loading) {
		return <Spinner />;
	}

	if (!calendarFromBackend) {
		return <Card className="p-4">No calendar for this ID {calendarId}</Card>;
	}

	return (
		<>
			<Heading size="6" mb="6">
				{calendarFromBackend?.name}
			</Heading>
			<Card className="p-4">
				<Flex justify="between" align="center" className="mb-4">
					<IconButton
						onClick={viewPreviousMonth}
						variant="ghost"
						className="text-gray-600 hover:bg-gray-100 text-lg"
					>
						<div className="flex items-center justify-center h-5 w-5">
							&lsaquo;
						</div>
					</IconButton>

					<Flex align="center" gap="2">
						<Select.Root
							value={`${viewing.getMonth()}-${viewing.getFullYear()}`}
							onValueChange={(value) => {
								const [month, year] = value.split("-");
								viewMonth(Number(month));
								viewYear(Number(year));
							}}
						>
							<Select.Trigger className="w-40" />
							<Select.Content>
								{MONTHS.map((month, index) => (
									<Select.Group key={month}>
										<Select.Label>{month}</Select.Label>
										{yearsRange.map((year) => (
											<Select.Item
												key={`${index}-${year}`}
												value={`${index}-${year}`}
											>
												{`${month} ${year}`}
											</Select.Item>
										))}
									</Select.Group>
								))}
							</Select.Content>
						</Select.Root>
					</Flex>

					<IconButton
						onClick={viewNextMonth}
						variant="ghost"
						className="text-gray-600 hover:bg-gray-100 text-lg"
					>
						<div className="flex items-center justify-center h-5 w-5">
							&rsaquo;
						</div>
					</IconButton>
				</Flex>

				<Heading size="4" className="mb-4 text-center">
					{format(viewing, "MMMM yyyy")}
				</Heading>
				<div className="grid grid-cols-7 gap-1">
					{DAYS.map((dayLabel) => (
						<div
							key={dayLabel}
							className="text-center font-semibold text-gray-600 mb-2"
						>
							{dayLabel}
						</div>
					))}

					{calendar[0].map((week, weekIndex) => (
						<Fragment key={`week-${weekIndex}`}>
							{week.map((day) => {
								const eventsOfThisDay = findEventsForDay(events, day);
								return (
									<button
										type="button"
										key={day.toString()}
										className={`aspect-square flex items-center justify-center rounded-2xl 
									${
										inRange(day, startOfMonth(viewing), endOfMonth(viewing))
											? "hover:bg-blue-100"
											: "text-gray-400"
									}
									${isSelected(day) ? "bg-blue-500 hover:bg-blue-500 text-white" : ""}
									${isToday(day) ? "border-2 border-blue-500" : ""}
									${Array.isArray(eventsOfThisDay) && eventsOfThisDay.length ? "border-2 border-green-500" : ""}`}
										onClick={() => select(day, true)}
									>
										<Text size="2">{format(day, "d")}</Text>
									</button>
								);
							})}
						</Fragment>
					))}
				</div>
			</Card>
			{calendarId && (
				<Card mt="4" className="p-4">
					<CreateEventPanel
						calendarId={calendarId}
						datetime={selected[0]?.toISOString()}
						persons={persons}
					/>
				</Card>
			)}
			<SlidingDrawer
				isOpen={isDrawerOpen}
				onOpenChange={setIsDrawerOpen}
				closeOnClickOutside={false}
			>
				<EventList events={drawerContent} />
			</SlidingDrawer>
		</>
	);
};
