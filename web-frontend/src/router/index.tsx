import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/layouts/Layout.tsx";
import { AuthenticationGuard } from "@/components/AuthenticationGuard.tsx";
import { Navigation } from "@/pages/calendars/layout/Navigation.tsx";

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
				element: <Navigation />,
				children: [
					{
						path: "/calendars/:calendarId",
						children: [
							{
								index: true,
								lazy: () => import("../pages/calendars/Calendar.tsx"),
							},
							{
								path: "chat-notes",
								lazy: () => import("../pages/calendars/ChatNotes.tsx"),
							},
							{
								path: "activity",
								lazy: () => import("../pages/calendars/Activity.tsx"),
							},
							{
								path: "settings",
								lazy: () => import("../pages/calendars/Settings.tsx"),
							},
						],
					},
				],
			},
		],
	},
	{
		path: "/login-signup",
		lazy: () => import("../pages/LoginSignup.tsx"),
	},
]);
