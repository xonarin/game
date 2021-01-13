import React, { useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PercentBlock.scss';
import { cn } from '../../utils/bem-css-module';
import Icon from '../Icon/Icon';
import Text from '../Text/Text';

export interface PercentBlockProps {
    value: number | null;
    onChange: (value: number | null) => void;
}

const cnPercentBlock = cn(s, 'PercentBlock');
const PercentBlock: React.FC<PercentBlockProps> = ({ value: amount, onChange: setAmount }) => {
    const [error, setError] = useState('');
    const [finalAmount, setFinalAmount] = useState('');

    const handleChange = e => {
        if (Number(e.target.value)) {
            const amount = Number(e.target.value);
            setAmount(amount);

            const tmp = amount - amount / 10;
            setFinalAmount(String(tmp));
        }

        if (e.target.value === '') {
            setAmount(null);
            setFinalAmount('');
        }
    };

    const finallyAmountChange = e => {
        if (Number(e.target.value)) {
            const finalAmount = Number(e.target.value);
            setFinalAmount(String(finalAmount));
            const tmp = (10 * finalAmount) / 9;
            setAmount(tmp);
        }

        if (e.target.value === '') {
            setAmount(null);
            setFinalAmount('');
        }
    };

    const checkValue = e => {
        if (e.target.value < 100) {
            setError('Минимальное значение  100 RUB');
            return;
        }
        setAmount(+e.target.value);
    };
    useStyles(s);
    return (
        <div className={cnPercentBlock()}>
            <div className={cnPercentBlock('Inputs')}>
                <div className={cnPercentBlock('Input-Block')}>
                    <div className={cnPercentBlock('Title')}>
                        <div className={cnPercentBlock('Title-Icon')}>
                            <Icon type="rightWhite" />
                        </div>
                        <Text>Сумма вывода</Text>
                    </div>
                    <div className={cnPercentBlock('Input')}>
                        <div className={cnPercentBlock('Input-Icon')}>
                            <Icon type="diamond" />
                        </div>
                        {error ? (
                            <div className={cnPercentBlock('Error')}>
                                <Text color="red">{error}</Text>
                            </div>
                        ) : null}
                        <input
                            value={amount ?? ''}
                            key="amount"
                            onChange={handleChange}
                            className={error ? cnPercentBlock('Input-Error') : undefined}
                            onBlur={checkValue}
                        />
                    </div>
                </div>
                <div className={cnPercentBlock('Input-Block')}>
                    <div className={cnPercentBlock('Title')}>
                        <div className={cnPercentBlock('Title-Icon')}>
                            <Icon type="rightWhite" />
                        </div>
                        <Text>К получению</Text>
                    </div>
                    <div className={cnPercentBlock('Input')}>
                        <div className={cnPercentBlock('Input-Icon')}>
                            <Icon type="diamond" />
                        </div>
                        <input value={finalAmount} key="finalAmount" onChange={finallyAmountChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PercentBlock;
