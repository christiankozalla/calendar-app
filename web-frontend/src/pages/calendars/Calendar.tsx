import { Fragment, useCallback, useRef, useState } from "react";
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
	Box,
	Heading,
	Text,
	Flex,
	IconButton,
	Select,
	Spinner,
	Button,
} from "@radix-ui/themes";
import { EventList } from "@/components/EventList";
import { CreateEventPanel } from "@/components/CreateEventPanel";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import { Header } from "@/components/Header";
import {
	Direction,
	type OnSwipeParams,
	Swipable,
	swipingDirection,
} from "@/components/Swipable";

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

	const { push, update } = useSlidingDrawer();

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
					if (e.status === "fulfilled") {
						setEvents(e.value.items);
					}
					if (p.status === "fulfilled") {
						setPersons(p.value.items);
					}
					if (c.status === "fulfilled") {
						setCalendar(c.value);
					}
				})
				.catch((err) => {
					console.error(err);
				})
				.finally(() => {
					setTimeout(() => {
						setLoading(false);
					}, 200); // dirty hack because: even though a calendarFromBackend was set before setLoading to false, the part "No calendar for this ID {calendarId}" is still shown (and shouldn't be!)
				});
		}
	}, [calendarId]);

	useEffect(() => {
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
	}, [calendarId]);

	const openCreateNewEvent = useCallback(
		(datetime: Date) => {
			push({
				state: { isOpen: true },
				props: { datetime: datetime.toISOString(), persons },
				component: CreateEventPanel,
			});
		},
		[persons],
	);

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

	const onSwipe = (output: OnSwipeParams) => {
		const directions = swipingDirection(output);
		if (directions.includes(Direction.LEFT)) {
			viewPreviousMonth();
		} else if (directions.includes(Direction.RIGHT)) {
			viewNextMonth();
		}
	};

	const yearsRange = Array.from(
		{ length: 10 },
		(_, i) => viewing.getFullYear() - 5 + i,
	);
	// Needs to be refactored to be more readable and concise
	const eventListId = useRef<string>();
	const newEventSliderId = useRef<string>();
	useEffect(() => {
		if (selected.length > 0) {
			const eventsForSelectedDay = findEventsForDay(events, selected[0]);
			if (eventsForSelectedDay.length) {
				if (eventListId.current) {
					update({
						id: eventListId.current,
						state: { isOpen: true },
						slots: {
							upperLeftSlot: (
								<Button
									variant="soft"
									radius="full"
									className="w-8 h-8 justify-self-start"
									onClick={() => openCreateNewEvent(selected[0])}
								>
									+
								</Button>
							),
						},
						props: { events: eventsForSelectedDay },
					});
				} else {
					eventListId.current = push({
						state: { isOpen: true },
						slots: {
							upperLeftSlot: (
								<Button
									variant="soft"
									radius="full"
									className="w-8 h-8 justify-self-start"
									onClick={() => openCreateNewEvent(selected[0])}
								>
									+
								</Button>
							),
						},
						props: {
							events: eventsForSelectedDay,
						},
						component: EventList,
					});
				}
			} else {
				// No events for selected date
				if (newEventSliderId.current) {
					update({
						id: newEventSliderId.current,
						state: { isOpen: true },
						props: {
							persons,
							datetime: selected[0].toISOString(),
						},
					});
				} else {
					newEventSliderId.current = push({
						state: { isOpen: true },
						props: {
							calendarId,
							persons,
							datetime: selected[0].toISOString(),
						},
						component: CreateEventPanel,
					});
				}
			}
		}
	}, [calendarId, selected, events]); // do I want to re-run this effect when new events are pushed into the state (by the backend realtime api)? Yes
	// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
	// Needs to be refactored to be more readable and concise

	if (loading) {
		return (
			<Flex className="h-screen" justify="center" align="center">
				<Spinner size="3" />
			</Flex>
		);
	}

	if (!calendarFromBackend) {
		return <Box className="p-4">No calendar for this ID {calendarId}</Box>;
	}

	return (
		<>
			<Header>
				<Heading size="3">{calendarFromBackend?.name}</Heading>
			</Header>
			<Box className="py-2">
				<Flex justify="between" align="center" className="mx-2 mb-4">
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

				<Swipable className="grid grid-cols-7 gap-1" onSwipe={onSwipe}>
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
				</Swipable>
			</Box>
		</>
	);
};
