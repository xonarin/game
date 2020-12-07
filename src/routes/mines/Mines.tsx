import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Mines.scss';
import { cn } from '../../utils/bem-css-module';
import { MinesGameStatus } from '../../__generated__/graphql';
import useActiveMinesGameQuery from '../../hooks/graphql/minesGame/useActiveMinesGameQuery';
import useMinesGameConfigurationQuery from '../../hooks/graphql/minesGame/useMinesGameConfigurationQuery';
import Layout31WithChat from '../../components/Layout/containers/Layout31WithChat';
import Panel from '../../components/Panel/Panel';
import LiveFeedTable from '../../routes/welcome/WelcomeLiveFeed/LiveFeedTable/LiveFeedTable';
import Text from '../../components/Text/Text';
import Icon from '../../components/Icon/Icon';
import MinesGame from './MinesGame/MinesGame';
import MinesBetForm, { BOMBS_COUNT_BREAKPOINTS } from '../../components/forms/MinesBetForm/MinesBetForm';
import PreLoader from '../../components/PreLoader/PreLoader';
export interface MinesProps {
    chatId: string;
}

const cnMines = cn(s, 'Mines');

const items = [
    { id: 1, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 2, game: 'dice' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 3, game: 'knb' as const, winner: 'Donald', chance: 10, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 4, game: 'dice' as const, winner: 'Donald', chance: 83, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 5, game: 'knb' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 6, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
];

const Mines: React.FC<MinesProps> = ({ chatId }) => {
    useStyles(s);

    const { loading: gameLoading, activeMinesGame } = useActiveMinesGameQuery();
    const { loading: configurationLoading, minesGameConfiguration } = useMinesGameConfigurationQuery();

    const [isDirty, setDirty] = useState(false);
    const [formBombsCount, setFormBombsCount] = useState(
        activeMinesGame?.bombsCount || minesGameConfiguration?.minBombsCount || BOMBS_COUNT_BREAKPOINTS[0],
    );

    useEffect(() => {
        setDirty(true);
    }, [formBombsCount]);
    useEffect(() => {
        setDirty(false);
    }, [activeMinesGame]);

    if (gameLoading || configurationLoading || !minesGameConfiguration) {
        return  <PreLoader/>
    }

    const { fieldSize, minBombsCount, coefs } = minesGameConfiguration;
    const actuallyActiveMinesGame =
        !isDirty || !activeMinesGame || activeMinesGame.status !== MinesGameStatus.Ended ? activeMinesGame : null;

    return (
        <Layout31WithChat
            chatId={chatId}
            title="Mines"
            leftContent={
                <Panel
                    className={cnMines('BetFormPanel')}
                    leftHead={
                        <Text className={cnMines('BetFormTitle')} font="Rubik" size="l" color="white" upper>
                            Ставка
                        </Text>
                    }
                    rightHead={<Icon type="guard" />}
                >
                    <MinesBetForm
                        fieldSize={fieldSize}
                        minBombsCount={minBombsCount}
                        coefs={coefs}
                        activeMinesGame={actuallyActiveMinesGame}
                        onChangeBombsCount={setFormBombsCount}
                    />
                </Panel>
            }
            rightContent={
                <MinesGame
                    fieldSize={fieldSize}
                    minBombsCount={minBombsCount}
                    coefs={coefs}
                    formBombsCount={formBombsCount}
                    activeMinesGame={actuallyActiveMinesGame}
                />
            }
            bottomContent={
                <Panel
                    leftHead={
                        <Text className={cnMines('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                            Последние игры
                        </Text>
                    }
                >
                    <LiveFeedTable items={items} />
                </Panel>
            }
        />
    );
};

export default Mines;
