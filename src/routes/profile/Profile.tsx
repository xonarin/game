import React, { useState } from 'react';

import ProfileWeb from './Web/Profile';

export interface ProfileWebProps {
    chatId: string;
}

const Profile: React.FC<ProfileWebProps> = ({ chatId }) => {
    //TODO сделать позже страницу для мобайла
    // const [mobile, setMobile] = useState(false);
    // useIsomorphicLayoutEffect(() => {
    //     if (
    //         typeof window !== 'undefined' &&
    //         typeof window.document !== 'undefined' &&
    //         typeof window.document.createElement !== 'undefined' &&
    //         window.screen.width < 900
    //     ) {
    //         setMobile(true);
    //     }
    // }, [typeof window !== 'undefined' && window?.screen?.width]);

    // if (mobile) {
    //     return <ReferalsMobile />;
    // }

    return <ProfileWeb chatId={chatId} />;
};

export default Profile;
