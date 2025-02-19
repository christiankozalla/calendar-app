import { Fragment, useState, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "./Button";

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
		<Fragment>
			<Button
				style={styles.button}
				onPress={handleCopy}
				label={copied ? "✓" : "Copy"}
			/>
			<View style={styles.container}>
				{children || (
					<Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>
						{text}
					</Text>
				)}
			</View>
		</Fragment>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		borderWidth: 1,
		borderColor: "#e0e0e0",
		borderRadius: 8,
		backgroundColor: "#f5f5f5",
	},
	text: {
		flex: 1,
	},
	button: {
		backgroundColor: "#e0e0e0",
		marginBottom: 12,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 4,
		width: "100%",
	},
});
