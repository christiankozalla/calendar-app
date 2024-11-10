import React, { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { AlertDialog } from "./AlertDialog";
import { format } from "date-fns";
import { MultiSelect } from "./Multiselect";
import { useRecoilValue } from "recoil";
import { PersonsState } from "@/store/Persons";
import { ColorsState } from "@/store/Colors";
import { ColorPicker } from "./ColorPicker";
import { CreatePerson } from "./CreatePerson";
import { TabBarIcon } from "./navigation/TabBarIcon";

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

const setDateTimes = (formData: FormData) => {
	const startDate = formData.get("startDate");
	const startTime = formData.get("startTime");

	if (startDate) {
		const datetime = new Date(startDate as string);
		if (startTime) {
			const [hours, minutes] = (startTime as string).split(":");
			datetime.setHours(Number(hours));
			datetime.setMinutes(Number(minutes));
		}
		formData.set("startDatetime", datetime.toISOString());
	}
	const endDate = formData.get("endDate");
	const endTime = formData.get("endTime");
	if (endDate) {
		const datetime = new Date(endDate as string);
		if (endTime) {
			const [hours, minutes] = (endTime as string).split(":");
			datetime.setHours(Number(hours));
			datetime.setMinutes(Number(minutes));
		}
		formData.set("endDatetime", datetime.toISOString());
	}
};

const deleteEvent = (id: string) => {
	pb.collection("events").delete(id);
};

const handleColorSelect = (color: string) => {
	console.log(color);
};

export const EventPanelCrud = ({
	id,
	calendar,
	startDatetime,
	endDatetime,
	title,
	description,
	color,
	persons,
}: Props) => {
	const allPersons = useRecoilValue(PersonsState);
	const [startDate, setStartDate] = useState<string>("");
	const [startTime, setStartTime] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");
	const [isAlertDialogVisible, setIsAlertDialogVisible] = useState(false);
	const colors = useRecoilValue(ColorsState);
	const [formData, setFormData] = useState({
		title: title || "",
		description: description || "",
	});

	useEffect(() => {
		const newDate = startDatetime ? format(startDatetime, "yyyy-MM-dd") : "";
		const newTime = startDatetime
			? new Date(startDatetime).toISOString().split("T")[1].substring(0, 5)
			: "";
		setStartDate(newDate);
		setStartTime(newTime);
		const newEndDate = endDatetime ? format(endDatetime, "yyyy-MM-dd") : "";
		const newEndTime = endDatetime
			? new Date(endDatetime).toISOString().split("T")[1].substring(0, 5)
			: "";
		setEndDate(newEndDate);
		setEndTime(newEndTime);
	}, [startDatetime, endDatetime]);

	const handleInputChange = useCallback((name: string, value: string) => {
		setFormData((prev) => ({ ...prev, [name]: value }));
	}, []);

	const handleSubmit = useCallback(async () => {
		const eventData = {
			...formData,
			startDatetime: new Date(
				`${startDate}T${startTime || "00:00"}`,
			).toISOString(),
			endDatetime: endDate
				? new Date(`${endDate}T${endTime || "00:00"}`).toISOString()
				: null,
			calendar,
			owner: pb.authStore.model?.id,
		};

		if (id) {
			await pb.collection("events").update(id, eventData);
		} else {
			await pb.collection("events").create(eventData);
		}

		setFormData({
			title: "",
			description: "",
		});
	}, [formData, startDate, startTime, endDate, endTime, calendar, id]);

	return (
		<View>
			<View style={styles.header}>
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
			</View>

			<TextInput
				style={styles.input}
				placeholder="Event Title"
				value={formData.title}
				onChangeText={(value) => handleInputChange("title", value)}
			/>

			{/* Date and time inputs */}
			<View style={styles.dateTimeContainer}>
				<View style={styles.dateTimeInput}>
					<Text style={styles.label}>Start Date</Text>
					<TextInput
						style={styles.input}
						placeholder="YYYY-MM-DD"
						value={startDate}
						onChangeText={setStartDate}
					/>
				</View>
				<View style={styles.dateTimeInput}>
					<Text style={styles.label}>Start Time</Text>
					<TextInput
						style={styles.input}
						placeholder="HH:MM"
						value={startTime}
						onChangeText={setStartTime}
					/>
				</View>
			</View>

			<View style={styles.dateTimeContainer}>
				<View style={styles.dateTimeInput}>
					<Text style={styles.label}>End Date (optional)</Text>
					<TextInput
						style={styles.input}
						placeholder="YYYY-MM-DD"
						value={endDate}
						onChangeText={setEndDate}
					/>
				</View>
				<View style={styles.dateTimeInput}>
					<Text style={styles.label}>End Time (optional)</Text>
					<TextInput
						style={styles.input}
						placeholder="HH:MM"
						value={endTime}
						onChangeText={setEndTime}
					/>
				</View>
			</View>

			<TextInput
				style={[styles.input, styles.textArea]}
				placeholder="Event Description"
				value={formData.description}
				onChangeText={(value) => handleInputChange("description", value)}
				multiline
			/>

			<View style={styles.selectorsContainer}>
				<MultiSelect
					placeholder="People"
					initiallySelected={persons}
					onSelectionChange={(selected) => {
						setFormData((prev) => ({
							...prev,
							persons: selected.map((p) => p.id),
						}));
					}}
					options={allPersons}
				>
					<View style={styles.separator} />
					<CreatePerson calendar={calendar} />
				</MultiSelect>
				<ColorPicker
					colors={colors}
					initialSelected={color}
					onColorSelect={handleColorSelect}
				/>
			</View>

			<TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
				<Text style={styles.submitButtonText}>
					{id ? "Update Event" : "Create Event"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
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
		marginBottom: 12,
	},
	dateTimeInput: {
		width: "48%",
	},
	label: {
		marginBottom: 4,
	},
	selectorsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	separator: {
		height: 1,
		backgroundColor: "#ccc",
		marginVertical: 8,
	},
	submitButton: {
		backgroundColor: "#007AFF",
		padding: 12,
		borderRadius: 4,
		alignItems: "center",
	},
	submitButtonText: {
		color: "white",
		fontWeight: "bold",
	},
	strong: {
		fontWeight: "bold",
	},
});
