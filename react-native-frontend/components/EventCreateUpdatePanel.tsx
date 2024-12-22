import React, {
	useState,
	useCallback,
	useEffect,
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
} from "react-native";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { AlertDialog } from "./AlertDialog";
import { useRecoilValue } from "recoil";
import { PersonsState } from "@/store/Persons";
import { ColorsState } from "@/store/Colors";
import { ColorPicker } from "./ColorPicker";
import { CreatePerson } from "./CreatePerson";
import { TabBarIcon } from "./navigation/TabBarIcon";
import Button from "react-native-ui-lib/button";
import DateTimePicker from "@react-native-community/datetimepicker";
import { roundToNearestHour } from "@/utils/date";
import { FullWidthGreyBorderButton } from "./FullWidthGreyBorderButton";
import {
	BottomSheetModal,
	BottomSheetModalProvider,
	BottomSheetTextInput,
	BottomSheetView,
	useBottomSheetModal,
	TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";
import Checkbox from "expo-checkbox";

type Props = {
	persons?: PersonsResponse[];
} & Partial<
	Pick<
		EventsResponse,
		| "id"
		| "startDatetime"
		| "endDatetime"
		| "title"
		| "description"
		| "calendar"
		| "color"
	>
>;

const deleteEvent = (id: string) => {
	pb.collection("events").delete(id);
};

const mergeDates = (dateInput: Date, timeInput: Date): Date => {
	// Extract day components from `dateWithDay`
	const year = dateInput.getFullYear();
	const month = dateInput.getMonth();
	const day = dateInput.getDate();

	// Extract time components from `dateWithTime`
	const hours = timeInput.getHours();
	const minutes = timeInput.getMinutes();
	const seconds = timeInput.getSeconds();

	return new Date(year, month, day, hours, minutes, seconds);
};

export const EventCreateUpdatePanel = ({
	id,
	calendar,
	title,
	description,
	startDatetime,
	endDatetime,
	color,
	persons = [],
}: Props) => {
	const bottomSheetModal = useBottomSheetModal();
	const personsModalRef = useRef<BottomSheetModal>(null);
	const allPersons = useRecoilValue(PersonsState);

	const [eventTitle, setEventTitle] = useState(title || "");
	const [eventDescription, setEventDescription] = useState(description || "");
	const [selectedPersons, setSelectedPersons] = useState([
		pb.authStore.record as unknown as { id: string; name: string },
		...persons,
	]);
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
	const [isAlertDialogVisible, setIsAlertDialogVisible] = useState(false);
	const colors = useRecoilValue(ColorsState);

	const handleSubmit = useCallback(async () => {
		console.log("handle submit");
		try {
			const owner = pb.authStore.record?.id;
			const eventData = {
				calendar, // id
				owner,
				title: eventTitle,
				description: eventDescription,
				startDatetime: mergeDates(startDate, startTime).toISOString(),
				endDatetime: mergeDates(endDate, endDate).toISOString(),
				persons: selectedPersons?.map((p) => p.id).filter((id) => id !== owner), // the owner is a User, not a Person, so its ID cannot be found in the persons table
				color: selectedColor,
			};

			console.log("handling submit", eventData);

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
		calendar,
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
		person: PersonsResponse | { id: string; name: string },
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
				<View
					style={[
						{
							flexDirection: "row",
							justifyContent: "space-between",
							marginBottom: 16,
						},
						bottomsheetStyles.marginHorizontal,
					]}
				>
					<TouchableOpacity
						style={{
							paddingLeft: 0,
							paddingVertical: 12,
							paddingRight: 24,
							justifyContent: "center",
						}}
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
					/>
				</View>

				{/* TODO: Move the "Delete Event" Feature to Event Detail Context ... Menu - as for the headline, we dont need a headline */}
				{/* <View
				style={[
					bottomsheetStyles.paddingTop,
					bottomsheetStyles.paddingHorizontal,
					styles.header,
				]}
					>	
				<Text style={styles.title}>
					{id ? "Update Event" : "Create New Event"}
				</Text>
				{id && (
					<AlertDialog
						triggerElement={
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => setIsAlertDialogVisible(true)}
							>
								<TabBarIcon name="trash" style={styles.icon} />
								<Text>Delete</Text>
							</TouchableOpacity>
						}
						title="Delete Event"
						descriptionElement={
							<Text>
								Do you really want to delete this event?
								{"\n"}
								<Text style={styles.strong}>{title}</Text>
							</Text>
						}
						actionText="Delete"
						action={() => {
							pb.collection("events").delete(id);
						}}
						isVisible={isAlertDialogVisible}
						onClose={() => {}}
					/>
				)}
			</View> */}

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
						snapPoints={["50%", "90%"]}
						enableDynamicSizing={false}
						style={bottomsheetStyles.container}
					>
						<BottomSheetView>
							{[
								pb.authStore.record as unknown as { id: string; name: string },
								...allPersons,
							].map((person) => {
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

							<CreatePerson calendar={calendar} />
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
