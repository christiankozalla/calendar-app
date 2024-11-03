import type { CalendarsResponse, UsersResponse } from "@/api/pocketbase-types";
import { atom } from "recoil";

export const CalendarsState = atom<CalendarsResponse<{ users: UsersResponse[] }>[]>({
	key: "Calendars",
	default: [],
});
