import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Mines.scss';
import { cn } from '../../utils/bem-css-module';
import { MinesGameStatus } from '../../__generated__/graphql';
import useActiveMinesGameQuery from '../../hooks/graphql/minesGame/useActiveMinesGameQuery';
import useMinesGameConfigurationQuery from '../../hooks/graphql/minesGame/useMinesGameConfigurationQuery';
import Layout31WithChat from '../../components/Layout/Web/containers/Layout31WithChat';
import Panel from '../../components/Panel/Panel';
import LiveFeedTableMobile from '../../components/LiveFeedTable/Mobile/LiveFeedTable';
import Text from '../../components/Text/Text';
import Icon from '../../components/Icon/Icon';
import MinesGame from './Web/MinesGame';
import MinesBetForm, { BOMBS_COUNT_BREAKPOINTS } from '../../components/forms/Web/MinesBetForm/MinesBetForm';
import PreLoader from '../../components/PreLoader/PreLoader';
import PopUp from '../../components/PopUp';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import LiveFeedTable from '../../components/LiveFeedTable/Web/LiveFeedTable';
import LayoutMobile from '../../components/Layout/Mobile/containers/LayoutMobileGamenoTabs';
import MinesGameMobile from './Mobile/MinesGame';
import MinesBetFormMobile from '../../components/forms/Mobile/MinesBetForm/MinesBetForm';

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

    const [mobile, setMobile] = useState(false);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 900
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    useEffect(() => {
        setDirty(true);
    }, [formBombsCount]);
    useEffect(() => {
        setDirty(false);
    }, [activeMinesGame]);
    const [popup, setPopup] = useState(false);
    const popUpClose = () => {
        setPopup(false);
    };
    if (gameLoading || configurationLoading || !minesGameConfiguration) {
        return <PreLoader />;
    }

    const { fieldSize, minBombsCount, coefs } = minesGameConfiguration;
    const actuallyActiveMinesGame =
        !isDirty || !activeMinesGame || activeMinesGame.status !== MinesGameStatus.Ended ? activeMinesGame : null;

    if (mobile) {
        return (
            <LayoutMobile
                title="Mines"
                Content={
                    popup ? (
                        <PopUp close={popUpClose} type="firePlay" mobile />
                    ) : (
                        <MinesGameMobile
                            fieldSize={fieldSize}
                            minBombsCount={minBombsCount}
                            coefs={coefs}
                            formBombsCount={formBombsCount}
                            activeMinesGame={actuallyActiveMinesGame}
                        />
                    )
                }
                bottomContent={
                    popup ? null : (
                        <Panel
                            className={cnMines('BetFormPanel')}
                            leftHead={
                                <Text className={cnMines('BetFormTitle')} font="Rubik" size="l" color="white" upper>
                                    Ставка
                                </Text>
                            }
                            rightHead={
                                <button
                                    type="button"
                                    className={cnMines('GuardButtton')}
                                    onClick={() => setPopup(true)}
                                >
                                <>
                                    {/* <Icon type="guard" /> */}
                                </>
                                </button>
                            }
                        >
                            <MinesBetFormMobile
                                fieldSize={fieldSize}
                                minBombsCount={minBombsCount}
                                coefs={coefs}
                                activeMinesGame={actuallyActiveMinesGame}
                                onChangeBombsCount={setFormBombsCount}
                            />
                        </Panel>
                    )
                }
                historyContent={
                    popup ? null : (
                        <Panel
                            leftHead={
                                <Text className={cnMines('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                                    Последние игры
                                </Text>
                            }
                        >
                            <LiveFeedTableMobile />
                        </Panel>
                    )
                }
            />
        );
    }
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
                    rightHead={
                        <button type="button" className={cnMines('GuardButtton')} onClick={() => setPopup(true)}>
                           {/* <Icon type="guard" /> */}
                        </button>
                    }
                >
                    <MinesBetForm
                        fieldSize={fieldSize}
                        minBombsCount={minBombsCount}
                        coefs={coefs}
                        activeMinesGame={actuallyActiveMinesGame}
                        onChangeBombsCount={setFormBombsCount}
                    />
                    {popup ? <PopUp close={popUpClose} type="firePlay" /> : null}
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
                    <LiveFeedTable />
                </Panel>
            }
        />
    );
};

export default Mines;
