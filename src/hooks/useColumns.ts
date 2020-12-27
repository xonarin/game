import { RefObject, useState } from 'react';

import useMeasure from './useMeasure';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';

export interface Column {
    minWidth: number;
    maxWidth?: number;
}

const useColumns = <R extends HTMLElement, C extends Column[]>(ref: RefObject<R | null>, columns: C): number[] => {
    const { width } = useMeasure(ref);
    const [columnWidths, setColumnWidths] = useState(() => columns.map(column => column.minWidth));

    useIsomorphicLayoutEffect(() => {
        let minWidth = 0;
        let maxWidth = 0;
        let maxDelta = 0;
        let unlimitedColumnsCount = 0;
        let unlimitedColumnsMinWidth = 0;

        columns.forEach(column => {
            minWidth += column.minWidth;

            if (column.maxWidth) {
                maxWidth += column.maxWidth;
                maxDelta = Math.max(maxDelta, column.maxWidth - column.minWidth);
            } else {
                maxWidth += column.minWidth;
                ++unlimitedColumnsCount;
                unlimitedColumnsMinWidth += column.minWidth;
            }
        });

        maxWidth += unlimitedColumnsCount * maxDelta;

        if (width <= minWidth) return;

        setColumnWidths(
            columns.map(column => {
                if (width <= maxWidth) {
                    const delta = column.maxWidth ? column.maxWidth - column.minWidth : maxDelta;

                    return column.minWidth + (delta / (maxWidth - minWidth)) * (width - minWidth);
                }

                return column.maxWidth
                    ? column.maxWidth
                    : column.minWidth + maxDelta + (column.minWidth / unlimitedColumnsMinWidth) * (width - maxWidth);
            }),
        );
    }, [width, columns]);

    return columnWidths;
};

export default useColumns;
