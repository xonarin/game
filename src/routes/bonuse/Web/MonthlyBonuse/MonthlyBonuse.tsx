import React, { useState } from 'react'
import Icon from '../../../../components/Icon/Icon';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Button from '../../../../components/Button/Button';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import PeopleCircles from '../../../welcome/Banner/PeopleCircles/PeopleCircles';
import ItemsCarousel from 'react-items-carousel';
import s from './MonthlyBonuse.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import useStyles from 'isomorphic-style-loader/useStyles';

const cnMonthlyBonuse = cn(s, 'MonthlyBonuse');

const MonthlyBonuse = () => {
    useStyles(s);
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const chevronWidth = 40;
    return (
        <div className={cnMonthlyBonuse('Content')}>
        <div className={cnMonthlyBonuse('Intro')}>
            <div className={cnMonthlyBonuse('Count')}>
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

            <Text size="l" color="white" className={cnMonthlyBonuse('Intro-Text')}>
                Каждый месяц мы разыгрываем 10.000 рублей среди игроков
            </Text>
            <Text color="white" className={cnMonthlyBonuse('Intro-Text')}>
                Успей принять участие!
            </Text>
            <Button size="m">Участвовать</Button>
            <div className={cnMonthlyBonuse('PeopleCircles')}>
                <PeopleCircles />
                <Text size="m" color="green">
                    +583K
                </Text>
            </div>
        </div>
        <div className={cnMonthlyBonuse('Slider')}>
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
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
                                text="1500"
                                icon="diamond"
                                color="white"
                                upper
                            />
                        </div>
                    </div>
                    <div className={cnMonthlyBonuse('SingleSlide')}>
                        <div className={cnMonthlyBonuse('WinnerAvatar')} />
                        <div className={cnMonthlyBonuse('WinnerInfo')}>
                            <Text className={cnMonthlyBonuse('WinnerName')} color="blue" upper>
                                Donald
                            </Text>
                            <TextIcon
                                className={cnMonthlyBonuse('Value')}
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
    )
}

export default MonthlyBonuse
