import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BonuseTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import SafeTable from '../../../../components/Table/containers/SafeTable';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import TextIcon from '../../../../components/TextIcon/TextIcon';

interface BonuseItem {
    id: number;
    avatar: string;
    winner: string;
    point: number;
    fund: number;
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
                        Игрок
                    </Text>
                }
                minWidth={200}
                columnKey="winner"
            >
                {({ winner, id, avatar }) => (
                    <>
                        <div className={cnBonuseTable('WinnerId')}>
                            <div className={cnBonuseTable('IdContainer')}>
                                <Text color="white" size="xs">
                                    {id}
                                </Text>
                            </div>
                        </div>
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
                        Очки
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="points"
            >
                {({ point }) => (
                    <Text font="Rubik" color="white" upper>
                        {point}
                    </Text>
                )}
            </Column>

            <Column<BonuseItem>
                label={
                    <Text weight="semiBold" upper>
                        Приз
                    </Text>
                }
                minWidth={110}
                maxWidth={180}
                columnKey="fund"
            >
                {({ fund }) => <TextIcon text={fund} icon="diamond" font="Rubik" color="white" upper />}
            </Column>
        </SafeTable>
    );
};

export default BonuseTable;
