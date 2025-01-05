// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";
import type { UsersResponse } from "@/api/pocketbase-types";

const getAuthStateFromPocketBaseSDK: AtomEffect<boolean> = ({
	trigger,
	setSelf,
}) => {
	const unsubscribe = pb.authStore.onChange((token) => {
		setSelf(Boolean(token));
	});

	pb.authStore.clear()

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

	return () => {
		unsubscribe();
	};
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
	const unsubscribe = pb.authStore.onChange((_, model) => {
		setSelf(model as UsersResponse);
	});

	if (trigger === "get") {
		if (pb.authStore.isValid) {
			setSelf(pb.authStore.record as UsersResponse);
		} else {
			pb.authStore.clear();
			setSelf(null);
		}
	}

	return () => {
		unsubscribe();
	}
};


export const UserState = atom({
	key: "User",
	default: null,
	effects: [getUserFromPocketBaseSDK]
});
