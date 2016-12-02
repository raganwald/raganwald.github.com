---
title: "Anamorphisms in JavaScript"
layout: default
tags: [allonge]
---

[![Eric Gjerde's Twist Star Unfolded](/assets/images/twist-star.jpg)](https://www.flickr.com/photos/georigami/7304363050)

*Eric Gjerde's Twist Star Unfolded, © 2012 [Jorge Jaramillo](https://www.flickr.com/photos/georigami/), [Some rights reserved][cc-by-2.0]*

---

### preamble: unfolds and folds

[Anamorphisms][anamorphism] are functions that map from some object to a more complex structure containing the type of the object. For example, mapping from an integer to a list of integers. Here's such an anamorphism:

```javascript
function oneTo(n) {
  const list = [];

  for (let i = 1; i <= n; ++i) {
    list.push(i);
  }

  return list;
}

oneTo(5)
  //=> [ 1, 2, 3, 4, 5 ]
```

An integer is our object, and the array containing integers is our "structure containing integers." Maps from integers to arrays of integers are anamorphisms. "Anamorphism" is a very long word, and using it implies that we are going to be strict about following category theory. So let's use a simpler word that has some poetic value: **Unfold**. Anamorphisms "unfold" values. I like to think of the integer `5` has having all the whole numbers less than five folded up inside itself.

So we'll use the word "unfold" from now on.


Unfolds (or anamorphisms) are the dual—a fancy word for _complement_—of [Catamorphisms][catamorphism], functions that map from some complex structure down to a simpler object. Here's a catamorphism:

```javascript
function product(list) {
  let product = 1;

  for (const n of list) {
    product *= n;
  }

  return product;
}

product(oneTo(5))
  //=> 120
```

"Catamorphism" is another long word that implies that we are going to be strict about following category theory. So let's call these things **folds* instead. We can think of `product` as _folding_ a list of integers into a single integer.

So we can say that our `product` function "folds a list of integers into an integer."

---

### folding and unfolding with generators

Unfolding a number into a list is questionable practice. It takes up a lot of space, and we just want to iterate over it, as we did above with `factorial`. Well, we can unfold it into a finite iteration with a generator:

```javascript
function * oneTo(n) {
  for (let i = 1; i <= n; ++i) {
    yield i;
  }
}

[...oneTo(5)]
  //=> [ 1, 2, 3, 4, 5 ]
```

Remember our `product` definition? Thanks to the way a `for... of` loop works in JavaScript, it folds any iterable of integers:

```javascript
function product(iterable) {
  let product = 1;

  for (const n of iterable) {
    product *= n;
  }

  return product;
}

product(oneTo(5))
  //=> 120
```

Folding and unfolding work very well with iterators.

---

### generalizing folds

We know that there is a very handy way to fold arrays, we can use the `.reduce` method:

```javascript
function product(list) {
  return list.reduce((acc, n) => acc * n, 1);
}

product(oneTo(5))
  //=> 120

const factorial = (n) => product(oneTo(n));
```

The two problems we have with `.reduce` are that first, it takes multiple arguments, and second, it is a method on arrays and not on everything iterable. But it's a useful pattern, and we can reproduce it by hand. Here we create a `foldWith` function that takes a folding function and a seed value, and gives us back a fold function. We use that to make our own `product` fold:

```javascript
function foldWithFnAndSeed(fn, seed) {
  return function fold (iterable) {
    let acc = seed;

    for (const element of iterable) {
      acc = fn(acc, element);
    }

    return acc;
  }
}

const product = foldWithFnAndSeed((acc, n) => acc * n, 1);

product(oneTo(5))
```

A variation uses the first element of the iterable as the seed, then iterates over the remainder. This is adequate for many purposes, including `product`:

```javascript
function foldWith(fn) {
  return function fold (iterable) {
    const iterator = iterable[Symbol.iterator]();
    let { value: acc } = iterator.next();

    for (const element of iterator) {
      acc = fn(acc, element);
    }

    return acc;
  }
}

const product = foldWith((acc, n) => acc * n);

product(oneTo(5))
```

---

### generalizing unfolds

Our `foldWith` function is handy, and we can use the same general idea for making unfolders. We want to end up with an `unfoldWith` function that takes, as its argument, a function for unfolding elements. What will this function look like? The opposite of the function we used to fold, in that it will take an accumulator (`acc`) as its argument, and return the next value of the accumulator and an element to yield. Unlike a fold, it has to know when to stop, so we return an empty list when there are no more values:

```javascript
function unfoldWith(fn) {
  return function * unfold (input) {
    let [remainder, element] = fn(input);

    while (remainder !== undefined) {
      yield element;
      [remainder, element] = fn(remainder);
    }
  }
}

const downToOne = unfoldWith((n) => n > 0 ? [n - 1, n] : []);

product(downToOne(5))
  //=> 120
```

For a moment, let's close our eyes very tightly, plug our ears with our fingers, and murmur "la-la-la-la-la" at the thought of performance costs or implementation limits. Ready? Ok:

If we didn't have a looping construct like `while`, we could write `unfoldWith` recursively:

```javascript
function unfoldWith(fn) {
  return function * unfold (input) {
    let [remainder, element] = fn(input);

    if (remainder !== undefined) {
      yield element;
      yield * unfold(remainder);
    }
  }
}

const downToOne = unfoldWith((n) => n > 0 ? [n - 1, n] : []);

product(downToOne(5))
  //=> 120
```

It works just the same up until JavaScript's stack overflows.

> Reminder: `yield *` yields all the elements of an iterable, so `yield * unfold(acc)` will yield the remaining elements.

Although it may be impractical for working at scale, what is interesting about the recursive unfold is that it encodes very directly how to do an unfold using linear recursion: _Given a structure, turn it into part of the result and a structure representing the rest of the work to do_.

In the case of unfolding, we take a structure, and return an element and a structure representing the part we haven't unfolded yet. We then yield the element and the result of unfolding the rest of the structure.

Divide-and-conquer algorithms all have this structure: Break the problem into parts, apply the algorithm to each part, then glue the results back together. Recursive divide-and-conquer applies the exact same algorithm at finer and finer scale until a simple case is reached. Linear recursion is a special case where we break the simple case off, solve it, and recursively apply our algorithm to the remainder of the input.

---

### traversing lists, trees and forests

A traversal, or _path_, is a function that takes a structure and returns its elements as an iterator. JavaScript gives us built-in traversals for returning the values in arrays, we just iterate over them. But sometimes we want to iterate in another order. For that, we need a traversal.

One handy use for unfolds is to use them to express traversals. We can do that with an array. Here's one that uses our `unfoldWith` exactly as described: it dives a non-empty array into an element and the rest of the array to unfold:

```javascript
const butLast = (array) => array.slice(0, array.length - 1);
const last = (array) => array[array.length - 1];

const inReverse = unfoldWith(
    (array) => array.length > 0 ? [butLast(array), last(array)] : []
  );

[...inReverse(['a', 'b', 'c'])]
  //=> ['c', 'b', 'a']
```

This is simple, but it makes successive copies of the array, and in JavaScript, this is expensive. It would be easier if we used the original array, but managed a _cursor_ to keep track of our position in the array.

```javascript
function * inReverse(array, cursor = array.length - 1) {
  if (cursor >= 0) {
    yield array[cursor];
    yield * inReverse(array, cursor - 1);
  }
}

[...inReverse(['a', 'b', 'c'])]
  //=> ['c', 'b', 'a']
```

We can easily write this with a `while` loop, but there is more interesting business afoot. Consider this binary tree:

[![Binary Tree](/assets/images/balanced-binary-tree-graph-1.png)](http://www.byte-by-byte.com/balancedtree/)

> Image © Sam Gavis-Hughson, [Coding Interview Question: Balanced Binary Tree](http://www.byte-by-byte.com/balancedtree/)

It can be represented as a nested POJO:

```javascript
const tree = {
  label: 1,
  children: [
    {
      label: 2,
      children: [
        {
          label: 4,
          children: []
        },
        {
          label: 5,
          children: []
        }
      ]
    },
    {
      label: 3,
      children: [
        {
          label: 6,
          children: []
        }
      ]
    }
  ]
}
```

Let's write a traversal for it:

```javascript
function * depthFirst (tree) {
  yield tree.label;
  for (const child of tree.children) {
    yield * depthFirst(child);
  }
}

[...depthFirst(tree)]
  //=> [ 1, 2, 4, 5, 3, 6]
```

Note that the for of this traversal is almost identical to the form of our recursive linear unfold. The big difference is that we start with one element, but the "remainder" of our work is multiple elements.

We can unify them. A tree is a divergent graph with a single root node. If we have a collection of root nodes, it's called a *forest*. The second-simplest possible forest is a collection with just root, and that's just like a tree.

So if we write a traversal for forests, we also get one for trees:

```javascript
function * depthFirst (forest) {
  if (forest.length > 0) {
    const [first, ...butFirst] = forest;

    yield first.label;
    yield * depthFirst(first.children.concat(butFirst))
  }
}

const simpleForest = [tree];

[...depthFirst([simpleForest])]
  //=> [ 1, 2, 4, 5, 3, 6]
```

This looks more familiar! We can express this as a linear recursion unfold:

```javascript
const first = (array) => array[0];
const butFirst = (array) => array.slice(1);

const depthFirst = unfoldWith(
  (forest) => forest.length > 0
              ? [
                  first(forest).children.concat(butFirst(forest)),
                  first(forest).label
                ]
              : []
);

[...depthFirst([simpleForest])]
  //=> [ 1, 2, 4, 5, 3, 6]
```

All this work brings us to this: Just as we can express forward and backwards traverses through a list, we can express different kinds of traversals through more complex structures, like trees or forests.

Here is a _breadth-first_ traversal of a forest:

```javascript
const breadthFirst = unfoldWith(
  (forest) => forest.length > 0
              ? [
                  butFirst(forest).concat(first(forest).children),
                  first(forest).label
                ]
              : []
);

[...breadthFirst([simpleForest])]
  //=> [ 1, 2, 3, 4, 5, 6 ]
```

Notice how it looks almost exactly identical to the depth-first expression. This tells us that we have exploited the symmetry between the various paths we can take through a forest. A right-to-left breadth-first search is likewise easy to code:

```javascript
const rightToLeftBreadthFirst = unfoldWith(
  (forest) => forest.length > 0
              ? [
                  last(forest).children.concat(butLast(forest)),
                  last(forest).label
                ]
              : []
);

[...rightToLeftBreadthFirst([simpleForest])]
  //=> [ 1, 3, 2, 6, 5, 4 ]
```

---

### unfolds, wrapped up

When working with data structures, we often want to provide certain common operations on their elements. For example, questions like "what is the set of unique elements of this collection?" or  "What is the sum of the numbers in this collection?"

If we write a traversal for the collection, we turn it into an iterator, and we can write a single generic `fold` over the resulting iteration. We can write:

```javascript
const sum = foldWith(
  (acc, element) => acc + element
);
```

And it works with forests as easily as it works with lists:

```javascript
sum([1, 2, 3, 4, 5, 6])
  //=> 21

sum(depthFirst(simpleForest))
  //=> 21
```

Writing traversals separates the concern of how to iterate over a data structure from the concern of what to do with the elements of the data structure.

You often hear the advice to write code in small functions, to avoid putting too many lines in one method. Obviously, we can break big methods up by extracting "helper" methods, and that will satisfy `JSLint`, but that is treating the symptom and not the problem.

Building blocks like `unfoldWith` serve to illustrate the idea that many algorithms do share common concerns. All we need to do is train ourselves to see the underlying symmetry between them, and we can decompose our functions and recompose them with abandon.

---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new) or [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-11-30-anamorphisms-in-javascript.md) yourself!

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
