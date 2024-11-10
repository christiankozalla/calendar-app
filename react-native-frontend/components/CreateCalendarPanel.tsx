import type { UsersResponse } from "@/api/pocketbase-types";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { pb } from "@/api/pocketbase";
import { Collections, type CalendarsResponse } from "@/api/pocketbase-types";
import { useSetRecoilState } from "recoil";
import { CalendarsState } from "@/store/Calendars";
import Button from "react-native-ui-lib/button";
import { updateCalendarState } from "@/utils/calendar";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { generateUUID } from "@/utils/uuid";

type Props = {
	onSuccess: ReturnType<typeof Promise.withResolvers<Response>>["resolve"];
	onFailure: ReturnType<typeof Promise.withResolvers<Response>>["reject"];
};
type Response = CalendarsResponse<{ users: UsersResponse[] }>;

export const CreateCalendarPanel = ({ onSuccess, onFailure }: Props) => {
	const [id] = useState(generateUUID());
	const [name, setName] = useState("");
	const setCalendars = useSetRecoilState(CalendarsState);

	const createCalendar = async () => {
		if (!name.trim()) return;

		try {
			const newCalendar = await pb
				.collection(Collections.Calendars)
				.create<Response>(
					{
						id,
						name,
						owner: pb.authStore.model?.id,
						users: [pb.authStore.model?.id],
					},
					{
						expand: "users",
					},
				);

			setCalendars((prev) => updateCalendarState(prev, newCalendar));
			setName("");
			onSuccess(newCalendar);
		} catch (err) {
			console.error(err);
			onFailure(err);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Calendar</Text>
			<BottomSheetTextInput
				style={styles.input}
				value={name}
				onChangeText={setName}
				placeholder="Calendar name"
				placeholderTextColor="#666"
			/>
			<Button
				label="Create"
				onPress={createCalendar}
				disabled={!name.trim()}
				backgroundColor="#006600"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 16,
		paddingBottom: 16,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 6,
		padding: 12,
		fontSize: 16,
	},
});
