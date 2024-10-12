import { isSameDay, isAfter, isBefore } from "date-fns";

export const inRange = (date: Date, min: Date, max: Date) =>
	(isSameDay(date, min) || isAfter(date, min)) &&
	(isSameDay(date, max) || isBefore(date, max));
