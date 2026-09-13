import { useCallback, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';

// Disables scrolling on a ScrollView whose content already fits the visible
// viewport, so there's no dead space to scroll into on tall screens —
// re-enables automatically if content later grows past the viewport height.
export function useFitScreenScroll() {
  const containerHeight = useRef(0);
  const [scrollEnabled, setScrollEnabled] = useState(false);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    containerHeight.current = e.nativeEvent.layout.height;
  }, []);

  const onContentSizeChange = useCallback((_width: number, height: number) => {
    setScrollEnabled(height > containerHeight.current);
  }, []);

  return { scrollEnabled, onLayout, onContentSizeChange };
}
