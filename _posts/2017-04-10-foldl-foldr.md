---
title: "foldl, foldr, and associative order"
layout: default
tags: [allonge]
---

[![Star](/assets/images/star.jpg)](https://www.flickr.com/photos/ambs/2993482908)

JavaScript has a method on arrays called [reduce]. It's used for "reducing" a collection to a value of some kind.

[reduce]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce

For example, we can use it to "reduce" an array of numbers to the sum of the numbers:

```javascript
[1, 2, 3, 4, 5].reduce((acc, n) => acc + n)
  //=> 15
```

Another way to put it is to say that reduce **folds** the array into a single value.

If all we saw was stuff like summing the elements of arrays, we might think that "folding" is about taking a collections of things and turning it into just one of those things. Like turning an array of numbers into a number. But not so! Folding can produce any arbitrary value.

For example, mapping can be implemented as folding. Here we fold an array of numbers into an array of the squares of the numbers:

```javascript
[1, 2, 3, 4, 5].reduce((acc, n) => acc.concat([n*n]), [])
  //=> [1, 4, 9, 16, 25]
```

### foldl

`.reduce` is handy, but it's not the whole story. It's a method on arrays, and we might have lots of collections that aren't arrays. We ought to be able to fold any iterable. Here's a function that makes iterables:

```javascript
const range = function * (fromNumber, toNumber) {
  for (let i = fromNumber; i <= toNumber; ++i) yield i;
}

for (const n of range(1, 5)) {
  console.log(n);
}

  //=>
    1
    2
    3
    4
    5
```

This can be useful, but it doesn't work with `.reduce`:

```javascript
range(1, 5).reduce((acc, n) => acc + n)
  //=> range(1, 5).reduce is not a function.
```

So let's write our own fold. We're going to call it `foldl`:

```javascript
function foldl (iterable, foldFunction) {
  const iterator = iterable[Symbol.iterator]();

  let { value: folded, done } = iterator.next();

  while (!done) {
    for (const element of iterator) {
      folded = foldFunction(folded, element);
    }

    return folded;
  }
}

foldl(range(1, 5), (acc, n) => acc + n)
  //=> 15
```

This works with any iterable, including arrays:

```javascript
console.log(foldl([1, 2, 3, 4, 5], (acc, n) => acc + n))
  //=> 15
```

Note that it _consumes_ the elements from the left of the collection. It has to, because iterables can only be consumed from the left. This is clear from `range`, because at the moment we write `range(1, 5)`, none of the elements exist yet. It is only by taking them one by one that the next one is calculated.[^caveat]

[^caveat]: Like `.reduce`, `foldl` is usually written to accomodate an optional seed. Feel free to rewrite `foldl` to allow for calls like `foldl(array, (acc, n) => acc + n, 0)`.

But `foldl` is not called `foldl` because it consumes its elements from the left. It's called `foldl` because it associates its folding function from the left. To see what we mean, let's do a fold where the order of application is very clear.

Let's start with the idea of *composing* two functions, each of which takes one argument:

```javascript
const compose2 = (x, y) => z => x(y(z));
```

We can see that the order in which we compose two functions matters:

```javascript
const increment = x => x + 1;
const square = x => x * x;
const half = x => x / 2;

compose2(increment, square)(3)
  //=> 10

compose2(half, increment)(3)
  //=> 2
```

`compose2(increment, square)` is the "increment" of the "square" of a number. In our case, that's `(3 * 3) + 1`. Whereas `compose2(half, increment)` is the "half" of the "increment" of a number. In our case, that's `(3 + 1) / 2`.

If we want to compose more than two functions, we can use `foldl` for that:

```javascript
const compose = (...fns) => foldl(fns, compose2);

compose(half, increment, square)(3)
  //=> 5
```

We've taken the half of the increment of the square of three. This is how `compose` works. It's equivalent to writing `compose2(compose2(half, increment), square)`:

```javascript
compose2(compose2(half, increment), square)(3)
  //=> 5
```

So we can see what we mean by saying it is "left-associative." Given elements `a`, `b`, `c`, and `d`, `foldl` applies the folding function like this: `(((a b) c) d)`.

### foldr

We composed `half` with `increment`, then composed the result with `square`. Works like a charm. But that being said, it can be difficult to follow. So sometimes, we want to apply the functions in order from left to right. This is called `pipeline` in [JavaScript Allongé][ja].

[ja]: https://leanpub.com/javascriptallongesix

To make `pipeline` our of `compose2`, we want to associate the folding function from right to left. That is to say, given `pipeline(half, increment, square)(4)`, we want to compose `square` with `increment`, and then compose the result with `half`, like this: `(half (increment square))`. There are a few ways to write `pipeline` without using a fold, but since we're talking about folding, we'll make `pipeline` with a fold.

`foldl` won't do, because it associates the folding function from the left. What we want is the opposite, `foldr`. Here's a recursive version:[^foldrlimit]

[^foldrlimit]: This particular implementation does not work if the fold function ever deliberately returns `undefined`. An implementation that gracefully accommodates this scenario is left as an exercise for the reader.

```javascript
function foldr (iterable, foldFunction) {
  const iterator = iterable[Symbol.iterator]();

  let { value: first, done } = iterator.next();

  if (!done) {
    const foldedRemainder = foldr(iterator, foldFunction);

    if (foldedRemainder === undefined) {
      return first;
    } else {
      return foldFunction(foldedRemainder, first);
    }
  }
}
```

Although it consumes its elements from the left, thanks to the recursive call, it associates them from the right. Let's check its behaviour:

```javascript
const pipeline = (...fns) => foldr(fns, compose2);

pipeline(half, increment, square)(4)
  //=> 9
```

We are indeed taking the half of four, incrementing that, and squaring the result. So while `foldl` is left associative, `(((a b) c) d)`, `foldr` is right-associative, `(a (b (c d)))`.

### the bottom line

If we look at the implementation of `foldr` and think about stacks and recursion and so on, we can come to the conclusion that while `foldr` does associate the folding function from the right, it actually applies the folding function from the left, it's just that we've used recursion and the call stack to reverse the order of elements.

This is true in a certain sense, but it's really just an implementation detail. The point is to understand the semantics of `foldl` and `foldr`, and the semantics are:

- Both `foldl` and `foldr` consume from the left. And thus, they can be written to consume iterables.
- `foldl` associates its folding function from the left.
- `foldr` associates its folding function from the right.

In sum, the order of *consuming* values and the order of *associating* a folding function are two separate concepts.

---

### notes

I'm working on a new book. Have a look at [Raganwald's Tooling for Turing Machines](https://leanpub.com/tooling) and let me know if you're interested. Thanks!


