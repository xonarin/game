import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Mines.scss';
import { cn } from '../../utils/bem-css-module';
import { MinesGameStatus } from '../../__generated__/graphql';
import useActiveMinesGameQuery from '../../hooks/graphql/minesGame/useActiveMinesGameQuery';
import useMinesGameConfigurationQuery from '../../hooks/graphql/minesGame/useMinesGameConfigurationQuery';
import Layout31WithChat from '../../components/Layout/containers/Layout31WithChat';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import MinesGame from './MinesGame/MinesGame';
import MinesBetForm, { BOMBS_COUNT_BREAKPOINTS } from '../../components/forms/MinesBetForm/MinesBetForm';
import HistoryTable from './HistoryTable/HistoryTable';

export interface MinesProps {
    chatId: string;
}

const cnMines = cn(s, 'Mines');

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
        return <div>Loading...</div>;
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
            bottomContent={<HistoryTable />}
        />
    );
};

export default Mines;
