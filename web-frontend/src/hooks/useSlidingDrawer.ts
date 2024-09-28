import { useSetRecoilState } from "recoil";
import { type Slide, SlidingDrawerState } from "@/store/SlidingDrawerState";

export const useSlidingDrawer = () => {
	const setSlidingDrawerState = useSetRecoilState(SlidingDrawerState);

	const push = (slide: Omit<Slide, "id">) => {
		const id = self.crypto.randomUUID();
		setSlidingDrawerState((prev) => [...prev, { ...slide, id }]);

		return id
	};

	const update = (slide: Pick<Slide, "id"> & Partial<Slide>) => {
		setSlidingDrawerState((prev) => {
			const mergedSlide = prev.find((s) => s.id === slide.id);
			if (!mergedSlide) {
				console.warn("Did not update SlidingDrawerState - Could not find id: ", slide.id);
				return prev;
			}
			return [
				...prev.filter((s) => s.id !== slide.id),
				{ ...mergedSlide, ...slide }, // updated slide, Note that the ordering might be relevant here!
			]
		});
	};

	return {
		push,
		update,
	};
};
