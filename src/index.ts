import {useMemo, useCallback} from 'react';


type UseCallbackType = Parameters<typeof useCallback>;

function getEmptyMap() {
    return new WeakMap();
}

function useWithCallback(fn: UseCallbackType[0], deps: UseCallbackType[1]) {
    const memoizedFn = useCallback(fn, deps);
    const cache = useMemo(getEmptyMap, [memoizedFn]);

    const withFunction = <T extends Function>(func: T): T => {
        if (!cache.has(func)) {
             cache.set(
                func,
                (...args: any[]) => {
                    memoizedFn();

                    return func(...args);
                }
            );
        }

        return cache.get(func);
    }

    return withFunction;
}

export default useWithCallback;
