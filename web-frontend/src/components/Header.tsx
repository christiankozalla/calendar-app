import type { PropsWithChildren } from "react";
import { cx } from "classix";

export const Header = ({
	children,
	className = "",
}: PropsWithChildren<{ className?: string }>) => {
	return (
		<div
			className={cx(
				className,
				"sticky top-0 left-0 right-0 p-2  text-gray-600 bg-white border-b border-gray-200",
			)}
		>
			{children}
		</div>
	);
};
