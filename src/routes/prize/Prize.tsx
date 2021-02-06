import React, { useState } from 'react';

import useIsomorphicLayoutEffect from '../../hooks/useIsomorphicLayoutEffect';
import PrizeMobile from './Mobile/PrizeMobile';
import PrizeWeb from './Web/PrizeWeb';
import Layout34ContentWithChat from '../../components/Layout/Web/containers/Layout34ContentWithChat';

export interface PrizeProps {
    chatId: string;
}

const Prize: React.FC<PrizeProps> = ({ chatId }) => {
    const [mobile, setMobile] = useState(false);

    useIsomorphicLayoutEffect(() => {
        if (
            typeof window !== 'undefined' &&
            typeof window.document !== 'undefined' &&
            typeof window.document.createElement !== 'undefined' &&
            window.screen.width < 992
        ) {
            setMobile(true);
        }
    }, [typeof window !== 'undefined' && window?.screen?.width]);

    if (mobile) {
        return <PrizeMobile />;
    }

    return <Layout34ContentWithChat chatId={chatId} title="Prize" centerContent={<PrizeWeb />} bottomContent="" />;
};

export default Prize;
