import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './ReferalsTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import SafeTable from '../../../../components/Table/containers/SafeTable';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import Icon from '../../../../components/Icon/Icon';
import Button from '../../../../components/Button/Button';
import useReferralsQuery from '../../../../hooks/graphql/referrals/useReferralsQuery';
import { getTime } from '../../../../utils/time';

interface Referal {
    id: number;
    username: string;
    avatar: string;
    gamesCount: number;
    income: number;
    isActive: boolean;
    createdAt: string;
}

export interface ReferalsTableProps {}

const cnReferalsTable = cn(s, 'ReferalsTable');

const ReferalsTable: React.FC<ReferalsTableProps> = () => {
    const { referrals } = useReferralsQuery();

    useStyles(s);

    const [showAll, setShowAll] = useState(false);

    const handleChange = () => {
        setShowAll(!showAll);
    };

    const data = showAll || referrals.length <= 6 ? referrals : referrals.slice(0, 6);

    return (
        <>
            <SafeTable<Referal, 'id'> className={cnReferalsTable()} rowKey="id" items={data} responsivity={false}>
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
                    {({ username, avatar }) => (
                        <>
                            <div
                                className={cnReferalsTable('WinnerAvatar')}
                                style={{ backgroundImage: `url(${avatar})` }}
                            />
                            <Text className={cnReferalsTable('WinnerName')} color="white" upper>
                                {username}
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
                    {({ gamesCount }) => (
                        <Text font="Rubik" color="white" upper>
                            {gamesCount}
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
                    {({ createdAt }) => (
                        <Text font="Rubik" color="white" upper>
                            {getTime(new Date(createdAt))}
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
                    {({ isActive }) => {
                        if (isActive) {
                            return (
                                <div className={cnReferalsTable('Status')}>
                                    <Icon type="checked" />
                                    <Text color="green">Активен</Text>
                                </div>
                            );
                        }
                        return (
                            <div className={cnReferalsTable('Status')}>
                                <Icon type="angryFace" />
                                <Text color="gray">Не активен</Text>
                            </div>
                        );
                    }}
                </Column>
            </SafeTable>
            {referrals.length > 6 && (
                <div className={cnReferalsTable('More')}>
                    <Button onClick={handleChange}>{showAll ? 'Hide' : 'More'}</Button>
                </div>
            )}
        </>
    );
};

export default ReferalsTable;
