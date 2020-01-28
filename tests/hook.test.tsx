import React, { useState } from 'react';
import {mount} from 'enzyme';

import useWithCallback from '../src';


type FooProps = {
    handleCounter: (n: number) => void,
    handleClick: () => void,
    handleMouseEnter: () => void
}

const Foo: React.FC<FooProps> = ({handleCounter, handleClick, handleMouseEnter}) => {
    const [counter, setCounter] = useState(0);

    const withIncrement = useWithCallback(() => setCounter(x => x + 1), []);
    const withHandleCounter = useWithCallback(() => handleCounter(counter), [counter]);

    return(
        <div onClick={withHandleCounter(handleClick)}
             onMouseEnter={withIncrement(withHandleCounter(handleMouseEnter))}/>
    );
}

describe('useWithCallback', function() {
    let handleCounter = jest.fn();
    let handleClick = jest.fn();
    let handleMouseEnter = jest.fn();

    beforeEach(() => {
        handleCounter = jest.fn();
        handleClick = jest.fn();
        handleMouseEnter = jest.fn();
    });

    it('should call all callbacks', () => {
        const wrapper = mount(
            <Foo handleCounter={handleCounter}
                 handleClick={handleClick}
                 handleMouseEnter={handleMouseEnter}/>
        );

        wrapper.simulate('click');

        expect(handleCounter).toBeCalledWith(0);
        expect(handleClick).toBeCalled();
        expect(handleMouseEnter).not.toBeCalled();

        wrapper.simulate('mouseEnter');

        expect(handleCounter).toHaveBeenLastCalledWith(0);
        expect(handleMouseEnter).toBeCalled();

        wrapper.simulate('click');

        expect(handleCounter).toHaveBeenLastCalledWith(1);
    });

    it('should cache combined function', () => {
        const wrapper = mount(
            <Foo handleCounter={handleCounter}
                 handleClick={handleClick}
                 handleMouseEnter={handleMouseEnter}/>
        );

        const firstClickHandler = wrapper.children().props().onClick;
        const firstMouseEnterHandler = wrapper.children().props().onMouseEnter;

        // re-render
        wrapper.setProps({});

        const secondClickHandler = wrapper.children().props().onClick;
        const secondMouseEnterHandler = wrapper.children().props().onMouseEnter;

        expect(firstClickHandler).not.toEqual(firstMouseEnterHandler);
        expect(firstClickHandler).toEqual(secondClickHandler);
        expect(firstMouseEnterHandler).toEqual(secondMouseEnterHandler);
    });

    it('should apply sequentially,', () => {
        const Bar: React.FC<{handleClick: (n: number) => void}> = ({handleClick}) => {
            const [counter, setCounter] = useState(0);

            const withIncrement = useWithCallback(
                () => setCounter(prevCounter => prevCounter + 1),
                []
            );

            const withMultiply = useWithCallback(
                () => setCounter(prevCounter => prevCounter * 10),
                []
            );

            return (
                <div onClick={withIncrement(withMultiply(() => handleClick(counter)))}/>
            );
        };

        const wrapper = mount(
            <Bar handleClick={handleClick}/>
        );

        wrapper.simulate('click');

        expect(handleClick).toHaveBeenCalledWith(0);

        wrapper.simulate('click');

        expect(handleClick).toHaveBeenLastCalledWith(10);

        wrapper.simulate('click');

        expect(handleClick).toHaveBeenLastCalledWith(110);
    })
});
