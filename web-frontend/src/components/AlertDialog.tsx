import type { ReactNode } from "react";
import {
	AlertDialog as RadixAlertDialog,
	Button,
	Flex,
} from "@radix-ui/themes";

export const AlertDialog = ({
	actionText,
	triggerElement,
	descriptionElement,
	action,
	title,
}: {
	actionText: string;
	triggerElement: ReactNode;
	descriptionElement: ReactNode;
	action: () => void;
	title: string;
}) => {
	return (
		<RadixAlertDialog.Root>
			<RadixAlertDialog.Trigger>{triggerElement}</RadixAlertDialog.Trigger>
			<RadixAlertDialog.Content maxWidth="450px">
				<RadixAlertDialog.Title>{title}</RadixAlertDialog.Title>
				<RadixAlertDialog.Description size="2">
					{descriptionElement}
				</RadixAlertDialog.Description>

				<Flex gap="3" mt="4" justify="end">
					<RadixAlertDialog.Cancel>
						<Button variant="soft" color="gray">
							Cancel
						</Button>
					</RadixAlertDialog.Cancel>
					<RadixAlertDialog.Action>
						<Button variant="solid" color="red" onClick={action}>
							{actionText}
						</Button>
					</RadixAlertDialog.Action>
				</Flex>
			</RadixAlertDialog.Content>
		</RadixAlertDialog.Root>
	);
};
