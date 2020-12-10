import React, { useState } from 'react'
import s from './PercentBlock.scss';
import { cn } from '../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Icon from '../Icon/Icon';
import Text from '../Text/Text';

const cnPercentBlock = cn(s, 'PercentBlock');
const PercentBlock: React.FC = () => {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    const [finalAmount, setFinalAmount] = useState('')

    const handleChange = (e) => {
        if (Number(e.target.value)) {
            let amount = Number(e.target.value)
            setAmount(String(amount))
            let tmp = amount - amount / 10
            setFinalAmount(String(tmp))
        }
        if (e.target.value === '') {
            setAmount('')
            setFinalAmount('')

        }
    }

    const finalyAmountChange = (e) => {
        if (Number(e.target.value)) {
            let finalAmount = Number(e.target.value)
            setFinalAmount(String(finalAmount))
            let tmp = 10 * finalAmount / 9
            setAmount(String(tmp))
        }
        if (e.target.value === '') {
            setAmount('')
            setFinalAmount('')
        }
    }
    const checkValue = (e) => {
        if (e.target.value < 100) {
            setError('Минимальное значение  100 RUB')
            return
        }
        setAmount(e.target.value)

    }
    useStyles(s)
    return (
        <div className={cnPercentBlock()}>
            <div className={cnPercentBlock('Inputs')}>
                <div className={cnPercentBlock('Input-Block')}>
                    <div className={cnPercentBlock('Title')}>
                        <div className={cnPercentBlock('Title-Icon')}>
                            <Icon type='rightWhite'/>
                        </div>
                        <Text>
                            Сумма вывода
                        </Text>
                    </div>
                    <div className={cnPercentBlock("Input")}>
                        <div className={cnPercentBlock("Input-Icon")}>
                            <Icon type='ruble' />
                        </div>
                        {error ? <div className={cnPercentBlock('Error')}><Text color='red'>{error}</Text></div> : null}
                        <input value={amount} key="amount" onChange={handleChange} className={error ? cnPercentBlock('Input-Error') : undefined} onBlur={checkValue} />
                    </div>
                </div>
                <div className={cnPercentBlock('Input-Block')}>
                    <div className={cnPercentBlock('Title')}>
                        <div className={cnPercentBlock('Title-Icon')}>
                            <Icon type='rightWhite'  />
                        </div>
                        <Text>
                        К получению
                        </Text>
                    </div>
                    <div className={cnPercentBlock("Input")}>
                        <div className={cnPercentBlock("Input-Icon")}>
                            <Icon type='ruble' />
                        </div>
                        <input value={finalAmount} key="finalAmount" onChange={finalyAmountChange} />
                    </div>

                </div>
            </div>

        </div>
    )
}

export default PercentBlock
