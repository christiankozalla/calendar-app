import type { PropsWithChildren } from "react";

export const Header = ({ children }: PropsWithChildren) => {
	return (
		<div className="sticky top-0 left-0 right-0 p-2  text-gray-600 bg-white border-b border-gray-200">
			{children}
		</div>
	);
};
