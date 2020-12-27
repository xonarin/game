import { DependencyList, EffectCallback, useEffect } from 'react';

import useDeepRef from './useDeepRef';

const isPrimitive = (val: unknown) => val == null || /^[sbn]/.test(typeof val);

const checkDeps = (deps: DependencyList) => {
    if (!deps || !deps.length) {
        throw new Error('useDeepEffect should not be used with no dependencies. Use React.useEffect instead.');
    }
    if (deps.every(isPrimitive)) {
        throw new Error(
            'useDeepEffect should not be used with dependencies that are all primitive values. Use React.useEffect instead.',
        );
    }
};

const useDeepEffect = (callback: EffectCallback, deps: DependencyList) => {
    if (process.env.NODE_ENV !== 'production') {
        checkDeps(deps);
    }

    useEffect(callback, useDeepRef<DependencyList>(deps).current);
};

export const useDeepEffectNoCheck = (callback: EffectCallback, deps: DependencyList) => {
    useEffect(callback, useDeepRef<DependencyList>(deps).current);
};

export default useDeepEffect;
