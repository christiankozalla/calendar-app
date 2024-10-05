import type { PersonsResponse } from "@/api/pocketbase-types";
import { atom } from "recoil";

export const PersonsState = atom<PersonsResponse[]>({
	key: "Persons",
	default: [],
});
