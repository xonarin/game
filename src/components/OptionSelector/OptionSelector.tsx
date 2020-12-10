import React, { useState } from 'react'
import s from './OptionSelector.scss';
import { cn } from '../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Icon from '../Icon/Icon';
import Text from '../Text/Text';
type SelectorType = 
    |'mobile'
    |'wallet'

export interface OptionSelectorProps {
    type: SelectorType
}
const cnOptionSelector = cn(s, 'OptionSelector');
const OptionSelector: React.FC<OptionSelectorProps> = ({ type }) => {
    const [selectedOption, setSelectedOption] = useState('mts')
    useStyles(s)

    return (
        <div className={cnOptionSelector()}>
            <div className={cnOptionSelector('Title')}>
                <div className={cnOptionSelector('Title-Icon')}>
                    <Icon type='rightWhite' />
                </div>
                <Text>
                    Сумма пополнения
                </Text>
            </div>
            <div className={cnOptionSelector('Options')}>
                {type === 'mobile' ? <> <button type='button' className={selectedOption === 'mts' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('mts')}>
                    <Icon type='automat' />
                    <Text>
                        MTS
                    </Text>
                </button>
                    <button type='button' className={selectedOption === 'megafon' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('megafon')}>
                        <Icon type='automat' />
                        <Text>
                            Megafon
                    </Text>
                    </button>
                    <button type='button' className={selectedOption === 'beeline' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('beeline')}>
                        <Icon type='automat' />
                        <Text>
                            Beeline
                    </Text>
                    </button>
                    <button type='button' className={selectedOption === 'tele2' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('tele2')}>
                        <Icon type='automat' />
                        <Text>
                            Tele2
                    </Text>
                    </button></> : <>  <button type='button' className={selectedOption === 'megafon' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('megafon')}>
                        <Text>
                            RUB
                    </Text>
                    </button>
                        <button type='button' className={selectedOption === 'beeline' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('beeline')}>
                            <Text>
                                UAH
                    </Text>
                        </button></>}


            </div>


        </div>
    )
}

export default OptionSelector
