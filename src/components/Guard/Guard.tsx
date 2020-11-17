import React from 'react';

export interface GuardProps {
    isAllowed: boolean;
    children: React.ReactElement;
}

const Guard: React.FC<GuardProps> = ({ isAllowed, children }) => {
    if (!isAllowed) {
        return null;
    }

    return children;
};

export default Guard;
