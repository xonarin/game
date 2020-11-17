import { useContext } from 'react';

import AppContext from '../context';

const useIsOnPath = (pathname: string, isSoft?: boolean) => {
    const appContext = useContext(AppContext);

    return isSoft ? new RegExp(`^${pathname}`).test(appContext.pathname) : appContext.pathname === pathname;
};

export default useIsOnPath;
