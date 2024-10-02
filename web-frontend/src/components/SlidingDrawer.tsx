import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren, ReactNode } from "react";
import { Card, Box, Text, Heading, Button } from "@radix-ui/themes";

type Props = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnClickOutside?: boolean;
	title?: string;
	description?: string;
	upperLeftSlot?: ReactNode;
} & PropsWithChildren;

export const SlidingDrawer = ({
	isOpen,
	onOpenChange,
	closeOnClickOutside,
	children,
	title,
	description,
	upperLeftSlot,
}: Props) => {
	const drawerRef = useRef<HTMLDivElement>(null);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			// Trigger reflow
			drawerRef.current?.offsetHeight;
			drawerRef.current?.classList.add("translate-y-0");
			drawerRef.current?.classList.remove("translate-y-full");
		} else {
			drawerRef.current?.classList.remove("translate-y-0");
			drawerRef.current?.classList.add("translate-y-full");
			const timer = setTimeout(() => {
				setIsVisible(false);
			}, 300); // This should match the transition duration
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	useEffect(() => {
		if (closeOnClickOutside) {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					drawerRef.current &&
					!drawerRef.current.contains(event.target as Node)
				) {
					onOpenChange(false);
				}
			};

			if (isOpen) {
				document.addEventListener("mousedown", handleClickOutside);
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}
	}, [closeOnClickOutside, isOpen, onOpenChange]);

	if (!isVisible && !isOpen) return null;

	return (
		<Card
			ref={drawerRef}
			className={`
				fixed bottom-0 left-0 right-0 max-h-[95vh] max-w-screen-sm mx-auto pt-0
				bg-white shadow-lg overflow-auto
				transform transition-transform duration-300 ease-in-out
				translate-y-full
			  `}
		>
			<Box className="p-4">
				<div className="grid grid-cols-3 items-center mb-4">
					{upperLeftSlot ?? null}
					<div className="col-start-2 justify-self-center w-12 h-1.5 bg-gray-300 rounded-full" />
					<Button
						variant="soft"
						radius="full"
						onClick={() => onOpenChange(false)}
						className="w-8 h-8 justify-self-end"
					>
						&#10005;
					</Button>
				</div>
				{title && (
					<Heading size="4" mb="2">
						{title}
					</Heading>
				)}
				{description && (
					<Text size="2" mb="4">
						{description}
					</Text>
				)}
				{children}
			</Box>
		</Card>
	);
};
