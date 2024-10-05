import { useEffect, useState, type FormEventHandler } from "react";
import { useRecoilValue } from "recoil";
import { pb } from "@/api/pocketbase";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { TextField, Button, Flex, Box, Text, TextArea } from "@radix-ui/themes";
import { format } from "date-fns";
import { MultiSelect } from "./Multiselect";
import { PersonsState } from "@/store/Persons";

type Props = {
	persons: PersonsResponse[];
} & Pick<
	EventsResponse,
	"id" | "startDatetime" | "endDatetime" | "title" | "description" | "calendar"
>;

const submit: FormEventHandler<HTMLFormElement> = async (event) => {
	event.preventDefault();
	const formData = new FormData(event.target as HTMLFormElement);
	const date = formData.get("startDate");
	const time = formData.get("startTime");
	if (date && time) {
		const [hours, minutes] = (time as string).split(":");
		const datetime = new Date(date as string);
		datetime.setHours(Number(hours));
		datetime.setMinutes(Number(minutes));
		formData.set("startDatetime", datetime.toISOString());
	}
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

export const EventPanelCrud = ({
	id,
	calendar,
	startDatetime,
	title,
	description,
	persons, // persons that are participating in the event
}: Props) => {
	const allPersons = useRecoilValue(PersonsState); // all existing persons in the backend for this user
	const [date, setDate] = useState<string>("");
	const [time, setTime] = useState<string>("");

	useEffect(() => {
		const newDate = startDatetime ? format(startDatetime, "yyyy-MM-dd") : "";
		const newTime = startDatetime
			? new Date(startDatetime).toISOString().split("T")[1].substring(0, 5)
			: "";
		setDate(newDate);
		setTime(newTime);
	}, [startDatetime]);

	return (
		<>
			<Text size="4" weight="bold" mb="2" className="block">
				{id ? "Update Event" : "Create New Event"}
			</Text>
			<form onSubmit={submit}>
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
								Date
							</Text>
							<input
								type="date"
								name="startDate"
								value={date}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) => setDate(format(e.target.value, "yyyy-MM-dd"))}
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
								value={time}
								className="w-full px-3 py-2 border rounded-md"
								onChange={(e) =>
									setTime(
										new Date(e.target.value)
											.toISOString()
											.split("T")[1]
											.substring(0, 5),
									)
								}
								required
							/>
						</Box>
					</Flex>

					<TextArea
						name="description"
						defaultValue={description}
						placeholder="Event Description"
					/>

					<Box>
						<Text size="2" className="mb-1">
							Participants
						</Text>
						<MultiSelect
							formfieldName="persons"
							placeholder="Select participating persons"
							initiallySelected={persons}
							options={allPersons}
						/>
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
