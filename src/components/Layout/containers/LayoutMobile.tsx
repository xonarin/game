import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutMobile.scss';
import { cn } from '../../../utils/bem-css-module';
import Layout from '../Layout';
import Link from '../../Link/Link';
import MiddleGame from '../MiddleGame/MiddleGame';
import Text from '../../Text/Text';

export interface LayoutMobileProps {
    title: string;

    Content: React.ReactNode;
}

const cnLayoutMobile = cn(s, 'LayoutMobile');

const LayoutMobile: React.FC<LayoutMobileProps> = ({ title, Content }) => {
    useStyles(s);

    return (
        <Layout>
            <div className={cnLayoutMobile('Container')}>
                <div className={cnLayoutMobile('Header')}>
                    <Link to="/">
                        <Text size="s">Игра</Text>
                    </Link>
                    <Link to="/">
                        <Text>Предстоящие игры</Text>
                    </Link>
                    <Link to="/">
                        <Text>История</Text>
                    </Link>
                </div>
                <MiddleGame className={cnLayoutMobile('Game')} title={title}>
                    {Content}
                </MiddleGame>
            </div>
        </Layout>
    );
};

export default LayoutMobile;
