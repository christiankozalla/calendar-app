import { Outlet } from "react-router-dom";
import { Container } from "@radix-ui/themes";

const Layout = () => {
	return (
		<Container size="2" py="9" px="2">
			<main>
				<Outlet />
			</main>
			{/* <aside>
				<ul>
					<li>Navigation panel</li>
					<li>Header</li>
					<li>Provide space for the main content</li>
				</ul>
			</aside> */}
		</Container>
	);
};

export default Layout;
