import React from 'react';
import { Element as ScrollElement } from 'react-scroll';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeGames.scss';
import { cn } from '../../../utils/bem-css-module';
import { useInView } from '../../../hooks/useInView';
import Title from '../../../components/Title/Title';
import Icon from '../../../components/Icon/Icon';
import Scroller from '../../../components/Scroller/Scroller';
import WelcomeGamesItem from './GamesItem/WelcomeGamesItem';

const cnWelcomeGames = cn(s, 'WelcomeGames');

const WelcomeGames: React.FC = () => {
    useStyles(s);

    const [games, inView] = useInView({ unobserveOnEnter: true });

    return (
        <section className={cnWelcomeGames({ inView })} ref={games}>
            <ScrollElement name="welcomeGames" />
            <div className={cnWelcomeGames('Head')}>
                <Title type="h2">
                    <span>Сыграйте</span> в наши лучшие игры
                </Title>
                <Icon className={cnWelcomeGames('Icon')} type="cardsCut" />
            </div>
            <Scroller className={cnWelcomeGames('List')}>
                <WelcomeGamesItem
                    title="Classic"
                    description="Сразись с другими игроками за главный приз и не дай себя обхитрить."
                    type="classic"
                />
                <WelcomeGamesItem
                    title="Mines"
                    description="Прислушайся к своему шестому чувству и сорви крупный куш."
                    type="mines"
                />
                <WelcomeGamesItem
                    title="Darts"
                    description="Набери как можно больше баллов, которые помогут приумножить твой выигрыш"
                    type="darts"
                />
                <WelcomeGamesItem
                    title="Knb"
                    description="Любимая всеми игра детства, теперь и на нашем сайте!"
                    type="knb"
                />
            </Scroller>
        </section>
    );
};

export default WelcomeGames;
