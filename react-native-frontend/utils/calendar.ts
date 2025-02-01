import type {
	CalendarsResponse,
	EventsRecord,
	UsersResponse,
} from "@/api/pocketbase-types";
import type { Colors } from "@/store/Colors";

type MarkedDates = {
	[date: string]: {
		periods: { startingDay?: boolean; endingDay?: boolean; color: string }[];
	};
};

export function eventsToMarkedDates(
	events: (EventsRecord & { color: keyof Colors })[],
	colors: Colors,
): MarkedDates {
	// Sort events first by start date, then by duration (longer spans first)
	events.sort((a, b) => {
		const startDateA = new Date(a.startDatetime as string).getTime();
		const startDateB = new Date(b.startDatetime as string).getTime();

		// Compare start dates
		if (startDateA !== startDateB) {
			return startDateA - startDateB;
		}

		// Compare durations if start dates are the same
		const durationA =
			new Date(a.endDatetime || (a.startDatetime as string)).getTime() -
			startDateA;
		const durationB =
			new Date(b.endDatetime || (b.startDatetime as string)).getTime() -
			startDateB;
		return durationB - durationA;
	});

	return events.reduce((markedDates, event) => {
		const {
			startDatetime,
			endDatetime = startDatetime,
			color = "6c60qjalpibtqt9",
		} = event;

		const startDate = new Date(startDatetime as string);
		const endDate = new Date(endDatetime as string);

		let eventIndex: number | null = null;

		for (
			let currentDate = new Date(startDate);
			currentDate <= endDate;
			currentDate.setDate(currentDate.getDate() + 1)
		) {
			const dateStr = currentDate.toISOString().split("T")[0];

			// Initialize periods array for this date if it doesn't exist
			if (!markedDates[dateStr]) {
				markedDates[dateStr] = { periods: [] };
			}

			// If this is the first time we're encountering this event, push it and get its index
			if (eventIndex === null) {
				eventIndex =
					markedDates[dateStr].periods.push({
						startingDay: currentDate.getTime() === startDate.getTime(),
						endingDay: currentDate.getTime() === endDate.getTime(),
						color: colors[color]?.hex || "#6A0572",
					}) - 1;
			} else {
				// Ensure that the event uses the same index for the remaining dates
				while (markedDates[dateStr].periods.length <= eventIndex) {
					markedDates[dateStr].periods.push({ color: "transparent" });
				}

				markedDates[dateStr].periods[eventIndex] = {
					startingDay: currentDate.getTime() === startDate.getTime(),
					endingDay: currentDate.getTime() === endDate.getTime(),
					color: colors[color]?.hex || "#6A0572",
				};
			}
		}

		return markedDates;
	}, {} as MarkedDates);
}
