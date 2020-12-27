import React, { useCallback, useImperativeHandle, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animateScroll } from 'react-scroll';
import { debounce } from 'lodash';

import s from './Scrollable.scss';
import { cn } from '../../utils/bem-css-module';
import useDragMove from '../../hooks/useDragMove';
import useElementSize from '../../hooks/useElementSize';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

export interface ScrollableProps {
    disablePadding?: boolean;
    onScroll?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;

    className?: string;
    children: React.ReactNode;
}

export interface ScrollableRef {
    getScrollHeight: () => number;
    getScrollTop: () => number;
    getClientHeight: () => number;
    scrollTo: (y: number, duration?: number, easingFunction?: string) => void;
}

const cnScrollable = cn(s, 'Scrollable');

const Scrollable = React.forwardRef<ScrollableRef, ScrollableProps>(
    ({ disablePadding, onScroll, className, children }, ref) => {
        useStyles(s);

        const viewportRef = useRef<HTMLDivElement | null>(null);
        const verticalScrollRef = useRef<HTMLDivElement | null>(null);
        const horizontalScrollRef = useRef<HTMLDivElement | null>(null);

        const [{ barWidth, barHeight, barTop, barLeft }, setState] = useState({
            barWidth: 0,
            barHeight: 0,
            barTop: 0,
            barLeft: 0,
        });

        const [{ isVerticalActive, isHorizontalActive }, setActive] = useState({
            isVerticalActive: false,
            isHorizontalActive: false,
        });

        const [isScrolling, setScrolling] = useState(false);

        const isVertical = barHeight > 0;
        const isHorizontal = barWidth > 0;

        const { height: scrollBarHeight } = useElementSize(verticalScrollRef, true, [isHorizontal]);
        const { width: scrollBarWidth } = useElementSize(horizontalScrollRef, true, [isVertical]);

        const onDragStartVertical = useDragMove(
            (_0, dy, isDragging) => {
                if (!viewportRef.current) return;

                viewportRef.current.scrollTop += (dy / scrollBarHeight) * viewportRef.current.scrollHeight;
                setActive({
                    isVerticalActive: isDragging,
                    isHorizontalActive: false,
                });
                setScrolling(isDragging);
            },
            [scrollBarHeight],
        );

        const onDragStartHorizontal = useDragMove(
            (dx, _0, isDragging) => {
                if (!viewportRef.current) return;

                viewportRef.current.scrollLeft += (dx / scrollBarWidth) * viewportRef.current.scrollWidth;
                setActive({
                    isVerticalActive: false,
                    isHorizontalActive: isDragging,
                });
                setScrolling(isDragging);
            },
            [scrollBarWidth],
        );

        const updateState = (element: HTMLDivElement) => {
            const { offsetWidth, offsetHeight, scrollWidth, scrollHeight, scrollTop, scrollLeft } = element;

            const newBarWidth = offsetWidth < scrollWidth ? (offsetWidth / scrollWidth) * 100 : 0;
            const newBarHeight = offsetHeight < scrollHeight ? (offsetHeight / scrollHeight) * 100 : 0;

            setState({
                barWidth: newBarWidth,
                barHeight: newBarHeight,
                barTop:
                    offsetHeight < scrollHeight
                        ? (scrollTop / (scrollHeight - offsetHeight)) * (100 - newBarHeight)
                        : 0,
                barLeft:
                    offsetWidth < scrollWidth ? (scrollLeft / (scrollWidth - offsetWidth)) * (100 - newBarWidth) : 0,
            });
        };

        const stopScrolling = useCallback(
            debounce(() => setScrolling(false), 300),
            [],
        );

        const handleScroll = (event: React.UIEvent<HTMLDivElement, UIEvent>) => {
            if (onScroll) {
                onScroll(event);
            }

            updateState(event.currentTarget);

            if (!isScrolling) {
                setScrolling(true);
            }

            if (!isVerticalActive && !isHorizontalActive) {
                stopScrolling();
            }
        };

        useIsomorphicLayoutEffect(() => {
            if (!viewportRef.current) return;

            updateState(viewportRef.current);
        }, [children]);

        useImperativeHandle(ref, () => ({
            getScrollHeight: () => {
                return viewportRef.current ? viewportRef.current.scrollHeight : 0;
            },
            getScrollTop: () => {
                return viewportRef.current ? viewportRef.current.scrollTop : 0;
            },
            getClientHeight: () => {
                return viewportRef.current ? viewportRef.current.clientHeight : 0;
            },
            scrollTo: (y, duration = 0, easingFunction) => {
                if (!viewportRef.current) return;

                const options = {
                    container: viewportRef.current,
                    duration,
                    smooth: easingFunction,
                };

                if (Object.is(y, -0)) {
                    animateScroll.scrollToBottom(options);
                } else {
                    animateScroll.scrollTo(y, options);
                }
            },
        }));

        // Dont touch Viewport's onWheel. This is magic fix for infinite scroll.
        return (
            <div className={cnScrollable({ isVertical, isHorizontal, isScrolling }, [className])}>
                <div
                    className={cnScrollable('Viewport', { disablePadding })}
                    ref={viewportRef}
                    onScroll={handleScroll}
                    onWheel={() => {}}
                >
                    {children}
                </div>
                <div className={cnScrollable('VerticalScroll')} ref={verticalScrollRef}>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        className={cnScrollable('VerticalBar', { active: isVerticalActive })}
                        style={{ height: `${barHeight}%`, top: `${barTop}%` }}
                        onMouseDown={onDragStartVertical}
                    />
                </div>
                <div className={cnScrollable('HorizontalScroll')} ref={horizontalScrollRef}>
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div
                        className={cnScrollable('HorizontalBar', { active: isHorizontalActive })}
                        style={{ width: `${barWidth}%`, left: `${barLeft}%` }}
                        onMouseDown={onDragStartHorizontal}
                    />
                </div>
            </div>
        );
    },
);

export default Scrollable;
