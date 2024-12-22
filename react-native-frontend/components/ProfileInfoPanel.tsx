import { useCallback, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { pb } from "@/api/pocketbase";
import { typography } from "@/utils/typography";
import { Avatar } from "./Avatar";
import { TabBarIcon } from "./navigation/TabBarIcon";
import {
	BottomSheetModal,
	BottomSheetView,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import type { UsersResponse } from "@/api/pocketbase-types";
import { useRecoilValue } from "recoil";
import { UserState } from "@/store/Authentication";
import Button from "react-native-ui-lib/button";
import { router } from "expo-router";
import { ImageUploadButton } from "./ImageUploadButton";
import { generateUUID } from "@/utils/uuid";
import type { ImagePickerAsset } from "expo-image-picker";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";
import { FullWidthGreyBorderButton } from "./FullWidthGreyBorderButton";

export const ProfileInfoPanel = () => {
	const user = useRecoilValue(UserState);
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	if (!user) {
		return <ActivityIndicator />;
	}

	const avatarUri = pb.authStore.record
		? pb.files.getURL(pb.authStore.record, pb.authStore.record.avatar, {
				thumb: "100x100",
			})
		: null;

	return (
		<>
			<TouchableOpacity
				style={[styles.flexRow, { flex: 1 }]}
				onPress={() => {
					bottomSheetRef.current?.present();
				}}
			>
				<Avatar uri={avatarUri} size="small" />
				<View style={{ flex: 1 }}>
					<View style={styles.flexRow}>
						<Text style={typography.h6}>{user.name}</Text>
						<TabBarIcon name="pencil" style={{ fontSize: 16 }} />
					</View>
					<Text style={typography.small}>{user.email}</Text>
				</View>
			</TouchableOpacity>

			<BottomSheetModal
				ref={bottomSheetRef}
				style={bottomsheetStyles.container}
				enablePanDownToClose
			>
				<ProfileEditor profile={user as UsersResponse} />
			</BottomSheetModal>
		</>
	);
};

const ProfileEditor = ({ profile }: { profile: UsersResponse }) => {
	const [isUpdating, setUpdating] = useState(false);
	const [editProfile, setEditProfile] = useState(false);
	const [name, setName] = useState(profile.name);
	const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null);

	const avatarUri = pb.authStore.record
		? pb.files.getURL(pb.authStore.record, pb.authStore.record.avatar, {
				thumb: "400x400f",
			})
		: null;

	const saveAvatarAndName = useCallback(async () => {
		const data = new FormData();

		if (name?.trim() && name.trim() !== profile.name) {
			data.set("name", name.trim());
		}

		if (avatar && avatar.type === "image") {
			const fileName =
				avatar.fileName ||
				`${profile.id}-${generateUUID()}.${getImageFileExtension(avatar.mimeType)}`;

			// @ts-ignore
			data.set("avatar", {
				uri: avatar.uri,
				type: avatar.mimeType || "image/*",
				name: fileName,
			});
		}

		// return early if no data has been set
		if (!(data.has("name") || data.has("avatar"))) return;

		try {
			setUpdating(true);
			await pb.collection("users").update(profile.id, data);
			setEditProfile(false);
		} catch (err) {
			console.error("Error uploading to PocketBase:", err);
		} finally {
			setUpdating(false);
		}
	}, [name, avatar]);

	const Buttons = () => {
		if (editProfile)
			return (
				<>
					<Button
						label="Save"
						style={styles.saveButton}
						onPress={saveAvatarAndName}
						size="small"
					/>
					<TouchableOpacity
						style={styles.editButton}
						onPress={() => setEditProfile(false)}
					>
						<TabBarIcon name="close" style={styles.editIcon} />
					</TouchableOpacity>
				</>
			);

		return (
			<TouchableOpacity
				style={styles.editButton}
				onPress={() => setEditProfile(true)}
			>
				<TabBarIcon name="pencil" style={styles.editIcon} />
			</TouchableOpacity>
		);
	};

	// This is intentionally not written as a function component, as doing so causes the BottomSheetTextInput to close the keyboard on the first keystroke (which is undesired behavior)
	const EditName = editProfile ? (
		<>
			<ImageUploadButton
				style={styles.uploadImageButton}
				setImage={setAvatar}
			/>
			<View style={styles.input}>
				<TabBarIcon name="pencil" style={{ fontSize: 18, marginTop: 6 }} />
				<BottomSheetTextInput
					style={typography.h3}
					value={name}
					onChangeText={setName}
				/>
			</View>
		</>
	) : (
		<Text style={[typography.h3, { marginTop: 12 }]}>{name}</Text>
	);

	return (
		<BottomSheetView>
			<ConditionalActivityIndicator isVisible={isUpdating} />

			<View style={[bottomsheetStyles.paddingTop, bottomsheetStyles.paddingHorizontal, styles.profile]}>
				<Buttons />
				<Avatar uri={avatar?.uri || avatarUri} size="xlarge" />
				{EditName}
				<EmailWithVerifiedIcon profile={profile} />
			</View>

			<View style={styles.profileLinks}>
				<ProfileLinks profile={profile} />
			</View>
		</BottomSheetView>
	);
};

const EmailWithVerifiedIcon = ({ profile }: { profile: UsersResponse }) => {
	return (
		<View style={{ flexDirection: "row", gap: 4 }}>
			<Text>{profile.email}</Text>
			{profile.verified ? (
				<TabBarIcon
					name="checkmark-circle"
					style={[styles.green, styles.icon]}
				/>
			) : (
				<TabBarIcon name="remove-circle" style={[styles.red, styles.icon]} />
			)}
		</View>
	);
};

const ConditionalActivityIndicator = ({
	isVisible,
}: { isVisible: boolean }) => {
	if (isVisible)
		return (
			<View style={styles.spinnerOverlay}>
				<ActivityIndicator />
			</View>
		);
	return null;
};

const ProfileLinks = ({ profile }: { profile: UsersResponse }) => {
	return (
		<FullWidthGreyBorderButton
			onPress={() => {
				router.push("/(tabs)/change-email");
			}}
		>
			<Text>Change email address</Text>
			<Text numberOfLines={1} ellipsizeMode="tail" style={styles.emailText}>
				{profile.email}
			</Text>
			<TabBarIcon name="arrow-forward" style={styles.icon} />
		</FullWidthGreyBorderButton>
	);
};

const getImageFileExtension = (mimeType?: string) => {
	if (!mimeType) return "";
	return mimeType.split("/")[1] || "jpg";
};

const styles = StyleSheet.create({
	profile: {
		flexGrow: 1,
		alignItems: "center",
	},
	profileLinks: { flexGrow: 1, paddingVertical: 36 },
	nameInput: {
		marginVertical: 12,
	},
	saveButton: {
		position: "absolute",
		top: 16,
		left: 12,
	},
	editButton: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 64,
		height: 64,
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 12,
	},
	editIcon: { fontSize: 20, marginTop: 6 },
	uploadImageButton: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 8,
		paddingTop: 4,
		marginVertical: 8,
	},
	flexRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	emailButton: {
		height: 50,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: "#ededed",
		padding: 12,
		marginTop: 16,
	},
	emailText: {
		fontSize: 8,
		fontWeight: "bold",
		marginHorizontal: 8,
		width: "40%",
	},
	green: {
		color: "green",
	},
	red: {
		color: "red",
	},
	icon: {
		fontSize: 20,
	},
	margins: { marginTop: 12, marginHorizontal: 12 },
	input: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 10,
		paddingTop: 0,
		borderRadius: 5,
		marginBottom: 10,
	},
	spinnerOverlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		alignItems: "center",
		justifyContent: "center",
	},
});
