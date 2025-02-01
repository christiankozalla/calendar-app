import { isSameDay, isAfter, isBefore } from "date-fns";

export const inRange = (date: Date, min: Date, max: Date) =>
	(isSameDay(date, min) || isAfter(date, min)) &&
	(isSameDay(date, max) || isBefore(date, max));

export const setDateWithCurrentTime = (dateString: string | Date): Date => {
	const date = new Date(dateString); // Create a Date instance with the specified date
	const now = new Date(); // Get the current time

	date.setHours(now.getHours(), now.getMinutes());

	return date;
};

export const roundToNearestHour = (
	date: Date | string,
	offset: number,
): Date => {
	const result = new Date(date);
	result.setMinutes(0, 0, 0);
	result.setHours(result.getHours() + offset);

	return result;
};

export const mergeDates = (dateInput: Date, timeInput: Date): Date => {
	// Extract day components from `dateWithDay`
	const year = dateInput.getFullYear();
	const month = dateInput.getMonth();
	const day = dateInput.getDate();

	// Extract time components from `dateWithTime`
	const hours = timeInput.getHours();
	const minutes = timeInput.getMinutes();
	const seconds = timeInput.getSeconds();

	return new Date(year, month, day, hours, minutes, seconds);
};

export const toDateString = (date: Date | string): string => {
	const theDate = parseDate(date);
	if (!theDate) return "";
	return theDate.toLocaleDateString(undefined, {
		year: "numeric",
		month: "2-digit",
		day: "numeric",
		weekday: "short",
	});
};

export const toTimeString = (date: Date | string): string => {
	const theDate = parseDate(date);
	if (!theDate) return "";
	return theDate.toLocaleTimeString(undefined, {
		hour: "2-digit",
		minute: "2-digit",
	});
};

const parseDate = (date: Date | string): Date | null => {
	try {
		date = typeof date === "string" ? new Date(date) : date;
		return date;
	} catch (error) {
		console.log("not a date", date);
		return null;
	}
};
