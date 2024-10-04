import type { ColorsRecord } from "@/api/pocketbase-types";
import { atom } from "recoil";

export const ColorsState = atom<{ [id: string]: ColorsRecord }>({
	key: "Colors",
	default: {},
});
