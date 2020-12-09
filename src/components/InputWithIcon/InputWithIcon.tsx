import React, { useEffect, useState } from 'react'
import Icon from '../Icon/Icon'
import Text from '../Text/Text'
import s from './InputWithIcon.scss';
import { cn } from '../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';

const cnInputWithIcon = cn(s, 'InputWithIcon');

const InputWithIcon = ({fixedAmounts=false,title,icon='qiwi',type='qiwi'}) => {
    const [amount, setAmount] = useState('')
    const [error, setError] = useState('')
    useEffect(() => {
        if(fixedAmounts){
            setAmount('500')
        }
        return () => {
        }
    }, [])
    useStyles(s)
    const handleChange = (e) => {
        setAmount(e.target.value)
    }
    const checkValue = (e) => {
        let value:String=e.target.value
        
        if(type==='qiwi' && ( value[0] !== '+' || value.length!=12)){
            setError('Введите номер международном формате')
            return
        }
        if(type==='card' && ( value.slice(0,4) !='4318' || e.target.value.length!=16)){
            setError('Введите корректный номер банковской карты')
            return
        }
        if(type==='yandex' && ( e.target.value.length!=15)){
            setError('Введите корректный номер Яндекс Кошелька')
            return
        }
        setError('')
    }
    return (
        <div className={cnInputWithIcon()}>
            <div className={cnInputWithIcon('Title')}>
                <div className={cnInputWithIcon('Title-Icon')}>
                    <Icon type='rightWhite'/>
                </div>
                <Text>
                   {title}
                </Text>
            </div>
            <div className={cnInputWithIcon("Input")}>
                <div className={cnInputWithIcon("Input-Icon")}>
                    <Icon type={icon} />
                </div>
                {error ? <div className={cnInputWithIcon('Error')}><Text color='red'>{error}</Text></div> : null}
                <input value={amount} onChange={handleChange} className={error ? cnInputWithIcon('Input-Error'):undefined} onBlur={checkValue} placeholder="Введите номер кошелька"/>
            </div>
            {fixedAmounts ?  <div className={cnInputWithIcon('FixedAmounts')}>
                <button className={amount === "100" ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')} onClick={() => setAmount('100')}><Text color={amount === '100' ? 'white' : undefined}>100 <Icon type='ruble'/></Text></button>
                <button className={amount === "1000" ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')} onClick={() => setAmount('1000')}><Text color={amount === '1000' ? 'white' : undefined}>1000 <Icon type='ruble'/></Text></button>
                <button className={amount === "5000" ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')} onClick={() => setAmount('5000')}><Text color={amount === '5000' ? 'white' : undefined}>5000 <Icon type='ruble'/></Text></button>
                <button className={amount === "15000" ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')} onClick={() => setAmount('15000')}><Text color={amount === '15000' ? 'white' : undefined}>15000 <Icon type='ruble'/></Text></button>
                <button className={amount === "50000" ? cnInputWithIcon('Amount-Active') : cnInputWithIcon('Amount')} onClick={() => setAmount('50000')}><Text color={amount === '50000' ? 'white' : undefined}>50000 <Icon type='ruble'/></Text></button>
            </div>:null}
           

        </div>
    )
}

export default InputWithIcon
