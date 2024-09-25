import { type PropsWithChildren, useState } from "react";
import { Card, Button, Flex, Text } from "@radix-ui/themes";

type Props = {
	text: string;
} & PropsWithChildren;

export const CopyableText = ({ text, children }: Props) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<Card>
			<Flex align="center" justify="between" gap="2">
				{children || <Text truncate>{text}</Text>}
				{copied && (
					<Text size="1" color="green">
						Copied!
					</Text>
				)}
				<Button
					type="button"
					variant="soft"
					className="w-16"
					onClick={handleCopy}
				>
					{copied ? "✓" : "Copy"}
				</Button>
			</Flex>
		</Card>
	);
};
