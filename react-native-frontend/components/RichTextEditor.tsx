import React, { Dispatch, Fragment, SetStateAction } from "react";
import { Button, TextInput, View, Text, type TextStyle } from "react-native";
import { encode, decode } from "@/utils/unicode";

/**
 * Constants for our rich text markers.
 */
const ZWS = "\u200B"; // Zero-width space used as the marker (both as prefix and base).
const HEADLINE_MARKER_TYPE = 0x10; // Marker type for headline start.

/**
 * Inserts a headline start marker into the text.
 * The marker encodes two bytes:
 *   - [0]: marker type (0x10 for headline)
 *   - [1]: headline level (here: 1)
 *
 * The marker is inserted at the start of a new line.
 */
const addHeadlineMarker = (
	onChangeText: Dispatch<SetStateAction<string | undefined>>,
) => {
	const headlineLevel = 1; // For now, we assume level 1 headline.
	const markerData = new Uint8Array([HEADLINE_MARKER_TYPE, headlineLevel]);
	// Use our encode function to hide the marker data, using ZWS as the base.
	const encodedMarker = encode(ZWS, markerData);

	onChangeText((text) => {
		if (!text) {
			return encodedMarker;
		}
		// Ensure the current text ends with a newline before adding the marker.
		if (!text.endsWith("\n")) {
			text = text + "\n";
		}
		// Append the marker and then a newline so that following text appears on a new line.
		return text + encodedMarker;
	});
};

/**
 * Renders the encoded text by looking for our markers.
 * It splits the text into lines; if a line begins with ZWS,
 * it assumes a marker is present.
 *
 * For headline markers, the first 3 characters of the line are:
 *  - The encoded marker (which is ZWS plus two variation selectors encoding our two marker bytes).
 *
 * We decode these bytes to check for a headline marker.
 */
const render = (encodedText: string) => {
	// Split text into lines.
	const lines = encodedText.split("\n");

	return lines.map((line, i) => {
		if (line.startsWith(ZWS)) {
      console.log("line", line, line.length);
			// The rest of the line is the headline text.
			const decodedBytes = decode(line);
      console.log("bytes decoded", decodedBytes)
			if (decodedBytes[0] === HEADLINE_MARKER_TYPE) {
				const level = decodedBytes[1];
				let headlineStyle: TextStyle;
				// Choose a style based on headline level.
				switch (level) {
					case 1:
            console.log("case 1")
						headlineStyle = {
							fontSize: 32,
							fontWeight: "bold",
							marginVertical: 4,
						};
						break;
					case 2:
						headlineStyle = {
							fontSize: 24,
							fontWeight: "bold",
							marginVertical: 4,
						};
						break;
					case 3:
						headlineStyle = {
							fontSize: 18,
							fontWeight: "bold",
							marginVertical: 4,
						};
						break;
					default:
						headlineStyle = {
							fontSize: 32,
							fontWeight: "bold",
							marginVertical: 4,
						};
				}
				console.log("headline", line);
				return (
					<Text key={i} style={headlineStyle}>
						{line + (i === lines.length - 1 ? "" : "\n")}
					</Text>
				);
			}
		}
		// Default rendering for normal lines.
		return <Text key={i}>{line + (i === lines.length - 1 ? "" : "\n")}</Text>;
	});
};

export function RichTextEditor({
	text,
	onChangeText,
}: {
	text?: string;
	onChangeText: Dispatch<SetStateAction<string | undefined>>;
}) {
	return (
		<View style={{ flex: 1 }}>
			<View style={{ flexDirection: "row" }}>
				<Button
					title="Headline"
					onPress={() => addHeadlineMarker(onChangeText)}
				/>
			</View>
			<TextInput
				multiline
				style={{ flex: 1, textAlignVertical: "top" }}
				onChangeText={(encodedText) => {
					onChangeText(encodedText);
				}}
			>
				{render(text || "")}
			</TextInput>
		</View>
	);
}
