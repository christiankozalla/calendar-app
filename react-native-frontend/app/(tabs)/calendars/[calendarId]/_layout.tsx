import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { useSegments } from "expo-router";
import { useRecoilValue } from "recoil";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { AuthState } from "@/store/Authentication";

export default function TabLayout() {
	const isAuthenticated = useRecoilValue(AuthState);
	const segments = useSegments();

	if (!isAuthenticated) {
		return <Redirect href="/login-signup" />;
	}

	const currentPage = segments.at(-1);
	const pagesToHide = ["[eventId]", "[noteId]"];

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#000000",
				tabBarInactiveTintColor: "#666666",
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopColor: "#E5E7EB", // light gray border
					display: !currentPage
						? "flex"
						: pagesToHide.includes(currentPage)
							? "none"
							: "flex", // hides tabBar on (tabs)/calendars/[calendarId]/comments/[eventId] and ..[noteId]
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: "Calendar",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="calendar-outline" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="comments/index"
				options={{
					tabBarLabel: "Comments",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="chatbubble-outline" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="shared-notes/index"
				options={{
					tabBarLabel: "Shared Notes",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="reader-outline" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarLabel: "Settings",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="settings-outline" color={color} />
					),
				}}
			/>
			<Tabs.Screen name="comments/[eventId]" options={{ href: null }} />
			<Tabs.Screen name="shared-notes/[noteId]" options={{ href: null }} />
		</Tabs>
	);
}
