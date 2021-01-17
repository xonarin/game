import React, { useCallback } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './PopUp.scss';
import { cn } from '../../utils/bem-css-module';
import FirePlay from './Web/FirePlay/FirePlay';
import { Transaction } from '../Transaction/Transaction';
import FirePlayMobile from './Mobile/FirePlay/FirePlay';

const cnPopUp = cn(s, 'PopUp');
type popUpType = 'firePlay' | 'transaction';

export interface PopUpProps {
    close: () => void;
    type: popUpType;
    mobile?: boolean;
}

const PopUp: React.FC<PopUpProps> = ({ close, type, mobile }) => {
    useStyles(s);

    const handleClick = useCallback(
        e => {
            if (e.target.id === 'shadow') {
                close();
            }
        },
        [close],
    );

    if (mobile) {
        return (
            <div className={cnPopUp('Mobile')} id="shadow" onClick={handleClick}>
                <div id="content">{type === 'firePlay' ? <FirePlayMobile close={close} /> : null}</div>
            </div>
        );
    }

    return (
        <div className={cnPopUp()} id="shadow" onClick={e => handleClick(e)}>
            <div id="content">{type === 'firePlay' ? <FirePlay close={close} /> : <Transaction close={close} />}</div>
        </div>
    );
};

export default PopUp;
