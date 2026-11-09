import React, { useContext } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './LayoutHeader.scss';
import { cn } from '../../../../utils/bem-css-module';
import useMeQuery from '../../../../hooks/graphql/users/useMeQuery';
import HeaderNavigationItem from './NavigationItem/HeaderNavigationItem';
import Balance from './Balance/Balance';
import AlarmButton from '../../../Button/containers/AlarmButton/AlarmButton';
import MiniProfile from './MiniProfile/MiniProfile';
import Link from '../../../Link/Link';
import Button from '../../../Button/Button';
import AnnouncementsWidget from './AnnouncementsWidget/AnnouncementsWidget';
import PreLoader from '../../../PreLoader/PreLoader';
import AppContext from '../../../../context';

const cnLayoutHeader = cn(s, 'LayoutHeader');

const LayoutHeader: React.FC = () => {
    useStyles(s);

    const { user } = useContext(AppContext);
    const { me } = useMeQuery();

    const navigation = (
        <nav className={cnLayoutHeader('Navigation')}>
            <HeaderNavigationItem to="/" text="Лобби" icon="gamepad" iconHover="gamepadWhite" />
            <HeaderNavigationItem to="/tournaments" text="Турниры" icon="ingots" iconHover="ingotsWhite" />
            <HeaderNavigationItem to="/faq" text="FAQ" icon="faq" iconHover="faqWhite" />
        </nav>
    );

    // Guest: the lobby is public, offer to sign in instead of balance/profile
    if (!user) {
        return (
            <header className={cnLayoutHeader()}>
                <div className={cnLayoutHeader('Container')}>
                    {navigation}
                    <div className={cnLayoutHeader('AuthButtons')}>
                        <Button className={cnLayoutHeader('AuthButton')} color="bordered" weight="normal">
                            <a className={cnLayoutHeader('AuthLink')} href="/login">
                                Войти
                            </a>
                        </Button>
                        <Button className={cnLayoutHeader('AuthButton')} weight="normal">
                            <a className={cnLayoutHeader('AuthLink')} href="/login">
                                Регистрация
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
                {navigation}
                <div className={cnLayoutHeader('Right')}>
                    <Balance money={me?.money || 0} />
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
                    <MiniProfile username={me?.username || ''} avatar={me?.avatar || ''} />
                </div>
            </div>
        </header>
    );
};

export default LayoutHeader;
