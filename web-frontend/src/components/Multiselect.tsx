import { useState } from "react";
import { Popover, Checkbox, Flex, Text, Button } from "@radix-ui/themes";
import type { BaseModel } from "pocketbase";

type MultiSelectProps<T extends BaseModel[]> = {
	options: T;
	placeholder: string;
	formfieldName: string;
};

export function MultiSelect<T extends BaseModel[]>({
	options,
	placeholder,
	formfieldName,
}: MultiSelectProps<T>) {
	const [open, setOpen] = useState(false);
	// @ts-ignore
	const [selectedOptions, setSelectedOptions] = useState<T>([]);

	const handleToggle = (id: string) => {
		setSelectedOptions((prev) => {
			return prev.find((o) => o.id === id)
				? (prev.filter((item) => item.id !== id) as T) // remove
				: ([...prev!, options.find((o) => o.id === id)] as T); // add
		});
	};

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Trigger>
				<Button variant="soft" className="w-full justify-between">
					<span>
						{selectedOptions?.length
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
							htmlFor={option.id}
							className="flex items-center space-x-2 cursor-pointer"
						>
							<Checkbox
								id={option.id}
								name={formfieldName}
								value={option.id}
								checked={selectedOptions?.some((o) => o.id === option.id)}
								onCheckedChange={() => handleToggle(option.id)}
							/>
							<Text size="2">{option.name}</Text>
						</label>
					))}
				</Flex>
			</Popover.Content>
		</Popover.Root>
	);
}
