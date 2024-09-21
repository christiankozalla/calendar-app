import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/Layout.tsx";
import { AuthenticationGuard } from "@/components/AuthenticationGuard.tsx";

export const router = createBrowserRouter([
	{
		element: (
			<AuthenticationGuard redirectPath="/login-signup">
				<Layout />
			</AuthenticationGuard>
		),
		children: [
			{
				path: "/",
				lazy: () => import("../pages/Home.tsx"),
			},
			{
				path: "/calendars/:calendarId",
				lazy: () => import("../pages/Calendars.tsx"),
			},
		],
	},
	{
		path: "/login-signup",
		lazy: () => import("../pages/LoginSignup.tsx"),
	},
]);
