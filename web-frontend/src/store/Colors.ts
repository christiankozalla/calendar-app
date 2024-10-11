import type { ColorsRecord } from "@/api/pocketbase-types";
import { atom } from "recoil";

export type Colors = { [id: string]: ColorsRecord };

export const ColorsState = atom<Colors>({
	key: "Colors",
	default: {},
});
