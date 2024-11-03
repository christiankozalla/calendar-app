import type { ReactNode } from "react";
import {
	View,
	KeyboardAvoidingView,
	StyleSheet,
	Platform,
	TouchableWithoutFeedback,
	Keyboard,
    type ViewStyle,
} from "react-native";

export const KeyboardAvoidingComponent = ({
	children,
	style,
}: { children: ReactNode; style?: ViewStyle }) => {
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={style}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View>{children}</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
};

