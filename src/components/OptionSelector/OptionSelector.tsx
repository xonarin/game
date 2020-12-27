import React, { useState } from 'react'
import s from './OptionSelector.scss';
import { cn } from '../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Icon from '../Icon/Icon';
import Text from '../Text/Text';
import mts from '../../assets/img/mts.png'
import megafon from '../../assets/img/megafon.png'
import beeline from '../../assets/img/beeline.png'
import tele2 from '../../assets/img/tele2.png'
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
                    <img src={mts}/>
                    <Text>
                        MTS
                    </Text>
                </button>
                    <button type='button' className={selectedOption === 'megafon' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('megafon')}>
                        <img src={megafon}/>
                        <Text>
                            Megafon
                    </Text>
                    </button>
                    <button type='button' className={selectedOption === 'beeline' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('beeline')}>
                        <img src={beeline}/>
                        <Text>
                            Beeline
                    </Text>
                    </button>
                    <button type='button' className={selectedOption === 'tele2' ? cnOptionSelector('Option-Active') : cnOptionSelector('Option')} onClick={() => setSelectedOption('tele2')}>
                        <img src={tele2}/>
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
