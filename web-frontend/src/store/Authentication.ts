// https://recoiljs.org/docs/basic-tutorial/atoms
import { atom, type AtomEffect } from "recoil";
import { pb } from "@/api/pocketbase";

const getAuthStateFromPocketBaseSDK: AtomEffect<boolean> = ({
	node,
	trigger,
	setSelf,
}) => {
	if (trigger === "get") {
		setSelf(pb.authStore.isValid);
	} else if (trigger === "set") {
		console.log(`Recoil store ${node.key} has been modified`);
	}

	const unsubscribe = pb.authStore.onChange((token) => {
		setSelf(Boolean(token));
	});

	return unsubscribe;
};

export const authenticatedState = atom({
	key: "UserAuthentication",
	default: false,
	effects: [getAuthStateFromPocketBaseSDK],
});
