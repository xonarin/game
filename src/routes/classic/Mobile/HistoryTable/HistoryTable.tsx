import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HistoryTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ClassicGamesHistoryItemFragment } from '../../../../__generated__/graphql';
import SafeTableSpring from '../../../../components/Table/containers/SafeTableSpring';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import ChanceBadge from '../../../../components/Badge/containers/ChanceBadge';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import useClassicGamesHistory from '../../../../hooks/graphql/classicGame/useClassicGamesHistoryQuery';

const cnHistoryTable = cn(s, 'HistoryTable');

const HistoryTableMobile: React.FC = () => {
    useStyles(s);

    const { classicGamesHistory } = useClassicGamesHistory();

    if (!classicGamesHistory) {
        return <div>Loading...</div>;
    }

    return (
        <SafeTableSpring<ClassicGamesHistoryItemFragment, 'id'>
            className={cnHistoryTable()}
            rowKey="id"
            items={classicGamesHistory.slice(0, 10)}
            responsivity
        >
            <Column<ClassicGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Победитель
                    </Text>
                }
                minWidth={200}
                columnKey="winner"
            >
                {({ winnerUsername, winnerAvatar, winnerBetsPrice }) => (
                    <>
                        <img className={cnHistoryTable('WinnerAvatar')} src={winnerAvatar} alt={winnerUsername} />
                        <div className={cnHistoryTable('WinnerInfo')}>
                            <Text className={cnHistoryTable('WinnerName')}>{winnerUsername}</Text>
                            <TextIcon
                                className={cnHistoryTable('BetsAmount')}
                                text={winnerBetsPrice}
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </>
                )}
            </Column>
            <Column<ClassicGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Шанс
                    </Text>
                }
                minWidth={100}
                maxWidth={200}
                columnKey="chance"
            >
                {({ winnerChance }) => <ChanceBadge chance={winnerChance} />}
            </Column>
            <Column<ClassicGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Выигрыш
                    </Text>
                }
                minWidth={110}
                maxWidth={200}
                columnKey="fund"
            >
                {({ fund }) => <TextIcon text={fund} icon="diamond" color="white" upper />}
            </Column>
        </SafeTableSpring>
    );
};

export default HistoryTableMobile;
