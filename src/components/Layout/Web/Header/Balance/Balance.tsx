import React, { useEffect, useRef, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Balance.scss';
import { cn } from '../../../../../utils/bem-css-module';
import Text from '../../../../Text/Text';
import TextIcon from '../../../../TextIcon/TextIcon';
import Button from '../../../../Button/Button';
import PopUp from '../../../../PopUp';

export interface BalanceProps {
    money: number;
}

const cnBalance = cn(s, 'Balance');

const Balance: React.FC<BalanceProps> = ({ money }) => {
    const [depositToggle, setDepositToggle] = useState(false)
    useStyles(s);

    const currentMoneyRef = useRef(money);
    const [diff, setDiff] = useState(0);

    useEffect(() => {
        const newDiff = money - currentMoneyRef.current;
        currentMoneyRef.current = money;

        setDiff(0);
        setTimeout(() => setDiff(newDiff));
    }, [money]);
    const popUpClose = () => {
        setDepositToggle(false)
    }
    return (
        <div className={cnBalance()}>
            <div className={cnBalance('Main')}>
                <Text className={cnBalance('Label')} upper>
                    Баланс
                </Text>
                <div className={cnBalance('ValueContainer')}>
                    <TextIcon className={cnBalance('Value')} text={money} icon="diamond" color="white" upper />
                    {diff !== 0 && (
                        <Text className={cnBalance('Diff', { type: diff < 0 ? 'red' : 'green' })}>
                            {Number(diff.toFixed(2))}
                        </Text>
                    )}
                </div>
            </div>
            <Button className={cnBalance('Button')} icon="plusWhite" onClick={()=>setDepositToggle(true)}/>
            {depositToggle ? <PopUp close={popUpClose} /> : null}
        </div>
    );
};

export default Balance;
