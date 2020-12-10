import React, { useState } from 'react'
import s from './HistoryItem.scss';
import { cn } from '../../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import Icon from '../../../Icon/Icon';
import Text from '../../../Text/Text';
const cnHistory = cn(s, 'HistoryItem');

function HistoryItem() {
    const [toggle, setToggle] = useState(false)
    useStyles(s)

    return (
        <div className={cnHistory()}>
            <div className={cnHistory("Short-Info")} onClick={()=>setToggle(!toggle)}>
                <div className={cnHistory('Service')}>
                    <div className={cnHistory('Icon')}><Icon type='qiwi' /></div>
                    <div className={cnHistory('Info')}>
                        <Text color='white'>Qiwi</Text>
                        <Text>#54544</Text>
                    </div>
                </div>
                <div className={cnHistory('Time')}>
                    <Text>10.12.2020</Text>
                </div>
                <div className={cnHistory('Amount')}>
                    <Text>50<Icon type='ruble' /></Text>
                </div>
            </div>
            {toggle ? <div className={cnHistory("Description")}>
                <Text color='white'>Transaction amount : 50<Icon type='rubleWhite' size='xs'/></Text>
                <Text color='white'>Transaction date : 20.14.2568</Text>
            </div>:null}
            
        </div>
    )
}

export default HistoryItem
