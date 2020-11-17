import React from 'react';
import { Element as ScrollElement } from 'react-scroll';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeLiveFeed.scss';
import { cn } from '../../../utils/bem-css-module';
import { useInView } from '../../../hooks/useInView';
import Title from '../../../components/Title/Title';
import Icon from '../../../components/Icon/Icon';
import LiveFeedTable from './LiveFeedTable/LiveFeedTable';

const cnWelcomeLiveFeed = cn(s, 'WelcomeLiveFeed');

const items = [
    { id: 1, game: 'battle' as const, winner: 'Donald', chance: 36, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 2, game: 'dice' as const, winner: 'Donald', chance: 67, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 3, game: 'knb' as const, winner: 'Donald', chance: 10, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 4, game: 'dice' as const, winner: 'Donald', chance: 83, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 5, game: 'knb' as const, winner: 'Donald', chance: 67, fund: 2500, time: '25.10.2019 в 21:46' },
    { id: 6, game: 'battle' as const, winner: 'Donald', chance: 36, fund: 2500, time: '25.10.2019 в 21:46' },
];

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
                <LiveFeedTable items={items} />
            </div>
        </section>
    );
};

export default WelcomeLiveFeed;
