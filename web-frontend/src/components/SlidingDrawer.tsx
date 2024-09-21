import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { Card, Box, Text, Heading, Button } from "@radix-ui/themes";

type Props = {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	closeOnClickOutside: boolean;
	title?: string;
	description?: string;
} & PropsWithChildren;

export const SlidingDrawer = ({
	isOpen,
	onOpenChange,
	closeOnClickOutside,
	children,
	title,
	description,
}: Props) => {
	const drawerRef = useRef<HTMLDivElement>(null);
	const [animationProgress, setAnimationProgress] = useState(isOpen ? 1 : 0);

	useEffect(() => {
		const drawer = drawerRef.current;
		if (!drawer) return;

		let start: number | null = null;
		let animationFrameId: number;

		const animate = (timestamp: number) => {
			if (start === null) start = timestamp;
			const elapsed = timestamp - start;
			const duration = 300; // Animation duration in ms
			const progress = Math.min(elapsed / duration, 1);

			const easedProgress = easeInOutCubic(progress);
			const currentProgress = isOpen ? easedProgress : 1 - easedProgress;

			setAnimationProgress(currentProgress);

			if (progress < 1) {
				animationFrameId = requestAnimationFrame(animate);
			}
		};

		animationFrameId = requestAnimationFrame(animate);

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
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

	const translateY = 105 - animationProgress * 100;

	return (
		<Card
			ref={drawerRef}
			className="fixed bottom-0 left-0 right-0 max-h-[95vh] max-w-screen-sm mx-auto bg-white shadow-lg pt-0 overflow-auto mx-2"
			style={{
				transform: `translateY(${translateY}%)`,
				visibility: translateY === 100 ? "hidden" : "visible",
			}}
		>
			<Box className="p-4">
				<div className="grid grid-cols-3 items-center mb-4">
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

// Easing function for smooth animation
function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// IMPLEMENTATION WITH CSS TRANSFORM TRANSLATE - WITHOUT requestAnimationFrame
// import { useEffect, useRef } from "react";
// import type { PropsWithChildren } from "react";
// import { Card, Box, Text, Heading } from "@radix-ui/themes";

// type Props = {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   title?: string;
//   description?: string;
// } & PropsWithChildren;

// export const SlidingDrawer = ({ isOpen, onOpenChange, children, title, description }: Props) => {
//   const drawerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
//         onOpenChange(false);
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onOpenChange]);

//   return (
//     <Card

//       ref={drawerRef}
//       size="2"
//       className={`fixed bottom-0 left-0 right-0 max-h-[95vh] max-w-screen-sm mx-auto transform transition-all duration-300 ease-in-out bg-white shadow-lg overflow-auto ${
//         isOpen ? 'translate-y-2' : 'translate-y-full'
//       }`}
//     >
//       <Box className="p-4">
//         <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
//         {title && <Heading size="4" mb="2">{title}</Heading>}
//         {description && <Text size="2" mb="4">{description}</Text>}
//         {children}
//       </Box>
//     </Card>
//   );
// };
