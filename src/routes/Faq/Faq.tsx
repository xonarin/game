import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Faq.scss';
import { cn } from '../../utils/bem-css-module';
import Layout33Content from '../../components/Layout/Web/containers/Layout33Content';
import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import FaqTheme from './FaqTheme';
import FaqMobile from './Mobile/Faq';

export interface FaqProps {
    title: string;
}

const themes = [
    {
        id: 1,
        title: 'ОБЩИЕ ПРАВИЛА И ВОПРОСЫ ПО ИГРЕ',
        questions: [
            {
                id: 1,
                title: 'Какие игры есть на проекте?',
                answer:
                    'Classic game - режим который ещё называют JACKPOT. Суть режима состоит в том, что игроки делают ставки и получают взамен билеты, затем с помощью рулетки определяется победный билет и победитель забирает весь банк игры.',
            },
            {
                id: 2,
                title: 'Как делать ставки?',
                answer:
                    ' Classic game - Нажмите на кнопку Сделать ставку, затем там подгрузятся вещи на ту сумму, которая у вас на балансе. Выберите вещи и нажмите Поставить.',
            },
        ],
    },
    {
        id: 2,
        title: 'КАК ОБРАТИТЬСЯ В ПОДДЕРЖКУ?',
        questions: [
            {
                id: 1,
                title: 'Куда писать?',
                answer: 'Для обращения в поддержку нажмите на ПОДДЕРЖКА в навигационном меню сайта слева.',
            },
            {
                id: 2,
                title: 'Как правильно обращаться?',
                answer:
                    'Первое, проявляйте вежливость! За угрозы, оскорбления в адрес поддержки, ваша заявка будет закрыта, а вы забанены навсегда. Во-вторых, указывайте полностью данные о вашей проблеме, а иначе ваша заявка будет проигнорирована или рассматриваться в несколько раз дольше.',
            },
        ],
    },
];
const cnFaq = cn(s, 'Faq');

const Faq: React.FC<FaqProps> = ({ title }) => {
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

    if (mobile) {
        return (
                <FaqMobile />
            
        );
    }
    return (
        <Layout33Content
        title="Помощь"
            centerContent={
                <div className={cnFaq('list')}>
                    <h4 className={cnFaq('title')}>Playtime.bet - ПОДРОБНЕЕ О ПРОЕКТЕ!</h4>
                    <p className={cnFaq('description')}>
                        Playtime.bet- Это проект, где каждый желающий может испытать свою удачу в различных комнатных
                        режимах и приумножить своё состояние.
                    </p>
                    {themes.map((theme, index) => {
                        return <FaqTheme theme={theme} key={theme.id} id={index + 1} />;
                    })}
                </div>
            }
        />
    );
};

export default Faq;
