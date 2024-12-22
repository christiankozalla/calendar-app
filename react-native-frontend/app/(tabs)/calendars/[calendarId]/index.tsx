import { useCallback, useRef, useState, useEffect, useMemo, type ReactNode } from "react";
import {
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { Link, useGlobalSearchParams } from "expo-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isSameDay } from "date-fns";
import {
	inRange,
	roundToNearestHour,
	setDateWithCurrentTime,
} from "@/utils/date";
import { EventListPanel } from "@/components/EventListPanel";
import { EventCreateUpdatePanel } from "@/components/EventCreateUpdatePanel";
import { Header } from "@/components/Header";
import { ColorsState } from "@/store/Colors";
import { PersonsState } from "@/store/Persons";
import { type DateData, Calendar, CalendarList } from "react-native-calendars";
import { eventsToMarkedDates } from "@/utils/calendar";
import type { ClientResponseError } from "pocketbase";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";
import { CalendarsState } from "@/store/Calendars";
import { Avatar } from "@/components/Avatar";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

const findEventsForDay = (
	events: EventWithPersons[],
	day: Date | string,
) => {
	// biome-ignore lint: param reassign is not confusing, this is a shallow helper func
	day = typeof day === "string" ? new Date(day) : day;
	return events?.filter((e) => {
		return !e.endDatetime
			? isSameDay(day, e.startDatetime)
			: inRange(day, new Date(e.startDatetime), new Date(e.endDatetime));
	});
};

const selectedStyle = {
	selected: true,
	selectedColor: "#00adf5",
	selectedTextColor: "#ffffff",
};

type EventWithPersons = EventsResponse<{ persons: PersonsResponse[] }>;

export default function CalendarScreen() {
	const { calendarId } = useGlobalSearchParams<{ calendarId: string }>();
	const calendars = useRecoilValue(CalendarsState);
	const colors = useRecoilValue(ColorsState);
	const setPersons = useSetRecoilState(PersonsState);
	const [loading, setLoading] = useState(true);
	const [selected, setSelected] = useState<`${number}-${number}-${number}`>();

	const calendarFromBackend = calendars.find((c) => c.id === calendarId);
	const [events, setEvents] = useState<EventWithPersons[]>([]);

	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>();

	useEffect(() => {
		if (calendarId) {
			setLoading(true);
			// const calendarRequest = pb.collection("calendars").getOne(calendarId);

			const eventsRequest = pb
				.collection("events")
				.getList<EventWithPersons>(undefined, undefined, {
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
					expand: "persons",
				});

			const personsRequest = pb
				.collection("persons")
				.getList(undefined, undefined, {
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
				});

			Promise.allSettled([eventsRequest, personsRequest])
				.then(([e, p]) => {
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
		}
	}, [calendarId]);

	useEffect(() => {
		const subscribeToEvents = async () => {
			if (calendarId) {
				const unsubscribe = pb.collection("events").subscribe<EventWithPersons>(
					"*",
					(collection) => {
						switch (collection.action) {
							case "create":
								setEvents((events) => [...(events ?? []), collection.record]);
								break;

							case "update":
								setEvents((events) => [
									...(events ?? []).filter(
										(e) => e.id !== collection.record.id,
									),
									collection.record,
								]);
								break;

							case "delete":
								setEvents((events) => [
									...(events ?? []).filter(
										(e) => e.id !== collection.record.id,
									),
								]);
								break;

							default:
								console.error("Unhandled action:", collection.action);
						}
					},
					{
						filter: pb.filter("calendar = {:calendarId}", { calendarId }),
						expand: "persons",
					},
				);
				return unsubscribe;
			}
		};

		const initiateSubscription = async () => {
			const unsubscribe = await subscribeToEvents();
			return unsubscribe;
		};

		const unsubscribePromise = initiateSubscription();

		return () => {
			unsubscribePromise.then((unsubscribe) => unsubscribe?.());
		};
	}, [calendarId]);

	// useEffect(() => {
	// 	// open bottom sheet every time its content changes
	// 	bottomSheetRef.current?.present();
	// }, [bottomSheetContent])

	const openCreateNewEvent = useCallback(
		(date: string) => {
			const props = {
				startDatetime: roundToNearestHour(
					setDateWithCurrentTime(date),
					0,
				).toISOString(),
				calendar: calendarId,
			};
			setBottomSheetContent(<EventCreateUpdatePanel {...props} />);
			bottomSheetRef.current?.present();
		},
		[calendarId],
	);

	const showEventList = (
		day: string, // YYYY-MM-DD
	) => {
		const eventsForDay = findEventsForDay(events, day);
		setBottomSheetContent(
			<EventListPanel
				events={eventsForDay}
				calendar={calendarId}
				currentDay={day}
				setBottomSheetContent={setBottomSheetContent}
			/>,
		);
		bottomSheetRef.current?.present();
	};

	const markedDates = useMemo(
		() => eventsToMarkedDates(events, colors),
		[events, colors],
	);

	const onDayPress = useCallback(
		(day: DateData) => {
			if (selected === day.dateString) {
				showEventList(day.dateString);
			} else {
				setSelected(day.dateString as `${number}-${number}-${number}`);
			}
		},
		[selected],
	);

	const markedDatesWithSelected = selected
		? {
				[selected]: selectedStyle,
				...markedDates,
			}
		: markedDates;

	const avatarUri = pb.authStore.record
		? pb.files.getURL(pb.authStore.record, pb.authStore.record.avatar, {
				thumb: "100x100",
			})
		: null;

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#000000" />
			</View>
		);
	}

	if (!calendarFromBackend) {
		return (
			<SafeAreaView style={globalstyles.safeArea}>
				<StatusBar style="dark" />
				<View style={styles.container}>
					<Header style={styles.header}>
						<Link href="/" push>
							<Avatar size="small" uri={avatarUri} />
						</Link>
					</Header>
					<Text>No calendar for this ID {calendarId}</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />
			<View style={styles.container}>
				<Header style={styles.header}>
					<Link href="/" push>
						<Avatar size="small" uri={avatarUri} />
					</Link>
					<Text style={styles.headerText}>{calendarFromBackend?.name}</Text>
				</Header>

				<CalendarList
					firstDay={1}
					markingType="multi-period"
					markedDates={markedDatesWithSelected}
					onDayPress={onDayPress}
					onDayLongPress={(day: DateData) => {
						openCreateNewEvent(day.dateString);
					}}
				/>

				<BottomSheetModal
					ref={bottomSheetRef}
					style={bottomsheetStyles.container}
					enablePanDownToClose
				>
					{bottomSheetContent}
				</BottomSheetModal>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "white",
		alignItems: "center",
	},
	header: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		flexGrow: 0,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 2,
	},
	addButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#E0E0E0",
		justifyContent: "center",
		alignItems: "center",
		alignSelf: "flex-start",
	},
	addButtonText: {
		fontSize: 24,
		color: "#000000",
	},
});
