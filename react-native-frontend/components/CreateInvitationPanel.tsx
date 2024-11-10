import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { createURL } from "expo-linking";
import type { CalendarsResponse, UsersResponse } from "@/api/pocketbase-types";
import { pb } from "@/api/pocketbase";
import { CopyableText } from "./CopyableText";
import Button from "react-native-ui-lib/button";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type Props = {
	calendar: CalendarsResponse<{ users: UsersResponse[] }>;
};

// TODO: Re-design this component to allow MULTI user invite
export const CreateInvitationPanel = ({ calendar }: Props) => {
	const [invitationLink, setInvitationLink] = useState<string>();
	const [inviteeEmail, setInviteeEmail] = useState("");

	const inviteNewUser = useCallback(async () => {
		try {
			if (!pb.authStore.model?.id) {
				throw new Error("User not logged in");
			}
			const data = {
				invitee_email: inviteeEmail,
				calendar: calendar.id,
				inviter: pb.authStore.model.id,
			};

			const response = await pb.collection("invitations").create(data);

			// const newInvitationLink = `${location.origin}/login-signup?token=${response.token}`;
			const newInvitationLink = createURL("login-signup", {
				queryParams: { token: response.token },
			});
			setInvitationLink(newInvitationLink);
		} catch (err) {
			console.warn("error", (err as { [key: string]: unknown })?.data || err);
		}
	}, [inviteeEmail]);

	return (
		<View style={styles.container}>
			<Text style={styles.title}>
				Invite people to <Text style={styles.italic}>{calendar.name}</Text>
			</Text>
			<View style={styles.form}>
				<BottomSheetTextInput
					style={styles.input}
					placeholder="Email of the person you want to invite"
					placeholderTextColor="#ccc"
					value={inviteeEmail}
					onChangeText={setInviteeEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>
				<Button
					label="Generate Invitation Link"
					onPress={inviteNewUser}
					primary
					disabled={!inviteeEmail.trim()}
				/>
			</View>

			{invitationLink && (
				<View style={styles.linkContainer}>
					<CopyableText text={invitationLink}>
						<Text style={styles.linkText}>
							<Text style={styles.boldText}>Your invitation link: </Text>
							{invitationLink}
						</Text>
					</CopyableText>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingBottom: 16,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8,
	},
	form: {
		marginBottom: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 8,
		marginBottom: 12,
	},
	linkContainer: {
		marginTop: 16,
	},
	linkText: {
		fontSize: 16,
	},
	boldText: {
		fontWeight: "bold",
	},
	button: {
		backgroundColor: "blue",
		color: "white",
	},
	buttonText: {
		color: "white",
	},
	italic: { fontStyle: "italic" },
});
