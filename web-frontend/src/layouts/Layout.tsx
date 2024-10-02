import { Outlet } from "react-router-dom";
import { SlidingDrawerManager } from "@/components/SlidingDrawerManager";

export const Layout = () => {
	return (
		<>
			<main>
				<Outlet />
			</main>
			<SlidingDrawerManager />
		</>
	);
};
