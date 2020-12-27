import { MutableRefObject, useCallback, useRef } from 'react';

import { ScrollableRef } from '../components/Scrollable/Scrollable';

export interface UseScrollableHelperResult {
    scrollableRef: MutableRefObject<ScrollableRef | null>;
    scrollTo: (y: number, duration?: number) => void;
    isScrolledToBottom: () => boolean;
}

const AUTO_SCROLL_THRESHOLD = 30;

const useScrollableHelper = (): UseScrollableHelperResult => {
    const scrollableRef = useRef<ScrollableRef | null>(null);
    const scrollTo = useCallback((y: number, duration?: number) => {
        if (scrollableRef.current) {
            scrollableRef.current.scrollTo(y, duration);
        }
    }, []);
    const isScrolledToBottom = useCallback(() => {
        const { current: scroll } = scrollableRef;
        return scroll
            ? scroll.getScrollHeight() - scroll.getScrollTop() - scroll.getClientHeight() <= AUTO_SCROLL_THRESHOLD
            : false;
    }, []);

    return { scrollableRef, scrollTo, isScrolledToBottom };
};

export default useScrollableHelper;
