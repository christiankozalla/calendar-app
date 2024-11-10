import { View, StyleSheet, type ViewStyle } from "react-native";

type HeaderProps = {
	children: React.ReactNode;
	style?: ViewStyle;
};

export const Header = ({ children, style }: HeaderProps) => {
	return (
		<View style={[styles.header, style]}>
			{children}
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
		height: "auto",
		minHeight: 50,
		paddingHorizontal: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		zIndex: 1,
	},
});
