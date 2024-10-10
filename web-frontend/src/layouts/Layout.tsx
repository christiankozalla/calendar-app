import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { SlidingDrawerManager } from "@/components/SlidingDrawerManager";
import { pb } from "@/api/pocketbase";
import { useSetRecoilState } from "recoil";
import { ColorsState } from "@/store/Colors";
import type { ColorsRecord } from "@/api/pocketbase-types";

export const Layout = () => {
	const setColors = useSetRecoilState(ColorsState);

	// biome-ignore lint: this effect shall only run on first render
	useEffect(() => {
		(async () => {
			const colorsResponse = await pb.collection("colors").getFullList();
			setColors(
				colorsResponse.reduce(
					(colors, current) => {
						colors[current.id] = { hex: current.hex, name: current.name };
						return colors;
					},
					{} as { [id: string]: ColorsRecord },
				),
			);
		})();
	}, []);

	return (
		<>
			<main>
				<Outlet />
			</main>
			<SlidingDrawerManager />
		</>
	);
};
