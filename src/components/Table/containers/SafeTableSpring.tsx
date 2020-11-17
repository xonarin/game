import React from 'react';

import { GetRowKey, TableProps } from '../Table';
import TableSpring from '../TableSpring';
import DelayedGuard from '../../Guard/containers/DelayedGuard';

const SafeTableSpring = <
    T extends K extends keyof T ? { [KE in K]: React.Key } : object,
    K extends keyof T | GetRowKey<T> = GetRowKey<T>
>(
    props: TableProps<T, K>,
): React.ReactElement<TableProps<T, K>> => {
    // noinspection RequiredAttributes
    return (
        <DelayedGuard>
            <TableSpring {...props} />
        </DelayedGuard>
    );
};

export default SafeTableSpring;
