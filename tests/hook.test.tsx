import {useState} from 'react';
import {renderHook, act} from '@testing-library/react-hooks';

import useWithCallback from '../src';


function useSomeScenario(customCallback: Function) {
    const [counter, setCounter] = useState(0);

    const withIncrement = useWithCallback(() => setCounter(x => x + 1), []);
    const withDouble = useWithCallback(() => setCounter(x => 2 * x), []);

    return {
        increment: withIncrement(customCallback),
        double: withDouble(customCallback),
        incrementAndDouble: withIncrement(withDouble(customCallback)),
        doubleAndIncrement: withDouble(withIncrement(customCallback)),
        counter
    };
}

describe('useWithCallback', function() {
    it('passes arguments to callback', () => {
        const cbk = jest.fn();

        const {result} = renderHook(() => useSomeScenario(cbk));

        act(() => result.current.increment(1, 2));

        expect(cbk).toHaveBeenLastCalledWith(1, 2);

        act(() => result.current.double(3, 4));

        expect(cbk).toHaveBeenLastCalledWith(3, 4);

        act(() => result.current.incrementAndDouble(5, 6, 7));

        expect(cbk).toHaveBeenLastCalledWith(5, 6, 7);

        act(() => result.current.doubleAndIncrement(8));

        expect(cbk).toHaveBeenLastCalledWith(8);
    });

    it('caches combined function', () => {
        const cbk1 = jest.fn();
        const cbk2 = jest.fn();

        const {result, rerender} = renderHook(({cbk}: {cbk: Function}) => useSomeScenario(cbk), {
            initialProps: {
                cbk: cbk1
            }
        });

        const increment1 = result.current.increment;
        const double1 = result.current.double;
        const doubleAndIncrement1 = result.current.doubleAndIncrement;
        const incrementAndDouble1 = result.current.incrementAndDouble;

        rerender({cbk: cbk2});

        const increment2 = result.current.increment;
        const double2 = result.current.double;
        const doubleAndIncrement2 = result.current.doubleAndIncrement;
        const incrementAndDouble2 = result.current.incrementAndDouble;

        rerender({cbk: cbk1});

        const increment3 = result.current.increment;
        const double3 = result.current.double;
        const doubleAndIncrement3 = result.current.doubleAndIncrement;
        const incrementAndDouble3 = result.current.incrementAndDouble;

        expect(increment1).toBe(increment3);
        expect(increment1).not.toBe(increment2);

        expect(double1).toBe(double3);
        expect(double1).not.toBe(double2);

        expect(doubleAndIncrement1).toBe(doubleAndIncrement3);
        expect(doubleAndIncrement1).not.toBe(doubleAndIncrement2);

        expect(incrementAndDouble1).toBe(incrementAndDouble3);
        expect(incrementAndDouble1).not.toBe(incrementAndDouble2);
    });

    it('applies sequentially', () => {
        const cbk = jest.fn();

        const {result} = renderHook(() => useSomeScenario(cbk));

        act(() => result.current.increment());

        expect(result.current.counter).toBe(1);

        act(() => result.current.double());

        expect(result.current.counter).toBe(2);

        act(() => result.current.incrementAndDouble());

        expect(result.current.counter).toBe(6);

        act(() => result.current.doubleAndIncrement());

        expect(result.current.counter).toBe(13);
    });
});
