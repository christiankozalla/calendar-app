import { useRecoilValue } from "recoil";
import { SlidingDrawerState } from "@/store/SlidingDrawerState";
import { SlidingDrawer } from "./SlidingDrawer";
import { useSlidingDrawer } from "@/hooks/useSlidingDrawer";

export const SlidingDrawerManager = () => {
	const state = useRecoilValue(SlidingDrawerState);
	const { update } = useSlidingDrawer();

	return (
		<>
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
		</>
	);
};
