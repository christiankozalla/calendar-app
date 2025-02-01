import type {
	CalendarsResponse,
	PersonsResponse,
	UsersResponse,
} from "@/api/pocketbase-types";
import { atom } from "recoil";

export type CalendarsStateType = {
	[calendarId: string]: CalendarsResponse<{
		owner?: UsersResponse;
		users?: UsersResponse[];
		persons?: PersonsResponse[];
	}>;
};

export const CalendarsState = atom<CalendarsStateType>({
	key: "Calendars",
	default: {},
});
