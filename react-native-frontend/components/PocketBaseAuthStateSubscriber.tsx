import { useEffect } from "react";
import { AuthState, UserState } from "@/store/Authentication";
import { pb } from "@/api/pocketbase";
import type { UsersResponse } from "@/api/pocketbase-types";
import { useRecoilState, useSetRecoilState } from "recoil";
import { Redirect } from "expo-router";

export const PocketBaseAuthStateSubscriber = () => {
	const [isAuthenticated, setAuthState] = useRecoilState(AuthState);
	const setUserState = useSetRecoilState(UserState);

	useEffect(() => {
		// map updates to pocketbase's authStore to global Auth state in Recoil
		const unsubscribe = pb.authStore.onChange((token, userRecord) => {
			setAuthState(Boolean(token));
			setUserState(userRecord as UsersResponse | null);
		});

		return () => {
			unsubscribe();
		};
	}, []);

	if (!isAuthenticated) {
		return <Redirect href="/login-signup" />;
	}

	return null;
};
