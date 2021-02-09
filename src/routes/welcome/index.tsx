import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Welcome from './Welcome';

const action = ({ user, query }: AppContextTypes): RouteResult => {
    const refId = query && (Array.isArray(query.ref) ? query.ref[0] : query.ref);

    return {
        title: 'Добро пожаловать',
        chunks: ['welcome'],
        pageContent: <Welcome refId={refId} />,
        redirect: user && '/all-games',
    };
};

export default action;
