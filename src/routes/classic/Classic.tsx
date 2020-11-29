import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Classic.scss';
import { cn } from '../../utils/bem-css-module';
import useCurrentClassicGameQuery from '../../hooks/graphql/classicGame/useCurrentClassicGameQuery';
import Layout31WithChat from '../../components/Layout/containers/Layout31WithChat';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import Icon from '../../components/Icon/Icon';
import BetsTable from './BetsTable/BetsTable';
import HistoryTable from './HistoryTable/HistoryTable';
import ClassicGame from './ClassicGame/ClassicGame';
import LayoutMobile from '../../components/Layout/containers/LayoutMobile';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';

export interface ClassicProps {
    chatId: string;
}

const cnClassic = cn(s, 'Classic');

const Classic: React.FC<ClassicProps> = ({ chatId }) => {
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
    useStyles(s);

    const { loading: gameLoading, currentClassicGame } = useCurrentClassicGameQuery();

    if (gameLoading || !currentClassicGame) {
        return <div>Loading...</div>;
    }
    if (mobile) {
        return (
            <LayoutMobile
                title="Classic"
                Content={<ClassicGame game={currentClassicGame} />}
                bottomContent={
                    <Panel
                        className={cnClassic('BetsPanel')}
                        leftHead={
                            <Text className={cnClassic('BetsTitle')} font="Rubik" size="l" color="white" upper>
                                Ставки
                            </Text>
                        }
                        rightHead={<Icon type="guard" />}
                    >
                        <BetsTable players={currentClassicGame.players} bets={currentClassicGame.bets} />
                    </Panel>
                }
                historyContent={
                    <Panel
                        leftHead={
                            <Text className={cnClassic('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                                Последние игры
                            </Text>
                        }
                    >
                        <HistoryTable />
                    </Panel>
                }
            />
        );
    }
    return (
        <Layout31WithChat
            chatId={chatId}
            title="Classic"
            leftContent={
                <Panel
                    className={cnClassic('BetsPanel')}
                    leftHead={
                        <Text className={cnClassic('BetsTitle')} font="Rubik" size="l" color="white" upper>
                            Ставки
                        </Text>
                    }
                    rightHead={<Icon type="guard" />}
                >
                    <BetsTable players={currentClassicGame.players} bets={currentClassicGame.bets} />
                </Panel>
            }
            rightContent={<ClassicGame game={currentClassicGame} />}
            bottomContent={
                <Panel
                    leftHead={
                        <Text className={cnClassic('HistoryTitle')} font="Rubik" size="l" color="white" upper>
                            Последние игры
                        </Text>
                    }
                >
                    <HistoryTable />
                </Panel>
            }
        />
    );
};

export default Classic;
