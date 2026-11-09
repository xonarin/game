import React, { useContext } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutHeader.scss';
import { cn } from '../../../../utils/bem-css-module';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import Balance from './Balance/Balance';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';
import Link from '../../../Link/Link';
import Button from '../../../Button/Button';
import AnnouncementsWidget from './AnnouncementsWidget/AnnouncementsWidget';
import logoImg from './logo.svg';
import PreLoader from '../../../PreLoader/PreLoader';
import AppContext from '../../../../context';

const cnLayoutHeader = cn(s, 'LayoutHeader');

const LayoutHeaderMobile: React.FC = () => {
    useStyles(s);

    const { user } = useContext(AppContext);
    const { me } = useMeQuery();

    // Guest: the lobby is public, offer to sign in instead of balance/bonuses
    if (!user) {
        return (
            <header className={cnLayoutHeader()}>
                <div className={cnLayoutHeader('Container')}>
                    <Link to="/">
                        <img className={cnLayoutHeader('LogoImg')} src={logoImg} alt="Рулетка" />
                    </Link>
                    <div className={cnLayoutHeader('AuthButtons')}>
                        <Button className={cnLayoutHeader('AuthButton')} weight="normal">
                            <a className={cnLayoutHeader('AuthLink')} href="/login">
                                Войти
                            </a>
                        </Button>
                    </div>
                </div>
            </header>
        );
    }

    if (!me) {
        return <PreLoader />;
    }

    return (
        <header className={cnLayoutHeader()}>
            <div className={cnLayoutHeader('Container')}>
                <div className={cnLayoutHeader('Buttons')}>
                    <Link
                        className={cnLayoutHeader('Button')}
                        to="/bonuse"
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

                <Link to="/">
                    <img className={cnLayoutHeader('LogoImg')} src={logoImg} alt="Рулетка" />
                </Link>
                <Balance money={me?.money || 0} />
            </div>
        </header>
    );
};

export default LayoutHeaderMobile;
