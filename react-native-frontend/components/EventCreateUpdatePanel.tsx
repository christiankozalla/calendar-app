import React, {
	useState,
	useCallback,
	useRef,
	type SetStateAction,
	type Dispatch,
} from "react";
import {
	View,
	Text,
	StyleSheet,
	Dimensions,
	Keyboard,
	TouchableWithoutFeedback,
	Alert,
} from "react-native";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetTextInput,
	BottomSheetView,
	useBottomSheetModal,
	TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { useRecoilValue } from "recoil";
import { ColorsState } from "@/store/Colors";
import { ColorPicker } from "./ColorPicker";
import { CreatePerson } from "./CreatePerson";
import { TabBarIcon } from "./navigation/TabBarIcon";
import DateTimePicker from "@react-native-community/datetimepicker";
import { roundToNearestHour, mergeDates } from "@/utils/date";
import { FullWidthGreyBorderButton } from "./FullWidthGreyBorderButton";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";
import Checkbox from "expo-checkbox";
import { typography } from "@/utils/typography";
import { Button } from "./Button";
import { CalendarsState } from "@/store/Calendars";

type Props = {
	persons?: PersonsResponse[];
} & Partial<
	Pick<
		EventsResponse,
		"id" | "startDatetime" | "endDatetime" | "title" | "description" | "color"
	>
> &
	Pick<EventsResponse, "calendar">;

