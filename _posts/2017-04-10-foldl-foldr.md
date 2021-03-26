---
title: "foldl, foldr, and associative order"
layout: default
tags: [allonges]
published: true
---

![New And Improved](/assets/folding/new-and-improved.jpg)

*This essay originally appeared in 2017. Eagle-eyed readers pointed out that the original implementation of `foldr` had incorrect semantics. The essay has now been substantially revised to provide an implementation of `foldr` that is much closer to the one we find in lazy languages like Haskell.*

---

JavaScript has a method on arrays called [reduce]. It's used for "reducing" a collection to a value of some kind. Here we use it to "reduce" an array of numbers to the sum of the numbers:

[reduce]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce

```javascript
[1, 2, 3, 4, 5].reduce((x, y) => x + y, 0)
  //=> 15
```

Reduce **folds** the array into a single value. Mapping can be implemented as folding. Here we fold an array of numbers into an array of the squares of the numbers:

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

Folding is a very fundamental kind of operation on     a collection. It can be used in many other ways, but let's move along and talk about what kinds of collections we might want to fold.

### foldl

Let's write our own fold, `foldl`:

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

This is a recursive implementation. Thanks to almost every implementation of JavaScript punting on tail recursion optimization, there's no easy way to write a version that doesn't consume the stack in proportion to the number of elements being folded. Nevertheless, we'll work with the recursive implementation for now.[^tco]

[^tco]: Languages like Haskell and Scheme that support [tail call optimization](https://en.wikipedia.org/wiki/Tail_call) can automatically transform linear recursion into a loop. Since loops are not difficult to write, that doesn't seem like a big deal. But as we'll see when we write `foldr` below, having two different functions share the same general shape communicates their design and relationship. Writing one as a loop and the other recursively conceals that which should be manifest.

With `foldl` in hand, we can look at its commutative and associative properties.

### the commutative and associative properties

`foldl` _consumes_ the elements from the left of the collection.  But `foldl` is not called `foldl` because it consumes its elements from the left. It's called `foldl` because it associates its folding function from the left.

When we write `foldl((valueSoFar, current) => valueSoFar + current, 0, [1, 2, 3, 4, 5])`, we're computing the sum as if we wrote `(((((0 + 1) + 2) + 3) + 4) + 5)`:

```javascript
foldl((valueSoFar, current) => valueSoFar + current, 0, [1, 2, 3, 4, 5])
  //=> 15

(((((0 + 1) + 2) + 3) + 4) + 5)
  //=> 15
```

Addition is **commutative**, meaning that it makes no difference how we group the operations, we get the same result.  But not all operators are commutative.

Subtraction is not commutative, we get different results depending upon how we group or order the operations:

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

When we're working with finite iterables, `foldl` can be used to implement `map`:

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

`foldl` is eager, meaning it computes`mapl` cannot be used on an infinite iterable. With care, we *can* make a fold that handles infinite iterables, but we begin with `foldr` rather than `foldl`.

What we'll do is structure the code as with our eager version of `foldr`, but instead of passing the remainder of the computation to the folding function, we'll pass a [memoized thunks][thunk] of the remainder of the computation, and require the folding function to explicitly invoke the thunk when it needs to evaluate the computation.[^haskell]

[thunk]: https://en.wikipedia.org/wiki/Thunk
[^haskell]: Languages like Haskell that have lazy evaluation don't need any special treatment to make this work, but since JavaScript is an "eager" language, we have to make some adjustments.

This allows us to create a lazy `foldr`:

```javascript
const memoized = (fn, keymaker = JSON.stringify) => {
    const lookupTable = new Map();

    return function (...args) {
      const key = keymaker.call(this, args);

      return lookupTable[key] || (lookupTable[key] = fn.apply(this, args));
    }
  };

let foldr = (fn, valueToCompute, iterable) => {
  const iterator = iterable[Symbol.iterator]();
  const { value: current, done } = iterator.next();

  if (done) {
    return valueToCompute;
  } else {
    const toComputeThunk = memoized(
      () => foldr(fn, valueToCompute, iterator)
    );

    return fn(current, toComputeThunk);
  }
};

foldr(
  (current, toComputeThunk) => current + toComputeThunk(), 0, [1, 2, 3, 4, 5])
  //=> 15

foldr((current, toComputeThunk) => current - toComputeThunk(), 5, [0, 1, 2, 3, 4])
  //=> -3
```

Laziness won't help us sum an infinite series, so we won't try that. But we could use laziness to search a possibly infinite iterable:

```javascript
let first = (predicate, iterable) =>
  foldr(
    (current, toComputeThunk) =>
      predicate(current) ? current : toComputeThunk(),
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

And now to implement a lazy map. Our lazy map can take any iterable (whether bounded or unbounded) as an argument, and it always returns an iterable:[^lazycons]

```javascript
const lazycons = (value, iterableThunk) => {
  return function * conscell () {
    yield value;
    yield * iterableThunk();
  }();
};

let lazymap = (mapper, iterable) =>
  foldr(
    (current, toComputeThunk) =>
      lazycons(mapper(current), toComputeThunk),
    [],
    iterable
  );

[a, b, c, d, e, f, g] = lazymap(c => c * c, fibonacci());

[a, b, c, d, e, f, g]
  //=> [0, 1, 1, 4, 9, 25, 64]
```

[^lazycons]: `lazycons` implements a linked list of sorts, with each `conscell` generator yielding a single value and then invoking a thunk to get a generator for the remainder of its values. This arrangement creates a lazily computed iterable that optimizes for the simplicity of prepending elements to the list.

As we can see, the unique combination of consuming from the left and associating from the right makes the lazy version of `foldr` very useful for working with short-circuit semantics like `first`, or working with unbounded iterables like `fibonacci`.

### what we've learned about foldl, foldr, and foldr

As we've seen, the order of consuming values and the order of association are independent, and because they are independent, we get different semantics:

- Both `foldl` and `foldr` consume from the left. And thus, they can be written to consume iterables.
- `foldl` associates its folding function from the left.
- `foldr` associates its folding function from the right.
- Because `foldr` consumes from the left and associates from the right, a lazy implementation can provide short-circuit semantics and/or manage unbounded iterables.

In sum, the order of *consuming* values and the order of *associating* a folding function are two separate concepts, and they both matter.

We've also learned that `foldl` is best used when we want to eagerly evaluate a fold. We initially wrote it recursively, but were we working with it in production using a language like JavaScript that cannot optimize linear recursion, we would rewrite it as a loop, e.g.:

```javascript
let foldl = (fn, valueSoFar, iterable) => {
  for (const current of iterable) {
    valueSoFar = fn(valueSoFar, current);
  }

  return valueSoFar;
};
```

Likewise, we've learned that `foldr`'s semantics of consuming fromt he left but associating from the right make it ideal for lazy computations, such as working with short-circuit semantics or unbounded iterables. We are likely then to prefer to use the lazy implementation for `foldr`.

The final "rule of thumb" is this: *Use `foldl` for eager computations, `foldr` for lazy computations*.[^rot]

[^rot]: The English phrase **rule of thumb** refers to a principle with broad application that is not intended to be strictly accurate or reliable for every situation. It refers to an easily learned and easily applied procedure or standard, based on practical experience rather than theory. This usage of the phrase can be traced back to the seventeenth century and has been associated with various trades where quantities were measured by comparison to the width or length of a thumb. --[Wikipedia](https://en.wikipedia.org/wiki/Rule_of_thumb)

(Discuss on [/r/javascript](https://www.reddit.com/r/javascript/comments/mdntyc/foldl_foldr_and_associative_order/))

---

# Notes