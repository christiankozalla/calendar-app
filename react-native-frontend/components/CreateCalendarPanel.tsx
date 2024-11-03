import type { UsersResponse } from "@/api/pocketbase-types";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
} from "react-native";
import { useState } from "react";
import { pb } from "@/api/pocketbase";
import { Collections, type CalendarsResponse } from "@/api/pocketbase-types";
import { useSetRecoilState } from "recoil";
import { CalendarsState } from "@/store/Calendars";
import Button from "react-native-ui-lib/button";
import { updateCalendarState } from "@/utils/calendar";

export const CreateCalendarPanel = ({
	closeSlidingDrawer,
}: { closeSlidingDrawer?: () => void }) => {
	const [name, setName] = useState("");
	const setCalendars = useSetRecoilState(CalendarsState);

	const createCalendar = async () => {
		if (!name.trim()) return;

		try {
			const newCalendar = await pb
				.collection(Collections.Calendars)
				.create<CalendarsResponse<{ users: UsersResponse[] }>>(
					{
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
		} catch (err) {
			console.error(err);
		} finally {
			closeSlidingDrawer?.();
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Calendar</Text>
			<TextInput
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
		padding: 16,
		gap: 16,
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
