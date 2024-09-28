import { useParams } from "react-router-dom";

export const Component = () => {
	const calendarId = useParams().calendarId;

	return <div>ChatNotes - CalendarId{calendarId}</div>;
};
