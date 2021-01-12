import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './WelcomeHeader.scss';
import { cn } from '../../../../utils/bem-css-module';
import logoImg from './logo.svg';
import Button from '../../../../components/Button/Button';
import Link from '../../../../components/Link/Link';

const cnWelcomeHeader = cn(s, 'WelcomeHeader');

const WelcomeHeader = () => {
    useStyles(s);

    return (
        <header className={cnWelcomeHeader()}>
            <div className={cnWelcomeHeader('Container')}>
                <Link className={cnWelcomeHeader('Logo')} to="/">
                    <img className={cnWelcomeHeader('Logo')} src={logoImg} alt="Рулетка" />
                </Link>
                <div className={cnWelcomeHeader('Buttons')}>
                    <Button className={cnWelcomeHeader('ButtonsAuth')} weight="normal">
                        <a className={cnWelcomeHeader('ButtonsLinkAuth')} href="/auth/vk">
                            Войти
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default WelcomeHeader;
