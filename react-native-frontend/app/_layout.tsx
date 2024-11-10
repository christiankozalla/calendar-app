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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

if (typeof Promise.withResolvers === "undefined") {
	// @ts-ignore
	Promise.withResolvers = function<T>() {
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
