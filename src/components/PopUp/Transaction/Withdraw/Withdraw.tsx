import React, { useState } from 'react'
import s from '../Transaction.scss';
import { cn } from '../../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Text from '../../../Text/Text';
import Icon from '../../../Icon/Icon';
import InputWithIcon from '../../../InputWithIcon/InputWithIcon';
import OptionSelector from '../../../OptionSelector/OptionSelector';
import PercentBlock from '../../../PercentBlock/PercentBlock';
import qiwi from '../../../../assets/img/qiwi.png'
import visa from '../../../../assets/img/visa.png'
import yandex from '../../../../assets/img/yandex.png'
import mobile from '../../../../assets/img/mobile.png'
import payeer from '../../../../assets/img/payeer.png'
import pm from '../../../../assets/img/pm.png'
import piasterix from '../../../../assets/img/piasterix.png'
const cnDeposit = cn(s, 'Deposit');

function Withdraw() {
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
                        <img src={qiwi}/>
                    </div>
                    <Text color='white'>
                        Qiwi
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'card' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("card")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <img src={visa}/>
                    </div>
                    <Text color='white'>
                        Банк. Карта
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'cardUa' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("cardUa")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <img src={visa}/>
                    </div>
                    <Text color='white'>
                    Банк. Карта (UA)
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'yandex' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("yandex")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <img src={yandex}/>
                    </div>
                    <Text color='white'>
                        Яндекс Деньги
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'mobile' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("mobile")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <img src={mobile}/>
                    </div>
                    <Text color='white'>
                        Моб. платеж
                </Text>
                </button>
                <button type='button' className={selectedMethod === 'payeer' ? cnDeposit('Method-Active') : cnDeposit('Method')} onClick={() => setSelectedMethod("payeer")}>
                    <div className={cnDeposit("Method-Icon")}>
                        <img src={payeer}/>
                    </div>
                    <Text color='white'>
                        Payeer
                </Text>
                </button>
                
            </div>
            <div className={cnDeposit('Settings')}>
            {selectedMethod === 'qiwi' ?
                <>
                    <div>
                        <InputWithIcon title=" Номер кошелька" icon={qiwi}/>
                        <PercentBlock />
                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                        </div>

                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 15 750<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
            {selectedMethod === 'card' ?
                <>
                    <div>

                        <InputWithIcon title=" Номер банковской карты"  type='card' icon={visa}/>
                        <PercentBlock />

                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                        </div>
                        
                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 52 500<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
                {selectedMethod === 'cardUa' ?
                <>
                    <div>

                        <InputWithIcon title=" Номер банковской карты" type='card' icon={visa}/>
                        <PercentBlock />

                        <div className={cnDeposit('Warning-Card')}>
                          
                            <Text >
                            Конвертация рубля в гривну происходит по курсу ЦБ + комиссии платежного агрегатора
                            </Text>
                        </div>
                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                        </div>
                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 52 500<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
            {selectedMethod === 'yandex' ?
                <>
                    <div>
                        <InputWithIcon title=" Сумма пополнения"   type='yandex' icon={visa}/>
                        <PercentBlock />
                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                                </div>
                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 15 750<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
            {selectedMethod === 'mobile' ?
                <>
                    <div>
                        <OptionSelector type='mobile' />
                        <InputWithIcon title=" Номер телефона" icon={mobile} type='mobile'/>
                        <PercentBlock />
                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                        </div>
                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 15 750<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
                {selectedMethod === 'payeer' ?
                <>
                    <div>
                        <InputWithIcon title=" Сумма пополнения" icon={payeer} />
                        <PercentBlock />
                        <div className={cnDeposit('Go-To-Payment')}>
                            Заказать вывод
                                </div>
                    </div>
                    <div className={cnDeposit('Footer')}>
                        <Text>
                            Комиссия: <Text color='white'>0%</Text> / Лимит одного пополнения: <Text color='white'>500<Icon type='rubleWhite' size='xs' /> − 15 750<Icon type='rubleWhite' size='xs' /></Text>
                        </Text>
                    </div>
                </> : null}
                </div>
        </div>
    )
}

export default Withdraw
