import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef } from 'react';

import useForceUpdate from './useForceUpdate';

type UseRefStateResult<T> = [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>];

const isSetStateFunc = <T>(value: SetStateAction<T>): value is (prevState: T) => T => {
    return typeof value === 'function' && value.length === 1;
};

const useRefState = <T>(initialValue: T): UseRefStateResult<T> => {
    const ref = useRef(initialValue);
    const forceUpdate = useForceUpdate();

    const setState = useCallback<Dispatch<SetStateAction<T>>>(
        value => {
            if (value === ref.current) return;

            if (isSetStateFunc(value)) {
                ref.current = value(ref.current);
            } else {
                ref.current = value;
            }

            forceUpdate();
        },
        [forceUpdate],
    );

    return [ref.current, setState, ref];
};

export default useRefState;
