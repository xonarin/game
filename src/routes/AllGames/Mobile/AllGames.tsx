import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './AllGames.scss';
import Link from '../../../components/Link/Link';
import { cn } from '../../../utils/bem-css-module';
import Layout33Content from '../../../components/Layout/Mobile/containers/Layout33Content';

const cnAllGames = cn(s, 'AllGames');

const AllGamesMobile: React.FC = () => {
    useStyles(s);

    return (
        <Layout33Content
            centerContent={
                <div className={cnAllGames('Row')}>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/minesback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                </div>
            }
        />
    );
};

export default AllGamesMobile;
