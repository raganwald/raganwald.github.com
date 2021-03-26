---
title: "foldl, foldr, and associative order"
layout: default
tags: [allonges]
published: true
---

![New And Improved](../assets/folding/new-and-improved.jpg)

JavaScript has a method on arrays called [reduce]. It's used for "reducing" a collection to a value of some kind.

[reduce]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce

For example, we can use it to "reduce" an array of numbers to the sum of the numbers:

```javascript
[1, 2, 3, 4, 5].reduce((x, y) => x + y, 0)
  //=> 15
```

Another way to put it is to say that reduce **folds** the array into a single value.

If all we saw was stuff like summing the elements of arrays, we might think that "folding" is about taking a collections of things and turning it into just one of those things. Like turning an array of numbers into a number. But not so! Folding can produce any arbitrary value.

For example, mapping can be implemented as folding. Here we fold an array of numbers into an array of the squares of the numbers:

```javascript
[1, 2, 3, 4, 5].reduce(
  (acc, n) => acc.concat([n*n]),
  []
)
  //=> [1, 4, 9, 16, 25]
```

And if we can map an array with a fold, we can also filter an array with a fold:

```javascript
[1, 2, 3, 4, 5].reduce(
  (acc, n) => n % 2 === 0 ? acc.concat([n]) : acc,
  []
)
  //=> [2, 4]
```

Folding is a very fundamental kind of iteration over a collection. It can be used in many other ways, but let's move along and talk about what kinds of collections we might want to fold.

### foldl

Let's write our own fold, `foldl`.

Here's a recursive version that uses destructuring. Thanks to almost every implementation of JavaScript punting on tail recursion optimization, there's no easy way to write a version that doesn't consume the stack in proportion to the number of elements being folded.

But from a discussion perspective, the structure will pay off in a few moments:

```javascript
let foldl = (fn, valueSoFar, iterable) => {
  const iterator = iterable[Symbol.iterator]();
  const { value: current, done } = iterator.next();

  if (done) {
    return valueSoFar;
  } else {
    return foldl(fn, fn(valueSoFar, current), iterator);
  }
};

foldl((valueSoFar, current) => valueSoFar + current, 0, [1, 2, 3, 4, 5])
  //=> 15
```

Now let's talk associativity.

### the commutative and associative properties

`foldl` _consumes_ the elements from the left of the collection.  But `foldl` is not called `foldl` because it consumes its elements from the left. It's called `foldl` because it associates its folding function from the left.

When we write `foldl((valueSoFar, current) => valueSoFar + current, 0, [1, 2, 3, 4, 5])`, we're computing the sum as if we wrote `(((((0 + 1) + 2) + 3) + 4) + 5)`:

```javascript
foldl((valueSoFar, current) => valueSoFar + current, 0, [1, 2, 3, 4, 5])
  //=> 15

(((((0 + 1) + 2) + 3) + 4) + 5)
  //=> 15
```

Addition is **commutative**, meaning that it makes no difference how we group the operations, we get the same result.  But not all operators are commutative. Subtraction is not commutative, we get different results depending upon how we group or order the operations:

```javascript
(((((0 - 1) - 2) - 3) - 4) - 5)
  //=> -15

(0 - (1 - (2 - (3 - (4 - 5)))))
  //=> -3
```

Because subtraction is not commutative, if we write an expression without explicitly forcing the order of operations with parentheses, we leave the order up to rules we arbitrarily establish about how we evaluate expressions.

How does JavaScript associate expressions by default? That's easy to test:

```javascript
0 - 1 - 2 - 3 - 4 - 5
  //=> -15
```

We say that JavaScript is **left-associative**, meaning that given an expression like `0 - 1 - 2 - 3 - 4 - 5`, JavaScript always evaluates it as if we wrote `(((((0 - 1) - 2) - 3) - 4) - 5))`.

And likewise, we say that `foldl` is left-associative, because when we write `foldl((valueSoFar, current) => valueSoFar - current, 0, [1, 2, 3, 4, 5])`, we get the same result as if we wrote `(((((0 - 1) - 2) - 3) - 4) - 5))`:

```javascript
(((((0 - 1) - 2) - 3) - 4) - 5)
  //=> -15

foldl((valueSoFar, current) => valueSoFar - current, 0, [1, 2, 3, 4, 5])
  //=> -15
```

But that's not always what we want. Sometimes, we want to fold an iterable with **right-associative semantics**.

With right-associative semantics, `0 - 1 - 2 - 3 - 4 - 5` would be evaluated as if we wrote `(0 - (1 - (2 - (3 - (4 - 5)))))`. And if we had a fold function with right-associative semantics--let's call it `foldr`--then we would expect:

```javascript
(0 - (1 - (2 - (3 - (4 - 5)))))
  //=> -3

foldr((current, valueToCompute) => current - valueToCompute, 5, [0, 1, 2, 3, 4])
  //=> -3
```

Note that with `foldl`, we supplied `0` as an initial value and `[1, 2, 3, 4, 5]` as the iterable, because we associate from the left. With `foldr`, we supplied `5` as the initial value, and `[0, 1, 2, 3, 4]` as the iterable, because `foldr` associates from the right, and thus the first thing we want it to evaluate will be `4 - 5`.

