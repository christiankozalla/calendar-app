import {
	Text,
	TouchableOpacity,
	StyleSheet,
	type ViewStyle,
	type StyleProp,
} from "react-native";

type Props = {
	label: string;
	onPress: () => void;
	textColor?: string;
	disabled?: boolean;
	size?: "small" | "medium";
	style?: StyleProp<ViewStyle>;
};

export const Button = ({
	label,
	onPress,
	disabled,
	style,
	textColor = "black",
	size = "medium",
}: Props) => {
	return (
		<TouchableOpacity
			style={[styles.button, disabled && styles.disabled, style, styles[size]]}
			onPress={onPress}
			disabled={disabled}
		>
			<Text style={{ textAlign: "center", color: textColor }}>{label}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		paddingHorizontal: 16,
		justifyContent: "center",
		borderWidth: 2,
		color: "grey",
	},
	disabled: {
		opacity: 0.5,
	},
	small: {
		paddingHorizontal: 16,
		borderRadius: 16,
		height: 32,
	},
	medium: {
		paddingHorizontal: 26,
		borderRadius: 26,
		height: 44,
		fontWeight: "bold"
	},
});
