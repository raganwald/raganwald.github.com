---
title: "A quick look at reduce, foldl, foldr, and associative order"
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

And if we can map an array with a fold, we can also filter an array with a fold:

```javascript
[1, 2, 3, 4, 5].reduce((acc, n) => n % 2 === 0 ? acc.concat([n]) : acc, [])
  //=> [2, 4]
```

Folding is a very fundamental kind of iteration over a collection. It can be used in many other ways, but let's move along and talk about what kinds of collections we might want to fold.

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
foldl([1, 2, 3, 4, 5], (acc, n) => acc + n)
  //=> 15
```

Note that it _consumes_ the elements from the left of the collection. It has to, because iterables can only be consumed from the left. This is clear from `range`, because at the moment we write `range(1, 5)`, none of the elements exist yet. It is only by taking them one by one that the next one is calculated.[^caveat]

[^caveat]: Like `.reduce`, `foldl` is usually written to accommodate an optional seed. Feel free to rewrite `foldl` to allow for calls like `foldl(array, (acc, n) => acc + n, 0)`.

But `foldl` is not called `foldl` because it consumes its elements from the left. It's called `foldl` because it associates its folding function from the left. To see what we mean, let's do a fold where the order of association is very clear.

### left-association

Let's start with the idea of *composing* two functions, each of which takes one argument:

```javascript
const compose2 = (x, y) => z => x(y(z));
```

Here are some examples of `compose2` in use:

```javascript
const half = x => x / 2;
const increment = x => x + 1;
const square = x => x * x;

compose2(half, increment)(3)
  //=> 2

compose2(increment, square)(3)
  //=> 10
```

`compose2(half, increment)` is the "half" of the "increment" of a number. In our case, that's `(3 + 1) / 2`. Whereas `compose2(increment, square)` is the "increment" of the "square" of a number. In our case, that's `(3 * 3) + 1`.

What about composing more than two functions? Before we write ourselves a "variadic" `compose` function, let's be sure we agree what we mean. `compose2(half, increment)(3)` means `half(increment(3))`, so `compose(half, increment, square)(3)` will mean `half(increment(square(3)))`.

Can we make `compose` out of `compose2`? Yes. If we want `half(increment(square(3)))`, we can use `compose2(compose2(half, increment), square)(3)`. And this generalizes! If we have four functions, `a`, `b`, `c`, and `d`, we can implement `compose(a, b, c, d)` with `compose2(compose2(compose2(a, b), c), d)`.

Can we build a function by applying a function to other functions? Naturally, that's one of JavaScript's Good Parts™. And we know how to build a value by repeatedly applying a function to a collection of values, we use `foldl`:

```javascript
const compose = (...fns) => foldl(fns, compose2);

compose(half, increment, square)(3)
  //=> 5
```

So we can see what we mean by saying it is "left-associative." Given elements `a`, `b`, `c`, and `d`, `foldl` associates the folding function like this: `(((a b) c) d)`. In the case of `compose`, it turns `compose(a, b, c, d)` into `compose2(compose2(compose2(a, b), c), d)`.

### foldr and right-association

We composed `half` with `increment`, then composed the result with `square`. Works like a charm. But that being said, it can be difficult to follow `compose` in programs. So sometimes, we want to apply the functions in order from left to right. This is called `pipeline` in [JavaScript Allongé][ja].

[ja]: https://leanpub.com/javascriptallongesix

To make `pipeline` our of `compose2`, we want to associate the folding function from right to left. That is to say, given `pipeline(half, increment, square)(4)`, we want to `compose2` `square` with `increment`, and then compose the result with `half`, like this: `compose2(half, compose2(increment square))`. There are a few ways to write `pipeline` without using a fold, but since we're talking about folding, we'll make `pipeline` with a fold.

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

We are indeed taking the half of four, incrementing that, and squaring the result. So while `foldl` is left associative, `(((a b) c) d)`, `foldr` is right-associative, `(a (b (c d)))`. And if we write `pipeline(a, b, c, d)`, we will get `compose2(a, compose2(b, compose2(c, d)))`.

### reduceRight

Right association is handy enough that JavaScript has something like it built in: `.reduceRight`. We can write `pipeline` with `.reduceRight`, because `fns` is an array:

```javascript
const pipeline = (...fns) => fns.reduceRight(compose2);

pipeline(half, increment, square)(4)
  //=> 9
```

`.reduceRight` is a method on arrays, and thus while it's incredibly useful when we have an array to work with, it can't be used on any arbitrary iterable. And while it makes no difference to writing functions like `pipeline`, it's still instructive to realize that it differs from `foldr` in that it achieves right-association by consuming its elements from the right, unlike `foldr`, that consumes its elements from the left.

### the bottom line

If we look at the implementation of `foldr` and think about stacks and recursion and so on, we can come to the conclusion that while `foldr` does associate the folding function from the right, it actually applies the folding function from the left, it's just that we've used recursion and the call stack to reverse the order of elements.

This is true in a certain sense, but it's really just an implementation detail. The point is to understand the semantics of `foldl` and `foldr`, and the semantics are:

- Both `foldl` and `foldr` consume from the left. And thus, they can be written to consume iterables.
- `foldl` associates its folding function from the left.
- `foldr` associates its folding function from the right.

In sum, the order of *consuming* values and the order of *associating* a folding function are two separate concepts.

And our takeaway about `reduce` and `reduceRight`? They're handy ways to fold arrays, but just arrays. When we want more, `foldl` and `foldr` are just a few lines of code. We can write them ourselves, or, if they are in a library, they're easy to understand.

(discuss on [/r/javascript](https://www.reddit.com/r/javascript/comments/64qv2a/a_quick_look_at_reduce_foldl_foldr_and/))

---

### notes

I'm working on a new book. Have a look at [Raganwald's Tooling for Turing Machines](https://leanpub.com/tooling) and let me know if you're interested. Thanks!


