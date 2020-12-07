import React from 'react'
import s from './PopUp.scss';
import { cn } from '../../utils/bem-css-module';
import FirePlay from './FirePlay/FirePlay';
import useStyles from 'isomorphic-style-loader/useStyles';

const cnPopUp = cn(s, 'PopUp');
export interface PopUpProps {
    close: Function
}
const PopUp:React.FC<PopUpProps>  = ({ close }) => {
    useStyles(s);

    return (
        <div className={cnPopUp()}>
            <FirePlay close={close} />
        </div>
    )
}

export default PopUp
