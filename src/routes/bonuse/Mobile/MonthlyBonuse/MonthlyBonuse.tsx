import React, { useState } from 'react'
import Icon from '../../../../components/Icon/Icon';
import TextInBox from '../../../../components/TextInBox/TextInBox';
import Button from '../../../../components/Button/Button';
import TextIcon from '../../../../components/TextIcon/TextIcon';
import PeopleCircles from '../../../welcome/Banner/PeopleCircles/PeopleCircles';
import s from './MonthlyBonuse.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text from '../../../../components/Text/Text';
import useStyles from 'isomorphic-style-loader/useStyles';

const cnMonthlyBonuse = cn(s, 'MonthlyBonuse');

const MonthlyBonuse = () => {
    useStyles(s);
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
                <div className={cnMonthlyBonuse('Description')}>
                    <Text line='xl' color="white" className={cnMonthlyBonuse('Intro-Text')}>
                        Каждый месяц мы разыгрываем 10.000 рублей среди игроков
            </Text>
                </div>

                <Text color="white" className={cnMonthlyBonuse('Intro-Text')}>
                    Успей принять участие!
            </Text>
                <Button size="m">Участвовать</Button>
                <div className={cnMonthlyBonuse('PeopleCircles')}>
                    <Text color='white'>участвуют:</Text>
                    <PeopleCircles />
                    <Text size="m" color="green">
                        +583K
                </Text>
                </div>
            </div>
            <div className={cnMonthlyBonuse('Slider')}>
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
                </div>
            </div>
        </div>
    )
}

export default MonthlyBonuse
