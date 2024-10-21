import { type PropsWithChildren, useState } from "react";
import { Popover, Checkbox, Flex, Text, Button } from "@radix-ui/themes";
import type { BaseModel } from "pocketbase";

type MultiSelectProps<T extends BaseModel> = PropsWithChildren<{
	options?: T[];
	initiallySelected?: T[];
	placeholder: string;
	formfieldName: string;
	className?: string;
}>;

export function MultiSelect<T extends BaseModel>({
	options,
	initiallySelected = [],
	placeholder,
	formfieldName,
	className = "",
	children,
}: MultiSelectProps<T>) {
	const [open, setOpen] = useState(false);
	const [selectedOptions, setSelectedOptions] =
		useState<T[]>(initiallySelected);

	const handleToggle = (option: T) => {
		setSelectedOptions((prev) =>
			prev.find((o) => o.id === option.id)
				? prev.filter((item) => item.id !== option.id)
				: [...prev, option],
		);
	};

	return (
		<div className={className}>
			<Popover.Root open={open} onOpenChange={setOpen}>
				<Popover.Trigger>
					<Button variant="soft" className="w-full justify-between">
						<Text truncate>
							{selectedOptions.length
								? selectedOptions.map((o) => o.name).join(", ")
								: placeholder}
						</Text>
						<span className="rotate-90">&lsaquo;</span>
					</Button>
				</Popover.Trigger>
				<Popover.Content maxWidth="95vw">
					<Flex gap="4" wrap="wrap">
						{options?.map((option) => (
							<label
								key={option.id}
								htmlFor={option.id}
								className="flex items-center space-x-2 cursor-pointer"
							>
								<Checkbox
									id={option.id}
									checked={selectedOptions.some((o) => o.id === option.id)}
									onCheckedChange={() => handleToggle(option)}
								/>
								<Text size="2">{option.name}</Text>
							</label>
						))}
					</Flex>
					<div>{children}</div>
				</Popover.Content>
			</Popover.Root>
			{/* Hidden inputs for form data */}
			{selectedOptions.map((option) => (
				<input
					key={option.id}
					type="hidden"
					name={formfieldName}
					value={option.id}
				/>
			))}
		</div>
	);
}
