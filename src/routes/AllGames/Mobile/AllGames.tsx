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
                        <Link to="/classic">
                            <img src="/classicback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>

                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/minesback.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="#">
                            <img src="/darts.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Darts</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="#">
                            <img src="/knb.png" alt="" />
                            <h2 className={cnAllGames('Title')}>KNB</h2>
                        </Link>
                    </div>
                </div>
            }
        />
    );
};

export default AllGamesMobile;
