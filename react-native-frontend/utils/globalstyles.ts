import { Platform } from "react-native";
import { StyleSheet } from "react-native";

export const globalstyles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "white",
		paddingTop: Platform.OS === "android" ? 30 : 0,
	},
	container: {
		flex: 1,
		backgroundColor: "white",
	},
	header: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		flexGrow: 0,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 2,
	},
});
