import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	StyleSheet,
} from "react-native";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { EventPanelCrud } from "./EventPanelCrud";
import { TabBarIcon } from "./navigation/TabBarIcon";

export const EventList = ({
	events,
}: { events: EventsResponse<{ persons: PersonsResponse[] }>[] }) => {
	const { push } = useSlidingDrawer();

	const renderEvent = ({
		item: event,
	}: { item: EventsResponse<{ persons: PersonsResponse[] }> }) => (
		<View style={styles.card}>
			<View style={styles.header}>
				<Text numberOfLines={1} style={styles.title}>{event.title || "Untitled Event"}</Text>
				<TouchableOpacity
					style={styles.editButton}
					onPress={() =>
						push({
							state: { isOpen: true },
							props: { ...event, persons: event.expand?.persons },
							component: EventPanelCrud,
						})
					}
				>
					<TabBarIcon name="pencil" style={styles.icon} />
					{/* <PencilIcon style={styles.icon} /> */}
					<Text>Edit</Text>
				</TouchableOpacity>
			</View>

			{event.startDatetime && (
				<View style={styles.row}>
					{/* <CalendarIcon style={styles.icon} /> */}
					<TabBarIcon name="calendar" style={styles.icon} />
					<Text style={styles.text}>
						{new Date(event.startDatetime).toLocaleString()}
					</Text>
				</View>
			)}

			{!!event.location && (
				<View style={styles.row}>
					<Text style={styles.text}>{event.location}</Text>
				</View>
			)}

			{event.expand?.persons && event.expand?.persons.length > 0 && (
				<View style={styles.row}>
					<TabBarIcon name="people" style={styles.icon} />
					<Text style={styles.text} numberOfLines={1}>
						{event.expand.persons.map((p) => p.name).join(", ")}
					</Text>
				</View>
			)}

			{!!event.description && (
				<View style={styles.description}>
					<Text style={styles.text}>{event.description}</Text>
				</View>
			)}
		</View>
	);

	return (
		<FlatList
			data={events}
			renderItem={renderEvent}
			keyExtractor={(event) => event.id}
		/>
	);
};

const styles = StyleSheet.create({
	card: {
		padding: 16,
		backgroundColor: "white",
		borderRadius: 8,
		marginBottom: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	title: {
		flex: 1,
		fontSize: 18,
		fontWeight: "bold",
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
		padding: 8,
		borderRadius: 20,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	icon: {
		fontSize: 24,
		marginRight: 8,
	},
	text: {
		fontSize: 14,
		color: "#666",
	},
	description: {
		marginTop: 8,
	},
});
