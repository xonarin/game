import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Referals from './Referals';

const action = ({ user }: AppContextTypes): RouteResult => {
    return {
        title: 'Партнёрская программа',
        chunks: ['referal'],
        pageContent: <Referals />,
        redirect: user ? undefined : '/',
    };
};

export default action;
