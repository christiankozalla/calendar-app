import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { RecoilRoot } from "recoil";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "@/hooks/useColorScheme";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PocketBaseAuthStateSubscriber } from "@/components/PocketBaseAuthStateSubscriber";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Declare type for Promise.withResolvers
declare global {
	interface PromiseConstructor {
		withResolvers<T>(): {
			promise: Promise<T>;
			resolve: (value: T) => void;
			// biome-ignore lint: any is used in the original declaration, too
			reject: (reason?: any) => void;
		};
	}
}

if (typeof Promise.withResolvers === "undefined") {
	// @ts-ignore
	Promise.withResolvers = function <T>() {
		// biome-ignore lint: utils fn may declare it this way
		let resolve, reject;
		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return {
			promise,
			resolve,
			reject,
		};
	};
}

export default function RootLayout() {
	const colorScheme = useColorScheme();

	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<RecoilRoot>
				<PocketBaseAuthStateSubscriber />
				<GestureHandlerRootView style={{ flex: 1 }}>
					<BottomSheetModalProvider>
						<Stack>
							<Stack.Screen
								name="login-signup"
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="(tabs)/index"
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="(tabs)/change-email"
								options={{ headerShown: false }}
							/>
							<Stack.Screen
								name="(tabs)/calendars/[calendarId]"
								options={{ headerShown: false }}
							/>
							<Stack.Screen name="+not-found" />
						</Stack>
					</BottomSheetModalProvider>
				</GestureHandlerRootView>
			</RecoilRoot>
		</ThemeProvider>
	);
}
