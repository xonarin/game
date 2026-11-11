import React from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Login.scss';
import { cn } from '../../utils/bem-css-module';
import { AppContextTypes } from '../../context';

const cnLogin = cn(s, 'Login');

const ERROR_TEXT: Record<string, string> = {
    auth: 'Не удалось войти. Попробуйте ещё раз.',
    not_admin: 'Этот аккаунт не является администратором.',
};

export interface LoginProps {
    providers: NonNullable<AppContextTypes['authProviders']>;
    error?: string;
}

const Login: React.FC<LoginProps> = ({ providers, error }) => {
    useStyles(s);

    // Social login goes entirely through the central auth service (plant-auth): each button
    // links straight to the broker, which runs the providers and redirects back to /auth/callback.
    const authServiceUrl = providers.authServiceUrl;
    const origin = providers.origin || (typeof window !== 'undefined' ? window.location.origin : '');
    const go = (type: string) => `${authServiceUrl}/go?from=${encodeURIComponent(origin)}&type=${type}`;

    if (!authServiceUrl) {
        return (
            <div className={cnLogin()}>
                <div className={cnLogin('Card')}>
                    <h1 className={cnLogin('Title')}>Вход</h1>
                    <div className={cnLogin('Empty')}>Способы входа пока не настроены.</div>
                </div>
            </div>
        );
    }

    return (
        <div className={cnLogin()}>
            <div className={cnLogin('Card')}>
                <h1 className={cnLogin('Title')}>Вход</h1>
                <p className={cnLogin('Subtitle')}>Выберите удобный способ входа или регистрации</p>

                {error && <div className={cnLogin('Error')}>{ERROR_TEXT[error] || 'Не удалось войти.'}</div>}

                <a className={cnLogin('Vk')} href={go('vk')}>
                    Войти через VK ID
                </a>
                <a className={cnLogin('Google')} href={go('google')}>
                    Войти через Google
                </a>
                <a className={cnLogin('Steam')} href={go('steam')}>
                    Войти через Steam
                </a>
                <a className={cnLogin('Telegram')} href={go('tg')}>
                    Войти через Telegram
                </a>

                {providers.dev && (
                    <form className={cnLogin('Dev')} method="get" action={`${authServiceUrl}/go`}>
                        <input type="hidden" name="type" value="dev" />
                        <input type="hidden" name="from" value={origin} />
                        <input
                            className={cnLogin('DevInput')}
                            name="user"
                            placeholder="dev1"
                            aria-label="Тестовый пользователь"
                        />
                        <button className={cnLogin('DevButton')} type="submit">
                            Dev вход
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
