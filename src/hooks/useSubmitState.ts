import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import useRefState from './useRefState';

type UseSubmitStateResult<T> = [T, Dispatch<SetStateAction<T>>, T, () => void];

const useSubmitState = <T>(initialValue: T): UseSubmitStateResult<T> => {
    const [value, setValue, valueRef] = useRefState(initialValue);
    const [submittedValue, setSubmittedValue] = useState(initialValue);

    const onSubmit = useCallback(() => {
        setSubmittedValue(valueRef.current);
    }, [valueRef]);

    return [value, setValue, submittedValue, onSubmit];
};

export default useSubmitState;
