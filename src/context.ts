import { createContext } from 'react';
import { QueryParams } from 'universal-router';

export interface AppContextTypes {
    pathname: string;
    domain: string;
    query?: QueryParams;
    params?: object;
    user?: Express.User;
    chats: Record<string, string>;
}

const AppContext = createContext<AppContextTypes>({
    pathname: '',
    domain: 'domain.io',
    query: {},
    params: {},
    chats: {},
});

export default AppContext;
