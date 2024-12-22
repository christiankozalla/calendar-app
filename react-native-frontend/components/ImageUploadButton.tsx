import type { Dispatch, SetStateAction } from "react";
import {
	Alert,
	TouchableOpacity,
	type StyleProp,
	type ViewStyle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { TabBarIcon } from "./navigation/TabBarIcon";

type Props = {
	setImage: Dispatch<SetStateAction<ImagePicker.ImagePickerAsset | null>>;
	style?: StyleProp<ViewStyle>;
};

export const ImageUploadButton = ({ setImage, style }: Props) => {
	const handleUpload = async () => {
		Alert.alert("Upload Avatar", "Choose an option", [
			{ text: "Take Photo", onPress: () => takePhoto() },
			{ text: "Choose from Library", onPress: () => pickFromLibrary() },
			{ text: "Cancel", style: "cancel" },
		]);
	};

	const takePhoto = async () => {
		const permission = await ImagePicker.requestCameraPermissionsAsync();
		if (permission.granted) {
			const result = await ImagePicker.launchCameraAsync();
			if (!result.canceled) {
				setImage(result.assets[0]);
			}
		}
	};

	const pickFromLibrary = async () => {
		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (permission.granted) {
			const result = await ImagePicker.launchImageLibraryAsync();
			if (!result.canceled) {
				setImage(result.assets[0]);
			}
		}
	};

	return (
		<TouchableOpacity
			style={[{ flexDirection: "row", gap: 4 }, style]}
			onPress={handleUpload}
		>
			<TabBarIcon name="camera" style={{ fontSize: 24 }} />
			<TabBarIcon name="document" style={{ fontSize: 24 }} />
		</TouchableOpacity>
	);
};
