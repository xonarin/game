import { MutableRefObject, useEffect, useRef } from 'react';

const useCloneRef = <T>(ref: MutableRefObject<T | null> | Function | null) => {
    const clonedRef = useRef<T>(ref && typeof ref !== 'function' ? ref.current : null);

    useEffect(() => {
        if (typeof ref === 'object' && ref !== null) {
            // eslint-disable-next-line no-param-reassign
            ref.current = clonedRef.current;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, clonedRef.current]);

    return clonedRef;
};

export default useCloneRef;
