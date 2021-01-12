import React from 'react';
import { Element as ScrollElement } from 'react-scroll';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeLiveFeed.scss';
import { cn } from '../../../../utils/bem-css-module';
import { useInView } from '../../../../hooks/useInView';
import Title from '../../../../components/Title/Title';
import Icon from '../../../../components/Icon/Icon';
import LiveFeedTable from '../../../../components/LiveFeedTable/Mobile/LiveFeedTable';

const cnWelcomeLiveFeed = cn(s, 'WelcomeLiveFeed');

const WelcomeLiveFeed: React.FC = () => {
    useStyles(s);

    const [liveFeed, inView] = useInView({ unobserveOnEnter: true, threshold: 0.7 });

    return (
        <section className={cnWelcomeLiveFeed({ inView })} ref={liveFeed}>
            <ScrollElement name="welcomeLiveFeed" />
            <div className={cnWelcomeLiveFeed('Head')}>
                <Title type="h2">
                    <span>Прямо сейчас</span> играют
                </Title>
                <Icon className={cnWelcomeLiveFeed('Icon')} type="playRedCut" />
            </div>
            <div className={cnWelcomeLiveFeed('TableContainer')}>
                <LiveFeedTable />
            </div>
        </section>
    );
};

export default WelcomeLiveFeed;
