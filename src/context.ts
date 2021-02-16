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
}

const AppContext = createContext<AppContextTypes>({
    pathname: '',
    domain: 'domain.io',
    query: {},
    params: {},
    chats: { game: '' },
});

export default AppContext;
