import { useSetRecoilState } from "recoil";
import { type Slide, SlidingDrawerState } from "@/store/SlidingDrawerState";
import { generateUUID } from "@/utils/uuid";

export const useSlidingDrawer = () => {
	const setSlidingDrawerState = useSetRecoilState(SlidingDrawerState);

	const push = (slide: Omit<Slide, "id">) => {
		const id = generateUUID();
		setSlidingDrawerState((prev) => [...prev, { ...slide, id }]);

		return id;
	};

	// const update = (slide: Pick<Slide, "id"> & Partial<Slide>) => {
	// 	console.log("update", slide);
	// 	setSlidingDrawerState((prev) => {
	// 		const slideToMergeWith = prev.find((s) => s.id === slide.id);
	// 		if (!slideToMergeWith) {
	// 			console.warn(
	// 				"Did not update SlidingDrawerState - Could not find id: ",
	// 				slide.id,
	// 			);
	// 			return prev;
	// 		}
	// 		return [
	// 			...prev.filter((s) => s.id !== slide.id),
	// 			{
	// 				id: slideToMergeWith.id,
	// 				props: { ...slideToMergeWith.props, ...slide.props },
	// 				state: { ...slideToMergeWith.state, ...slide.state },
	// 				slots: { ...slideToMergeWith.slots, ...slide.slots },
	// 				component: slide.component || slideToMergeWith.component,
	// 			}, // updated slide, Note that the ordering might be relevant here!
	// 		];
	// 	});
	// };

	const update = (slide: Pick<Slide, "id"> & Partial<Slide>) => {
		setSlidingDrawerState((prev) => {
			const index = prev.findIndex((s) => s.id === slide.id);
			if (index === -1) {
				console.warn(
					"Did not update SlidingDrawerState - Could not find id: ",
					slide.id,
				);
				return prev;
			}
			
			const updatedSlides = [...prev];
			const currentSlide = prev[index];
			updatedSlides[index] = {
				id: currentSlide.id,
				props: { ...currentSlide.props, ...slide.props },
				state: { ...currentSlide.state, ...slide.state },
				slots: { ...currentSlide.slots, ...slide.slots },
				component: slide.component || currentSlide.component,
			};
			
			return updatedSlides;
		});
	};
	return {
		push,
		update,
	};
};
