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
	Separator,
} from "@radix-ui/themes";
import { AlertDialog } from "./AlertDialog";
import { format } from "date-fns";
import { MultiSelect } from "./Multiselect";
import { PersonsState } from "@/store/Persons";
import { TrashIcon } from "./svg/TrashIcon";
import { ColorsState } from "@/store/Colors";
import { ColorPicker } from "./ColorPicker";
import { CreatePerson } from "./CreatePerson";

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
							if (closeAll) closeAll();
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
						<Box className="w-2/3">
							<Text
								size="2"
								className="block mb-1"
								as="label"
								htmlFor="startDate"
							>
								Start Date
							</Text>
							<input
								type="date"
								id="startDate"
								name="startDate"
								value={startDate}
								className="block w-full px-3 py-2 border rounded-md border-gray-200 bg-white appearance-none"
								onChange={(e) =>
									setStartDate(format(e.target.value, "yyyy-MM-dd"))
								}
								required
							/>
						</Box>
						<Box className="w-1/3">
							<Text
								size="2"
								className="block mb-1"
								as="label"
								htmlFor="startTime"
								truncate
							>
								Start Time <small>(optional)</small>
							</Text>
							<input
								type="time"
								id="startTime"
								name="startTime"
								value={startTime}
								className="block w-full px-3 py-2 border rounded-md border-gray-200 bg-white appearance-none"
								onChange={(e) => setStartTime(e.target.value)}
							/>
						</Box>
					</Flex>
					<Flex gap="2">
						<Box className="w-2/3">
							<Text
								size="2"
								className="block mb-1"
								as="label"
								htmlFor="endDate"
							>
								End Date <small>(optional)</small>
							</Text>
							<input
								type="date"
								id="endDate"
								name="endDate"
								value={endDate}
								min={startDate}
								className="block w-full px-3 py-2 border rounded-md border-gray-200 bg-white appearance-none"
								onChange={(e) =>
									setEndDate(format(e.target.value, "yyyy-MM-dd"))
								}
							/>
						</Box>
						<Box className="w-1/3">
							<Text
								size="2"
								className="block mb-1"
								as="label"
								htmlFor="endTime"
								truncate
							>
								End Time <small>(optional)</small>
							</Text>
							<input
								type="time"
								id="endTime"
								name="endTime"
								value={endTime}
								className="block w-full px-3 py-2 border rounded-md border-gray-200 bg-white appearance-none"
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
							<MultiSelect
								className="flex-none w-1/2"
								formfieldName="persons"
								placeholder="People"
								initiallySelected={persons}
								options={allPersons}
							>
								<Separator my="3" size="4" />
								<CreatePerson calendar={calendar} />
							</MultiSelect>
							<ColorPicker
								className="flex-none w-1/2"
								colors={colors}
								fieldName="color"
								initialSelected={color}
							/>
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
