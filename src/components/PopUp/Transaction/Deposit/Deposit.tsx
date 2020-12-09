import React, { useState } from 'react'
import s from '../Transaction.scss';
import { cn } from '../../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Text from '../../../Text/Text';
import Icon from '../../../Icon/Icon';
import InputWithIcon from '../../../InputWithIcon/InputWithIcon';
import OptionSelector from '../../../OptionSelector/OptionSelector';

const cnDeposit = cn(s, 'Deposit');

function Deposit() {
    const [selectedMethod, setSelectedMethod] = useState('qiwi')
    useStyles(s)

    return (
        <div className={cnDeposit('Description')}>
            <div className={cnDeposit('Methods')}>
                <button type='button' className={cnDeposit('Method')}>
                    <div className={cnDeposit("Category-Icon")}>
                        <Icon type='rightWhite' />
                    </div>
                    <Text>
                        Способ оплаты
                     </Text>
                </button>

                <button type='button' className={selectedMethod === 'qiwi' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("qiwi")} >
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='qiwi'/>
                    </div>
                    <Text color='white'>
                        Qiwi
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'card' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("card")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Банк. Карта
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'yandex' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("yandex")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Яндекс Деньги
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'mobile' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("mobile")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Моб. платеж
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'payeer' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("payeer")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Payeer
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'perfect' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("perfect")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Perfect Money
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'peasterix' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("peasterix")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <Icon type='balance' />
                    </div>
                    <Text color='white'>
                        Piastrix
                </Text>
                </button>
            </div>
            <div className={cnDeposit('Settings')}>
                {selectedMethod === 'qiwi' ?
                    <>
                        <div>
                            <InputWithIcon title=" Номер кошелька" icon='qiwi'/>
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts icon='ruble'/>
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>

                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 250 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'card' ?
                    <>
                        <div>
                            <OptionSelector type='mobile' />
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                            <div className={cnDeposit('Warning')}>
                                <Icon type='automat' />
                                <Text >
                                    Если у вас возникли трудности с оплатой попробуйте <Text color='green'>оплатить здесь</Text>
                                </Text>
                            </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 100 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'yandex' ?
                    <>
                        <div>
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />

                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 100 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'mobile' ?
                    <>
                        <div>
                            <OptionSelector type='mobile' />
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 15 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'payeer' ?
                    <>
                        <div>
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 500 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'perfect' ?
                    <>
                        <div>
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 100 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
                {selectedMethod === 'peasterix' ?
                    <>
                        <div>
                            <InputWithIcon title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>
                                Перейти к оплате
                </div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>100<Icon type='automat' size='xs' /> − 100 000<Icon type='automat' size='xs' /></Text>
                            </Text>
                        </div>
                    </> : null}
            </div>
        </div>
    )
}

export default Deposit
