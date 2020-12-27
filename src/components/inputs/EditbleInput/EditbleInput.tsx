import React, { useState } from 'react'
import Icon from '../../Icon/Icon'
import s from './EditbleInput.scss';
import { cn } from '../../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';

const cnPopUp = cn(s, 'EditbleInput');

const EditbleInput = () => {
    const [toggle, setToggle] = useState(false)
    const [text, setText] = useState('test')
    useStyles(s);

    return (
        <div className={cnPopUp('')}>
            <input value={text} className={cnPopUp('Input')} onChange={(e)=>toggle ? setText(e.target.value) : null}/>
            <button type='button' className={cnPopUp('Edit')} onClick={()=>setToggle(!toggle)}>
                <Icon type='edit' />
            </button>
        </div>

    )
}

export default EditbleInput
