import React from 'react';

import { AppContextTypes } from '../../context';
import { RouteResult } from '../../router';
import Layout from '../../components/Layout/Layout';
import GameUpgraderUPG from './GameUpgraderUPG';

const action = ({ user }: AppContextTypes): RouteResult => ({
    title: 'Upgrade',
    chunks: ['upgrade'],
    pageContent: (
        <Layout>
            <GameUpgraderUPG />
        </Layout>
    ),
    redirect: user ? undefined : '/login',
});

export default action;
