import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutHeader.scss';
import { cn } from '../../../../utils/bem-css-module';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import Balance from './Balance/Balance';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';
import Link from '../../../Link/Link';
import AnnouncementsWidget from './AnnouncementsWidget/AnnouncementsWidget';
import logoImg from './logo.svg';
import PreLoader from '../../../PreLoader/PreLoader';
const cnLayoutHeader = cn(s, 'LayoutHeader');

const LayoutHeaderMobile: React.FC = () => {
    useStyles(s);

    const { me, loading } = useMeQuery();

    if (loading) {
        return  <PreLoader/>
     
    
    }
    return (
        <header className={cnLayoutHeader()}>
            <div className={cnLayoutHeader('Container')}>
                <div className={cnLayoutHeader('Buttons')}>
                    <Link
                        className={cnLayoutHeader('Button')}
                        to="/"
                        render={isActive => (
                            <AlarmButton
                                className={cnLayoutHeader('InnerButton', { isActive })}
                                icon="prize"
                                iconHover="prizeWhite"
                                color="gray"
                            />
                        )}
                    />
                    <AnnouncementsWidget className={cnLayoutHeader('Button')} />
                </div>

                <img src={logoImg} alt="Рулетка" />

                <Balance money={me?.money || 0} />
            </div>
        </header>
    );
};

export default LayoutHeaderMobile;
