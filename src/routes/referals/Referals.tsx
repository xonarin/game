import React, { useState } from 'react';

import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import ReferalsMobile from './Mobile/Referals';
import ReferalsWeb from './Web/Referals';

const Referals: React.FC = () => {
    const [mobile, setMobile] = useState(false);
    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 900
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    if (mobile) {
        return <ReferalsMobile />;
    }

    return <ReferalsWeb />;
};

export default Referals;
