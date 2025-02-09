import type { Dispatch, ReactNode, SetStateAction } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { TabBarIcon } from "./navigation/TabBarIcon";
import {
	BottomSheetView,
	useBottomSheetModal,
	TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";
import { EventCreateUpdatePanel } from "./EventCreateUpdatePanel";
import { setDateWithCurrentTime } from "@/utils/date";
import { Button } from "./Button";
import { EventDetailsPanel } from "./EventDetailsPanel";

type Props = {
	events: EventsResponse<{ persons: PersonsResponse[] }>[];
	currentDay: string;
	calendar: string;
	setBottomSheetContent?: Dispatch<SetStateAction<ReactNode>>;
};

export const EventListPanel = ({
	events,
	currentDay,
	calendar,
	setBottomSheetContent,
}: Props) => {
	const bottomSheetModal = useBottomSheetModal();

	const renderEvent = ({
		item: event,
	}: { item: EventsResponse<{ persons: PersonsResponse[] }> }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => {
				setBottomSheetContent?.(
					<EventDetailsPanel {...event} persons={event.expand?.persons} />,
				);
			}}
		>
			<View style={styles.header}>
				<Text numberOfLines={1} style={styles.title}>
					{event.title || "Untitled Event"}
				</Text>
				<TouchableOpacity
					style={[styles.button, styles.editButton]}
					onPress={() => {
						setBottomSheetContent?.(
							<EventCreateUpdatePanel
								{...event}
								persons={event.expand?.persons}
							/>,
						);
					}}
				>
					<TabBarIcon name="pencil" style={styles.icon} />
					<Text>Edit</Text>
				</TouchableOpacity>
			</View>

			{event.startDatetime && (
				<View style={styles.row}>
					<TabBarIcon name="calendar" style={styles.icon} />
					<Text style={styles.text}>
						{new Date(event.startDatetime).toLocaleString(undefined, {
							dateStyle: "short",
							timeStyle: "short",
						})}
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
		</TouchableOpacity>
	);

	return (
		<BottomSheetView style={styles.bottomsheetContent}>
			<View
				style={[
					{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						marginBottom: 16,
					},
					bottomsheetStyles.marginHorizontal,
				]}
			>
				<TouchableOpacity
					style={{
						paddingLeft: 0,
						paddingVertical: 12,
						paddingRight: 24,
						justifyContent: "center",
					}}
					onPress={() => {
						bottomSheetModal.dismiss();
					}}
				>
					<TabBarIcon name="close" style={{ fontSize: 20 }} />
				</TouchableOpacity>
				<Button
					label="New Event"
					size="small"
					onPress={() => {
						setBottomSheetContent?.(
							<EventCreateUpdatePanel
								startDatetime={setDateWithCurrentTime(currentDay).toISOString()}
								calendar={calendar}
							/>,
						);
					}}
					style={{ borderColor: "rebeccapurple" }}
				/>
			</View>
			<FlatList
				data={events}
				renderItem={renderEvent}
				keyExtractor={(event) => event.id}
				style={bottomsheetStyles.paddingHorizontal}
			/>
		</BottomSheetView>
	);
};

const styles = StyleSheet.create({
	card: {
		padding: 16,
		borderWidth: 1,
		borderColor: "lightgrey",
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
		borderColor: "lightgrey",
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 2,
		borderWidth: 1,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 4,
	},
	icon: {
		fontSize: 18,
		marginRight: 8,
	},
	text: {
		fontSize: 14,
		color: "#666",
		marginRight: 24,
	},
	description: {
		marginTop: 8,
	},
	bottomsheetContent: {
		height: Dimensions.get("screen").height,
	},
	button: {
		paddingHorizontal: 16,
		height: 26,
		justifyContent: "center",
		borderRadius: 16,
		borderWidth: 2,
		color: "grey",
	},
});
