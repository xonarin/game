import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import { animated, useSpring } from 'react-spring';

import s from './ClassicGameFund.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../../components/Text/Text';
import TextIcon from '../../../../../components/TextIcon/TextIcon';

export interface ClassicGameFundProps {
    fund: number;
}

const AnimatedTextIcon = animated(TextIcon);

const cnClassicGameFund = cn(s, 'ClassicGameFund');

const ClassicGameFund: React.FC<ClassicGameFundProps> = ({ fund }) => {
    useStyles(s);

    const springProps = useSpring<ClassicGameFundProps>({
        fund,
        from: { fund },
        config: { duration: fund === 0 ? 1000 : 2000 },
    });

    return (
        <div className={cnClassicGameFund()}>
            <Text className={cnClassicGameFund('Label')} upper>
                Банк игры
            </Text>
            <AnimatedTextIcon
                className={cnClassicGameFund('Icon')}
                // @ts-ignore Поле done не протипизировано в react-spring
                text={springProps.fund.interpolate(value => (springProps.fund.done ? value : value.toFixed(2)))}
                icon="diamond"
                color="white"
                size="l"
            />
        </div>
    );
};

export default ClassicGameFund;
