import React, { useEffect, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Balance.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../Text/Text';
import TextIcon from '../../../../TextIcon/TextIcon';
import Button from '../../../../Button/Button';
import Link from '../../../../Link/Link';

export interface BalanceProps {
    money: number;
}

const cnBalance = cn(s, 'Balance');

const Balance: React.FC<BalanceProps> = ({ money }) => {
    const currentMoneyRef = useRef(money);
    const [diff, setDiff] = useState(0);

    useStyles(s);

    useEffect(() => {
        const newDiff = money - currentMoneyRef.current;
        currentMoneyRef.current = money;

        setDiff(0);
        setTimeout(() => setDiff(newDiff));
    }, [money]);

    return (
        <div className={cnBalance()}>
            <div className={cnBalance('Main')}>
                <Link to="/balance" className={cnBalance('Deposit')}>
                    <div className={cnBalance('ValueContainer')}>
                        <TextIcon className={cnBalance('Value')} text={money} icon="diamond" color="white" upper />
                        {diff !== 0 && (
                            <Text className={cnBalance('Diff', { type: diff < 0 ? 'red' : 'green' })}>
                                {Number(diff.toFixed(2))}
                            </Text>
                        )}
                    </div>
                </Link>
            </div>
            <Link to="/balance" className={cnBalance('DepositPlus')}>
                <Button className={cnBalance('Button')} icon="plusWhite" />
            </Link>
        </div>
    );
};

export default Balance;
