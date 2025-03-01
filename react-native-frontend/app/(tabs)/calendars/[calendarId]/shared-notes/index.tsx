import { Avatar } from "@/components/Avatar";
import { globalstyles } from "@/utils/globalstyles";
import { Link, useGlobalSearchParams, useRouter } from "expo-router";
import {
	View,
	Text,
	SafeAreaView,
	StyleSheet,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Header } from "@/components/Header";
import { pb } from "@/api/pocketbase";
import { Collections, SharedNotesResponse } from "@/api/pocketbase-types";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/Button";

const fetchNotesList = async (calendarId: string) => {
	if (!pb.authStore.record?.id) {
		throw new Error("No user id");
	}
	if (!calendarId) {
		throw new Error("No calendar id");
	}

	return pb.collection(Collections.SharedNotes).getList(1, 10, {
		filter: pb.filter(
			"calendar = {:calendarId} && ({:userId} ~ users || owner = {:userId})",
			{
				calendarId,
				userId: pb.authStore.record.id,
			},
		),
	});
};

const createEmptyNote = async (calendarId: string) => {
	if (!pb.authStore.record?.id) {
		throw new Error("No user id");
	}
	if (!calendarId) {
		throw new Error("No calendar id");
	}

	return pb.collection(Collections.SharedNotes).create({
		calendar: calendarId,
		owner: pb.authStore.record.id,
	});
};

export default function SharedNotes() {
	const { calendarId } = useGlobalSearchParams<{ calendarId: string }>();
	const [sharedNotes, setSharedNotes] = useState<SharedNotesResponse[]>();
	const router = useRouter();

	useEffect(() => {
		(async () => {
			try {
				const notes = await fetchNotesList(calendarId);
				setSharedNotes(notes.items);
			} catch (err) {}
		})();
	}, [calendarId]);

	const avatarUri = pb.authStore.record
		? pb.files.getURL(pb.authStore.record, pb.authStore.record.avatar, {
				thumb: "100x100",
			})
		: null;

	const handleCreateNote = useCallback(() => {
		createEmptyNote(calendarId)
			.then((note) => {
				router.navigate(
					`/(tabs)/calendars/${calendarId}/shared-notes/${note.id}`,
				);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [calendarId]);

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />
			<View style={globalstyles.container}>
				<Header style={globalstyles.header}>
					<Link href="/" push style={styles.avatar}>
						<Avatar size="small" uri={avatarUri} />
					</Link>
					<Text style={[globalstyles.headerText, styles.headerText]}>
						Shared Notes
					</Text>
					<Button label="Create Note" onPress={handleCreateNote} size="small" />
				</Header>

				<FlatList
					data={sharedNotes}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.listItem}
							onPress={() => {
								router.push(
									`/(tabs)/calendars/${calendarId}/shared-notes/${item.id}`,
								);
							}}
						>
							<Text
								style={styles.noteTitle}
								ellipsizeMode="tail"
								numberOfLines={1}
							>
								{item.title || "Untitled Note"}
							</Text>
							<View style={styles.noteFooter}>
								<Text style={styles.noteOwner}>By {item.owner}</Text>
								<View style={styles.avatarsContainer}>
									<Avatar size="small" />
									<Avatar size="small" />
									<Avatar size="small" />
								</View>
							</View>
						</TouchableOpacity>
					)}
					ListEmptyComponent={
						<View style={styles.emptyContainer}>
							<Text style={styles.emptyText}>No shared notes yet.</Text>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	avatar: {
		flex: 1,
	},
	headerText: {
		flex: 8,
		marginBottom: 4,
	},
	listItem: {
		width: "100%",
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e0e0e0",
		position: "relative",
	},
	noteTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 4,
	},
	noteFooter: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	noteOwner: {
		fontSize: 14,
		color: "#666",
	},
	avatarsContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 8,
		gap: 4,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 8,
	},
	emptyText: {
		fontSize: 16,
		color: "#666",
	},
});
