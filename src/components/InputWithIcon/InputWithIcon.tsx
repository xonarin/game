import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import Icon from '../Icon/Icon';
import Text from '../Text/Text';
import s from './InputWithIcon.scss';
import { cn } from '../../utils/bem-css-module';

const cnInputWithIcon = cn(s, 'InputWithIcon');

export interface InputWithIconProps {
    fixedAmounts?: boolean;
    title: string;
    icon?: string;
    type?: string;
    mobile?: boolean;

    value: string;
    onChange: (value: string) => void;
}

const InputWithIcon: React.FC<InputWithIconProps> = ({
    fixedAmounts = false,
    title,
    icon,
    type,
    mobile,
    value: amount,
    onChange: setAmount,
}) => {
    const [error, setError] = useState('');
    useStyles(s);
    const handleChange = e => {
        if (Number(e.target.value) || e.target.value == '') {
            setAmount(e.target.value);
        }
    };
    const checkValue = e => {
        const { value } = e.target;

        if (type === 'qiwi' && (value[0] !== '+' || value.length != 12)) {
            setError('Введите номер международном формате');
            return;
        }
        if (type === 'mobile' && (value[0] !== '+' || value.length != 12)) {
            setError('Введите номер международном формате');
            return;
        }
        if (type === 'card' && (value.slice(0, 4) != '4318' || e.target.value.length != 16)) {
            setError('Введите корректный номер банковской карты');
            return;
        }
        if (type === 'yandex' && e.target.value.length != 15) {
            setError('Введите корректный номер Яндекс Кошелька');
            return;
        }
        if (fixedAmounts && Number(amount) < 50) {
            setError('min amount 100');
            return;
        }
        setError('');
    };

    return (
        <div className={cnInputWithIcon()}>
            <div className={cnInputWithIcon('Title')}>
                <div className={cnInputWithIcon('Title-Icon')}>
                    <Icon type="rightWhite" />
                </div>
                <Text>{title}</Text>
            </div>
            <div className={cnInputWithIcon('Input')}>
                <div className={cnInputWithIcon('Input-Icon')}>
                    {fixedAmounts || !icon ? <Icon type="diamond" /> : <img src={icon} />}
                </div>
                {error ? (
                    <div className={cnInputWithIcon('Error')}>
                        <Text color="red">{error}</Text>
                    </div>
                ) : null}
                <input
                    value={amount}
                    onChange={handleChange}
                    className={error ? cnInputWithIcon('Input-Error') : undefined}
                    onBlur={checkValue}
                    placeholder={fixedAmounts ? undefined : 'Введите номер кошелька'}
                />
            </div>
            {fixedAmounts ? (
                mobile ? (
                    <div className={cnInputWithIcon('FixedAmounts')}>
                        <button
                            className={
                                amount === '100'
                                    ? cnInputWithIcon('Amount-Active-Mobile')
                                    : cnInputWithIcon('Amount-Mobile')
                            }
                            onClick={() => setAmount('100')}
                        >
                            <Text color={amount === '100' ? 'white' : undefined}>
                                100 <Icon type={amount === '100' ? 'diamond' : 'diamond'} size={mobile ? 'xs' : 's'} />
                            </Text>
                        </button>
                        <button
                            className={
                                amount === '1000'
                                    ? cnInputWithIcon('Amount-Active-Mobile')
                                    : cnInputWithIcon('Amount-Mobile')
                            }
                            onClick={() => setAmount('1000')}
                        >
                            <Text color={amount === '1000' ? 'white' : undefined}>
                                1000{' '}
                                <Icon type={amount === '1000' ? 'diamond' : 'diamond'} size={mobile ? 'xs' : 's'} />
                            </Text>
                        </button>
                        <button
                            className={
                                amount === '5000'
                                    ? cnInputWithIcon('Amount-Active-Mobile')
                                    : cnInputWithIcon('Amount-Mobile')
                            }
                            onClick={() => setAmount('5000')}
                        >
                            <Text color={amount === '5000' ? 'white' : undefined}>
                                5000{' '}
                                <Icon type={amount === '5000' ? 'diamond' : 'diamond'} size={mobile ? 'xs' : 's'} />
                            </Text>
                        </button>
                        <button
                            className={
                                amount === '15000'
                                    ? cnInputWithIcon('Amount-Active-Mobile')
                                    : cnInputWithIcon('Amount-Mobile')
                            }
                            onClick={() => setAmount('15000')}
                        >
                            <Text color={amount === '15000' ? 'white' : undefined}>
                                15000{' '}
                                <Icon type={amount === '15000' ? 'diamond' : 'diamond'} size={mobile ? 'xs' : 's'} />
                            </Text>
                        </button>
                    </div>
                ) : (
                    <div className={cnInputWithIcon('FixedAmounts')}>
                        <button
                            className={amount === '100' ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')}
                            onClick={() => setAmount('100')}
                        >
                            <Text color={amount === '100' ? 'white' : undefined}>
                                100 <Icon type={amount === '100' ? 'diamond' : 'diamond'} size={mobile ? 'xs' : 's'} />
                            </Text>
                        </button>
                        <button
                            className={amount === '1000' ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')}
                            onClick={() => setAmount('1000')}
                        >
                            <Text color={amount === '1000' ? 'white' : undefined}>
                                1000 <Icon type={amount === '1000' ? 'diamond' : 'diamond'} />
                            </Text>
                        </button>
                        <button
                            className={amount === '5000' ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')}
                            onClick={() => setAmount('5000')}
                        >
                            <Text color={amount === '5000' ? 'white' : undefined}>
                                5000 <Icon type={amount === '5000' ? 'diamond' : 'diamond'} />
                            </Text>
                        </button>
                        <button
                            className={
                                amount === '15000' ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')
                            }
                            onClick={() => setAmount('15000')}
                        >
                            <Text color={amount === '15000' ? 'white' : undefined}>
                                15000 <Icon type={amount === '15000' ? 'diamond' : 'diamond'} />
                            </Text>
                        </button>
                        <button
                            className={
                                amount === '50000' ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')
                            }
                            onClick={() => setAmount('50000')}
                        >
                            <Text color={amount === '50000' ? 'white' : undefined}>
                                50000 <Icon type={amount === '50000' ? 'diamond' : 'diamond'} />
                            </Text>
                        </button>
                    </div>
                )
            ) : null}
        </div>
    );
};

export default InputWithIcon;
