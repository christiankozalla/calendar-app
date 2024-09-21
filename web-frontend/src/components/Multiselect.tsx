import { useState } from "react";
import { Popover, Checkbox, Flex, Text, Button } from "@radix-ui/themes";
import type { BaseModel } from "pocketbase";

type MultiSelectProps<T extends BaseModel> = {
	options: T[];
	placeholder: string;
	formfieldName: string;
};

export function MultiSelect<T extends BaseModel>({
	options,
	placeholder,
	formfieldName,
}: MultiSelectProps<T>) {
	const [open, setOpen] = useState(false);
	const [selectedOptions, setSelectedOptions] = useState<T[]>([]);

	const handleToggle = (option: T) => {
		setSelectedOptions((prev) =>
			prev.find((o) => o.id === option.id)
				? prev.filter((item) => item.id !== option.id)
				: [...prev, option],
		);
	};

	return (
		<>
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger>
					<Button variant="soft" className="w-full justify-between">
						<span>
							{selectedOptions.length
								? selectedOptions.map((o) => o.name).join(", ")
								: placeholder}
						</span>
						<span className="rotate-90">&lsaquo;</span>
					</Button>
				</Popover.Trigger>
				<Popover.Content className="w-[200px]">
					<Flex gap="4">
						{options.map((option) => (
							<label
								key={option.id}
								className="flex items-center space-x-2 cursor-pointer"
							>
								<Checkbox
									checked={selectedOptions.some((o) => o.id === option.id)}
									onCheckedChange={() => handleToggle(option)}
								/>
								<Text size="2">{option.name}</Text>
							</label>
						))}
					</Flex>
				</Popover.Content>
			</Popover.Root>
	selectedOptions.map((option) => (
		<input
			key={option.id}
			type="hidden"
			name={formfieldName}
			value={option.id}
		/>
	));
	</>
	)
}
