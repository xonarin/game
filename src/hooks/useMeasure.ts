import { RefObject, useMemo, useState } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export interface MeasureSnapshot {
    width: number;
    height: number;
}

const useMeasure = <T extends HTMLElement>(ref: RefObject<T | null>, dontObserve?: boolean): MeasureSnapshot => {
    const [snapshot, setSnapshot] = useState<MeasureSnapshot>({ width: 0, height: 0 });

    const resizeObserver = useMemo(
        () =>
            dontObserve
                ? null
                : new ResizeObserver(entries => {
                      const { offsetWidth: width, offsetHeight: height } = entries[0].target as HTMLElement;

                      setSnapshot({ width, height });
                  }),
        [dontObserve],
    );

    useIsomorphicLayoutEffect(() => {
        const element = ref.current;

        if (!element || !resizeObserver) return;

        resizeObserver.observe(element);

        // eslint-disable-next-line consistent-return
        return () => resizeObserver.unobserve(element);
    }, [ref, resizeObserver]);

    return snapshot;
};

export default useMeasure;
