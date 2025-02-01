import type { CalendarsResponse, UsersResponse } from "@/api/pocketbase-types";
import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { pb, PbOperations } from "@/api/pocketbase";
import { useSetRecoilState } from "recoil";
import { CalendarsState, type CalendarsStateType } from "@/store/Calendars";
import { Button } from "@/components/Button";
import { BottomSheetTextInput, BottomSheetView } from "@gorhom/bottom-sheet";
import { generateUUID } from "@/utils/uuid";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

type Props = {
	onSuccess: ReturnType<
		typeof Promise.withResolvers<CalendarsResponse<never>>
	>["resolve"];
	onFailure: ReturnType<
		typeof Promise.withResolvers<CalendarsResponse<never>>
	>["reject"];
};

export const CreateCalendarPanel = ({ onSuccess, onFailure }: Props) => {
	const [id] = useState(generateUUID());
	const [name, setName] = useState("");

	const createCalendar = async () => {
		if (!pb.authStore.record?.id || !name.trim()) return;

		const newCalendarResponse = await PbOperations.createCalendar({
			id,
			name,
			owner: pb.authStore.record.id,
		});

		if ("error" in newCalendarResponse) {
			// show error screen
			console.error("CreateCalendarPanel", newCalendarResponse.error);
			onFailure(newCalendarResponse.error);
		} else {
			setName("");
			onSuccess(newCalendarResponse);
		}
	};

	return (
		<BottomSheetView
			style={[
				bottomsheetStyles.paddingTop,
				bottomsheetStyles.paddingHorizontal,
				bottomsheetStyles.paddingBottom,
			]}
		>
			<View style={styles.container}>
				<Text style={styles.title}>Create Calendar</Text>
				<BottomSheetTextInput
					style={styles.input}
					value={name}
					onChangeText={setName}
					placeholder="Calendar name"
					placeholderTextColor="#999"
				/>
				<Button
					label="Create"
					onPress={createCalendar}
					disabled={!name.trim()}
					textColor="white"
					style={{
						backgroundColor: "#006600",
						borderWidth: 0,
					}}
				/>
			</View>
		</BottomSheetView>
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
