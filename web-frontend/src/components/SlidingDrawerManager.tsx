import { useRecoilValue } from "recoil";
import { SlidingDrawerState } from "@/store/SlidingDrawerState";
import { SlidingDrawer } from "./SlidingDrawer";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";
import {
	type OnSwipeParams,
	Direction,
	Swipable,
	swipingDirection,
} from "./Swipable";

export const SlidingDrawerManager = () => {
	const state = useRecoilValue(SlidingDrawerState);
	const { update } = useSlidingDrawer();

	const onSwipe = (directions: OnSwipeParams) => {
		const swipingDirections = swipingDirection(directions);
		if (swipingDirections.includes(Direction.DOWN)) {
			for (const slide of state) {
				update({ ...slide, state: { ...slide.state, isOpen: false } });
			}
		} else if (swipingDirections.includes(Direction.UP) && state.length > 0) {
			const slide = state[state.length - 1];
			update({ ...slide, state: { ...slide.state, isOpen: true } });
		}
	};

	return (
		<Swipable global onSwipe={onSwipe}>
			{/* NOTE: SlidingDrawers that have been closed, remain in state array */}
			{/* NOTE: Ordering of those slides in state might matter, once the "history" of slides needs to be accesses - e.g. open the previously closed SlidingDrawer by swiping up */}
			{state.map((slide) => (
				<SlidingDrawer
					key={slide.id}
					isOpen={slide.state.isOpen}
					onOpenChange={(isOpen: boolean) =>
						update({ ...slide, state: { ...slide.state, isOpen } })
					}
					{...slide.slots}
				>
					<slide.component {...slide.props} />
				</SlidingDrawer>
			))}
		</Swipable>
	);
};
