import { useEffect, useRef, useState } from 'react';

const useLoadingState = <T>(initialValue: T) => {
    const initialValueRef = useRef<T>(initialValue);
    const [state, setState] = useState<T>(initialValue);

    useEffect(() => {
        if (initialValue !== initialValueRef.current) {
            setState(initialValue);
        }

        initialValueRef.current = initialValue;
    }, [initialValue]);

    return [state, setState] as const;
};

export default useLoadingState;
