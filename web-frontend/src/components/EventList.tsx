import { Card, Text, Heading, Flex, Box } from "@radix-ui/themes";
import type { EventsResponse } from "@/api/pocketbase-types";

export const EventList = ({ events }: { events: EventsResponse[] }) => {
	return (
		<Flex direction="column" gap="3">
			{events.map((event, index) => (
				<Card key={index} className="p-4 hover:bg-gray-50 transition-colors">
					<Flex direction="column" gap="2">
						<Heading size="4">{event.title || "Untitled Event"}</Heading>

						{event.startDatetime && (
							<Flex align="center" gap="2">
								{/* <CalendarIcon className="w-4 h-4 text-gray-500" /> */}
								<Text size="2" className="text-gray-600">
									{new Date(event.startDatetime).toLocaleString()}
								</Text>
							</Flex>
						)}

						{event.location && (
							<Flex align="center" gap="2">
								{/* <MapPinIcon className="w-4 h-4 text-gray-500" /> */}
								<Text size="2" className="text-gray-600">
									{event.location}
								</Text>
							</Flex>
						)}

						{event.persons && event.persons.length > 0 && (
							<Flex align="center" gap="2">
								{/* <UserIcon className="w-4 h-4 text-gray-500" /> */}
								<Text size="2" className="text-gray-600">
									{event.persons.length}{" "}
									{event.persons.length === 1 ? "person" : "people"}
								</Text>
							</Flex>
						)}

						{event.description && (
							<Box className="mt-2">
								<Text
									size="2"
									className="text-gray-700"
									dangerouslySetInnerHTML={{ __html: event.description }}
								></Text>
							</Box>
						)}
					</Flex>
				</Card>
			))}
		</Flex>
	);
};
