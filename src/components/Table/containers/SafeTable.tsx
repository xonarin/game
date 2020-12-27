import React from 'react';

import Table, { GetRowKey, TableProps } from '../Table';
import DelayedGuard from '../../Guard/containers/DelayedGuard';

const SafeTable = <
    T extends K extends keyof T ? { [KE in K]: React.Key } : object,
    K extends keyof T | GetRowKey<T> = GetRowKey<T>
>(
    props: TableProps<T, K>,
): React.ReactElement<TableProps<T, K>> => {
    // noinspection RequiredAttributes
    return (
        <DelayedGuard>
            <Table {...props} />
        </DelayedGuard>
    );
};

export default SafeTable;
