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
import { isSameDay, startOfMonth, endOfMonth, isToday, format } from "date-fns";
import { inRange } from "@/utils/date";
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
import { cx } from "classix";
import { EventList } from "@/components/EventList";
import { EventPanelCrud } from "@/components/EventPanelCrud";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import { Header } from "@/components/Header";
import {
	Direction,
	type OnSwipeParams,
	Swipable,
	swipingDirection,
} from "@/components/Swipable";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { ColorsState } from "@/store/Colors";
import { PersonsState } from "@/store/Persons";
import { getTextColorBasedOnBg } from "@/utils/color";

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
): EventsResponse[] =>
	events?.filter((e) =>
		!e.endDatetime
			? isSameDay(day, e.startDatetime)
			: inRange(day, new Date(e.startDatetime), new Date(e.endDatetime)),
	);

export const Component = () => {
	const calendarId = useParams().calendarId;

	const [calendarFromBackend, setCalendar] = useState<CalendarsResponse>();
	// This state should be global
	const [events, setEvents] = useState<
		EventsResponse<{ persons: PersonsResponse[] }>[]
	>([]);
	const setPersons = useSetRecoilState(PersonsState);
	const [loading, setLoading] = useState(true);
	const colors = useRecoilValue(ColorsState);

	const { push, update } = useSlidingDrawer();

	useEffect(() => {
		if (calendarId) {
			setLoading(true);
			const calendarRequest = pb.collection("calendars").getOne(calendarId);

			const eventsRequest = pb
				.collection("events")
				.getList<EventsResponse<{ persons: PersonsResponse[] }>>(
					undefined,
					undefined,
					{
						// TODO: enhance filter with viewing month (from useLilius)
						filter: pb.filter("calendar = {:calendarId}", { calendarId }),
						expand: "persons",
					},
				);

			const personsRequest = pb
				.collection("persons")
				.getList(undefined, undefined, {
					// TODO: enhance filter with viewing month (from useLilius)
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				});

			Promise.allSettled([calendarRequest, eventsRequest, personsRequest])
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
	}, [calendarId, setPersons]);

	useEffect(() => {
		pb.collection("events").subscribe<
			EventsResponse<{ persons: PersonsResponse[] }>
		>(
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
				expand: "persons",
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
				props: { startDatetime: datetime.toISOString(), calendar: calendarId },
				component: EventPanelCrud,
			});
		},
		[calendarId],
	);

	const {
		calendar,
		selected,
		isSelected,
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
			viewNextMonth();
		} else if (directions.includes(Direction.RIGHT)) {
			viewPreviousMonth();
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
							startDatetime: selected[0].toISOString(),
							calendar: calendarId,
						},
					});
				} else {
					newEventSliderId.current = push({
						state: { isOpen: true },
						props: {
							calendar: calendarId,
							startDatetime: selected[0].toISOString(),
						},
						component: EventPanelCrud,
					});
				}
			}
		}
	}, [calendarId, selected]);
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
			<Box className="h-[calc(100vh-100px)]">
				<Flex justify="between" align="center" className="mx-2 my-2">
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

				<Swipable className="grid grid-cols-7" onSwipe={onSwipe}>
					{DAYS.map((dayLabel) => (
						<div
							key={dayLabel}
							className="text-center text-gray-600 p-2 border-b border-r border-t border-gray-200"
						>
							{dayLabel}
						</div>
					))}

					{calendar[0].map((week) => (
						<Fragment key={week.toString()}>
							{week.map((day) => {
								const eventsOfThisDay = findEventsForDay(events, day);
								const inRangeOfMonth = inRange(
									day,
									startOfMonth(viewing),
									endOfMonth(viewing),
								);

								return (
									<div
										key={day.toString()}
										className={cx(
											"relative",
											"border-b",
											"border-r",
											"border-gray-200",
											"min-h-[100px]",
											!inRangeOfMonth && "bg-gray-100",
											isSelected(day) && "bg-blue-100",
											isToday(day) && "bg-yellow-50",
										)}
									>
										<button
											type="button"
											className="flex flex-col flex-auto justify-between w-full h-full"
											onClick={() => select(day, true)}
										>
											<Text
												size="3"
												my="1"
												className={cx(
													"w-full",
													"text-center",
													inRangeOfMonth ? "" : "text-gray-400",
													isSelected(day) ? "font-bold" : "",
												)}
											>
												{format(day, "d")}
											</Text>
											<div className="w-full grow">
												{eventsOfThisDay?.map((event) => (
													<div
														key={event.id}
														className="h-[16px] w-full mb-1 truncate"
														style={{
															backgroundColor:
																colors[event.color]?.hex ?? "#0000FF",
															color: getTextColorBasedOnBg(
																colors[event.color]?.hex ?? "#0000FF",
															),
														}}
													>
														{isSameDay(day, new Date(event.startDatetime)) && (
															<Text
																size="1"
																weight="bold"
																trim="both"
																className="align-middle"
															>
																{event.title}
															</Text>
														)}
													</div>
												))}
											</div>
										</button>
									</div>
								);
							})}
						</Fragment>
					))}
				</Swipable>
			</Box>
		</>
	);
};
