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
import BonuseBanner from './BonuseBanner/BonuseBanner';

const cnBonuse = cn(s, 'Bonuse');
const Bonuse: React.FC = () => {
    const [activeItemIndex, setActiveItemIndex] = useState(0);
    const chevronWidth = 40;
    useStyles(s);
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
                            </TextInBox>{' '}
                            <TextInBox size="xxl" color="white">
                                <Icon type="diamond" size="m" />
                            </TextInBox>
                        </div>

                        <Text color="white" className={cnBonuse('Intro-Text')}>
                            Every day w play more than 1000 rubies between 100 participants
                        </Text>
                        <Text color="white" className={cnBonuse('Intro-Text')}>
                            Hurry up to take part!
                        </Text>
                        <Button size="m">Play Now</Button>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                                        <Text className={cnBonuse('WinnerName')} color="dark-blue" upper>
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
                <BonuseBanner
                    title="active player"
                    description={
                        <>
                            {' '}
                            Every week on Fri. <Text color="white"> 6:00p.m </Text> the 10 most active players who made
                            the most bets on the total win prizes
                        </>
                    }
                    count="5000"
                />
            }
            RightContent={
                <BonuseBanner
                    title="bonus partner"
                    description={
                        <>
                            {' '}
                            Every week on Fri. <Text color="white"> 6:00p.m </Text> the 10 most active players who made
                            the most bets on the total win prizes
                        </>
                    }
                    count="3000"
                />
            }
        />
    );
};

export default Bonuse;
