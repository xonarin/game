import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutMobileGame.scss';
import { cn } from '../../../../utils/bem-css-module';
import Layout from '../../Layout';
import MiddleGame from '../../Web/MiddleGame/MiddleGame';
import Text from '../../../Text/Text';

export interface LayoutMobileProps {
    title: string;
    bottomContent: React.ReactNode;
    historyContent: React.ReactNode;
    Content: React.ReactNode;
}

const cnLayoutMobile = cn(s, 'LayoutMobile');

const LayoutMobile: React.FC<LayoutMobileProps> = ({ title, Content, bottomContent, historyContent }) => {
    const [selectedTab, setSelectedTab] = useState('game');
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutMobile('Container')}>
                <div className={cnLayoutMobile('Header')}>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTab('game');
                        }}
                        className={selectedTab === 'game' ? cnLayoutMobile('Selected-Tab') : ''}
                    >
                        <Text>Игра</Text>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTab('history');
                        }}
                        className={selectedTab === 'history' ? cnLayoutMobile('Selected-Tab') : ''}
                    >
                        <Text>История</Text>
                    </button>
                </div>
                {selectedTab === 'game' ? (
                    <>
                        <MiddleGame className={cnLayoutMobile('Game')} title={title}>
                            {Content}
                        </MiddleGame>
                        <div className={cnLayoutMobile('Bets')}>{bottomContent}</div>
                    </>
                ) : (
                    <div className={cnLayoutMobile('History')}>{historyContent}</div>
                )}
            </div>
        </Layout>
    );
};

export default LayoutMobile;
