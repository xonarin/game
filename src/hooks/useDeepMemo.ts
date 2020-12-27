import { DependencyList, useMemo } from 'react';

import useDeepRef from './useDeepRef';

const isPrimitive = (val: unknown) => val == null || /^[sbn]/.test(typeof val);

const checkDeps = (deps: DependencyList) => {
    if (!deps || !deps.length) {
        throw new Error('useDeepMemo should not be used with no dependencies. Use React.useMemo instead.');
    }
    if (deps.every(isPrimitive)) {
        throw new Error(
            'useDeepMemo should not be used with dependencies that are all primitive values. Use React.useMemo instead.',
        );
    }
};

const useDeepMemo = <T>(factory: () => T, deps: DependencyList): T => {
    if (process.env.NODE_ENV !== 'production') {
        checkDeps(deps);
    }

    return useMemo<T>(factory, useDeepRef<DependencyList>(deps).current);
};

export const useDeepMemoNoCheck = <T>(factory: () => T, deps: DependencyList): T => {
    return useMemo<T>(factory, useDeepRef<DependencyList>(deps).current);
};

export default useDeepMemo;
