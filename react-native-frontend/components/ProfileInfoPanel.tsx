import { Fragment, useCallback, useRef, useState } from "react";
import {
	ActivityIndicator,
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
} from "react-native";
import { pb, PbOperations } from "@/api/pocketbase";
import { typography } from "@/utils/typography";
import { Avatar } from "./Avatar";
import { TabBarIcon } from "./navigation/TabBarIcon";
import {
	BottomSheetModal,
	BottomSheetView,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import type {
	PersonsRecord,
	PersonsResponse,
	UsersResponse,
} from "@/api/pocketbase-types";
import {
	type SetterOrUpdater,
	useRecoilState,
	useRecoilValue,
	useSetRecoilState,
} from "recoil";
import { UserPersonState, UserState } from "@/store/Authentication";
import { Button } from "./Button";
import { router } from "expo-router";
import { ImageUploadButton } from "./ImageUploadButton";
import { generateUUID } from "@/utils/uuid";
import type { ImagePickerAsset } from "expo-image-picker";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";
import { FullWidthGreyBorderButton } from "./FullWidthGreyBorderButton";
import { CalendarsState } from "@/store/Calendars";
import type { ClientResponseError } from "pocketbase";

export const ProfileInfoPanel = () => {
	// updating the user record with update pb.authStore.record AND UserState atom
	const user = useRecoilValue(UserState);
	// userPerson Recoil state must be updated manually
	const [userPerson, setUserPerson] = useRecoilState(UserPersonState);
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
		<Fragment>
			<TouchableOpacity
				style={[styles.flexRow, { flex: 1 }]}
				onPress={() => {
					bottomSheetRef.current?.present();
				}}
			>
				<Avatar uri={avatarUri} size="small" />
				<View style={{ flex: 1 }}>
					<View style={styles.flexRow}>
						<Text style={typography.h6}>{userPerson?.name || ""}</Text>
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
				<ProfileEditor
					user={user}
					profile={userPerson}
					setUserPerson={setUserPerson}
				/>
			</BottomSheetModal>
		</Fragment>
	);
};

const ProfileEditor = ({
	user,
	profile,
	setUserPerson,
}: {
	user: UsersResponse;
	profile: PersonsResponse | null;
	setUserPerson: SetterOrUpdater<PersonsResponse | null>;
}) => {
	const setGlobalCalendars = useSetRecoilState(CalendarsState);
	const [isUpdating, setUpdating] = useState(false);
	const [editProfile, setEditProfile] = useState(false);
	const [name, setName] = useState(profile?.name || "");
	const [avatar, setAvatar] = useState<ImagePickerAsset | null>(null);

	const avatarUri = profile?.avatar
		? pb.files.getURL(profile, profile.avatar, {
				thumb: "400x400f",
			})
		: null;

	const saveAvatarAndName = useCallback(async () => {
		const data: Partial<PersonsRecord> = {
			user: user.id,
		};

		if (name?.trim() && name.trim() !== profile?.name) {
			data.name = name.trim();
		}

		if (avatar && avatar.type === "image") {
			const fileName =
				avatar.fileName ||
				`${profile?.id ?? pb.authStore.record?.id ?? ""}-${generateUUID()}.${getImageFileExtension(avatar.mimeType)}`;

			// @ts-ignore
			data.avatar = {
				uri: avatar.uri,
				type: avatar.mimeType || "image/*",
				name: fileName,
			};
		}

		// return early if no data has been set
		if (!("name" in data || "avatar" in data)) return;

		setUpdating(true);
		let userPersonRecord:
			| PersonsResponse
			| { error: Error | ClientResponseError };
		if (profile) {
			userPersonRecord = await PbOperations.updatePerson(
				{ id: profile.id, ...data },
				setGlobalCalendars,
			);
		} else {
			userPersonRecord = await PbOperations.createPerson(
				data,
				setGlobalCalendars,
			);
		}

		if ("error" in userPersonRecord) {
			console.error("Error updating userPersonRecord:", userPersonRecord.error);
			return;
		}

		setUserPerson(userPersonRecord);
		setEditProfile(false);
		setUpdating(false);
	}, [name, avatar, profile, user, setGlobalCalendars, setUserPerson]);

	const Buttons = () => {
		if (editProfile)
			return (
				<Fragment>
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
				</Fragment>
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
		<Fragment>
			<ImageUploadButton
				style={styles.uploadImageButton}
				setImage={setAvatar}
			/>
			<View style={styles.input}>
				<TabBarIcon name="pencil" style={{ fontSize: 18 }} />
				<BottomSheetTextInput
					style={typography.h3}
					value={name}
					onChangeText={setName}
					autoCorrect={false}
				/>
			</View>
		</Fragment>
	) : (
		<Text style={[typography.h3, { marginTop: 12 }]}>{name}</Text>
	);

	return (
		<BottomSheetView>
			<ConditionalActivityIndicator isVisible={isUpdating} />

			<View
				style={[
					bottomsheetStyles.paddingTop,
					bottomsheetStyles.paddingHorizontal,
					styles.profile,
				]}
			>
				<Buttons />
				<Avatar uri={avatar?.uri || avatarUri} size="xlarge" />
				{EditName}
				<EmailWithVerifiedIcon user={user} />
			</View>

			<View style={styles.profileLinks}>
				<ProfileLinks user={user} />
			</View>
		</BottomSheetView>
	);
};

const EmailWithVerifiedIcon = ({ user }: { user: UsersResponse }) => {
	return (
		<View style={{ flexDirection: "row", gap: 4 }}>
			<Text>{user.email}</Text>
			{user.verified ? (
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

const ProfileLinks = ({ user }: { user: UsersResponse }) => {
	return (
		<FullWidthGreyBorderButton
			onPress={() => {
				router.push("/(tabs)/change-email");
			}}
		>
			<Text>Change email address</Text>
			<Text numberOfLines={1} ellipsizeMode="tail" style={styles.emailText}>
				{user.email}
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
		paddingHorizontal: 10,
		borderRadius: 6,
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
