# Combine your callbacks with **useWithCallback** hook!

[![](https://img.shields.io/npm/v/react-use-with-callback)](https://www.npmjs.com/package/react-use-with-callback)
![](https://img.shields.io/github/actions/workflow/status/minhir/react-use-with-callback/nodejs.yml?branch=master)
[![](https://img.shields.io/coveralls/github/Minhir/react-use-with-callback)](https://coveralls.io/github/Minhir/react-use-with-callback)
![](https://img.shields.io/github/license/minhir/react-use-with-callback?color=blue)


```javascript
const Foo = ({handleA, handleB}) => {
    const [counter, setCounter] = useState(0);

    const withIncrement = useWithCallback(
        () => setCounter(prevCounter => prevCounter + 1),
        []
    );

    return (
        <Bar onA={withIncrement(handleA)}
             onB={withIncrement(handleB)}/>
    );
};
```

## How to use

```javascript
const Foo = ({func}) => {
    const fn = () => {...};

    // Pass a function and an array of dependencies (as well as `useCallback`).
    const withFn = useWithCallback(fn, []);

    // `withFn` accepts another function and return handler
    const handleClick = withFn(func);

    // On click action `fn` will be called and then `func`
    return <div onClick={handleClick}/>;
};
```

`withFn` returns a memoized value when receive a known function. This can help to prevent unnecessary renders. It could be a good idea to use  `useCallback` with `func`, before passing it inside `withFn`.

`withFn` is **not a hook**! So you can use it inside loops, clauses or jsx!

You can combine `withFn` together:

```javascript
const MyComponent = ({handleClick}) => {
    const [counter, setCounter] = useState(0);

    const withIncrement = useWithCallback(
        () => setCounter(prevCounter => prevCounter + 1),
        []
    );

    const withMultiply = useWithCallback(
        () => setCounter(prevCounter => prevCounter * 10),
        []
    );

    return <div onClick={withIncrement(withMultiply(handleClick))}/>
};
```

Result of click action step by step:

1. setCounter increases counter by 1. Here `counter = 1`.
2. setCounter multiplies counter by 10. Here `counter = 10`.
3. `handleClick` will be called.

# API

useWithCallback(fn, deps):

* *fn*: `() => any` — callback function
* *deps*: `any[]` — fn dependencies (same as in React `useCallback` hook)
* return *withFn*: `(func: T) => T` — combiner function