export const EventCreateUpdatePanel = ({
	id,
	calendar: calendarId,
	title = "",
	description = "",
	startDatetime,
	endDatetime,
	color,
	persons = [],
}: Props) => {
	const bottomSheetModal = useBottomSheetModal();
	const personsModalRef = useRef<BottomSheetModal>(null);

	const calendars = useRecoilValue(CalendarsState);
	const calendar = calendars[calendarId];

	const [eventTitle, setEventTitle] = useState(title);
	const [eventDescription, setEventDescription] = useState(description);
	const [selectedPersons, setSelectedPersons] = useState(persons);
	const [startDate, setStartDate] = useState(
		startDatetime ? new Date(startDatetime) : new Date(),
	);
	const [startTime, setStartTime] = useState(
		startDatetime ? new Date(startDatetime) : roundToNearestHour(new Date(), 0),
	);
	const [endDate, setEndDate] = useState(
		endDatetime ? new Date(endDatetime) : startDate || new Date(),
	);
	const [endTime, setEndTime] = useState(
		endDatetime
			? new Date(endDatetime)
			: roundToNearestHour(startTime || new Date(), 1),
	);
	const [selectedColor, setSelectedColor] = useState(color);
	const colors = useRecoilValue(ColorsState);

	const handleSubmit = useCallback(async () => {
		const startDateTime = mergeDates(startDate, startTime);
		const endDateTime = mergeDates(endDate, endTime);

		if (endDateTime < startDateTime) {
			// Show an Alert dialog to the user
			Alert.alert("End date cannot be before start date");
			return;
		}

		try {
			const owner = pb.authStore.record?.id;
			const eventData = {
				calendar: calendarId,
				owner,
				title: eventTitle,
				description: eventDescription,
				startDatetime: startDateTime.toISOString(),
				endDatetime: endDateTime.toISOString(),
				persons: selectedPersons?.map((p) => p.id),
				color: selectedColor,
			};

			if (id) {
				await pb.collection("events").update(id, eventData);
			} else {
				await pb.collection("events").create(eventData);
			}
			bottomSheetModal?.dismiss();
		} catch (err) {
			console.log("submit err", err);
		}
	}, [
		calendarId,
		id,
		eventTitle,
		eventDescription,
		startDate,
		startTime,
		endDate,
		endTime,
		selectedPersons,
		selectedColor,
	]);

	const onChange =
		(dateSetter: Dispatch<SetStateAction<Date>>) =>
		(_event: unknown, selectedDate?: Date) => {
			const currentDate = selectedDate || new Date(startDate);
			// setShowPicker(Platform.OS === "ios"); // Keep the picker open for iOS
			dateSetter(currentDate);
		};

	const onPersonCheckboxChange = (
		person: PersonsResponse,
		isSelected: boolean,
	) => {
		if (isSelected) {
			setSelectedPersons((prev) => [person, ...prev]);
		} else {
			setSelectedPersons((prev) => prev.filter((p) => p.id !== person.id));
		}
	};

	return (
		<TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
			<BottomSheetView style={styles.bottomsheetContent}>
				<View style={[styles.header, bottomsheetStyles.marginHorizontal]}>
					<TouchableOpacity
						style={styles.iconButton}
						onPress={() => {
							bottomSheetModal.dismiss();
						}}
					>
						<TabBarIcon name="close" style={{ fontSize: 20 }} />
					</TouchableOpacity>
					<Button
						size="small"
						label={id ? "Update Event" : "Create Event"}
						onPress={handleSubmit}
						style={{ borderColor: "rebeccapurple" }}
					/>
				</View>

				<BottomSheetTextInput
					style={[styles.input, bottomsheetStyles.marginHorizontal]}
					placeholder="Event Title"
					placeholderTextColor="#999"
					value={eventTitle}
					onChangeText={setEventTitle}
				/>

				{/* Date and time inputs */}
				<View
					style={[
						styles.dateTimeContainer,
						bottomsheetStyles.paddingHorizontal,
					]}
				>
					<Text style={styles.label}>Start Date</Text>
					<View style={styles.flexRow}>
						<DateTimePicker
							value={startDate}
							mode="date"
							textColor="black"
							onChange={onChange(setStartDate)}
						/>
						<DateTimePicker
							value={startTime}
							mode="time"
							textColor="black"
							onChange={onChange(setStartTime)}
						/>
					</View>
				</View>

				<View
					style={[
						styles.dateTimeContainer,
						bottomsheetStyles.paddingHorizontal,
					]}
				>
					<Text style={styles.label}>End Date (optional)</Text>
					<View style={styles.flexRow}>
						<DateTimePicker
							value={endDate}
							mode="date"
							textColor="black"
							onChange={onChange(setEndDate)}
						/>
						<DateTimePicker
							value={endTime}
							mode="time"
							textColor="black"
							onChange={onChange(setEndTime)}
						/>
					</View>
				</View>

				<BottomSheetTextInput
					style={[
						styles.input,
						styles.textArea,
						bottomsheetStyles.marginHorizontal,
					]}
					placeholder="Event Description (optional)"
					placeholderTextColor="#999"
					value={eventDescription}
					onChangeText={setEventDescription}
					multiline
				/>

				<View>
					<FullWidthGreyBorderButton
						onPress={() => {
							personsModalRef.current?.present();
						}}
					>
						<View
							style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
						>
							<TabBarIcon name="people-circle" />
							<Text style={{ marginTop: 6 }}>
								{selectedPersons.map((p) => p.name).join(", ")}
							</Text>
						</View>
						<TabBarIcon name="chevron-forward" />
					</FullWidthGreyBorderButton>
					<ColorPicker
						colors={colors}
						initialSelected={color}
						onColorSelect={setSelectedColor}
					/>
				</View>

				{/* Persons Bottom Sheet */}
				<BottomSheetModalProvider>
					<BottomSheetModal
						ref={personsModalRef}
						style={bottomsheetStyles.container}
					>
						{/* paddingBottom is some sort of hack to make dynamic sizing of the BottomSheet work - i.e. show CreatePerson component, too */}
						<BottomSheetView style={{ paddingBottom: 104 }}>
							{calendar?.expand?.persons?.map((person) => {
								const selectedState =
									selectedPersons.findIndex((sp) => sp.id === person.id) > -1;
								return (
									<TouchableOpacity
										key={person.id}
										onPress={() =>
											onPersonCheckboxChange(person, !selectedState)
										}
										style={[
											{
												flexDirection: "row",
												alignItems: "center",
												justifyContent: "space-between",
											},
											bottomsheetStyles.paddingHorizontal,
											bottomsheetStyles.paddingTop,
										]}
									>
										<Text>{person.name}</Text>
										<Checkbox value={selectedState} />
									</TouchableOpacity>
								);
							})}

							<Text
								style={[
									bottomsheetStyles.paddingHorizontal,
									{ marginTop: 18, marginBottom: 8 },
									typography.h3,
								]}
							>
								Create a new person
							</Text>
							<CreatePerson calendar={calendarId} />
						</BottomSheetView>
					</BottomSheetModal>
				</BottomSheetModalProvider>
			</BottomSheetView>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	iconButton: {
		paddingLeft: 0,
		paddingVertical: 12,
		paddingRight: 24,
		justifyContent: "center",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	deleteButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		padding: 8,
		borderRadius: 20,
	},
	icon: {
		fontSize: 24,
		marginRight: 4,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 8,
		marginBottom: 12,
	},
	textArea: {
		height: 100,
	},
	dateTimeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	label: {
		marginBottom: 4,
	},
	strong: {
		fontWeight: "bold",
	},
	flexRow: { flexDirection: "row" },
	bottomsheetContent: {
		height: Dimensions.get("screen").height,
	},
});
