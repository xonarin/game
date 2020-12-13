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
import LayoutMobileGame from '../../components/Layout/containers/LayoutMobileGame';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import PreLoader from '../../components/PreLoader/PreLoader';
import LiveFeedTableMobile from '../../components/LiveFeedTable/Mobile/LiveFeedTable';
import LiveFeedTable from '../../components/LiveFeedTable/Web/LiveFeedTable';

export interface ClassicProps {
    chatId: string;
}

const items = [
    { id: 1, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 2, game: 'dice' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 3, game: 'knb' as const, winner: 'Donald', chance: 10, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 4, game: 'dice' as const, winner: 'Donald', chance: 83, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 5, game: 'knb' as const, winner: 'Donald', chance: 67, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 6, game: 'battle' as const, winner: 'Donald', chance: 36, bet: 10, fund: 2500, time: '25.10.2019 в 21:46' },
];

const cnClassic = cn(s, 'Classic');

const Classic: React.FC<ClassicProps> = ({ chatId }) => {
    const [mobile, setMobile] = useState(false);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    useStyles(s);

    const { loading: gameLoading, currentClassicGame } = useCurrentClassicGameQuery();

    if (gameLoading || !currentClassicGame) {
        return  <PreLoader/>
    }
    if (mobile) {
        return (
            <LayoutMobileGame
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
                   
                            <LiveFeedTableMobile items={items}/>
                     
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
               
                       <LiveFeedTable items={items}/>
                 
            }
        />
    );
};

export default Classic;
