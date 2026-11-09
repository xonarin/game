import { createContext } from 'react';
import { QueryParams } from 'universal-router';

export type GlobalChatType = 'game';

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
        telegramBot: string | null;
        dev: boolean;
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
