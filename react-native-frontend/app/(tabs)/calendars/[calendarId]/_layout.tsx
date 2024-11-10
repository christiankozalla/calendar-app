import { Tabs } from "expo-router";
import { Redirect } from "expo-router";
import { useRecoilValue } from "recoil";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { AuthState } from "@/store/Authentication";

export default function TabLayout() {
	const isAuthenticated = useRecoilValue(AuthState);

	if (!isAuthenticated) {
		return <Redirect href="/login-signup" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#000000",
				tabBarInactiveTintColor: "#666666",
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopColor: "#E5E7EB", // light gray border
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarLabel: "Calendar",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="calendar" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="chat"
				options={{
					tabBarLabel: "Chat",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="chatbubble" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="activity"
				options={{
					tabBarLabel: "Activity",
					tabBarIcon: ({ color }) => <TabBarIcon name="pulse" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarLabel: "Settings",
					tabBarIcon: ({ color }) => (
						<TabBarIcon name="settings" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
