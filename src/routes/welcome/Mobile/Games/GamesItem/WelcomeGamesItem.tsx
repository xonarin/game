import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeGamesItem.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text, { TextProps } from '../../../../../components/Text/Text';
import TextBlock from '../../../../../components/TextBlock/TextBlock';

type WelcomeGamesItemType = 'classic' | 'mines' | 'darts' | 'knb';

export interface WelcomeGamesItemProps {
    title: TextProps['children'];
    description: TextProps['children'];
    type: WelcomeGamesItemType;

    className?: string;
}

const cnWelcomeGamesItem = cn(s, 'WelcomeGamesItem');

const WelcomeGamesItem: React.FC<WelcomeGamesItemProps> = ({ title, description, type, className }) => {
    useStyles(s);

    return (
        <div className={cnWelcomeGamesItem({ type }, [className])}>
            <Text className={cnWelcomeGamesItem('Title')} size="xl" color="white">
                {title}
            </Text>
            <TextBlock className={cnWelcomeGamesItem('Description')}>{description}</TextBlock>
        </div>
    );
};

export default WelcomeGamesItem;
