import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import Scrollable, { ScrollableRef } from '../Scrollable/Scrollable';
import useCloneRef from '../../hooks/useCloneRef';

const MAGIC_NUMBER = 7;

export interface InfiniteScrollProps {
    offset: number;
    count: number;
    loadMore: (offset: number) => Promise<unknown>;
    toTop?: boolean;
    threshold?: number;
    onScroll?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
    disablePadding?: boolean;
    className?: string;
    children: React.ReactNode;
}

const InfiniteScroll = React.forwardRef<ScrollableRef, InfiniteScrollProps>(
    ({ offset, count, loadMore, toTop, threshold = 0, onScroll, disablePadding, className, children }, ref) => {
        const isLoadingRef = useRef(false);
        const prevScrollHeightRef = useRef(-1);
        const memoizedScrollDiffRef = useRef(-1);
        const scrollableRef = useCloneRef(ref);

        const onLoadMore = useCallback(
            async (currentOffset: number, isDelayed?: boolean) => {
                if (isDelayed) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const { current: scroll } = scrollableRef;
                if (!scroll) return;

                if (toTop) {
                    memoizedScrollDiffRef.current = scroll.getScrollHeight() - scroll.getScrollTop();
                }

                isLoadingRef.current = true;
                await loadMore(currentOffset);
                isLoadingRef.current = false;
            },
            [loadMore, scrollableRef, toTop],
        );

        const handleScroll = useMemo(
            () =>
                offset < count
                    ? (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
                          if (onScroll) {
                              onScroll(event);
                          }

                          const { current: scroll } = scrollableRef;
                          if (!scroll) return;

                          const needLoad =
                              (toTop
                                  ? scroll.getScrollTop()
                                  : scroll.getScrollHeight() - scroll.getScrollTop() - scroll.getClientHeight()) <=
                              threshold;

                          if (needLoad && !isLoadingRef.current) {
                              onLoadMore(offset).then();
                          }
                      }
                    : onScroll,
            [offset, count, onScroll, scrollableRef, toTop, threshold, onLoadMore],
        );

        // Load more if we have enough place
        useEffect(() => {
            const { current: scroll } = scrollableRef;
            if (!scroll) return;

            if (offset < count && scroll.getScrollHeight() === scroll.getClientHeight()) {
                onLoadMore(offset, true).then();
            }
        }, [offset, count, onLoadMore, scrollableRef]);

        // Restore scroll position after re-render
        useEffect(() => {
            const { current: scroll } = scrollableRef;
            const scrollHeight = scroll?.getScrollHeight() ?? -1;

            if (
                scroll &&
                prevScrollHeightRef.current !== -1 &&
                Math.abs(scrollHeight - prevScrollHeightRef.current) > MAGIC_NUMBER &&
                memoizedScrollDiffRef.current !== -1
            ) {
                scroll.scrollTo(scrollHeight - memoizedScrollDiffRef.current);
                memoizedScrollDiffRef.current = -1;
            }

            prevScrollHeightRef.current = scrollHeight;
        });

        return (
            <Scrollable
                onScroll={handleScroll}
                disablePadding={disablePadding}
                className={className}
                ref={scrollableRef}
            >
                {children}
            </Scrollable>
        );
    },
);

export default InfiniteScroll;
