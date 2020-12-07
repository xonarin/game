import React from 'react'
import { CircleSpinner } from "react-spinners-kit";
import { cn } from '../../utils/bem-css-module';
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './PreLoader.scss';

const cnPreLoader = cn(s, 'PreLoader');


const PreLoader: React.FC = () => {
    useStyles(s);

    return (
        <div className={cnPreLoader()}>
            <CircleSpinner
               
                color="#2f83fd" />
        </div>
    )
}

export default PreLoader