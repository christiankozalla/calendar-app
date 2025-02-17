import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	SafeAreaView,
	Keyboard,
	ActivityIndicator,
} from "react-native";
import { useRouter, useGlobalSearchParams, Redirect } from "expo-router";
import { pb } from "@/api/pocketbase";
import { ClientResponseError, type RecordOptions } from "pocketbase";
import { useRecoilValue } from "recoil";
import { AuthState } from "@/store/Authentication";
import { type JwtBaseClaims, parse } from "@/utils/jwt";
import { globalstyles } from "@/utils/globalstyles";
import { StatusBar } from "expo-status-bar";
import { Collections, type PersonsRecord } from "@/api/pocketbase-types";
import { KeyboardAvoidingComponent } from "@/components/KeyboardAvoidingComponent";

type SignupData = {
	email: string;
	password: string;
	passwordConfirm: string;
	token?: string; // Invite Token
};

type InviteTokenJwtClaims = {
	inviteeEmail: string;
	inviterEmail: string;
	inviterName: string;
} & JwtBaseClaims;

const loginUser = async ({
	email,
	password,
}: Pick<SignupData, "email" | "password">) => {
	console.log("Logging in user:", email);
	await pb.collection(Collections.Users).authWithPassword(email, password);
};

const signupUser = async (
	data: SignupData & Pick<PersonsRecord, "name">,
	options?: RecordOptions,
) => {
	console.log("Signing up user:", data.email);
	await pb.collection(Collections.Users).create(data, options);
	await loginUser({ email: data.email, password: data.password });
};

export default function LoginSignup() {
	const router = useRouter();
	const { token: inviteToken } = useGlobalSearchParams<{ token?: string }>();
	const isAuthenticated = useRecoilValue(AuthState);

	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [name, setName] = useState("");
	const [inviterInfo, setInviterInfo] = useState<Pick<
		InviteTokenJwtClaims,
		"inviterEmail" | "inviterName"
	> | null>(null);

	useEffect(() => {
		if (inviteToken) {
			const parsed = parse<InviteTokenJwtClaims>(inviteToken as string);
			setActiveTab("signup");
			setEmail(parsed.body.inviteeEmail);
			setInviterInfo({
				inviterEmail: parsed.body.inviterEmail,
				inviterName: parsed.body.inviterName,
			});
		}
	}, [inviteToken]);

	const handleSubmit = async () => {
		Keyboard.dismiss();
		setLoading(true);
		try {
			if (activeTab === "login") {
				await loginUser({ email, password });
			} else {
				// signup
				const options = inviteToken
					? { query: { token: inviteToken } }
					: undefined;
				await signupUser({ email, password, passwordConfirm, name }, options);
			}
			router.replace("/");
		} catch (err) {
			if (err instanceof ClientResponseError) {
				console.log("error", JSON.stringify(err));
			}
		} finally {
			setLoading(false);
		}
	};

	if (isAuthenticated && !inviteToken) {
		return <Redirect href="/" />;
	}
	// TODO: If condition (isuthenticated && inviteToken) is true (i.e. already registered user with invite token) then show just a screen for the user to complete the invitation

	return (
		<SafeAreaView style={globalstyles.safeArea}>
			<StatusBar style="dark" />

			<View style={styles.container}>
				<View style={styles.box}>
					<Text style={styles.heading}>Suntimes Calendar</Text>
					<View style={styles.tabs}>
						<TouchableOpacity
							style={[styles.tab, activeTab === "login" && styles.activeTab]}
							onPress={() => setActiveTab("login")}
						>
							<Text>Login</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.tab, activeTab === "signup" && styles.activeTab]}
							onPress={() => setActiveTab("signup")}
						>
							<Text>Sign Up</Text>
						</TouchableOpacity>
					</View>
					{inviterInfo && (
						<View style={styles.callout}>
							<Text>
								{inviterInfo.inviterName || "Your friend"} (
								{inviterInfo.inviterEmail}) invited you to Suntimes!
							</Text>
							<Text>Signup so you can enjoy sharing a calendar :D</Text>
						</View>
					)}
					<KeyboardAvoidingComponent>
						{activeTab === "signup" && (
							<TextInput
								style={styles.input}
								placeholder="Name"
								value={name}
								onChangeText={setName}
								placeholderTextColor="#999"
							/>
						)}
						<TextInput
							style={styles.input}
							placeholder="Email"
							value={email}
							onChangeText={setEmail}
							keyboardType="email-address"
							editable={!inviteToken}
							placeholderTextColor="#999"
						/>
						<TextInput
							style={styles.input}
							placeholder="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							placeholderTextColor="#999"
							autoCapitalize="none"
						/>
						{activeTab === "signup" && (
							<TextInput
								style={styles.input}
								placeholder="Confirm Password"
								value={passwordConfirm}
								onChangeText={setPasswordConfirm}
								secureTextEntry
								placeholderTextColor="#999"
								autoCapitalize="none"
							/>
						)}
					</KeyboardAvoidingComponent>
					<TouchableOpacity style={styles.button} onPress={handleSubmit}>
						{loading && <ActivityIndicator color="white" />}
						<Text style={styles.buttonText}>
							{activeTab === "login" ? "Login" : "Sign Up"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() =>
							setActiveTab(activeTab === "login" ? "signup" : "login")
						}
					>
						<Text style={styles.toggleText}>
							{activeTab === "login"
								? "Don't have an account? Sign up!"
								: "Already have an account? Log in!"}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 48,
		paddingHorizontal: 20,
	},
	box: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 20,
	},
	tabs: {
		flexDirection: "row",
		marginBottom: 20,
	},
	tab: {
		flex: 1,
		padding: 10,
		alignItems: "center",
		borderBottomWidth: 2,
		borderBottomColor: "#ddd",
	},
	activeTab: {
		borderBottomColor: "#007AFF",
	},
	callout: {
		backgroundColor: "#e0e0e0",
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		padding: 10,
		borderRadius: 5,
		marginBottom: 10,
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
	toggleText: {
		marginTop: 15,
		textAlign: "center",
		color: "#007AFF",
	},
});
