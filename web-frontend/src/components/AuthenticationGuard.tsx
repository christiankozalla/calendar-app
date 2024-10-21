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

	useEffect(() => {
		const unsubsribeFromAuthStoreChanges = pb.authStore.onChange((token) => {
			setIsAuthenticated(Boolean(token));
		}, true);

		return unsubsribeFromAuthStoreChanges;
	}, [setIsAuthenticated]);

	if (!isAuthenticated) {
		return <Navigate to={redirectPath} replace />;
	}

	return <>{children}</>;
};
