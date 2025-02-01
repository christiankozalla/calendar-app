// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";
import type { PersonsResponse, UsersResponse } from "@/api/pocketbase-types";

const getAuthStateFromPocketBaseSDK: AtomEffect<boolean> = ({
	trigger,
	setSelf,
}) => {
	console.log("Running getAuthStateFromPocketBaseSDK Effect");
	if (trigger === "get") {
		if (pb.authStore.isValid) {
			pb.collection("users")
				.authRefresh()
				.then(() => {
					console.log("User is authenticated");
					setSelf(true);
				})
				.catch(() => {
					console.log("Error on authRefresh: User is not authenticated");
					pb.authStore.clear();
				});
		} else {
			console.log(
				"No Token or is expired: User is not authenticated - needs to re-login",
			);
			pb.authStore.clear();
		}
	}
};

export const AuthState = atom({
	key: "UserAuthentication",
	default: false,
	effects: [getAuthStateFromPocketBaseSDK],
});

const getUserFromPocketBaseSDK: AtomEffect<UsersResponse | null> = ({
	trigger,
	setSelf,
}) => {
	console.log("Running getUserFromPocketBaseSDK Effect");
	if (trigger === "get") {
		console.log("getUserFromPocketBaseSDK setting user on get trigger");
		if (pb.authStore.isValid) {
			setSelf(pb.authStore.record as UsersResponse);
		} else {
			pb.authStore.clear();
			setSelf(null);
		}
	}
};

const getUserPersonFromPocketBaseSDK: AtomEffect<PersonsResponse | null> = ({
	trigger,
	setSelf,
}) => {
	console.log("Running getUserPersonFromPocketBaseSDK Effect");
	if (trigger === "get") {
		if (pb.authStore.record?.id) {
			pb.collection("persons")
				.getFirstListItem<PersonsResponse>(
					pb.filter("user = {:userId}", { userId: pb.authStore.record.id }),
				)
				.then(setSelf)
				.catch((err) => {
					console.error("Error getting user person", err?.data || err);
					setSelf(null);
				});
		}
	}
};

export const UserState = atom({
	key: "User",
	default: null,
	effects: [getUserFromPocketBaseSDK],
});

// The person record associated with the current user
export const UserPersonState = atom({
	key: "UserPerson",
	default: null,
	effects: [getUserPersonFromPocketBaseSDK],
});
