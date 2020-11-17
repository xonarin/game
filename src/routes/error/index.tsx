import React from 'react';

import { RouteResult } from '../../router';
import ErrorPage from './ErrorPage';

const action = (): RouteResult => {
    return {
        title: 'Demo Error',
        component: <ErrorPage />,
    };
};

export default action;
