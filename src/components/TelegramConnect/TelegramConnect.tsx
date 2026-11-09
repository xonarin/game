import React, { useContext, useEffect, useRef } from 'react';
import useStyles from 'isomorphic-style-loader/useStyles';

import s from './TelegramConnect.scss';
import { cn } from '../../utils/bem-css-module';
import AppContext from '../../context';
import useMeQuery from '../../hooks/graphql/users/useMeQuery';

const cnTelegramConnect = cn(s, 'TelegramConnect');

const STATUS_TEXT: Record<string, string> = {
    linked: 'Telegram подключён.',
    taken: 'Этот Telegram уже привязан к другому аккаунту.',
    error: 'Не удалось подключить Telegram. Попробуйте ещё раз.',
    disabled: 'Подключение Telegram пока недоступно.',
};

/** Telegram login widget that connects a Telegram account to the current user (for the bonus). */
const TelegramWidget: React.FC<{ bot: string }> = ({ bot }) => {
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
        script.setAttribute('data-auth-url', `${window.location.origin}/auth/telegram/link`);
        container.appendChild(script);

        return () => {
            container.innerHTML = '';
        };
    }, [bot]);

    return <div ref={ref} className={cnTelegramConnect('Widget')} />;
};

const TelegramConnect: React.FC = () => {
    useStyles(s);

    const { me } = useMeQuery();
    const { authProviders, query } = useContext(AppContext);
    const bot = authProviders?.telegramBot || null;
    const status = query && typeof query.telegram === 'string' ? query.telegram : undefined;

    // Nothing to do if Telegram is not configured or already linked.
    if (!bot || !me || me.telegramLinked) {
        return status && STATUS_TEXT[status] ? (
            <div className={cnTelegramConnect()}>
                <div className={cnTelegramConnect('Status')}>{STATUS_TEXT[status]}</div>
            </div>
        ) : null;
    }

    return (
        <div className={cnTelegramConnect()}>
            <div className={cnTelegramConnect('Text')}>
                Чтобы получать бонусы, подключите Telegram, подпишитесь на наш канал и запустите бота.
            </div>
            {status && STATUS_TEXT[status] && <div className={cnTelegramConnect('Status')}>{STATUS_TEXT[status]}</div>}
            <TelegramWidget bot={bot} />
        </div>
    );
};

export default TelegramConnect;
