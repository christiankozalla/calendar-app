import { useEffect, useState, type FormEventHandler } from "react";
import { useRecoilValue } from "recoil";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import {
	TextField,
	Button,
	Flex,
	Box,
	Text,
	TextArea,
	Strong,
	Select,
} from "@radix-ui/themes";
import { AlertDialog } from "./AlertDialog";
import { format } from "date-fns";
import { MultiSelect } from "./Multiselect";
import { PersonsState } from "@/store/Persons";
import { TrashIcon } from "./svg/TrashIcon";
import { ColorsState } from "@/store/Colors";
import { ColorPicker } from "./ColorPicker";

type Props = {
	persons: PersonsResponse[];
	closeSlidingDrawer?: () => void;
	closeAll?: () => void;
} & Pick<
	EventsResponse,
	| "id"
	| "startDatetime"
	| "endDatetime"
	| "title"
	| "description"
	| "calendar"
	| "color"
>;

const setDateTimes = (formData: FormData) => {
	const startDate = formData.get("startDate");
	const startTime = formData.get("startTime");

	if (startDate && startTime) {
		const [hours, minutes] = (startTime as string).split(":");
		const datetime = new Date(startDate as string);
		datetime.setHours(Number(hours));
		datetime.setMinutes(Number(minutes));
		formData.set("startDatetime", datetime.toISOString());
	}
	const endDate = formData.get("endDate");
	const endTime = formData.get("endTime");
	if (endDate && endTime) {
		const [hours, minutes] = (endTime as string).split(":");
		const datetime = new Date(endDate as string);
		datetime.setHours(Number(hours));
		datetime.setMinutes(Number(minutes));
		formData.set("endDatetime", datetime.toISOString());
	}
};

const submit: FormEventHandler<HTMLFormElement> = async (event) => {
	event.preventDefault();
	const formData = new FormData(event.target as HTMLFormElement);
	setDateTimes(formData);
	formData.set("owner", pb.authStore.model?.id);

	const id = formData.get("id");
	if (id) {
		// update existing event
		await pb.collection("events").update(id as string, formData);
	} else {
		await pb.collection("events").create(formData);
	}
	(event.target as HTMLFormElement).reset();
};

const deleteEvent = (id: string) => {
	pb.collection("events").delete(id);
};

export const EventPanelCrud = ({
	id,
	calendar,
	startDatetime,
	endDatetime,
	title,
	description,
	color,
	persons, // persons that are participating in the event
	closeSlidingDrawer,
	closeAll,
}: Props) => {
	const allPersons = useRecoilValue(PersonsState); // all existing persons in the backend for this user
	const [startDate, setStartDate] = useState<string>("");
	const [startTime, setStartTime] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [endTime, setEndTime] = useState<string>("");
	const colors = useRecoilValue(ColorsState);

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

	return (
		<>
			<Flex justify="between">
				<Text size="4" weight="bold" mb="2" className="block">
					{id ? "Update Event" : "Create New Event"}
				</Text>
				{id && (
					<AlertDialog
						triggerElement={
							<Button radius="full" variant="soft">
								<TrashIcon className="w-4 h-4" /> Delete
							</Button>
						}
						title="Delete Event"
						descriptionElement={
							<Text>
								Do you really want to delete this event?
								<br />
								<Strong>{title}</Strong>
							</Text>
						}
						actionText="Delete"
						action={() => {
							deleteEvent(id);
							if (closeAll) closeAll(); // bug/unwanted behavior: when an event is deleted, the sliding drawer stays open and displays a "Create New Event" panel (because the useEffect in Calendar.tsx runs again)
						}}
					/>
				)}
			</Flex>
			<form
				onSubmit={(e) => {
					submit(e);
					if (closeSlidingDrawer) closeSlidingDrawer();
				}}
				onReset={() => {
					setStartTime("");
					setStartDate("");
					setEndTime("");
					setEndDate("");
				}}
			>
				<Flex direction="column" gap="3">
					<TextField.Root
						name="title"
						defaultValue={title}
						placeholder="Event Title"
						required
					/>

					<Flex gap="2">
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								Start Date
							</Text>
							<input
								type="date"
								name="startDate"
								value={startDate}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) =>
									setStartDate(format(e.target.value, "yyyy-MM-dd"))
								}
								required
							/>
						</Box>
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								Time
							</Text>
							<input
								type="time"
								name="startTime"
								value={startTime}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) => setStartTime(e.target.value)}
								required
							/>
						</Box>
					</Flex>
					<Flex gap="2">
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								End Date <small>(optional)</small>
							</Text>
							<input
								type="date"
								name="endDate"
								value={endDate}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) =>
									setEndDate(format(e.target.value, "yyyy-MM-dd"))
								}
							/>
						</Box>
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								End Time <small>(optional)</small>
							</Text>
							<input
								type="time"
								name="endTime"
								value={endTime}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) => setEndTime(e.target.value)}
							/>
						</Box>
					</Flex>

					<TextArea
						name="description"
						defaultValue={description}
						placeholder="Event Description"
					/>

					<Box>
						<Flex gap="2" className="w-full">
							<div className="w-2/3">
								<Text size="2" className="mb-1">
									Participants
								</Text>
								<MultiSelect
									formfieldName="persons"
									placeholder="Select participating persons"
									initiallySelected={persons}
									options={allPersons}
								/>
							</div>
							<div className="w-1/3">
								<Text size="2" className="mb-1">
									Color
								</Text>
								<ColorPicker
									colors={colors}
									fieldName="color"
									initialSelected={color}
								/>
							</div>
						</Flex>
					</Box>

					<input type="hidden" name="calendar" value={calendar} />
					{id && <input type="hidden" name="id" value={id} />}

					<Button type="submit" className="mt-2">
						{id ? "Update Event" : "Create Event"}
					</Button>
				</Flex>
			</form>
		</>
	);
};
