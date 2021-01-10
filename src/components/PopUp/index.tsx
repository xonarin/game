import React from 'react'
import s from './PopUp.scss';
import { cn } from '../../utils/bem-css-module';
import FirePlay from './Web/FirePlay/FirePlay';
import useStyles from 'isomorphic-style-loader/useStyles';
import Transaction from './Web/Transaction/Transaction';
import FirePlayMobile from './Mobile/FirePlay/FirePlay';

const cnPopUp = cn(s, 'PopUp');
type popUpType=
    |'firePlay'
    |"transaction"

export interface PopUpProps {
    close: Function
    type:popUpType
    mobile?:boolean
}


const PopUp:React.FC<PopUpProps>  = ({ close,type,mobile }) => {
    useStyles(s);

    const handleClick=(e)=>{
        if(e.target.id==="shadow"){
            close()
        }
    }
    if(mobile){
        return (
            <div className={cnPopUp("Mobile")} id="shadow" onClick={(e)=>handleClick(e)}>
                <div id='content' >
                {type === 'firePlay' ? <FirePlayMobile close={close}/>:null}
                </div>
            </div>
        )
    }
    return (
        <div className={cnPopUp()} id="shadow" onClick={(e)=>handleClick(e)}>
            <div id='content' >
            {type === 'firePlay' ? <FirePlay close={close}/>:<Transaction close={close}/>}
            </div>
        </div>
    )
}

export default PopUp
