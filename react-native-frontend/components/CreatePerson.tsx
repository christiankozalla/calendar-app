import React, { useCallback, useState } from "react";
import {
	View,
	TextInput,
	StyleSheet,
} from "react-native";
import type { PersonsRecord } from "@/api/pocketbase-types";
import { pb } from "@/api/pocketbase";
import { useSetRecoilState } from "recoil";
import { PersonsState } from "@/store/Persons";
import { Button } from "./Button";

type Props = Pick<PersonsRecord, "calendar">;

export const CreatePerson = ({ calendar }: Props) => {
	const [name, setName] = useState<string>("");
	const setPersons = useSetRecoilState(PersonsState);

	const submit = useCallback(async () => {
		if (!name.trim()) return; // Prevent submission if name is empty

		const personData = {
			name: name,
			calendar: calendar,
		};

		try {
			const newPersonResponse = await pb
				.collection("persons")
				.create(personData);
			setPersons((persons) => [
				...persons.filter((p) => p.id !== newPersonResponse.id),
				newPersonResponse,
			]);
			setName(""); // Clear input after successful submission
		} catch (error) {
			console.error("Error creating person:", error);
			// Handle error (e.g., show an alert to the user)
		}
	}, [name, calendar, setPersons]);

	return (
		<View style={styles.container}>
			<TextInput
				value={name}
				onChangeText={setName}
				placeholder="Name"
				placeholderTextColor="#999"
				style={styles.input}
			/>
			<Button
				label="Create Person"
				onPress={submit}
				disabled={!name}
				style={{ backgroundColor: "#007AFF", borderWidth: 0 }}
				textColor="#fff"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 10,
	},
	input: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
});
