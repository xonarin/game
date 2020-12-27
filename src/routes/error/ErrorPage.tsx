import React from 'react';
import withStyles from 'isomorphic-style-loader/withStyles';

import s from './ErrorPage.scss';

interface ErrorProps {
    error?: {
        name: string;
        message: string;
        stack: string;
    };
}

export const ErrorPage: React.FC<ErrorProps> = ({ error }) => {
    if (__DEV__ && error) {
        return (
            <div>
                <h1>{error.name}</h1>
                <pre>{error.stack}</pre>
            </div>
        );
    }

    return (
        <div>
            <h1>Error</h1>
            <p>Sorry, a critical error occurred on this page.</p>
        </div>
    );
};

export default withStyles(s)(ErrorPage);
