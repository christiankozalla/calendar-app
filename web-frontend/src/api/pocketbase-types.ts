/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
	Calendars = "calendars",
	Chat = "chat",
	Colors = "colors",
	Events = "events",
	EventsByMessage = "events_by_message",
	Invitations = "invitations",
	Locations = "locations",
	Messages = "messages",
	Persons = "persons",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string;
export type RecordIdString = string;
export type HTMLString = string;

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString;
	created: IsoDateString;
	updated: IsoDateString;
	collectionId: string;
	collectionName: Collections;
	expand?: T;
};

export type AuthSystemFields<T = never> = {
	email: string;
	emailVisibility: boolean;
	username: string;
	verified: boolean;
} & BaseSystemFields<T>;

// Record types for each collection

export type CalendarsRecord = {
	name?: string;
	owner?: RecordIdString;
	users?: RecordIdString[];
};

export type ChatRecord = {
	author?: RecordIdString;
	calendar: RecordIdString;
	calendar_users?: RecordIdString[];
	event_created?: IsoDateString;
	event_id?: RecordIdString;
	event_title?: string;
	message_created?: IsoDateString;
	message_id?: RecordIdString;
	message_text?: string;
};

export type ColorsRecord = {
	hex?: string;
	name?: string;
};

export type EventsRecord = {
	calendar: RecordIdString;
	color?: RecordIdString;
	description?: HTMLString;
	endDatetime?: IsoDateString;
	location?: RecordIdString;
	owner?: RecordIdString[];
	persons?: RecordIdString[];
	startDatetime?: IsoDateString;
	title?: string;
};

export type EventsByMessageRecord<Tmost_recent_message_time = unknown> = {
	calendar: RecordIdString;
	calendar_users?: RecordIdString[];
	most_recent_message_time?: null | Tmost_recent_message_time;
	title?: string;
};

export type InvitationsRecord = {
	calendar?: RecordIdString[];
	invitee_email?: string;
	inviter?: RecordIdString;
	token?: string;
};

export type LocationsRecord = {
	latitude?: number;
	longitude?: number;
	name?: string;
};

export type MessagesRecord = {
	author?: RecordIdString;
	event?: RecordIdString;
	text?: string;
};

export type PersonsRecord = {
	calendar?: RecordIdString;
	color?: string;
	email?: string;
	name?: string;
};

export type UsersRecord = {
	avatar?: string;
	name?: string;
};

// Response types include system fields and match responses from the PocketBase API
export type CalendarsResponse<Texpand = unknown> = Required<CalendarsRecord> &
	BaseSystemFields<Texpand>;
export type ChatResponse<Texpand = unknown> = Required<ChatRecord> &
	BaseSystemFields<Texpand>;
export type ColorsResponse<Texpand = unknown> = Required<ColorsRecord> &
	BaseSystemFields<Texpand>;
export type EventsResponse<Texpand = unknown> = Required<EventsRecord> &
	BaseSystemFields<Texpand>;
export type EventsByMessageResponse<
	Tmost_recent_message_time = unknown,
	Texpand = unknown,
> = Required<EventsByMessageRecord<Tmost_recent_message_time>> &
	BaseSystemFields<Texpand>;
export type InvitationsResponse<Texpand = unknown> =
	Required<InvitationsRecord> & BaseSystemFields<Texpand>;
export type LocationsResponse<Texpand = unknown> = Required<LocationsRecord> &
	BaseSystemFields<Texpand>;
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> &
	BaseSystemFields<Texpand>;
export type PersonsResponse<Texpand = unknown> = Required<PersonsRecord> &
	BaseSystemFields<Texpand>;
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> &
	AuthSystemFields<Texpand>;

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	calendars: CalendarsRecord;
	chat: ChatRecord;
	colors: ColorsRecord;
	events: EventsRecord;
	events_by_message: EventsByMessageRecord;
	invitations: InvitationsRecord;
	locations: LocationsRecord;
	messages: MessagesRecord;
	persons: PersonsRecord;
	users: UsersRecord;
};

export type CollectionResponses = {
	calendars: CalendarsResponse;
	chat: ChatResponse;
	colors: ColorsResponse;
	events: EventsResponse;
	events_by_message: EventsByMessageResponse;
	invitations: InvitationsResponse;
	locations: LocationsResponse;
	messages: MessagesResponse;
	persons: PersonsResponse;
	users: UsersResponse;
};

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: "calendars"): RecordService<CalendarsResponse>;
	collection(idOrName: "chat"): RecordService<ChatResponse>;
	collection(idOrName: "colors"): RecordService<ColorsResponse>;
	collection(idOrName: "events"): RecordService<EventsResponse>;
	collection(
		idOrName: "events_by_message",
	): RecordService<EventsByMessageResponse>;
	collection(idOrName: "invitations"): RecordService<InvitationsResponse>;
	collection(idOrName: "locations"): RecordService<LocationsResponse>;
	collection(idOrName: "messages"): RecordService<MessagesResponse>;
	collection(idOrName: "persons"): RecordService<PersonsResponse>;
	collection(idOrName: "users"): RecordService<UsersResponse>;
};
