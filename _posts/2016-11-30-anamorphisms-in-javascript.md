---
title: "Anamorphisms in JavaScript"
layout: default
tags: [allonge]
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


Unfolds (or anamorphisms) are the dual—a fancy word for _complement_—of Catamorphisms, functions that map from some complex structure down to a simpler object. Here's a catamorphism:

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

The two problems we have with `.reduce` are that first, it takes multiple arguments, and second, it is a method on arrays. But it's a useful pattern, and we can reproduce it by hand. Here we create a `foldWith` function that takes a folding function and a seed value, and gives us back a fold function. We use that to make our own `product` fold:

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

### generalizing unfolds

Our `foldWith` function is handy, and we can use the same general idea for making unfolders. We want to end up with an `unfoldWith` function that takes, as its argument, a function for unfolding elements. What will this function look like? The opposite of the function we used to fold, in that it will take an accumulator (`acc`) as its arhgument, and return the next value of the accumulator and an element to yield. Unlike a fold, it has to know when to stop, so we return an empty list when there are no more values:

```javascript
function unfoldWith(fn) {
  return function * unfold (value) {
    let [acc, element] = fn(value);

    while (acc !== undefined) {
      yield element;
      [acc, element] = fn(acc);
    }
  }
}

const downToOne = unfoldWith((acc) => acc > 0 ? [acc - 1, acc] : []);

product(downToOne(5))
  //=> 120
```

### traversals

A traversal, or _path_, is a function that takes a structure and returns its elements as an iterator. JavaScript gives us built-in traversals for returning the values in arrays, we just iterate over them. But sometimes we want to iterate in another order. For that, we need a traversal.

One handy use for unfolds is to use them to express traversals. We can do that with an array. Let's start with an expensive, but simple forulation:

```javascript
const inReverse = unfoldWith(
    (arr) => arr.length > 0 ? [arr.slice(0, arr.length - 1), arr[arr.length - 1]]: [];
  );

[...inReverse(['a', 'b', 'c'])]
  //=> ['c', 'b', 'a']
```

This is simple, but it makes successive copies of the array, and in JavaScript, this is expensive. It would be easier if we used the original array, but managed a _cursor_ of some kind to keep track of our traversal. We can almost-but-not-quite do this with `unfoldWith`: Our `acc` could be an object with a reference to the array and to a position, but we would need to initialize it somehow. Let's build that:

```javascript
function traverseWith(initializer, fn) {
  return function traverse (structure) {
    const initial = initializer(structure);

    return unfoldWith(fn)(initial);
  }
}

const inReverse = traverseWith(
  array => ({ array, cursor: array.length - 1 }),
  (acc) => acc.cursor >= 0 ? [{ array: acc.array, cursor: acc.cursor - 1 }, acc.array[acc.cursor]] : []
)

[...inReverse(['a', 'b', 'c'])]
  //=> ['c', 'b', 'a']
```

This does make a new object containing a reference to the original array and an integer on each iteration, so it is not nearly as compact as an ordinary function, but we see the idea that we can make traversals out of unfolds, and that we can either do it in a really pure way, or with a little finagling, we can use a cursor to save excess copying.

### more complex traversals

Lists are very simple data structures, but we can build from there.

### unfolding in higher dimensions

We've seen how to unfold something into a one-dimensional structure, a list or iterable. We can write functions that unfold integers into more complex structures. Here's one that makes a multiplication table:

```javascript
const multiplicationTable = (max) =>
  [...oneTo(max)].map(
    (row) => [...oneTo(max)].map(
      (column) => row * column
    )
  );

multiplicationTable(5)
  //=> [
          [ 1 ,  2 ,  3 ,  4 ,  5 ],
          [ 2 ,  4 ,  6 ,  8 , 10 ],
          [ 3 ,  6 ,  9 , 12 , 15 ],
          [ 4 ,  8 , 12 , 16 , 20 ],
          [ 5 , 10 , 15 , 20 , 25 ]
       ]
```

[anamorphism]: http://tunes.org/wiki/Morphism

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [reddit](https://www.reddit.com/r/javascript/comments/4u243o/from_mixins_to_object_composition_raganwaldcom/), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-07-20-prefer-composition-to-inheritance.md) yourself!

---

### notes
