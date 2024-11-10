import {
	useCallback,
	useRef,
	useState,
	useEffect,
	useMemo,
	type ReactNode,
} from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	ActivityIndicator,
	SafeAreaView,
} from "react-native";
import { pb } from "@/api/pocketbase";
import type {
	EventsResponse,
	CalendarsResponse,
	PersonsResponse,
} from "@/api/pocketbase-types";
import { Link, useGlobalSearchParams } from "expo-router";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { isSameDay } from "date-fns";
import { inRange } from "@/utils/date";
import { EventList } from "@/components/EventList";
import { EventPanelCrud } from "@/components/EventPanelCrud";
import { Header } from "@/components/Header";
import { ColorsState } from "@/store/Colors";
import { PersonsState } from "@/store/Persons";
import { type DateData, Calendar } from "react-native-calendars";
import { eventsToMarkedDates } from "@/utils/calendar";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import type { ClientResponseError } from "pocketbase";
import BottomSheet, { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { globalstyles } from "@/utils/globalstyles";

// biome-ignore lint: unexpected any
const findEventsForDay = (events: EventsResponse<any>[], day: Date | string) =>
	events?.filter((e) => {
		// biome-ignore lint: param reassign is not confusing, this is a shallow helper func
		day = typeof day === "string" ? new Date(day) : day;
		return !e.endDatetime
			? isSameDay(day, e.startDatetime)
			: inRange(day, new Date(e.startDatetime), new Date(e.endDatetime));
	});

export default function CalendarScreen() {
	const { calendarId } = useGlobalSearchParams<{ calendarId: string }>();
	const [calendarFromBackend, setCalendar] = useState<CalendarsResponse>();
	const [events, setEvents] = useState<
		EventsResponse<{ persons: PersonsResponse[] }>[]
	>([]);
	const setPersons = useSetRecoilState(PersonsState);
	const [loading, setLoading] = useState(true);
	const colors = useRecoilValue(ColorsState);
	const [selected, setSelected] = useState<`${number}-${number}-${number}`>();

	const [error, setError] = useState<Error | ClientResponseError>();

	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const [bottomSheetContent, setBottomSheetContent] = useState<ReactNode>();

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
						filter: pb.filter("calendar = {:calendarId}", { calendarId }),
						expand: "persons",
					},
				);

			const personsRequest = pb
				.collection("persons")
				.getList(undefined, undefined, {
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
					setError(err);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [calendarId, setPersons]);

	useEffect(() => {
		if (calendarId) {
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
					filter: pb.filter("calendar = {:calendarId}", { calendarId }),
					expand: "persons",
				},
			);

			return () => {
				pb.collection("events").unsubscribe("*");
			};
		}
	}, [calendarId]);

	const openCreateNewEvent = useCallback(
		(datetime: Date | string) => {
			// push({
			// 	state: { isOpen: true },
			// 	props: {
			// 		startDatetime:
			// 			typeof datetime !== "string" ? datetime.toISOString() : datetime,
			// 		calendar: calendarId,
			// 	},
			// 	component: EventPanelCrud,
			// });
			const props = {
				startDatetime:
					typeof datetime !== "string" ? datetime.toISOString() : datetime,
				calendar: calendarId,
			};
			setBottomSheetContent(<EventPanelCrud {...props} />);
		},
		[calendarId],
	);

	useEffect(() => {
		if (selected) {
			const eventsForSelectedDay = findEventsForDay(events, selected);
			if (eventsForSelectedDay.length) {
				setBottomSheetContent(<EventList events={eventsForSelectedDay} />);
				// eventListId.current = push({
				// 	state: { isOpen: true, height: "full" },
				// 	slots: {
				// 		upperLeftSlot: (
				// 			<TouchableOpacity
				// 				style={styles.addButton}
				// 				onPress={() => openCreateNewEvent(selected)}
				// 			>
				// 				<Text style={styles.addButtonText}>+</Text>
				// 			</TouchableOpacity>
				// 		),
				// 	},
				// 	props: {
				// 		events: eventsForSelectedDay,
				// 	},
				// 	component: EventList,
				// });
			} else {
				// No events for selected date
				const props = {
					calendar: calendarId,
					startDatetime: selected,
				};
				setBottomSheetContent(<EventPanelCrud {...props} />);
			}
			bottomSheetRef.current?.expand();
		}
	}, [calendarId, selected, openCreateNewEvent]);

	const markedDates = useMemo(
		() => eventsToMarkedDates(events, colors),
		[events, colors],
	);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#000000" />
			</View>
		);
	}

	if (!calendarFromBackend) {
		return (
			<View style={styles.container}>
				<Header style={styles.header}>
					<Link href="/" push>
						{pb.authStore.model?.avatar ? (
							<Image source={{ uri: pb.authStore.model.avatar }} />
						) : (
							<TabBarIcon name="person-circle" style={styles.icon} />
						)}
					</Link>
				</Header>
				<Text>No calendar for this ID {calendarId}</Text>
				<Text>{JSON.stringify(error)}</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<View style={styles.container}>
				<Header style={styles.header}>
					<Link href="/" push>
						{pb.authStore.model?.avatar ? (
							<Image source={{ uri: pb.authStore.model.avatar }} />
						) : (
							<TabBarIcon name="person-circle" style={styles.icon} />
						)}
					</Link>
					<Text style={styles.headerText}>{calendarFromBackend?.name}</Text>
				</Header>
				<Calendar
					firstDay={1}
					markingType="multi-period"
					markedDates={markedDates}
					selected={selected}
					onDayPress={(day: DateData) => {
						setSelected(day.dateString as `${number}-${number}-${number}`);
					}}
				/>
				<GestureHandlerRootView>
					<BottomSheetModal ref={bottomSheetRef}>
						<BottomSheetView>{bottomSheetContent}</BottomSheetView>
					</BottomSheetModal>
				</GestureHandlerRootView>
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
	icon: {
		fontSize: 24,
	},
});
