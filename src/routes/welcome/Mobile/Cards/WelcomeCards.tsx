import React from 'react';
import { Element as ScrollElement } from 'react-scroll';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeCards.scss';
import { cn } from '../../../utils/bem-css-module';
import { useInView } from '../../../hooks/useInView';
import Title from '../../../components/Title/Title';
import Icon from '../../../components/Icon/Icon';
import WelcomeCard from './WelcomeCard/WelcomeCard';

const cnWelcomeCards = cn(s, 'WelcomeCards');

const WelcomeCards: React.FC = () => {
    useStyles(s);

    const [cards, inView] = useInView({ unobserveOnEnter: true, threshold: 0.3 });

    return (
        <section className={cnWelcomeCards({ inView })} ref={cards}>
            <ScrollElement name="welcomeCards" />
            <div className={cnWelcomeCards('Container')}>
                <div className={cnWelcomeCards('Head')}>
                    <Title type="h2">
                        <span>Зарабатывайте</span> на бонусах без вложений
                    </Title>
                    <Icon className={cnWelcomeCards('Icon')} type="ingotsCut" />
                </div>
                <div className={cnWelcomeCards('Items')}>
                    <WelcomeCard title="День рубинов" buttonText="Начать играть">
                        Каждый день мы&nbsp;разыгрываем более <b>1000 рубинов</b> между <b>100 участниками</b>
                    </WelcomeCard>
                    <WelcomeCard title="Активный игрок" buttonText="Начать играть">
                        Каждую неделю <b>награждаем активных игроков</b> которые сделали больше всех ставок
                    </WelcomeCard>
                    <WelcomeCard title="Бонус-партнер" buttonText="Начать играть">
                        Учавствуйте в&nbsp;нашей программе и&nbsp;зарабатывайте <b>до&nbsp;20% от&nbsp;выигрышей</b>{' '}
                        реферала!
                    </WelcomeCard>
                    <WelcomeCard title="Выигрыш плюс" buttonText="Начать играть">
                        Каждый день мы разыгрываем более <b>1000 рубинов</b> между <b>100 участниками</b>
                    </WelcomeCard>
                </div>
            </div>
        </section>
    );
};

export default WelcomeCards;
