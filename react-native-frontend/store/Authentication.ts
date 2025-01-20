// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";
import type { PersonsResponse, UsersResponse } from "@/api/pocketbase-types";

const getAuthStateFromPocketBaseSDK: AtomEffect<boolean> = ({
	trigger,
	setSelf,
}) => {
	if (trigger === "get") {
		if (pb.authStore.isValid) {
			pb.collection("users").authRefresh().then(() => {
				setSelf(true);
			}).catch(() => {
				pb.authStore.clear();
				setSelf(false);
			});
		} else {
			pb.authStore.clear();
			setSelf(false);
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
	if (trigger === "get") {
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
	if (trigger === "get") {
		if (pb.authStore.record?.id) {
			pb.collection("persons")
				.getFirstListItem<PersonsResponse>(pb.filter("user = {:userId}", { userId: pb.authStore.record.id }))
				.then(setSelf)
				.catch((err) => {
					console.error("Error getting user person", err?.data || err);
					setSelf(null);
				});
		}
	}
}

export const UserState = atom({
	key: "User",
	default: null,
	effects: [getUserFromPocketBaseSDK]
});

// The person record associated with the current user
export const UserPersonState = atom({
	key: "UserPerson",
	default: null,
	effects: [getUserPersonFromPocketBaseSDK]
});