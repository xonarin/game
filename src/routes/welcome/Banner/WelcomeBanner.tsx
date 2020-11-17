import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeBanner.scss';
import { cn } from '../../../utils/bem-css-module';
import { useInView } from '../../../hooks/useInView';
import Title from '../../../components/Title/Title';
import Button from '../../../components/Button/Button';
import Text from '../../../components/Text/Text';
import PeopleCircles from './PeopleCircles/PeopleCircles';
import StatsItem from './StatsItem/StatsItem';
import TextBlock from '../../../components/TextBlock/TextBlock';

const cnWelcomeBanner = cn(s, 'WelcomeBanner');

const WelcomeBanner: React.FC = () => {
    useStyles(s);

    const [banner, inView] = useInView({ unobserveOnEnter: true });

    return (
        <section className={cnWelcomeBanner({ inView })} ref={banner}>
            <div className={cnWelcomeBanner('Container')}>
                <main className={cnWelcomeBanner('Main')}>
                    <div className={cnWelcomeBanner('Text')}>
                        <Title className={cnWelcomeBanner('Title')} color="white">
                            Играйте, соревнуйтесь и зарабатывайте!
                        </Title>
                        <TextBlock className={cnWelcomeBanner('TextBlock')}>
                            Выберите игру, кидайте кости, крутите барабан и выигрывайте реальные деньги каждый день
                        </TextBlock>
                    </div>
                    <div className={cnWelcomeBanner('MainBottom')}>
                        <Button className={cnWelcomeBanner('PlayButton')} shape="alphaRight">
                            Начать играть
                        </Button>
                        <div className={cnWelcomeBanner('MainBottomRight')}>
                            <Text size="m" color="white">
                                Уже играют:
                            </Text>
                            <PeopleCircles className={cnWelcomeBanner('PeopleCircles')} />
                            <Text size="m" color="green">
                                +583K
                            </Text>
                        </div>
                    </div>
                </main>
                <div className={cnWelcomeBanner('Stats')}>
                    <StatsItem
                        className={cnWelcomeBanner('StatsItem')}
                        label="Пользователей"
                        icon="user"
                        value="550 000"
                    />
                    <StatsItem
                        className={cnWelcomeBanner('StatsItem')}
                        label="Онлайн"
                        icon="lightning"
                        value="27 650"
                    />
                    <StatsItem className={cnWelcomeBanner('StatsItem')} label="Выплачено" icon="rub" value="962 275" />
                </div>
                <div className={cnWelcomeBanner('NotebookImage')} />
            </div>
        </section>
    );
};

export default WelcomeBanner;
