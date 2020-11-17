import React, { useEffect, useState } from 'react';

import Guard from '../Guard';

export interface DelayedGuardProps {
    children: React.ReactElement;
}

const DelayedGuard: React.FC<DelayedGuardProps> = ({ children }) => {
    const [isShow, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    return <Guard isAllowed={isShow}>{children}</Guard>;
};

export default DelayedGuard;
