import { Fragment, useCallback, useState } from "react";
import { View, Text, StyleSheet, Keyboard } from "react-native";
import { createURL } from "expo-linking";
import { pb } from "@/api/pocketbase";
import { CopyableText } from "./CopyableText";
import { Button } from "./Button";
import type { CalendarsStateType } from "@/store/Calendars";
import { UserState } from "@/store/Authentication";
import { useRecoilValue } from "recoil";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type Props = {
	calendar: CalendarsStateType[string];
};

// TODO: Re-design this component to allow MULTI user invite
export const CreateInvitationPanel = ({ calendar }: Props) => {
	const user = useRecoilValue(UserState);
	const [invitationLink, setInvitationLink] = useState<string>();
	const [inviteeEmail, setInviteeEmail] = useState("");

	const inviteNewUser = useCallback(async () => {
		try {
			if (!user) {
				throw new Error("User not logged in");
			}
			const data = {
				invitee_email: inviteeEmail,
				calendar: calendar.id,
				inviter: user.id,
			};

			const { token } = await pb.collection("invitations").create(data);

			// const newInvitationLink = `${location.origin}/login-signup?token=${token}`;
			const newInvitationLink = createURL("login-signup", {
				queryParams: { token },
			});
			setInvitationLink(newInvitationLink);
			Keyboard.dismiss();
		} catch (err) {
			console.warn("error", (err as { [key: string]: unknown })?.data || err);
		}
	}, [user, calendar, inviteeEmail]);

	if (user?.id !== calendar.owner) {
		console.log(
			"CreateInvitationPanel hidden: User is not the owner of the calendar",
		);
		return;
	}

	return (
		<Fragment>
			<Text style={styles.title}>Invite people to {calendar.name}</Text>
			<View style={styles.form}>
				<BottomSheetTextInput
					style={styles.input}
					placeholder="Email of the person you want to invite"
					placeholderTextColor="#999"
					value={inviteeEmail}
					onChangeText={setInviteeEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>
				<Button
					label="Generate Invitation Link"
					onPress={inviteNewUser}
					disabled={!inviteeEmail.trim() || Boolean(invitationLink)}
				/>
			</View>

			{invitationLink && (
				<View>
					<CopyableText text={invitationLink}>
						<Text style={styles.linkText}>
							<Text style={styles.boldText}>Your invitation link: </Text>
							<Text numberOfLines={1} ellipsizeMode="tail">
								{invitationLink}
							</Text>
						</Text>
					</CopyableText>
				</View>
			)}
		</Fragment>
	);
};

const styles = StyleSheet.create({
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 8,
	},
	form: {
		marginBottom: 32,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		padding: 8,
		marginBottom: 12,
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
