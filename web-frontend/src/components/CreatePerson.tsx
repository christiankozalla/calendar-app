import { useCallback, useState, type FormEventHandler } from "react";
import type { PersonsRecord } from "@/api/pocketbase-types";
import { pb } from "@/api/pocketbase";
import { Button, TextField } from "@radix-ui/themes";
import { useSetRecoilState } from "recoil";
import { PersonsState } from "@/store/Persons";

type Props = Pick<PersonsRecord, "calendar">;

export const CreatePerson = ({ calendar }: Props) => {
	const [name, setName] = useState<string>("");
	const setPersons = useSetRecoilState(PersonsState);

	const submit: FormEventHandler<HTMLFormElement> = useCallback(
		async (event) => {
			event.preventDefault();
			event.stopPropagation();
			const formData = new FormData(event.target as HTMLFormElement);

			const newPersonResponse = await pb.collection("persons").create(formData);
			setPersons((persons) => [
				...persons.filter((p) => p.id !== newPersonResponse.id),
				newPersonResponse,
			]);
			setName("");
		},
		[setPersons],
	);

	return (
		<form onSubmit={submit}>
			<TextField.Root
				name="name"
				placeholder="Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
			/>
			<input type="hidden" name="calendar" value={calendar} />

			<Button type="submit" className="mt-2 w-full">
				Create Person
			</Button>
		</form>
	);
};
