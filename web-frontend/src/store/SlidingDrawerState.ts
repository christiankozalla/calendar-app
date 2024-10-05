import type { FunctionComponent, ReactNode } from "react";
import { atom } from "recoil";

export type Slide = {
	id: string;
	state: { isOpen: boolean };
	slots?: { upperLeftSlot?: ReactNode };
	props: any;
	component: FunctionComponent<any>;
};
/**
 * SlidingDrawerState keeps a global state of data
 * that can be subscribed by SlidingDrawer components
 *
 * From anywhere in the React app, you are able to push data into the SlidingDrawerState
 * to be displayed in a SlidingDrawer component right away.
 * Data pushed into SlidingDrawerState declares which child component and other JSON data should be used for display
 */
export const SlidingDrawerState = atom<Slide[]>({
	key: "SlidingDrawer",
	default: [],
});
