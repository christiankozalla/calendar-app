import { useState } from "react";
import cx from "classix";
import type { ColorsRecord } from "@/api/pocketbase-types";
import { Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import type { Colors } from "@/store/Colors";

type Props = {
	colors: Colors;
	fieldName: string;
	initialSelected?: string;
};

export const ColorPicker = ({ colors, fieldName, initialSelected }: Props) => {
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<[string, ColorsRecord] | undefined>(
		initialSelected ? [initialSelected, colors[initialSelected]] : undefined,
	);

	return (
		<div>
			<input type="hidden" name={fieldName} value={selected?.[0] || ""} />
			<DropdownMenu.Root open={open} onOpenChange={setOpen}>
				<DropdownMenu.Trigger>
					<Button variant="soft" size="2">
						{selected ? (
							<>
								<div
									className="w-6 h-6 rounded-full"
									style={{ backgroundColor: selected[1].hex }}
								/>
								{selected[1].name}
							</>
						) : (
							"Colors"
						)}
						<DropdownMenu.TriggerIcon />
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<div className="grid grid-cols-4 gap-2 p-2 bg-white rounded-lg shadow-lg">
						{Object.entries(colors)
							.filter(([_, color]) => color.name && color.hex)
							.map(([id, color]) => (
								<button
									key={id}
									type="button"
									className={cx(
										selected?.[0] === id &&
											"outline outline-2 outline-offset-2 outline-current",
										"w-8 h-8 rounded-full cursor-pointer",
									)}
									style={{ backgroundColor: color.hex, color: color.hex }}
									aria-label={color.name}
									onClick={() => {
										setSelected([id, color]);
										setOpen(false);
									}}
								/>
							))}
					</div>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	);
};
