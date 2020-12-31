import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from '../Mobile/AllGames.scss';
import Panel from '../../../components/Panel/Panel';
import Text from '../../../components/Text/Text';
import Link from '../../../components/Link/Link';
import LiveFeedTable from '../../../routes/welcome/WelcomeLiveFeed/LiveFeedTable/LiveFeedTable';
import { cn } from '../../../utils/bem-css-module';
import Layout33Content from '../../../components/Layout/Mobile/containers/Layout33Content';
import WelcomeHeader from '../../welcome/Header/WelcomeHeader';


const cnAllGames = cn(s, 'AllGames');

const AllGamesMobile: React.FC = ({ }) => {

    useStyles(s);

        return (

            <Layout33Content
                centerContent={
                    <div className={cnAllGames('Row')}>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>

                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>

                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/classic">
                            <img src="/wheel.45b409c3.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Classic</h2>
                        </Link>
                    </div>
                    <div className={cnAllGames('Game')}>
                        <Link to="/mines">
                            <img src="/mines.185b60b6.png" alt="" />
                            <h2 className={cnAllGames('Title')}>Mines</h2>
                        </Link>
                    </div>
                   
                </div>
                }
            />
            
        );
};

export default AllGamesMobile;
