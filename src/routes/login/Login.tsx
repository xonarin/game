import React, { useEffect, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './Login.scss';
import { cn } from '../../utils/bem-css-module';
import { AppContextTypes } from '../../context';

const cnLogin = cn(s, 'Login');

const ERROR_TEXT: Record<string, string> = {
    vk: 'Не удалось войти через VK ID. Попробуйте ещё раз.',
    vk_disabled: 'Вход через VK ID пока не настроен.',
    google: 'Не удалось войти через Google. Попробуйте ещё раз.',
    google_disabled: 'Вход через Google пока не настроен.',
    steam: 'Не удалось войти через Steam. Попробуйте ещё раз.',
    steam_disabled: 'Вход через Steam пока не настроен.',
    telegram: 'Не удалось подтвердить вход через Telegram. Попробуйте ещё раз.',
    telegram_disabled: 'Вход через Telegram пока не настроен.',
};

interface TelegramWidgetProps {
    bot: string;
}

/** Official Telegram Login Widget; it redirects to /auth/telegram/return on success. */
const TelegramWidget: React.FC<TelegramWidgetProps> = ({ bot }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return undefined;

        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', bot);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute('data-auth-url', `${window.location.origin}/auth/telegram/return`);
        container.appendChild(script);

        return () => {
            container.innerHTML = '';
        };
    }, [bot]);

    return <div ref={ref} className={cnLogin('Telegram')} />;
};

export interface LoginProps {
    providers: NonNullable<AppContextTypes['authProviders']>;
    error?: string;
}

const Login: React.FC<LoginProps> = ({ providers, error }) => {
    useStyles(s);

    const hasProviders = providers.vk || providers.google || providers.steam || Boolean(providers.telegramBot);

    // When a central auth broker is configured, every provider goes through it
    // (`${authServiceUrl}/go?from=<this site>&type=...`); otherwise use local /auth/* routes.
    const broker = providers.authServiceUrl;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const go = (type: string) => `${broker}/go?from=${encodeURIComponent(origin)}&type=${type}`;
    const link = (type: string, local: string) => (broker ? go(type) : local);

    return (
        <div className={cnLogin()}>
            <div className={cnLogin('Card')}>
                <h1 className={cnLogin('Title')}>Вход</h1>
                <p className={cnLogin('Subtitle')}>Выберите удобный способ входа или регистрации</p>

                {error && <div className={cnLogin('Error')}>{ERROR_TEXT[error] || 'Не удалось войти.'}</div>}

                {providers.vk && (
                    <a className={cnLogin('Vk')} href={link('vk', '/auth/vk')}>
                        Войти через VK ID
                    </a>
                )}

                {providers.google && (
                    <a className={cnLogin('Google')} href={link('google', '/auth/google')}>
                        Войти через Google
                    </a>
                )}

                {providers.steam && (
                    <a className={cnLogin('Steam')} href={link('steam', '/auth/steam')}>
                        Войти через Steam
                    </a>
                )}

                {(providers.vk || providers.google || providers.steam) && providers.telegramBot && (
                    <div className={cnLogin('Divider')}>или</div>
                )}

                {providers.telegramBot &&
                    (broker ? (
                        <a className={cnLogin('Vk')} href={go('tg')}>
                            Войти через Telegram
                        </a>
                    ) : (
                        <TelegramWidget bot={providers.telegramBot} />
                    ))}

                {!hasProviders && <div className={cnLogin('Empty')}>Способы входа пока не настроены.</div>}

                {providers.dev && (
                    <form className={cnLogin('Dev')} method="get" action="/auth/dev">
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
