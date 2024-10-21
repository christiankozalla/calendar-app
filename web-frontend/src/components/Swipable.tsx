import { useCallback, useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
	global?: boolean; // if true, swipes on the whole window/screen will be detected
	className?: string;
	onSwipe: ({
		startX,
		startY,
		endX,
		endY,
		deltaX,
		deltaY,
	}: OnSwipeParams) => void;
}>;

export type OnSwipeParams = {
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	deltaX: number;
	deltaY: number;
};

export const Swipable = ({
	children,
	onSwipe,
	className = "",
	global = false,
}: Props) => {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const startX = useRef(0);
	const startY = useRef(0);

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			if (
				!global &&
				e.target &&
				!wrapperRef.current?.contains(e.target as Node)
			) {
				return;
			}

			startX.current = e.touches[0].clientX;
			startY.current = e.touches[0].clientY;
		},
		[global],
	);

	const handleTouchEnd = useCallback(
		(e: TouchEvent) => {
			if (
				!global &&
				e.target &&
				!wrapperRef.current?.contains(e.target as Node)
			) {
				return;
			}

			const endX = e.changedTouches[0].clientX;
			const endY = e.changedTouches[0].clientY;
			const deltaX = endX - startX.current;
			const deltaY = endY - startY.current;

			// Prevent default scroll if the swipe is likely
			if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
				e.preventDefault();
			}

			onSwipe({
				startX: startX.current,
				startY: startY.current,
				endX,
				endY,
				deltaX,
				deltaY,
			});
		},
		[onSwipe, global],
	);

	useEffect(() => {
		window.addEventListener("touchstart", handleTouchStart, { passive: false });
		window.addEventListener("touchend", handleTouchEnd, { passive: false });

		return () => {
			window.removeEventListener("touchstart", handleTouchStart);
			window.removeEventListener("touchend", handleTouchEnd);
		};
	}, [handleTouchStart, handleTouchEnd]);

	return (
		<div className={className} ref={wrapperRef}>
			{children}
		</div>
	);
};

export enum Direction {
	UP = 1,
	DOWN = 2,
	LEFT = 3,
	RIGHT = 4,
}

type SwipingDirectionResult = [
	Direction.UP | Direction.DOWN | null,
	Direction.LEFT | Direction.RIGHT | null,
];

export const swipingDirection = (
	{ deltaX, deltaY }: Pick<OnSwipeParams, "deltaX" | "deltaY">,
	{ threshold }: { threshold: number } = { threshold: 100 },
): SwipingDirectionResult => {
	const result: SwipingDirectionResult = [null, null];
	if (Math.abs(deltaY) > threshold) {
		if (deltaY < 0) {
			result[0] = Direction.UP;
		} else {
			result[0] = Direction.DOWN;
		}
	}
	if (Math.abs(deltaX) > threshold) {
		if (deltaX < 0) {
			result[1] = Direction.LEFT;
		} else {
			result[1] = Direction.RIGHT;
		}
	}

	return result;
};
