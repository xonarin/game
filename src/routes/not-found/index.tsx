import React from 'react';

import { RouteResult } from '../../router';
import NotFound from './NotFound';

const title = 'Page Not Found';

const action = (): RouteResult => {
    return {
        chunks: ['not-found'],
        title,
        component: <NotFound title={title} />,
        status: 404,
    };
};

export default action;
