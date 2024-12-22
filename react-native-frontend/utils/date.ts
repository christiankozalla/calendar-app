import { isSameDay, isAfter, isBefore } from "date-fns";

export const inRange = (date: Date, min: Date, max: Date) =>
	(isSameDay(date, min) || isAfter(date, min)) &&
	(isSameDay(date, max) || isBefore(date, max));

export const setDateWithCurrentTime = (dateString: string | Date): Date => {
	const date = new Date(dateString); // Create a Date instance with the specified date
	const now = new Date(); // Get the current time

	date.setHours(now.getHours(), now.getMinutes());

	return date;
}

export const roundToNearestHour = (date: Date | string, offset: number): Date => {
	const result = new Date(date);
	result.setMinutes(0, 0, 0);
	result.setHours(result.getHours() + offset);

	return result;
}