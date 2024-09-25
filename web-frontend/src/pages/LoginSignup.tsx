import { useState, useEffect } from "react";
import {
	Container,
	Tabs,
	Box,
	Heading,
	TextField,
	Button,
	Flex,
	Text,
	Link as VisualLink,
	Callout,
} from "@radix-ui/themes";
import { pb } from "@/api/pocketbase";
import { ClientResponseError, type RecordOptions } from "pocketbase";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { authenticatedState } from "@/store/Authentication";
import { type JwtBaseClaims, parse } from "@/utils/jwt";

type SignupData = {
	email: string;
	name: string;
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
	const response = await pb
		.collection("users")
		.authWithPassword(email, password);
};

const signupUser = async (data: SignupData, options?: RecordOptions) => {
	console.log("Signing up user:", data.email);
	const userCreateRes = await pb.collection("users").create(data, options);
	// const verificationEmailSent = await pb.collection("users").requestVerification(email);

	await loginUser({ email: data.email, password: data.password });
};
// Needs to be exported as named export Component, so that it may be lazily loaded as Routes object in src/router/index.ts
export const Component = () => {
	const navigate = useNavigate();
	const isAuthenticated = useRecoilValue(authenticatedState);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated]);

	const [searchParams] = useSearchParams();
	const inviteToken = searchParams.get("token");
	const [inviterInfo, setInviterInfo] = useState<Pick<
		InviteTokenJwtClaims,
		"inviterEmail" | "inviterName"
	> | null>(null);

	const [activeTab, setActiveTab] = useState("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [name, setName] = useState("");

	useEffect(() => {
		if (inviteToken) {
			const parsed = parse<InviteTokenJwtClaims>(inviteToken);
			setActiveTab("signup");
			setEmail(parsed.body.inviteeEmail);
			setInviterInfo({
				inviterEmail: parsed.body.inviterEmail,
				inviterName: parsed.body.inviterName,
			});
		}
	}, [searchParams]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (activeTab === "login") {
				await loginUser({ email, password });
			} else {
				const options = inviteToken
					? { query: { token: inviteToken } }
					: undefined;
				await signupUser({ email, password, passwordConfirm, name }, options);
			}

			navigate("/");
		} catch (err) {
			if (err instanceof ClientResponseError) {
				console.log("error", err.data);
			}
		}
	};

	const toggleTab = () => {
		setActiveTab(activeTab === "login" ? "signup" : "login");
	};

	return (
		<>
			{isAuthenticated ? null : (
				<Container size="2" py="9">
					<Box className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
						<Heading size="6" mb="4" className="text-center">
							Welcome
						</Heading>
						<Tabs.Root
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<Tabs.List className="mb-4 w-full">
								<Tabs.Trigger
									value="login"
									className="flex-1 py-2 px-4 rounded-tl-lg "
								>
									Login
								</Tabs.Trigger>
								<Tabs.Trigger
									value="signup"
									className="flex-1 py-2 px-4 rounded-tr-lg "
								>
									Sign Up
								</Tabs.Trigger>
							</Tabs.List>
							{/* Invitation */}
							{inviterInfo && (
								<Callout.Root mb="2">
									<Callout.Text>
										{inviterInfo.inviterName || "Your friend"} (
										{inviterInfo.inviterEmail}) invited you to CalenShare!
										<br />
										Signup so you can enjoy sharing a calendar :D
									</Callout.Text>
								</Callout.Root>
							)}
							<form onSubmit={handleSubmit}>
								<Flex direction="column" gap="3">
									{activeTab === "signup" && (
										<TextField.Root
											placeholder="Name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											required
										/>
									)}
									<TextField.Root
										type="email"
										placeholder="Email"
										value={email}
										disabled={Boolean(inviteToken)}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
									<TextField.Root
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										{...{ autoComplete: (activeTab === "login").toString() }}
										required
									/>
									{activeTab === "signup" && (
										<TextField.Root
											type="password"
											placeholder="Confirm Password"
											value={passwordConfirm}
											onChange={(e) => setPasswordConfirm(e.target.value)}
											required
										/>
									)}
									<Button type="submit" className=" mt-2">
										{activeTab === "login" ? "Login" : "Sign Up"}
									</Button>
								</Flex>
							</form>
						</Tabs.Root>
						<Text size="2" className="block text-center mt-2">
							{activeTab === "login" ? (
								<>
									Don't have an account?{" "}
									<VisualLink onClick={toggleTab} className="cursor-pointer">
										Sign up!
									</VisualLink>
								</>
							) : (
								<>
									Already have an account?{" "}
									<VisualLink onClick={toggleTab} className="cursor-pointer">
										Log in!
									</VisualLink>
								</>
							)}
						</Text>
					</Box>
				</Container>
			)}
		</>
	);
};
