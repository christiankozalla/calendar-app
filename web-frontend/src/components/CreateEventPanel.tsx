import type { FormEventHandler } from "react";
import type { BaseModel } from "pocketbase";
import { pb } from "@/api/pocketbase";
import type { EventsRecord, PersonsResponse } from "@/api/pocketbase-types";
import { TextField, Button, Flex, Box, Text, TextArea } from "@radix-ui/themes";
import { format } from "date-fns";
import { MultiSelect } from "./Multiselect";

type Props = {
	calendarId: BaseModel["id"];
	persons: PersonsResponse[];
} & Pick<EventsRecord, "datetime" | "title" | "description">;

const submit: FormEventHandler<HTMLFormElement> = async (event) => {
	event.preventDefault();
	const formData = new FormData(event.target as HTMLFormElement);
	const date = formData.get("date");
	const time = formData.get("time");
	if (date && time) {
		const [hours, minutes] = (time as string).split(":");
		const datetime = new Date(date as string);
		datetime.setHours(Number(hours));
		datetime.setMinutes(Number(minutes));
		formData.set("datetime", datetime.toISOString());
	}
	formData.set("owner", pb.authStore.model?.id);

	formData.forEach((v, k) => {
		console.log(k, v);
	});

	await pb.collection("events").create(formData);
	(event.target as HTMLFormElement).reset();
};

export const CreateEventPanel = ({
	calendarId,
	datetime,
	title,
	description,
	persons,
}: Props) => {
	const defaultDate = datetime ? format(datetime, "yyyy-MM-dd") : "";
	const defaultTime = datetime
		? new Date(datetime).toISOString().split("T")[1].substring(0, 5)
		: "";

	return (
		<>
			<Text size="5" weight="bold" mb="3" className="block">
				Create New Event
			</Text>
			<form onSubmit={submit}>
				<Flex direction="column" gap="3">
					<TextField.Root
						name="title"
						defaultValue={title}
						placeholder="Event Title"
						required
					></TextField.Root>

					<Flex gap="2">
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								Date
							</Text>
							<input
								type="date"
								name="date"
								defaultValue={defaultDate}
								className="w-full px-3 py-2 border rounded-md"
								required
								onChange={(e) => {
									console.log("date", e);
								}}
							/>
						</Box>
						<Box className="flex-1">
							<Text size="2" className="mb-1">
								Time
							</Text>
							<input
								type="time"
								name="time"
								defaultValue={defaultTime}
								className="w-full px-3 py-2 border rounded-md"
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
						<MultiSelect<PersonsResponse[]>
							formfieldName="persons"
							placeholder="Select participating persons"
							options={persons}
						/>
					</Box>

					<input type="hidden" name="calendar" value={calendarId} />

					<Button type="submit" className="mt-2">
						Create Event
					</Button>
				</Flex>
			</form>
		</>
	);
};
