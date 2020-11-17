import { useCallback, useState } from 'react';

type UseForceUpdateResult = () => void;

const useForceUpdate = (): UseForceUpdateResult => {
    const [, setState] = useState(Object.create(null));

    return useCallback(() => {
        setState(Object.create(null));
    }, []);
};

export default useForceUpdate;
