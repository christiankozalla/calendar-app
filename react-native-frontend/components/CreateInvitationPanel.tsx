import { useCallback, useState } from "react";
import {
	View,
	Text,
	TextInput,
	StyleSheet,
} from "react-native";
import type { CalendarsResponse, UsersResponse } from "@/api/pocketbase-types";
import { pb } from "@/api/pocketbase";
import { CopyableText } from "./CopyableText";
import Button from "react-native-ui-lib/button";

type Props = {
	calendar: CalendarsResponse<{ users: UsersResponse[] }>;
};

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

			const newInvitationLink = `${location.origin}/login-signup?token=${response.token}`;
			setInvitationLink(newInvitationLink);
		} catch (err) {
			console.warn("error", (err as { [key: string]: unknown })?.data || err);
		}
	}, [calendar.id, inviteeEmail]);

	return (
		<View>
			<Text style={styles.title}>
				Invite people to your calendar
			</Text>
			<View style={styles.form}>
				<TextInput
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
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8
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
});
