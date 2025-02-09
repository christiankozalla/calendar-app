import { Platform } from "react-native";
import { StyleSheet } from "react-native";

export const globalstyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "white",
		paddingTop: Platform.OS === "android" ? 30 : 0,
	},
});
