import React, { useCallback, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animateScroll } from 'react-scroll';

import s from './Scroller.scss';
import { cn } from '../../utils/bem-css-module';
import useDragMove from '../../hooks/useDragMove';
import Button from '../Button/Button';

export interface ScrollerProps {
    withControls?: boolean;
    scrollDuration?: number;
    className?: string;
    children: React.ReactNode;
}

const cnScroller = cn(s, 'Scroller');

const Scroller = React.forwardRef<HTMLDivElement, ScrollerProps>(
    ({ withControls, scrollDuration = 500, children, className }, ref) => {
        useStyles(s);

        const viewport = useRef<HTMLDivElement | null>(null);

        const onDragStart = useDragMove((dx, dy) => {
            if (!viewport.current) return;

            viewport.current.scrollLeft -= dx;
            viewport.current.scrollTop -= dy;
        }, []);

        const onClickControl = useCallback(
            isRight => {
                if (!viewport.current) return;

                const options = {
                    container: viewport.current,
                    duration: scrollDuration,
                    horizontal: true,
                };
                const diff = Math.round(viewport.current.offsetWidth);

                animateScroll.scrollMore(isRight ? diff : -diff, options);
            },
            [scrollDuration],
        );
        const onClickLeftControl = useCallback(() => onClickControl(false), [onClickControl]);
        const onClickRightControl = useCallback(() => onClickControl(true), [onClickControl]);

        return (
            <div className={cnScroller(null, [className])} ref={ref}>
                {withControls && (
                    <Button
                        className={cnScroller('CaretLeft')}
                        icon="caretLeft"
                        iconHover="caretLeftWhite"
                        iconSize="xs"
                        clear
                        onClick={onClickLeftControl}
                    />
                )}
                {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                <div className={cnScroller('Viewport')} ref={viewport} onMouseDown={onDragStart}>
                    <div className={cnScroller('Items')}>{children}</div>
                </div>
                {withControls && (
                    <Button
                        className={cnScroller('CaretRight')}
                        icon="caretLeft"
                        iconHover="caretLeftWhite"
                        iconSize="xs"
                        clear
                        onClick={onClickRightControl}
                    />
                )}
            </div>
        );
    },
);

export default Scroller;
