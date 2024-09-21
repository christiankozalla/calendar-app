import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./App.css";
import { RecoilRoot } from "recoil";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const App = () => {
	return (
		<Theme>
			<RecoilRoot>
				<RouterProvider router={router} />
			</RecoilRoot>
		</Theme>
	);
};

export default App;
