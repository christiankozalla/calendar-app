import { View, StyleSheet, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps = {
	children: React.ReactNode;
	style?: ViewStyle;
};

export const Header = ({ children, style }: HeaderProps) => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.header, { paddingTop: insets.top }, style]}>
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
		paddingHorizontal: 16,
		paddingBottom: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		zIndex: 1,
	},
});
