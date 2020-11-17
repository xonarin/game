import { isEqual } from 'lodash';
import { useRef } from 'react';

const useDeepRef = <T>(value: T) => {
    const ref = useRef<T>(value);

    if (!isEqual(value, ref.current)) {
        ref.current = value;
    }

    return ref;
};

export default useDeepRef;
