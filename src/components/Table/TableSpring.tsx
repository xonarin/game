import React, { useMemo, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animated, useTransition } from 'react-spring';
import { easeCubicInOut } from 'd3-ease';

import s from './Table.scss';
import { cn } from '../../utils/bem-css-module';
import { GetRowClassName, GetRowKey, TableProps } from './Table';
import useColumns from '../../hooks/useColumns';
import Scrollable from '../Scrollable/Scrollable';

const cnTable = cn(s, 'Table');

const TableSpring = <
    T extends K extends keyof T ? { [KE in K]: React.Key } : object,
    K extends keyof T | GetRowKey<T> = GetRowKey<T>
>({
    rowKey,
    rowClassName,
    items,
    className,
    children,
}: TableProps<T, K>): React.ReactElement<TableProps<T, K>> => {
    useStyles(s);

    // @ts-ignore Тип K не приводится к keyof T при низлежайшей проверке
    const getRowKey = (typeof rowKey === 'function' ? rowKey : (item: T) => item[rowKey]) as GetRowKey<T>;
    const getRowClassName: GetRowClassName<T> =
        // eslint-disable-next-line no-nested-ternary
        typeof rowClassName === 'undefined'
            ? () => []
            : typeof rowClassName === 'function'
            ? rowClassName // eslint-disable-line prettier/prettier
            : () => rowClassName; // eslint-disable-line prettier/prettier

    const anchor = useRef<HTMLDivElement | null>(null);
    const columns = useMemo(() => children.map(child => child.props), [children]);
    const columnWidths = useColumns(anchor, columns);

    const springItems = useTransition(items, item => getRowKey(item), {
        initial: {
            maxHeight: 65,
            marginBottom: 10,
            opacity: 1,
            transform: 'translateY(0)',
        },
        from: {
            maxHeight: 0,
            marginBottom: 0,
            opacity: 0,
            transform: 'translateY(-100%)',
        },
        enter: {
            maxHeight: 65,
            marginBottom: 10,
            opacity: 1,
            transform: 'translateY(0)',
        },
        leave: {
            maxHeight: 0,
            marginBottom: 0,
            opacity: 0,
            transform: 'translateY(-100%)',
        },
        config: {
            duration: 500,
            easing: easeCubicInOut,
        },
    });

    return (
        <div className={cnTable(null, [className])}>
            <Scrollable className={cnTable('Content')} disablePadding>
                <div className={cnTable('Head')}>
                    <div className={cnTable('Anchor')} ref={anchor} />
                    {columns.map((column, index) => (
                        <div
                            className={cnTable('HeadCell')}
                            style={{ width: columnWidths[index] }}
                            key={column.columnKey}
                        >
                            {column.label}
                        </div>
                    ))}
                </div>
                <div className={cnTable('Body')}>
                    {springItems.map(({ item, key, props: { maxHeight, marginBottom, opacity, transform } }, index) => (
                        <animated.div className={cnTable('RowContainer')} style={{ maxHeight, marginBottom }} key={key}>
                            <animated.div
                                className={cnTable('Row', [...getRowClassName(item)])}
                                style={{ opacity, transform }}
                            >
                                {columns.map((column, columnIndex) => (
                                    <div
                                        className={cnTable('RowCell')}
                                        style={{ width: columnWidths[columnIndex] }}
                                        key={column.columnKey}
                                    >
                                        {column.children(item, index)}
                                    </div>
                                ))}
                            </animated.div>
                        </animated.div>
                    ))}
                </div>
            </Scrollable>
        </div>
    );
};

export default TableSpring;
