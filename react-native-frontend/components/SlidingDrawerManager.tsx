import { useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SlidingDrawerState } from '@/store/SlidingDrawerState';
import { SlidingDrawer } from './SlidingDrawer';
import { useSlidingDrawer } from '@/hooks/useSlidingDrawer';
import { KeyboardAvoidingComponent } from './KeyboardAvoidingComponent';

export const SlidingDrawerManager = () => {
  const state = useRecoilValue(SlidingDrawerState);
  const { update } = useSlidingDrawer();

  const closeAll = useCallback(() => {
    for (const slide of state) {
      update({ id: slide.id, state: { ...slide.state, isOpen: false } });
    }
  }, [state, update]);

  const renderSlides = useMemo(() => {
    return state.map((slide) => {
      const handleOpenChange = (isOpen: boolean) => {
        update({ 
          id: slide.id, 
          state: { ...slide.state, isOpen } 
        });
      };

      const handleClose = () => {
        update({ 
          id: slide.id, 
          state: { ...slide.state, isOpen: false } 
        });
      };

      const SlideComponent = slide.component;

      return (
        <SlidingDrawer
          key={`drawer-${slide.id}`}
          isOpen={slide.state.isOpen}
          height={slide.state.height}
          onOpenChange={handleOpenChange}
          upperLeftSlot={slide.slots?.upperLeftSlot}
        >
          <SlideComponent
            {...slide.props}
            closeSlidingDrawer={handleClose}
            closeAll={closeAll}
          />
        </SlidingDrawer>
      );
    });
  }, [state, update, closeAll]);

  return (
    <KeyboardAvoidingComponent 
      style={{ 
        flex: 1, 
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0 
      }}
    >
      {renderSlides}
    </KeyboardAvoidingComponent>
  );
};