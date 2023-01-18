import React, { useEffect, useState } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';
import s from './AuthWait.scss';
import { cn } from '../../utils/bem-css-module';

const cnAuthWait = cn(s, 'AuthWait');

const AuthWait = () => {
    useStyles(s);

    const timeRand = Math.round(3 - 0.5 + Math.random() * (9 - 3 + 1));
    const [time, setTime] = useState(timeRand);

    useEffect(() => {
        setTimeout(() => {
            time === 0 ? window.location.replace('/auth/vk/') : setTime(prev => prev - 1)
        }, 1000)

    }, [time])

    return (

        <>
            <div className={cnAuthWait()}>
                <h1 className={cnAuthWait('title')}>Авторизация временно перегружена </h1>
                <p className={cnAuthWait('paragraph')}>Повторная попытка произойдёт через</p>
                <div className={cnAuthWait('circle')}>
                    <span>{time}</span>
                </div>
            </div>
        </>

    );
};

export default AuthWait;
