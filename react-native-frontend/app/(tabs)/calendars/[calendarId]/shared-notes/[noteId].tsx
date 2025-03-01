import { globalstyles } from "@/utils/globalstyles";
import { pb } from "@/api/pocketbase";
import {
	Collections,
	SharedNotesResponse,
	type PersonsResponse,
} from "@/api/pocketbase-types";
import { Link, useGlobalSearchParams } from "expo-router";
import {
	View,
	Text,
	SafeAreaView,
	StyleSheet,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Avatar } from "@/components/Avatar";

const fetchNote = async (noteId: string) => {
	return pb.collection(Collections.SharedNotes).getOne(noteId);
};

const fetchUserPersons = async (...userIds: string[]) => {
	if (userIds.length === 0) {
		return { items: [] };
	}

	return pb.collection(Collections.Persons).getList(undefined, undefined, {
		filter: userIds.map((id) => `user="${id}"`).join("||"),
	});
};

export default function SharedNote() {
	const { calendarId, noteId } = useGlobalSearchParams();
	const [note, setNote] = useState<SharedNotesResponse>();
	const [userPersons, setUserPersons] = useState<PersonsResponse[]>();
	const [inputText, setInputText] = useState("");

	useEffect(() => {
		if (noteId) {
			fetchNote(noteId as string)
				.then((note) => {
					setNote(note);
					return fetchUserPersons(...note.users);
				})
				.then((userPersons) => {
					setUserPersons(userPersons?.items);
				})
				.catch((err) => {
					console.error(err);
				});
		}
	}, [noteId]);

	return (
		<SafeAreaView style={[globalstyles.safeArea, styles.container]}>
			<StatusBar style="dark" />
			<View style={globalstyles.container}>
				<Header style={[globalstyles.header, styles.header]}>
					<Link
						href={`/calendars/${calendarId as string}/shared-notes`}
						style={styles.link}
					>
						<TabBarIcon name="arrow-back" size={18} />
					</Link>
					<Text style={globalstyles.headerText}>{note?.title}</Text>
				</Header>
				<KeyboardAvoidingView
					behavior="padding"
					style={styles.container}
					keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
				>
					{/*  */}
				</KeyboardAvoidingView>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		justifyContent: "flex-start",
		gap: 12,
	},
	link: {
		marginTop: 4,
		paddingHorizontal: 12,
	},
});
