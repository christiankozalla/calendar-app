export type JwtBaseClaims = {
	iat: number;
	exp: number;
};

export function parse<Body = Record<string, string>>(
	encodedJwt: string,
): { head: Record<string, string>; body: Body } {
	const [head, body] = encodedJwt.split(".");
	return {
		head: JSON.parse(atob(head)),
		body: JSON.parse(atob(body)) as Body,
	};
}
