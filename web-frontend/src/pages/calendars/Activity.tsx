import { useParams } from "react-router-dom";

export const Component = () => {
	const calendarId = useParams().calendarId;

	return <div>Activity - CalendarId{calendarId}</div>;
};
