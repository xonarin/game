import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './HistoryTable.scss';
import { cn } from '../../../../utils/bem-css-module';
import { ClassicGamesHistoryItemFragment } from '../../../../__generated__/graphql';
import { addLeadingZeros } from '../../../../utils/strings';
import SafeTableSpring from '../../../../components/Table/containers/SafeTableSpring';
import Column from '../../../../components/Table/Column/Column';
import Text from '../../../../components/Text/Text';
import ChanceBadge from '../../../../components/Badge/containers/ChanceBadge';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import Icon from '../../../../components/Icon/Icon';
import useClassicGamesHistory from '../../../../hooks/graphql/classicGame/useClassicGamesHistoryQuery';

const transformDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${addLeadingZeros(date.getDate())}.${addLeadingZeros(
        date.getMonth() + 1,
    )}.${date.getFullYear()} ${addLeadingZeros(date.getHours())}:${addLeadingZeros(date.getMinutes())}`;
};

const cnHistoryTable = cn(s, 'HistoryTable');

const HistoryTable: React.FC = () => {
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
            <Column<ClassicGamesHistoryItemFragment>
                label={
                    <Text weight="semiBold" upper>
                        Время
                    </Text>
                }
                minWidth={120}
                maxWidth={180}
                columnKey="time"
            >
                {({ finishedAt }) => (
                    <Text color="white" upper>
                        {transformDate(finishedAt)}
                    </Text>
                )}
            </Column>
            <Column<ClassicGamesHistoryItemFragment>
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
