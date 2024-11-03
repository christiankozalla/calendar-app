import { pb } from "@/api/pocketbase";
import type { ColorsRecord } from "@/api/pocketbase-types";
import { atom } from "recoil";

export type Colors = { [id: string]: ColorsRecord };

export const ColorsState = atom<Colors>({
	key: "Colors",
	default: {},
	effects: [
		({ trigger, setSelf }) => {
			if (trigger === "get") {
				pb.collection("colors").getFullList().then((colorsResponse) => {
					setSelf(
						colorsResponse.reduce(
							(colors, current) => {
								colors[current.id] = { hex: current.hex, name: current.name };
								return colors;
							},
							{} as { [id: string]: ColorsRecord },
						),
					);
				});
			}
		}
	]
});
