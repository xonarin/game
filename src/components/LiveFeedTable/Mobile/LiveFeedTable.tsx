import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LiveFeedTable.scss';
import { cn } from '../../../utils/bem-css-module';
import Column from '../../Table/Column/Column';
import SafeTable from '../../Table/containers/SafeTable';
import Text from '../../Text/Text';
import Icon, { IconProps } from '../../Icon/Icon';
import ChanceBadge from '../../Badge/containers/ChanceBadge';
import TextIcon from '../../TextIcon/TextIcon';
import useGamesQuery from '../../../hooks/graphql/liveData/useGamesQuery';

type LiveFeedItemGame = string;

interface LiveFeedItem {
    id: string;
    game: LiveFeedItemGame;
    winner: string;
    avatar: string;
    bet: number;
    chance: number;
    fund: number;
    time: string;
}

const cnLiveFeedTable = cn(s, 'LiveFeedTable');

const getIcon = (game: LiveFeedItemGame): IconProps['type'] => {
    if (game === 'classic') return 'sword';
    if (game === 'mines') return 'bomb';
    if (game === 'knb') return 'scissors';

    return 'automat';
};

const LiveFeedTable: React.FC = () => {
    useStyles(s);

    const { games } = useGamesQuery();

    if (games === undefined) {
        return null;
    }

    if (typeof window !== 'undefined' && window.screen.width < 600) {
        return (
            <SafeTable<LiveFeedItem, 'id'> className={cnLiveFeedTable()} rowKey="id" items={games} responsivity>
                <Column<LiveFeedItem>
                    label={
                        <Text weight="semiBold" upper>
                            Игра
                        </Text>
                    }
                    minWidth={130}
                    maxWidth={200}
                    columnKey="game"
                >
                    {({ game }) => (
                        <>
                            <Icon className={cnLiveFeedTable('GameIcon')} type={getIcon(game)} />
                            <Text className={cnLiveFeedTable('GameName')} font="Rubik" color="white" upper>
                                {game}
                            </Text>
                        </>
                    )}
                </Column>
                <Column<LiveFeedItem>
                    label={
                        <Text weight="semiBold" upper>
                            Победитель
                        </Text>
                    }
                    minWidth={200}
                    columnKey="winner"
                >
                    {({ winner, avatar }) => (
                        <>
                            <div
                                className={cnLiveFeedTable('WinnerAvatar')}
                                style={{ backgroundImage: `url(${avatar}})` }}
                            />
                            <Text className={cnLiveFeedTable('WinnerName')} color="white" upper>
                                {winner}
                            </Text>
                        </>
                    )}
                </Column>

                <Column<LiveFeedItem>
                    label={
                        <Text weight="semiBold" upper>
                            Выигрыш
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
    }

    return (
        <SafeTable<LiveFeedItem, 'id'> className={cnLiveFeedTable()} rowKey="id" items={games}>
            <Column<LiveFeedItem>
                label={
                    <Text weight="semiBold" upper>
                        Игра
                    </Text>
                }
                minWidth={130}
                maxWidth={200}
                columnKey="game"
            >
                {({ game }) => (
                    <>
                        <Icon className={cnLiveFeedTable('GameIcon')} type={getIcon(game)} />
                        <Text className={cnLiveFeedTable('GameName')} font="Rubik" color="white" upper>
                            {game}
                        </Text>
                        <Icon className={cnLiveFeedTable('FairIcon')} type="guard" />
                    </>
                )}
            </Column>
            <Column<LiveFeedItem>
                label={
                    <Text weight="semiBold" upper>
                        Победитель
                    </Text>
                }
                minWidth={200}
                columnKey="winner"
            >
                {({ winner }) => (
                    <>
                        <div className={cnLiveFeedTable('WinnerAvatar')} />
                        <Text className={cnLiveFeedTable('WinnerName')} color="white" upper>
                            {winner}
                        </Text>
                    </>
                )}
            </Column>

            <Column<LiveFeedItem>
                label={
                    <Text weight="semiBold" upper>
                        КОЭФФ
                    </Text>
                }
                minWidth={100}
                maxWidth={200}
                columnKey="chance"
            >
                {({ chance }) => <ChanceBadge chance={chance} />}
            </Column>
            <Column<LiveFeedItem>
                label={
                    <Text weight="semiBold" upper>
                        Выигрыш
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

export default LiveFeedTable;
