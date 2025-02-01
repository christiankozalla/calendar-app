/**
 * This file was @generated using pocketbase-typegen
 */

import type PocketBase from "pocketbase";
import type { RecordService } from "pocketbase";

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
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

export type AuthoriginsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	fingerprint: string;
	id: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type ExternalauthsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	provider: string;
	providerId: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type MfasRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	method: string;
	recordRef: string;
	updated?: IsoDateString;
};

export type OtpsRecord = {
	collectionRef: string;
	created?: IsoDateString;
	id: string;
	password: string;
	recordRef: string;
	sentTo?: string;
	updated?: IsoDateString;
};

export type SuperusersRecord = {
	created?: IsoDateString;
	email: string;
	emailVisibility?: boolean;
	id: string;
	password: string;
	tokenKey: string;
	updated?: IsoDateString;
	verified?: boolean;
};

export type CalendarsRecord = {
	created?: IsoDateString;
	id: string;
	name?: string;
	owner?: RecordIdString;
	persons?: RecordIdString[];
	updated?: IsoDateString;
	users?: RecordIdString[];
};

export type ChatRecord = {
	author?: RecordIdString;
	calendar: RecordIdString;
	calendar_users?: RecordIdString[];
	event_created?: IsoDateString;
	event_id?: RecordIdString;
	event_title?: string;
	id: string;
	message_created?: IsoDateString;
	message_id?: RecordIdString;
	message_text?: string;
};

export type ColorsRecord = {
	created?: IsoDateString;
	hex?: string;
	id: string;
	name?: string;
	updated?: IsoDateString;
};

export type EventsRecord = {
	calendar: RecordIdString;
	color?: RecordIdString;
	created?: IsoDateString;
	description?: HTMLString;
	endDatetime?: IsoDateString;
	id: string;
	location?: RecordIdString;
	owner?: RecordIdString[];
	persons?: RecordIdString[];
	startDatetime?: IsoDateString;
	title?: string;
	updated?: IsoDateString;
};

export type EventsByMessageRecord<Tmost_recent_message_time = unknown> = {
	calendar: RecordIdString;
	calendar_users?: RecordIdString[];
	created?: IsoDateString;
	id: string;
	most_recent_message_text?: string;
	most_recent_message_time?: null | Tmost_recent_message_time;
	title?: string;
};

export type InvitationsRecord = {
	calendar?: RecordIdString[];
	created?: IsoDateString;
	id: string;
	invitee_email?: string;
	inviter?: RecordIdString;
	token?: string;
	updated?: IsoDateString;
};

export type LocationsRecord = {
	created?: IsoDateString;
	id: string;
	latitude?: number;
	longitude?: number;
	name?: string;
	updated?: IsoDateString;
};

export type MessagesRecord = {
	author?: RecordIdString;
	created?: IsoDateString;
	event?: RecordIdString;
	id: string;
	text?: string;
	updated?: IsoDateString;
};

export type PersonsRecord = {
	avatar?: string;
	color?: string;
	created?: IsoDateString;
	id: string;
	name?: string;
	updated?: IsoDateString;
	user?: RecordIdString;
};

export type UsersRecord = {
	created?: IsoDateString;
	email?: string;
	emailVisibility?: boolean;
	id: string;
	password: string;
	tokenKey: string;
	updated?: IsoDateString;
	verified?: boolean;
};

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> =
	Required<AuthoriginsRecord> & BaseSystemFields<Texpand>;
export type ExternalauthsResponse<Texpand = unknown> =
	Required<ExternalauthsRecord> & BaseSystemFields<Texpand>;
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> &
	BaseSystemFields<Texpand>;
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> &
	BaseSystemFields<Texpand>;
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> &
	AuthSystemFields<Texpand>;
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
	_authOrigins: AuthoriginsRecord;
	_externalAuths: ExternalauthsRecord;
	_mfas: MfasRecord;
	_otps: OtpsRecord;
	_superusers: SuperusersRecord;
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
	_authOrigins: AuthoriginsResponse;
	_externalAuths: ExternalauthsResponse;
	_mfas: MfasResponse;
	_otps: OtpsResponse;
	_superusers: SuperusersResponse;
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
	collection(idOrName: "_authOrigins"): RecordService<AuthoriginsResponse>;
	collection(idOrName: "_externalAuths"): RecordService<ExternalauthsResponse>;
	collection(idOrName: "_mfas"): RecordService<MfasResponse>;
	collection(idOrName: "_otps"): RecordService<OtpsResponse>;
	collection(idOrName: "_superusers"): RecordService<SuperusersResponse>;
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
