import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ReferalsTable.scss';
import { cn } from '../../../utils/bem-css-module';
import SafeTable from '../../../components/Table/containers/SafeTable';
import Column from '../../../components/Table/Column/Column';
import Text from '../../../components/Text/Text';
import Icon from '../../../components/Icon/Icon';

interface Referal {
    id: number;
    user: string;
    count: number;
    date: string;
    income: number;
    status: Boolean;
}

export interface ReferalsTableProps {
    items: Referal[];
}

const cnReferalsTable = cn(s, 'ReferalsTable');

const ReferalsTable: React.FC<ReferalsTableProps> = ({ items }) => {
    useStyles(s);

    return (
        <SafeTable<Referal, 'id'> className={cnReferalsTable()} rowKey="id" items={items} responsivity={false}>
            <Column<Referal>
                label={
                    <Text weight="semiBold" upper>
                        ПОЛЬЗОВАТЕЛЬ
                    </Text>
                }
                minWidth={130}
                maxWidth={200}
                columnKey="id"
            >
              {({ user }) => (
                    <>
                        <div className={cnReferalsTable('WinnerAvatar')} />
                        <Text className={cnReferalsTable('WinnerName')} color="white" upper>
                            {user}
                        </Text>
                    </>
                )}
            </Column>
            <Column<Referal>
                label={
                    <Text weight="semiBold" upper>
                        СЫГРАНО ИГР
                    </Text>
                }
                minWidth={200}
                columnKey="count"
            >
               {({ count }) => (
                    <Text font="Rubik" color="white" upper>
                        {count}
                    </Text>
                )}
            </Column>
            <Column<Referal>
                label={
                    <Text weight="semiBold" upper>
                        ДАТА РЕГИСТРАЦИИ
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="points"
            >
                {({ date }) => (
                    <Text font="Rubik" color="white" upper>
                        {date}
                    </Text>
                )}
            </Column>

            <Column<Referal>
                label={
                    <Text weight="semiBold" upper>
                       ДОХОД С РЕФЕРАЛА
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="income"
            >
                 {({ income }) => (
                    <Text font="Rubik" color="green" upper>
                        {income}
                    </Text>
                )}
            </Column>
            <Column<Referal>
                label={
                    <Text weight="semiBold" upper>
                      СТАТУС
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="status"
            >
              {({ status }) => {
                    if(status){
                        return <div>
                            <Icon type='cardsWhite'/>
                            <Text color='green'>Активен</Text>
                        </div>
                    }
                    return <div>
                            <Icon type='automat'/>
                            <Text color='gray'>Не активен</Text>
                    </div>
}} 
                </Column>
        </SafeTable>
    );
};

export default ReferalsTable;
