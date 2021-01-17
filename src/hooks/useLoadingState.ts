import { useEffect, useRef, useState } from 'react';

const useLoadingState = <T>(initialValue: T) => {
    const initialValueRef = useRef(initialValue);
    const [state, setState] = useState();

    useEffect(() => {
        if (initialValue !== initialValueRef.current) {
            setState(initialValue);
        }

        initialValueRef.current = initialValue;
    }, [initialValue]);

    return [state, setState];
};

export default useLoadingState;
