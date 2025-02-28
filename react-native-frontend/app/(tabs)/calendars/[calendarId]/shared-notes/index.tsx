import { Avatar } from "@/components/Avatar";
import { globalstyles } from "@/utils/globalstyles";
import { Link } from "expo-router";
import { View, Text, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Header } from "@/components/Header";

export default function Activity() {
	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />
			<View style={globalstyles.container}>
				<Header style={globalstyles.header}>
					<Link href="/" push>
						<Avatar size="small" />
					</Link>
					<Text style={globalstyles.headerText}>Header Text</Text>
				</Header>
			</View>
		</SafeAreaView>
	);
}
