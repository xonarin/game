import React, { useEffect, useMemo, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animateScroll } from 'react-scroll/modules';

import s from './HitsItems.scss';
import { cn } from '../../../../utils/bem-css-module';
import Scroller from '../../../../components/Scroller/Scroller';
import HitsItemsGroup from './HitsItemsGroup/HitsItemsGroup';
import { HitsItemProps } from './HitsItemsGroup/HitsItem/HitsItem';
import useMeasure from '../../../../hooks/useMeasure';

export interface HitsItemsProps {
    current: number;
    items: number[];
}

const cnHitsItems = cn(s, 'HitsItems');

const HitsItems: React.FC<HitsItemsProps> = ({ current, items }) => {
    useStyles(s);

    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const scrollerViewportRef = useRef<HTMLDivElement | null>(null);
    const { width } = useMeasure(scrollerRef);

    const maxItemsInGroup = width <= 478 ? 3 : 4;

    const groups = useMemo<HitsItemProps[][]>(() => {
        const transformedItems = items.map<HitsItemProps>((coef, index) => ({
            coef,
            hit: index + 1,
            isCurrent: current >= 0 ? index === current - 1 : false,
        }));

        return transformedItems.reduce<HitsItemProps[][]>((acc, item) => {
            const last = acc[acc.length - 1];

            if (!last || last.length === maxItemsInGroup) {
                acc.push([item]);
            } else {
                last.push(item);
            }

            return acc;
        }, []);
    }, [current, items, maxItemsInGroup]);

    useEffect(() => {
        if (!scrollerRef.current) return;
        if (width === 0) {
            return;
        }

        const scrollerViewport = scrollerViewportRef.current;

        if (!scrollerViewport) {
            return;
        }

        const currentGroup = current !== 0 ? Math.floor((current - 1) / maxItemsInGroup) : 0;
        const scrollX = currentGroup * scrollerViewport.offsetWidth;

        // noinspection JSSuspiciousNameCombination
        animateScroll.scrollTo(scrollX, {
            container: scrollerViewport,
            duration: 500,
            horizontal: true,
        });
    }, [current, maxItemsInGroup, width]);

    if (groups.length === 0) {
        return null;
    }

    return (
        <Scroller className={cnHitsItems()} withControls ref={scrollerRef} viewportRef={scrollerViewportRef}>
            {groups.map(group => (
                <HitsItemsGroup items={group} key={group[0].coef} />
            ))}
        </Scroller>
    );
};

export default HitsItems;
