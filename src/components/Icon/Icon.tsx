import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import { cn } from '../../utils/bem-css-module';
import s from './Icon.scss';

type IconSize = 'xs' | 's' | 'm' | 'xxl';

type IconType =
    | 'gamepad'
    | 'gamepadWhite'
    | 'ingots'
    | 'ingotsWhite'
    | 'play'
    | 'playWhite'
    | 'user'
    | 'lightning'
    | 'rub'
    | 'cardsCut'
    | 'ingotsCut'
    | 'playRedCut'
    | 'guard'
    | 'guardTwo'
    | 'diamond'
    | 'sword'
    | 'dice'
    | 'bomb'
    | 'bombWhite'
    | 'automat'
    | 'scissors'
    | 'wheel'
    | 'cards'
    | 'cube'
    | 'faq'
    | 'swordWhite'
    | 'diceWhite'
    | 'automatWhite'
    | 'scissorsWhite'
    | 'wheelWhite'
    | 'cardsWhite'
    | 'cubeWhite'
    | 'faqWhite'
    | 'plusWhite'
    | 'prize'
    | 'bell'
    | 'message'
    | 'prizeWhite'
    | 'bellWhite'
    | 'messageWhite'
    | 'signOut'
    | 'smile'
    | 'ban'
    | 'delete'
    | 'search'
    | 'send'
    | 'letter'
    | 'letterWhite'
    | 'gem'
    | 'bombColored'
    | 'close'
    | 'caretLeft'
    | 'caretLeftWhite'
    | 'left'
    | 'right'
    |'balance'
    |'angryFace'
    |'checked'
    |'diagrams'
    |'link'
    |'peoples'
    |'percentage'
    |'star'
    |'edit'
    |'rightWhite'
    |'qiwi'
    |'ruble'
    |'rubleWhite'
    |'add'
    |'minus'
    |'clock';

export interface IconProps {
    type: IconType;
    hover?: IconType | boolean;
    size?: IconSize;
    className?: string;
}

const cnIcon = cn(s, 'Icon');

const Icon: React.FC<IconProps> = ({ type, hover, size = 's', className }) => {
    useStyles(s);

    return <i className={cnIcon({ type, hover, size }, [className])} />;
};

export default Icon;
