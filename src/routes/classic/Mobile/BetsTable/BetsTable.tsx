import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './BetsTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import {
    ClassicGameBetFragment,
    ClassicGameFragment,
    ClassicGamePlayerFragment,
} from '../../../../__generated__/graphql';
import useDeepMemo from '../../../../hooks/useDeepMemo';
import SafeTableSpring from '../../../../components/Table/containers/SafeTableSpring';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import ChanceBadge from '../../../../components/Badge/containers/ChanceBadge';

export interface BetsTableItem extends ClassicGameBetFragment {
    player: ClassicGamePlayerFragment;
}

export interface BetsTableProps {
    players: ClassicGameFragment['players'];
    bets: ClassicGameFragment['bets'];
}

const cnBetsTable = cn(s, 'BetsTable');

const BetsTable: React.FC<BetsTableProps> = ({ players, bets }) => {
    useStyles(s);

    const items = useDeepMemo(() => {
        const playersMap = players.reduce(
            (acc, player) => acc.set(player.id, player),
            new Map<string, ClassicGamePlayerFragment>(),
        );

        return bets.map(bet => {
            const player = playersMap.get(bet.userId);

            if (!player) {
                throw new Error('BetsTable: Player is not found in players map');
            }

            return {
                ...bet,
                player,
            };
        });
    }, [players, bets]);

    return (
        <SafeTableSpring<BetsTableItem, 'id'> className={cnBetsTable()} rowKey="id" items={items}>
            <Column<BetsTableItem>
                label={
                    <Text weight="semiBold" upper>
                        Игрок
                    </Text>
                }
                minWidth={100}
                columnKey="user"
            >
                {({ player }) => (
                    <>
                        <img className={cnBetsTable('UserAvatar')} src={player.avatar} alt={player.username} />
                        <Text className={cnBetsTable('UserName')} color="white" upper>
                            {player.username}
                        </Text>
                    </>
                )}
            </Column>
            <Column<BetsTableItem>
                label={
                    <Text weight="semiBold" upper>
                        Сумма
                    </Text>
                }
                minWidth={55}
                maxWidth={90}
                columnKey="amount"
            >
                {({ amount }) => <TextIcon text={amount} icon="diamond" color="white" upper />}
            </Column>
            <Column<BetsTableItem>
                label={
                    <Text weight="semiBold" upper>
                        Шанс
                    </Text>
                }
                minWidth={85}
                maxWidth={100}
                columnKey="chance"
            >
                {({ player }) => <ChanceBadge chance={player.chance} forceColor={player.color} />}
            </Column>
        </SafeTableSpring>
    );
};

export default BetsTable;
