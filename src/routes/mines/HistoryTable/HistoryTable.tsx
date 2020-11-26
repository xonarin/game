import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HistoryTable.scss';
import { cn } from '../../../utils/bem-css-module';
import { MinesGamesHistoryItemFragment } from '../../../__generated__/graphql';
import { addLeadingZeros } from '../../../utils/strings';
import SafeTableSpring from '../../../components/Table/containers/SafeTableSpring';
import Column from '../../../components/Table/Column/Column';
import Text from '../../../components/Text/Text';
import ChanceBadge from '../../../components/Badge/containers/ChanceBadge';
import TextIcon from '../../../components/TextIcon/TextIcon';
import Icon from '../../../components/Icon/Icon';
import useMinesGameHistoryQuery from '../../../hooks/graphql/minesGame/useMinesGamesHistory';

const transformDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${addLeadingZeros(date.getDay())}.${addLeadingZeros(
        date.getMonth(),
    )}.${date.getFullYear()} ${addLeadingZeros(date.getHours())}:${addLeadingZeros(date.getMinutes())}`;
};

const cnHistoryTable = cn(s, 'HistoryTable');

const HistoryTable: React.FC = () => {
    useStyles(s);

    const { loading: historyLoading, minesGameHistory } = useMinesGameHistoryQuery();

    if (historyLoading || !minesGameHistory) {
        return <div>Loading...</div>;
    }

    return (
        <SafeTableSpring<MinesGamesHistoryItemFragment, 'id'>
            className={cnHistoryTable()}
            rowKey="id"
            items={minesGameHistory.slice(0, 10)}
        >
            <Column<MinesGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Победитель
                    </Text>
                }
                minWidth={200}
                columnKey="winner"
            >
                {({ betAmount }) => (
                    <>
                        <div className={cnHistoryTable('WinnerInfo')}>
                            <Text className={cnHistoryTable('WinnerName')}>{betAmount}</Text>
                        </div>
                    </>
                )}
            </Column>
            <Column<MinesGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        КЭФ
                    </Text>
                }
                minWidth={100}
                maxWidth={200}
                columnKey="chance"
            >
                {({ betAmount, winAmount }) => <ChanceBadge chance={(winAmount / betAmount).toFixed(2)} />}
            </Column>
            <Column<MinesGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Выигрыш
                    </Text>
                }
                minWidth={110}
                maxWidth={200}
                columnKey="fund"
            >
                {({ winAmount }) => <TextIcon text={winAmount} icon="diamond" color="white" upper />}
            </Column>
            <Column<MinesGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Время
                    </Text>
                }
                minWidth={120}
                maxWidth={180}
                columnKey="time"
            >
                {({ createdAt }) => (
                    <Text color="white" upper>
                        {transformDate(createdAt)}
                    </Text>
                )}
            </Column>
            <Column<MinesGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Номер игры
                    </Text>
                }
                minWidth={95}
                maxWidth={110}
                columnKey="gameId"
            >
                {({ id }) => (
                    <>
                        <Text font="Rubik" color="white" upper>
                            {id}
                        </Text>
                        <Icon className={cnHistoryTable('FairButton')} type="guard" />
                    </>
                )}
            </Column>
        </SafeTableSpring>
    );
};

export default HistoryTable;
