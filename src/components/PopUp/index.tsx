import React from 'react'
import s from './PopUp.scss';
import { cn } from '../../utils/bem-css-module';
import FirePlay from './FirePlay/FirePlay';
import useStyles from 'isomorphic-style-loader/useStyles';
import Transaction from './Transaction/Transaction';

const cnPopUp = cn(s, 'PopUp');
type popUpType=
    |'firePlay'
    |"transaction"

export interface PopUpProps {
    close: Function
    type:popUpType
}
const PopUp:React.FC<PopUpProps>  = ({ close,type }) => {
    useStyles(s);

    return (
        <div className={cnPopUp()}>
            {type === 'firePlay' ? <FirePlay close={close}/>:<Transaction close={close}/>}
        </div>
    )
}

export default PopUp
