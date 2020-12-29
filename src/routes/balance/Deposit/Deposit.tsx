import React, { useState } from 'react';
import s from '../Transaction.scss';
import { cn } from '../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';

import qiwi from '../../../assets/img/qiwi.png';
import visa from '../../../assets/img/visa.png';
import yandex from '../../../assets/img/yandex.png';
import mobile from '../../../assets/img/mobile.png';
import payeer from '../../../assets/img/payeer.png';
import pm from '../../../assets/img/pm.png';
import piasterix from '../../../assets/img/piasterix.png';
import Text from '../../../components/Text/Text';
import Icon from '../../../components/Icon/Icon';
import InputWithIcon from '../../../components/InputWithIcon/InputWithIcon';
import OptionSelector from '../../../components/OptionSelector/OptionSelector';
const cnDeposit = cn(s, 'Deposit');

function Deposit() {
    const [selectedMethod, setSelectedMethod] = useState(0);
    const [selectedMethodToggle, setSelectedMethodToggle] = useState(false);
    const paymentMethods = [
        <button
            type="button"
            className={selectedMethod === 0 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(0);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={qiwi} />
            </div>
            <Text color="white">Qiwi</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 1 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(1);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={visa} />
            </div>
            <Text color="white">Банк. Карта</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 2 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(2);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={yandex} />
            </div>
            <Text color="white">Яндекс Деньги</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 3 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(3);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={mobile} />
            </div>
            <Text color="white">Моб. платеж</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 4 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(4);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={payeer} />
            </div>
            <Text color="white">Payeer</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 5 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(5);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={pm} />
            </div>
            <Text color="white">Perfect Money</Text>
        </button>,
        <button
            type="button"
            className={selectedMethod === 6 ? cnDeposit('Method-Active') : cnDeposit('Method')}
            onClick={() => {
                setSelectedMethod(6);
                setSelectedMethodToggle(!selectedMethodToggle);
            }}
        >
            <div className={cnDeposit('Method-Icon')}>
                <img src={piasterix} />
            </div>
            <Text color="white">Piastrix</Text>
        </button>,
    ];
    useStyles(s);

    return (
        <div className={cnDeposit('Description')}>
            <div className={cnDeposit('Methods')}>
                <button type="button" className={cnDeposit('Method')}>
                    <div className={cnDeposit('Category-Icon')}>
                        <Icon type="rightWhite" />
                    </div>
                    <Text>Способ оплаты</Text>
                </button>
                <div className={cnDeposit("SelectetedMethod")}>
                {paymentMethods[selectedMethod]} 
                <Icon type='left'/>
                </div>
                {selectedMethodToggle ? (
                    <div className={cnDeposit("PaymentsList")}>
                        {paymentMethods.map((method, index) => {
                            if (index !== selectedMethod) {
                                return method;
                            }
                        })}
                    </div>
                ) : null}
            </div>
            <div className={cnDeposit('Settings')}>
                {selectedMethod === 0 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Номер кошелька" icon={qiwi} type="qiwi" />
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 250 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 1 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 100 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 2 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />

                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 100 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 3 ? (
                    <>
                        <div>
                            <OptionSelector type="mobile" />
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 15 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 4 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 500 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 5 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 100 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
                {selectedMethod === 6 ? (
                    <>
                        <div>
                            <InputWithIcon mobile={true} title=" Сумма пополнения" fixedAmounts />
                            <div className={cnDeposit('Go-To-Payment')}>Перейти к оплате</div>
                        </div>
                        <div className={cnDeposit('Footer')}>
                            <Text>
                                Комиссия: <Text color="white">0%</Text> / Лимит одного пополнения:{' '}
                                <Text color="white">
                                    100
                                    <Icon type="diamond" size="xs" /> − 100 000
                                    <Icon type="diamond" size="xs" />
                                </Text>
                            </Text>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default Deposit;
