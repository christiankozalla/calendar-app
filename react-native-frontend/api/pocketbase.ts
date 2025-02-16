import type { CalendarsStateType } from "@/store/Calendars";
import type {
	TypedPocketBase,
	CalendarsResponse,
	PersonsResponse,
	CalendarsRecord,
	MessagesRecord,
	PersonsRecord,
} from "./pocketbase-types";
import { Collections } from "./pocketbase-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PocketBase, {
	AsyncAuthStore,
	type ClientResponseError,
} from "pocketbase";
import eventsource from "react-native-sse";
import type { SetterOrUpdater } from "recoil";
// @ts-ignore
global.EventSource = eventsource;

const store = new AsyncAuthStore({
	save: async (serialized) => AsyncStorage.setItem("pb_auth", serialized),
	initial: AsyncStorage.getItem("pb_auth"),
});

export const pb = new PocketBase(
	"http://192.168.178.44:8090", // use the IP where Metro's dev server is listening
	store,
) as TypedPocketBase;

class Operations {
	constructor(private pb: TypedPocketBase) {}

	public async createCalendar(
		data: Required<Pick<CalendarsRecord, "owner">> & CalendarsRecord,
	) {
		if (!data.owner) {
			return { error: new Error("new calendar must have an `owner` field") };
		}

		return this.catchError(() =>
			pb
				.collection(Collections.Calendars)
				.create<CalendarsResponse<never>>(data),
		);
	}

	public async getAllCalendarsOwnedByAndUserIsPartOf(userId: string) {
		return this.catchError(() =>
			this.pb
				.collection(Collections.Calendars)
				.getList<CalendarsResponse<never>>(undefined, undefined, {
					filter: pb.filter("owner = {:userId} || users ~ {:userId}", {
						userId,
					}),
					skipTotal: true,
				}),
		);
	}

	public async getCalendarDetails(
		calendarId: string,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			this.pb
				.collection(Collections.Calendars)
				.getOne<CalendarsStateType[string]>(calendarId, {
					expand: "users,owner,persons",
				}),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => ({
				...prev,
				[calendarId]: result,
			}));
		}

		return result;
	}

	public async deleteCalendar(
		calendarId: string,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			pb.collection(Collections.Calendars).delete(calendarId),
		);

		if (typeof result !== "boolean" && "error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => {
				const { [calendarId]: _, ...rest } = prev;
				return rest;
			});
		}

		return result;
	}

	// adding a user to a calendar is only possible through an invitation - mutual agreement
	// public async addUserToCalendar(calendarId: string, userId: string, calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>)

	public async addPersonToCalendar(
		calendarId: string,
		person: PersonsResponse,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			this.pb
				.collection(Collections.Calendars)
				.update<CalendarsStateType[string]>(
					calendarId,
					{ "+persons": person.id },
					{ expand: "users,owner,persons" },
				),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => ({
				...prev,
				[calendarId]: result,
			}));
		}

		return result;
	}

	public async removePersonFromCalendar(
		calendarId: string,
		personId: string,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			this.pb
				.collection(Collections.Calendars)
				.update<CalendarsResponse<never>>(calendarId, {
					"persons-": personId,
				}),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => {
				if (prev[calendarId]) {
					return {
						...prev,
						[calendarId]: {
							...prev[calendarId],
							expand: {
								...prev[calendarId].expand,
								persons: (prev[calendarId].expand?.persons ?? []).filter(
									(p) => p.id !== personId,
								),
							},
						},
					};
				}

				return {
					...prev,
					[calendarId]: {
						...result,
						expand: {
							persons: [],
							users: [],
						},
					},
				};
			});
		}

		return result;
	}

	public async removeUserFromCalendar(
		calendarId: string,
		userId: string,
		personId: string,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			this.pb
				.collection(Collections.Calendars)
				.update<CalendarsStateType[string]>(calendarId, {
					"users-": userId,
					"persons-": personId,
				}),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => ({
				...prev,
				[calendarId]: result,
			}));
		}
	}

	public async createPerson(
		person: Partial<PersonsRecord>,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			pb.collection(Collections.Persons).create(person),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => {
				const newCalendars = { ...prev };
				for (const calendarId in newCalendars) {
					if (newCalendars[calendarId].expand?.persons) {
						newCalendars[calendarId] = {
							...newCalendars[calendarId],
							expand: {
								...newCalendars[calendarId].expand,
								persons: [...newCalendars[calendarId].expand.persons, result],
							},
						};
					}
				}
				return newCalendars;
			});
		}

		return result;
	}

	public async updatePerson(
		person: PersonsRecord,
		calendarsStateSetter?: SetterOrUpdater<CalendarsStateType>,
	) {
		const result = await this.catchError(() =>
			pb.collection(Collections.Persons).update(person.id, person),
		);

		if ("error" in result) {
			return result;
		}

		if (calendarsStateSetter) {
			calendarsStateSetter((prev) => {
				const newCalendars = { ...prev };
				for (const calendarId in newCalendars) {
					if (newCalendars[calendarId].expand?.persons) {
						newCalendars[calendarId] = {
							...newCalendars[calendarId],
							expand: {
								...newCalendars[calendarId].expand,
								persons: [
									...newCalendars[calendarId].expand.persons.filter(
										(p) => p.id !== result.id,
									),
									result,
								],
							},
						};
					}
				}
				return newCalendars;
			});
		}

		return result;
	}

	public async createMessageForEvent(
		message: Required<Pick<MessagesRecord, "event" | "author" | "text">>,
	) {
		return this.catchError(() =>
			this.pb.collection(Collections.Messages).create(message),
		);
	}

	private async catchError<T>(operation: () => Promise<T>) {
		return operation().catch((err: ClientResponseError | Error) => {
			return { error: err };
		});
	}

	// Usage: const list = await PbOperations.getAllCalendarsOwnedByAndPartOf("1", { expand: ["users"] as const });
	// MAYBE THE EXPAND OPTION IS A LITTLE OVERKILL HERE. Better: Just get a list of calendars, fetch single expanded calendar if needed
	// public async getAllCalendarsOwnedByAndUserIsPartOf<TExpand extends ("users" | "owner")[] | undefined>(
	//     userId: string,
	//     { expand }: { expand?: TExpand }
	// ) {
	//     return this.catchError(() => this.pb.collection(Collections.Calendars).getList<
	//         TExpand extends ["users", "owner"]
	//         ? CalendarsResponse<{ users: UsersResponse[]; owner: UsersResponse }>
	//         : TExpand extends ["owner", "users"]
	//         ? CalendarsResponse<{ users: UsersResponse[]; owner: UsersResponse }>
	//         : TExpand extends ["users"]
	//         ? CalendarsResponse<{ users: UsersResponse[] }>
	//         : TExpand extends ["owner"]
	//         ? CalendarsResponse<{ owner: UsersResponse }>
	//         : CalendarsResponse<never>
	//     >(undefined, undefined, {
	//         filter: pb.filter("owner = {:userId} || users ~ {:userId}", { userId }),
	//         expand: expand?.join(","),
	//     }));
	// }
}

export const PbOperations = new Operations(pb);

// (async () => {
//     const list = await PbOperations.getAllCalendarsOwnedByAndPartOf("1", { expand: ["users"] as const });
//     if ("error" in list) {
//         console.error("Error fetching calendars", list.error);
//         return
//     }

//     list.items[0]?.expand?.users // correct
//     list.items[0]?.expand?.owner // correct red squiggly lines

// })();
