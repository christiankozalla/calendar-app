// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";

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
