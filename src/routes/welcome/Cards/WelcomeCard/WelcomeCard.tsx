import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeCard.scss';
import { cn } from '../../../../utils/bem-css-module';
import Text, { TextProps } from '../../../../components/Text/Text';
import Button, { ButtonProps } from '../../../../components/Button/Button';
import TextBlock from '../../../../components/TextBlock/TextBlock';

export interface WelcomeCardProps {
    title: TextProps['children'];
    buttonText: ButtonProps['children'];

    children: TextProps['children'];
}

const cnWelcomeCard = cn(s, 'WelcomeCard');

const WelcomeCard: React.FC<WelcomeCardProps> = ({ title, buttonText, children }) => {
    useStyles(s);

    return (
        <div className={cnWelcomeCard()}>
            <div className={cnWelcomeCard('Head')}>
                <Text className={cnWelcomeCard('Title')} size="m" color="white">
                    {title}
                </Text>
            </div>
            <div className={cnWelcomeCard('Main')}>
                <TextBlock className={cnWelcomeCard('Description')} size="l" weight="regular" color="white">
                    {children}
                </TextBlock>
                <Button size="m"><a className={cnWelcomeCard('ButtonLink')} href="/auth/vk">{buttonText}</a></Button>
            </div>
        </div>
    );
};

export default WelcomeCard;
