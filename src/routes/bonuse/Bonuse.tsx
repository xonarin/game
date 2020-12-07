import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import ItemsCarousel from 'react-items-carousel';

import s from './Bonuse.scss';
import { cn } from '../../utils/bem-css-module';
import LayoutBonuse from '../../components/Layout/containers/LayoutBonuse';
import Text from '../../components/Text/Text';
import Icon from '../../components/Icon/Icon';
import TextInBox from '../../components/TextInBox/TextInBox';
import Button from '../../components/Button/Button';
import TextIcon from '../../components/TextIcon/TextIcon';
import PeopleCircles from '../welcome/Banner/PeopleCircles/PeopleCircles';
import BonuseBannerPlayer from './BonuseBanner/BonuseBannerPlayer';
import BonuseBannerReferal from './BonuseBanner/BonuseBannerReferal';

const cnBonuse = cn(s, 'Bonuse');
const Bonuse: React.FC = () => {
    useStyles(s);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const chevronWidth = 40;
    return (
        <LayoutBonuse
            title="Bonuse"
            TopContent={
                <div className={cnBonuse('Content')}>
                    <div className={cnBonuse('Intro')}>
                        <div className={cnBonuse('Count')}>
                            <TextInBox size="xxl" color="white">
                                1
                            </TextInBox>
                            <TextInBox size="xxl" color="white">
                                0
                            </TextInBox>{' '}
                            <TextInBox size="xxl" color="white">
                                0
                            </TextInBox>{' '}
                            <TextInBox size="xxl" color="white">
                                0
                            </TextInBox>
                            <TextInBox size="xxl" color="white">
                                0
                            </TextInBox>
                            <TextInBox size="xxl" color="white">
                                <Icon type="diamond" size="m" />
                            </TextInBox>
                        </div>

                        <Text size="l" color="white" className={cnBonuse('Intro-Text')}>
                            Каждый месяц мы разыгрываем 10.000 рублей среди игроков
                        </Text>
                        <Text color="white" className={cnBonuse('Intro-Text')}>
                            Успей принять участие!
                        </Text>
                        <Button size="m">Участвовать</Button>
                        <div className={cnBonuse('PeopleCircles')}>
                            <PeopleCircles />
                            <Text size="m" color="green">
                                +583K
                            </Text>
                        </div>
                    </div>
                    <div className={cnBonuse('Slider')}>
                        <div style={{ padding: `0 ${chevronWidth}px`, width: '100%' }}>
                            <ItemsCarousel
                                requestToChangeActive={setActiveItemIndex}
                                activeItemIndex={activeItemIndex}
                                numberOfCards={6}
                                gutter={10}
                                leftChevron={<Icon type="left" />}
                                rightChevron={<Icon type="right" />}
                                outsideChevron
                                chevronWidth={chevronWidth}
                            >
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                                <div className={cnBonuse('SingleSlide')}>
                                    <div className={cnBonuse('WinnerAvatar')} />
                                    <div className={cnBonuse('WinnerInfo')}>
                                        <Text className={cnBonuse('WinnerName')} color="blue" upper>
                                            Donald
                                        </Text>
                                        <TextIcon
                                            className={cnBonuse('Value')}
                                            text="1500"
                                            icon="diamond"
                                            color="white"
                                            upper
                                        />
                                    </div>
                                </div>
                            </ItemsCarousel>
                        </div>
                    </div>
                </div>
            }
            LeftContent={
                <BonuseBannerPlayer
                    title="Активный игрок"
                    description={
                        <>
                            {' '}
                            Каждые <Text color="white"> 3 дня </Text>  мы разыгрываем призы среди <Text color="white"> 3 </Text> самых активных игроков,
                            которые сделали больше всех ставок по сумме.
                        </>
                    }
                    count="5000"
                />
            }
            RightContent={
                <BonuseBannerReferal
                    title="Бонус-партнёр"
                    description={
                        <>
                            {' '}
                            Приглашай людей на сайт и каждые <Text color="white"> 30 дней </Text> и лучшие партнёры по количеству рефералов получат повышенные % отчисления! 
                        </>
                    }
                    count="3000"
                />
            }
        />
    );
};

export default Bonuse;
