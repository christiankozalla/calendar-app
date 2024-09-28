import { Outlet } from "react-router-dom";
import { Container } from "@radix-ui/themes";
import { SlidingDrawerManager } from "@/components/SlidingDrawerManager";

export const Layout = () => {
	return (
		<Container size="2" py="9" px="2">
			<main>
				<Outlet />
			</main>
			<SlidingDrawerManager />
		</Container>
	);
};
