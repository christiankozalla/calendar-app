import { useSetRecoilState } from "recoil";
import { type Slide, SlidingDrawerState } from "@/store/SlidingDrawerState";

export const useSlidingDrawer = () => {
	const setSlidingDrawerState = useSetRecoilState(SlidingDrawerState);

	const push = (slide: Omit<Slide, "id">) => {
		(slide as Slide).id = self.crypto.randomUUID();
		setSlidingDrawerState((prev) => [...prev, slide as Slide]);
	};

	const update = (slide: Slide) => {
		setSlidingDrawerState((prev) => [
			...prev.filter((s) => s.id !== slide.id),
			slide, // updated slide, Note that the ordering might be relevant here!
		]);
	};

	return {
		push,
		update,
	};
};
