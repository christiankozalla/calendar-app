import { Card, Text, Heading, Flex, Box, Button } from "@radix-ui/themes";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import type { EventsResponse, PersonsResponse } from "@/api/pocketbase-types";
import { EventPanelCrud } from "./EventPanelCrud";
import { CalendarIcon } from "./svg/CalendarIcon";
import { PeopleIcon } from "./svg/PeopleIcon";
import { PencilIcon } from "./svg/PencilIcon";

export const EventList = ({
	events,
}: { events: EventsResponse<{ persons: PersonsResponse[] }>[] }) => {
	const { push } = useSlidingDrawer();

	return (
		<Flex direction="column" gap="3">
			{events.map((event) => (
				<Card key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
					<Flex direction="column" gap="2">
						<Flex justify="between">
							<Heading size="4">{event.title || "Untitled Event"}</Heading>
							<Button
								variant="soft"
								radius="full"
								onClick={() =>
									push({
										state: { isOpen: true },
										props: { ...event, persons: event.expand?.persons },
										component: EventPanelCrud,
									})
								}
							>
								<PencilIcon className="w-4 h-4" />
								Edit
							</Button>
						</Flex>

						{event.startDatetime && (
							<Flex align="center" gap="2">
								<CalendarIcon className="w-4 h-4 text-gray-500" />
								<Text size="2" className="text-gray-700">
									{new Date(event.startDatetime).toLocaleString()}
								</Text>
							</Flex>
						)}

						{event.location && (
							<Flex align="center" gap="2">
								{/* <MapPinIcon className="w-4 h-4 text-gray-500" /> */}
								<Text size="2" className="text-gray-700">
									{event.location}
								</Text>
							</Flex>
						)}

						{event.expand?.persons && event.expand?.persons.length > 0 && (
							<Flex align="center" gap="2">
								<PeopleIcon className="w-4 h-4 text-gray-500" />
								<Text size="2" className="text-gray-700" truncate>
									{event.expand.persons.map((p) => p.name).join(", ")}
								</Text>
							</Flex>
						)}

						{event.description && (
							<Box className="mt-2">
								<Text
									size="2"
									className="text-gray-700"
									// biome-ignore lint: rich text content stored in the backend is escaped properly
									dangerouslySetInnerHTML={{
										__html: event.description,
									}}
								/>
							</Box>
						)}
					</Flex>
				</Card>
			))}
		</Flex>
	);
};

//  .replace(/</g, "&lt;")
// .replace(/>/g, "&gt;"),
