import { useState, type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";

type Props = {
	text: string;
	children?: ReactNode;
};

export const CopyableText = ({ text, children }: Props) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await Clipboard.setStringAsync(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<View style={styles.container}>
			{children || (
				<Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
					{text}
				</Text>
			)}
			<View style={styles.buttonContainer}>
				{copied && <Text style={styles.copiedText}>Copied!</Text>}
				<TouchableOpacity style={styles.button} onPress={handleCopy}>
					<Text style={styles.buttonText}>{copied ? "✓" : "Copy"}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		backgroundColor: "#f5f5f5",
	},
	buttonContainer: {
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	text: {
		flex: 1,
	},
	copiedText: {
		fontSize: 12,
		color: "green",
		marginLeft: 8,
	},
	button: {
		backgroundColor: "#e0e0e0",
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 4,
		marginLeft: 8,
	},
	buttonText: {
		fontSize: 14,
		color: "#333",
	},
});
