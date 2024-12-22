// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";
import type { UsersResponse } from "@/api/pocketbase-types";

const getAuthStateFromPocketBaseSDK: AtomEffect<boolean> = ({
	trigger,
	setSelf,
}) => {
	if (trigger === "get") {
		if (pb.authStore.isValid) {
			pb.collection("users").authRefresh();
			setSelf(true);
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

		pb.authStore.onChange((_, model) => {
			setSelf(model as UsersResponse);
		});
	}
};


export const UserState = atom({
	key: "User",
	default: null,
	effects: [getUserFromPocketBaseSDK]
});
