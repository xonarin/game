import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BonuseTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import SafeTable from '../../../../components/Table/containers/SafeTable';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import Badge from '../../../../components/Badge/Badge';

interface BonuseItem {
    id: number;
    avatar: string;
    winner: string;
    referrals: number;
    percent: number;
}

export interface BonuseTableProps {
    items: BonuseItem[];
}

const cnBonuseTable = cn(s, 'BonuseTable');

const BonuseTable: React.FC<BonuseTableProps> = ({ items }) => {
    useStyles(s);

    return (
        <SafeTable<BonuseItem, 'id'> className={cnBonuseTable()} rowKey="id" items={items} responsivity>
            <Column<BonuseItem>
                label={
                    <Text weight="semiBold" upper>
                        #
                    </Text>
                }
                minWidth={130}
                maxWidth={200}
                columnKey="id"
            >
                {({ id }) => <Badge>{id}</Badge>}
            </Column>
            <Column<BonuseItem>
                label={
                    <Text weight="semiBold" upper>
                        Игрок
                    </Text>
                }
                minWidth={200}
                columnKey="winner"
            >
                {({ winner, avatar }) => (
                    <>
                        <div className={cnBonuseTable('WinnerAvatar')} style={{ backgroundImage: `url(${avatar})` }} />
                        <Text className={cnBonuseTable('WinnerName')} color="white" upper>
                            {winner}
                        </Text>
                    </>
                )}
            </Column>
            <Column<BonuseItem>
                label={
                    <Text weight="semiBold" upper>
                        Рефералов
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="points"
            >
                {({ referrals }) => (
                    <Text font="Rubik" color="white" upper>
                        {referrals}
                    </Text>
                )}
            </Column>

            <Column<BonuseItem>
                label={
                    <Text weight="semiBold" upper>
                        Отчисления
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="fund"
            >
                {({ percent }) => <TextIcon text={percent} icon="percentage" font="Rubik" color="white" upper />}
            </Column>
        </SafeTable>
    );
};

export default BonuseTable;
