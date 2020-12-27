import React, { ReactNode } from 'react';
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import StyleContext from 'isomorphic-style-loader/StyleContext';

import AppContext, { AppContextTypes } from '../context';

interface AppProps {
    client: ApolloClient<NormalizedCacheObject>;
    context: AppContextTypes;
    insertCss: Function;
    children: ReactNode;
}

const App: React.FC<AppProps> = ({ client, insertCss, context, children }) => (
    // NOTE: If you need to add or modify header, footer etc. of the app,
    // please do that inside the Layout component.
    <ApolloProvider client={client}>
        <AppContext.Provider value={context}>
            <StyleContext.Provider value={{ insertCss }}>{children}</StyleContext.Provider>
        </AppContext.Provider>
    </ApolloProvider>
);

export default App;
