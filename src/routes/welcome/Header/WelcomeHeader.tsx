import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeHeader.scss';
import { cn } from '../../../utils/bem-css-module';
import NavigationItem from './NavigationItem/NavigationItem';
import logoImg from './logo.svg';
import Button from '../../../components/Button/Button';
import Link from '../../../components/Link/Link';

const cnWelcomeHeader = cn(s, 'WelcomeHeader');

const WelcomeHeader = () => {
    useStyles(s);

    return (
        <header className={cnWelcomeHeader()}>
            <div className={cnWelcomeHeader('Container')}>
                <nav className={cnWelcomeHeader('Navigation')}>
                    <NavigationItem to="welcomeGames" text="Игры" icon="gamepad" iconHover="gamepadWhite" />
                    <NavigationItem to="welcomeCards" text="Турниры" icon="ingots" iconHover="ingotsWhite" />
                    <NavigationItem to="welcomeLiveFeed" text="Прямой эфир" icon="play" iconHover="playWhite" />
                </nav>
                <Link className={cnWelcomeHeader('Logo')} to="/">
                    <img className={cnWelcomeHeader('Logo')} src={logoImg} alt="Рулетка" />
                </Link>
                <div className={cnWelcomeHeader('Buttons')}>
                    <Button className={cnWelcomeHeader('ButtonsAuth')} color="bordered" weight="normal">
                        <a className={cnWelcomeHeader('ButtonsLinkAuth')} href="/auth/vk">
                            Войти
                        </a>
                    </Button>
                    <Button className={cnWelcomeHeader('ButtonsAuth')} weight="normal">
                        <a className={cnWelcomeHeader('ButtonsLinkAuth')} href="/auth/vk">
                            Регистрация
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default WelcomeHeader;
