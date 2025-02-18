import { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const formatValue = (value: Date, mode: "date" | "time") => {
	if (mode === "date") {
		return value.toLocaleDateString();
	}
	if (mode === "time") {
		return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}
	return value.toString();
};

// Component to wrap DateTimePicker for Android behavior
export const AndroidDateTimePicker = ({
	value,
	mode,
	onChange,
}: {
	value: Date;
	mode: "date" | "time";
	onChange: (event: unknown, selectedDate?: Date) => void;
}) => {
	const [show, setShow] = useState(false);

	const handlePress = () => {
		setShow(true);
	};

	const handleChange = (event: unknown, selectedDate?: Date) => {
		setShow(false); // dismiss picker on selection/cancel
		if (selectedDate) {
			onChange(event, selectedDate);
		}
	};

	return (
		<View style={styles.androidPickerContainer}>
			<TouchableOpacity onPress={handlePress} style={styles.pickerButton}>
				<Text style={styles.pickerButtonText}>{formatValue(value, mode)}</Text>
			</TouchableOpacity>
			{show && (
				<DateTimePicker
					value={value}
					mode={mode}
					textColor="black"
					display="default"
					onChange={handleChange}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	pickerButton: {
		padding: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		marginRight: 8,
	},
	pickerButtonText: {
		fontSize: 16,
	},
	androidPickerContainer: {},
});
