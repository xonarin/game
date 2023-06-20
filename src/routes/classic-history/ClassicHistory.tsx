import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Classic.scss';
import { cn } from '../../utils/bem-css-module';
import useCurrentClassicGameQuery from '../../hooks/graphql/classicGame/useCurrentClassicGameQuery';
import Layout31WithChat from '../../components/Layout/Web/containers/Layout31WithChat';
import Panel from '../../components/Panel/Panel';
import Text from '../../components/Text/Text';
import Icon from '../../components/Icon/Icon';
import Link from '../../components/Link/Link';
import BetsTable from '../classic/Web/BetsTable/BetsTable';
import HistoryTable from '../classic/Web/HistoryTable/HistoryTable';
import ClassicGame from '../classic/Web/ClassicGame/ClassicGame';
import LayoutMobileGame from '../../components/Layout/Mobile/containers/LayoutMobileGame';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import PreLoader from '../../components/PreLoader/PreLoader';

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
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    useStyles(s);

    const { currentClassicGame } = useCurrentClassicGameQuery();

    if (!currentClassicGame) {
        return <PreLoader />;
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
                        rightHead={
                            <>
                             {/* <Icon type="guard" /> */}
                             </>
                        }
                    >
                        <BetsTable players={currentClassicGame.players} bets={currentClassicGame.bets} />
                    </Panel>
                }
                historyContent={<HistoryTableMobile />}
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
                    rightHead={
                        <>
                            <Link to={'#'}>
                                <Icon type={'guard'} size="m" />
                            </Link>

                            <Link to={'/classic-history'}>
                                <Icon type={'clock'} size="m" />
                            </Link>
                        </>
                    }
                >
                    <BetsTable players={currentClassicGame.players} bets={currentClassicGame.bets} />
                </Panel>
            }
            rightContent={
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
