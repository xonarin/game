import { memoize, throttle } from 'lodash';

export interface MemoizedThrottleSettings {
    leading?: boolean;
    trailing?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver?: (...args: any[]) => any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoizedThrottle = <T extends (...args: any[]) => any>(
    func: T,
    wait: number = 0,
    options: MemoizedThrottleSettings = {},
) => {
    const memoizedFunc = memoize(() => throttle(func, wait, options), options.resolver);

    // eslint-disable-next-line func-names
    return function(this: unknown, ...args: unknown[]) {
        // Powerful casting types (don't do like that)
        memoizedFunc.apply(this, args as []).apply(this, args as Parameters<T>);
    } as T;
};

export default memoizedThrottle;
