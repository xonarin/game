import { createContext } from 'react';

export type GlobalChatType = 'game';

/** Parsed URL query string (?a=1&b=2) */
export type QueryParams = Record<string, string | string[] | null | undefined>;

export interface AppContextTypes {
    pathname: string;
    domain: string;
    query?: QueryParams;
    params?: object;
    user?: Express.User;
    chats: Record<GlobalChatType, string>;
    // Sign-in methods available on /login (filled on the server, see src/auth)
    authProviders?: {
        vk: boolean;
        google: boolean;
        steam: boolean;
        telegramBot: string | null;
        telegramChannel: string | null;
        dev: boolean;
        authServiceUrl: string | null;
    };
}

const AppContext = createContext<AppContextTypes>({
    pathname: '',
    domain: 'domain.io',
    query: {},
    params: {},
    chats: { game: '' },
});

export default AppContext;
