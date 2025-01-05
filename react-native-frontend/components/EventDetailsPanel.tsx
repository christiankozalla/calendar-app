import { Text, View, StyleSheet, Dimensions } from "react-native";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { useRecoilValue } from "recoil";
import { typography } from "@/utils/typography";
import { toDateString, toTimeString } from "@/utils/date";
import { TabBarIcon } from "./navigation/TabBarIcon";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { ColorsState } from "@/store/Colors";
import { bottomsheetStyles } from "@/utils/bottomsheetStyles";

type Props = {
	persons?: PersonsResponse[];
} & Partial<
	Pick<
		EventsResponse,
		| "startDatetime"
		| "endDatetime"
		| "title"
		| "description"
		| "color"
	>
>;

export const EventDetailsPanel = ({
	title = "Untitled Event",
	description,
	startDatetime,
	endDatetime,
	color,
	persons = [],
}: Props) => {
	const colors = useRecoilValue(ColorsState);
	const hexColor = color ? colors[color].hex : "black";

	return (
		<BottomSheetView
			style={[bottomsheetStyles.paddingHorizontal, styles.bottomsheetContent]}
		>
			<Text style={[typography.h2, styles.headline, { color: hexColor }]}>
				{title}
			</Text>
			{startDatetime && (
				<View style={styles.dates}>
					<View>
						<Text style={[typography.h6, styles.bold]}>
							{toDateString(startDatetime)}
						</Text>
						<Text style={[typography.h3, styles.bold]}>
							{toTimeString(startDatetime)}
						</Text>
					</View>
					{endDatetime && (
						<>
							<TabBarIcon name="caret-forward" color={hexColor} />
							<View>
								<Text style={[typography.h6, styles.bold]}>
									{toDateString(endDatetime)}
								</Text>
								<Text style={[typography.h3, styles.bold]}>
									{toTimeString(endDatetime)}
								</Text>
							</View>
						</>
					)}
				</View>
			)}

			{description && (
				<View style={[styles.description, styles.section]}>
					<TabBarIcon
						style={styles.icon}
						name="document-text-outline"
						color={hexColor}
					/>
					<Text style={typography.h6}>{description}</Text>
				</View>
			)}

			{persons.length > 0 && (
				<View style={[styles.persons, styles.section]}>
                        <TabBarIcon style={styles.icon} name="people-outline" color={hexColor} />
					<Text style={typography.h6}>{persons.map((person) => person.name).join(", ")}</Text>
				</View>
			)}

            {/* Comments */}
		</BottomSheetView>
	);
};

const styles = StyleSheet.create({
	headline: {
		textAlign: "center",
		fontWeight: "bold",
		marginBottom: 16,
	},
	dates: {
		flexDirection: "row",
		marginBottom: 16,
		gap: 12,
		justifyContent: "center",
		alignItems: "center",
		marginHorizontal: 16,
	},
	bold: {
		fontWeight: "bold",
	},
	bottomsheetContent: {
		height: Dimensions.get("screen").height,
	},
	section: {
		marginVertical: 16,
	},
	description: {
		flexDirection: "row",
		gap: 8,
	},
	icon: {
		marginTop: -4,
	},
	persons: {
		flexDirection: "row",
		gap: 8,
	},
});

/* TODO: Move the "Delete Event" Feature to Event Detail Context ... Menu - as for the headline, we dont need a headline */
/* <View
				style={[
					bottomsheetStyles.paddingTop,
					bottomsheetStyles.paddingHorizontal,
					{
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: 16,
				}
				]}
					>	
				<Text style={styles.title}>
					{id ? "Update Event" : "Create New Event"}
				</Text>
				{id && (
					<AlertDialog
						triggerElement={
							<TouchableOpacity
								style={styles.deleteButton}
								onPress={() => setIsAlertDialogVisible(true)}
							>
								<TabBarIcon name="trash-outline" style={styles.icon} />
								<Text>Delete</Text>
							</TouchableOpacity>
						}
						title="Delete Event"
						descriptionElement={
							<Text>
								Do you really want to delete this event?
								{"\n"}
								<Text style={styles.strong}>{title}</Text>
							</Text>
						}
						actionText="Delete"
						action={() => {
							pb.collection("events").delete(id);
						}}
						isVisible={isAlertDialogVisible}
						onClose={() => {}}
					/>
				)}
			</View> */

// const deleteEvent = (id: string) => {
// 	pb.collection("events").delete(id);
// };
