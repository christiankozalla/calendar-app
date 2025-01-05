// Invitation flow
// 1. Inviter sends email address to collection("invitations")
// 2. collection("invitations") has an onBefore or an onAfter hook that:
// 2.1 generates a JWT token
// 2.2. returns a signup link /login-signup?token=<TOKEN> ( inviter name +  invitee email in token payload )
// 3. The login page hides the login feature
// 3.1 The login page prefills the email address in a disabled field
// 3.2 Explains who was the inviter
// 3.3. When the invitee signs up with the token, an onAfter hook is called in Users-Create
// 4. OnAfter in Users-Create does
// 4.1 verify and decode the token
// 4.2 check the invitation entity for whether it is a legitimate request (do token and emails match?)
// 4.3 add invitee email address to Calendar to which they were invited
// 4.4 set their own User status to verified (because they already received the invitation as email)

import type { CalendarsResponse } from "@/api/pocketbase-types";
import { useState, type FormEventHandler } from "react";
import {
	TextField,
	Box,
	Text,
	Select,
	Button,
	Flex,
	Strong,
} from "@radix-ui/themes";
import { pb } from "@/api/pocketbase";
import { ClientResponseError } from "pocketbase";
import { CopyableText } from "./CopyableText";

type Props = {
	calendars: CalendarsResponse[];
};

export const CreateInvitationPanel = ({ calendars }: Props) => {
	const [invitationLink, setInvitationLink] = useState<string>();

	const inviteNewUser: FormEventHandler<HTMLFormElement> = async (e) => {
		try {
			e.preventDefault();
			const fd = new FormData(e.target as HTMLFormElement);

			fd.append("inviter", pb.authStore.model?.id || "");

			const response = await pb.collection("invitations").create(fd);

			const newInvitationLink = `${location.origin}/login-signup?token=${response.token}`;
			setInvitationLink(newInvitationLink);
		} catch (err) {
			if (err instanceof ClientResponseError) {
				console.warn("error", err.data);
			} else {
				console.error("CreateInvitationPanel", err);
			}
		}
	};

	return (
		<Box mt="6">
			<Text>Invite people to share your calendar with (exclusively)</Text>
			<form onSubmit={inviteNewUser}>
				<Flex direction="column" gap="2">
					<TextField.Root
						type="email"
						name="invitee_email"
						placeholder="Email: Who do you want to invite to your calendar?"
						required
					/>
					<Select.Root name="calendar">
						<Select.Trigger
							variant="surface"
							placeholder="The calendar you want to invite to"
						/>
						<Select.Content variant="soft">
							{calendars.map((c) => (
								<Select.Item key={c.id} value={c.id}>
									{c.name}
								</Select.Item>
							))}
						</Select.Content>
					</Select.Root>
					<Button type="submit" className="block">
						Generate Invitation Link
					</Button>
				</Flex>
			</form>

			{invitationLink && (
				<Box my="2">
					<CopyableText text={invitationLink}>
						<Text truncate>
							<Strong>Your invitation link: </Strong>
							{invitationLink}
						</Text>
					</CopyableText>
				</Box>
			)}
		</Box>
	);
};
