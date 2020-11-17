import { DependencyList, RefObject, useEffect, useState } from 'react';

export interface ElementSizeSnapshot {
    width: number;
    height: number;
}

const getPxValue = (style: CSSStyleDeclaration, propertyName: string): number => {
    return parseFloat(style.getPropertyValue(propertyName).slice(0, -2));
};

const useElementSize = <T extends HTMLElement>(
    ref: RefObject<T | null>,
    excludePadding: boolean,
    deps: DependencyList,
): ElementSizeSnapshot => {
    const [snapshot, setSnapshot] = useState<ElementSizeSnapshot>({ width: 0, height: 0 });

    useEffect(() => {
        if (!ref.current) return;

        const style = window.getComputedStyle(ref.current);

        let width = getPxValue(style, 'width');
        let height = getPxValue(style, 'height');

        if (excludePadding) {
            width -= getPxValue(style, 'padding-left') + getPxValue(style, 'padding-right');
            height -= getPxValue(style, 'padding-top') + getPxValue(style, 'padding-bottom');
        }

        setSnapshot({ width, height });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, excludePadding, ...deps]);

    return snapshot;
};

export default useElementSize;
