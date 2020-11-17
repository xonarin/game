import React from 'react';

import { Column as ColumnType } from '../../../hooks/useColumns';

export interface ColumnProps<T> extends ColumnType {
    label: React.ReactNode;
    columnKey: React.Key;
    children: (item: T, index: number) => React.ReactNode;
}

export type ColumnElement<T> = React.ReactElement<ColumnProps<T>, 'Column'>;

const Column = <T extends object>(props: ColumnProps<T>): ColumnElement<T> => ({
    type: 'Column',
    props,
    key: props.columnKey,
});

export default Column;
