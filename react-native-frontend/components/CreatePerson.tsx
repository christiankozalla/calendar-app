import React, { useCallback, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { pb, PbOperations } from "@/api/pocketbase";
import { Button } from "./Button";
import { useSetRecoilState } from "recoil";
import { CalendarsState } from "@/store/Calendars";

type Props = { calendar: string };

export const CreatePerson = ({ calendar }: Props) => {
	const [name, setName] = useState<string>("");
	const setCalendarsState = useSetRecoilState(CalendarsState);

	const submit = useCallback(async () => {
		if (!name.trim()) return; // Prevent submission if name is empty

		const personData = {
			name: name,
		};

		try {
			const newPerson = await pb.collection("persons").create(personData);

			await PbOperations.addPersonToCalendar(
				calendar,
				newPerson,
				setCalendarsState,
			);

			setName(""); // Clear input after successful submission
		} catch (error) {
			console.error("Error creating person:", error);
			// Handle error (e.g., show an alert to the user)
		}
	}, [name, calendar]);

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