We can write `foldr` just like `foldl`, but with one small change:

```javascript
let foldr = (fn, valueToCompute, iterable) => {
  const iterator = iterable[Symbol.iterator]();
  const { value: current, done } = iterator.next();

  if (done) {
    return valueToCompute;
  } else {
    valueToCompute = foldr(fn, valueToCompute, iterator);

    return fn(current, valueToCompute);
  }
};

foldr((current, valueToCompute) => current - valueToCompute, 5, [0, 1, 2, 3, 4])
  //=> -3
```

Although it consumes its elements from the left, `foldr` associates its operations from the right.

### hard work pays off in the future;<br/>laziness pays off right away

When we're working with finite iterables, `foldl` can be used to implement `map` just as `reduce` can be used to implement `map`:

```javascript
let mapl = (fn, iterable) =>
  foldl(
    (valueSoFar, current) => valueSoFar.concat([fn(current)]),
    [],
    iterable
  );

mapl(current => current * current, [1, 2, 3, 4, 5])
  //=> [1, 4, 9, 16, 25]
```

`mapl` cannot be used on an infinite iterable. With care, we *can* make a fold that handles infinite iterables, but we begin with `foldr` rather than `foldl`. Languages like Haskell that have lazy evaluation don't need any special treatment to make this work, but since JavaScript is an "eager" language, we have to make some adjustments.

What we'll do is structure the code as with our eager version of `foldr`, but instead of passing the remainder of the computation to the folding function, we'll pass [memoized thunks][thunk], and require the folding function to invoke the thunks when it needs them.

[thunk]: https://en.wikipedia.org/wiki/Thunk

This allows us to create a lazy `foldr`:

```javascript
const memoized = (fn, keymaker = JSON.stringify) => {
    const lookupTable = new Map();

    return function (...args) {
      const key = keymaker.call(this, args);

      return lookupTable[key] || (lookupTable[key] = fn.apply(this, args));
    }
  };

let lazyfoldr = (fn, valueToCompute, iterable) => {
  const iterator = iterable[Symbol.iterator]();
  const { value: current, done } = iterator.next();

  if (done) {
    return valueToCompute;
  } else {
    const currentThunk = () => current;
    const toComputeThunk = memoized(
      () => lazyfoldr(fn, valueToCompute, iterator)
    );

    return fn(currentThunk, toComputeThunk);
  }
};

lazyfoldr(
  (currentThunk, toComputeThunk) => currentThunk() + toComputeThunk(), 0, [1, 2, 3, 4, 5])
  //=> 15

lazyfoldr((currentThunk, toComputeThunk) => currentThunk() - toComputeThunk(), 5, [0, 1, 2, 3, 4])
  //=> -3
```

Laziness won't help us sum an infinite series, so we won't try that. But we could use laziness to search a possibly infinite iterable:

```javascript
let first = (predicate, iterable) =>
  lazyfoldr(
    (currentThunk, toComputeThunk) =>
      predicate(currentThunk()) ? currentThunk() : toComputeThunk(),
    undefined,
    iterable
  );

let fibonacci = function * () {
  let a = 0;
  let b = 1;
  let c;

  while (true) {
    yield a;

    ([a, b] = [b, a + b]);
  }
}

first(n => n > 0 && n % 7 === 0, fibonacci())
  //=> 21
```

It's counter-intuitive that associating operations to the right makes working with infinite iterables possible, but `foldr` is quite explicit about separating the current value from the remainder of the computations to be performed, and since it consumes elements from the left, it can stop at any time by not evaluating the thunk representing the remainder of the computation.

And now to implement a lazy map:

```javascript
let prependToThunk = (value, iterableThunk) => {
  return function * () {
    yield value;
    yield * iterableThunk();
  }();
};

let lazymap = (mapper, iterable) =>
  lazyfoldr(
    (currentThunk, toComputeThunk) =>
      prependToThunk(mapper(currentThunk()), toComputeThunk),
    [],
    iterable
  );

[a, b, c, d, e, f, g] = lazymap(c => c * c, fibonacci());

[a, b, c, d, e, f, g]
  //=> [0, 1, 1, 4, 9, 25, 64]
```

As we can see, the unique combination of consuming from the left and associating from the right makes the lazy version of `foldr` very useful for working with short-circuit semantics like `first`, or working with unbounded iterables like `fibonacci`.

### what we've learned about foldl, foldr, and lazyfoldr

As we've seen, the order of consuming values and the order of association are independent, and because they are independent, we get different semantics:

- Both `foldl` and `foldr` consume from the left. And thus, they can be written to consume iterables.
- `foldl` associates its folding function from the left.
- `foldr` associates its folding function from the right.
- Because `foldr` consumes from the left and associates from the right, a lazy implementation--lazyfoldr--can provide short-circuit semantics and/or manage unbounded iterables.

In sum, the order of *consuming* values and the order of *associating* a folding function are two separate concepts, and they both matter.

