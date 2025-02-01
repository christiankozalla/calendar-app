import {
	type StyleProp,
	StyleSheet,
	TouchableOpacity,
	type ViewProps,
} from "react-native";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	onPress: () => void;
	style?: StyleProp<ViewProps>;
}>;

export const FullWidthGreyBorderButton = ({
	children,
	style,
	onPress,
}: Props) => {
	return (
		<TouchableOpacity
			style={[styles.flexRowGrow, styles.greyborderButton, style]}
			onPress={onPress}
		>
			{children}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	flexRowGrow: {
		flexGrow: 1,
		gap: 4,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	greyborderButton: {
		height: 50,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "#ededed",
		padding: 12,
		marginTop: 16,
	},
});
