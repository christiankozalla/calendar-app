import { useEffect, type PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { authenticatedState } from "@/store/Authentication";
import { pb } from "@/api/pocketbase";

type Props = {
	redirectPath: string;
};

export const AuthenticationGuard = ({
	children,
	redirectPath,
}: PropsWithChildren<Props>) => {
	const [isAuthenticated, setIsAuthenticated] =
		useRecoilState(authenticatedState);

	// biome-ignore lint: this effect shall run only on first render
	useEffect(() => {
		const unsubsribeFromAuthStoreChanges = pb.authStore.onChange((token) => {
			setIsAuthenticated(Boolean(token));
		}, true);

		return unsubsribeFromAuthStoreChanges;
	}, []);

	if (!isAuthenticated) {
		return <Navigate to={redirectPath} replace />;
	}

	return <>{children}</>;
};
