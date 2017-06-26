---
title: "One, Two, Three, ... Infinity"
layout: default
tags: [allonge, noindex]
---

Imagine we create intelligent life. Perhaps they are sims in a virtual world. Or if you prefer, they arise spontaneously in miniature as part of a school science experiment.

As they work their way up Maslow's Hierarchy of Needs, they teach themselves about counting things. One of them, a little more academic than the others, decides to take their folk knowledge about couting and codify it into a "calculus."[^romance]

This calculus describes, in steps, how to perform calculations of various sorts. What does it look like?

### the first calculus

The first calculus developed is very simple. It has the notion of nothing and of something. In our own language, these are like the numbers zero and one. Since JavaScript is a notation familiar to almost everyone who reads this blog, we shall translate the calculus to JavaScript. Here are the first two given elements:

```javascript
const Zero = '.';
const One = '*';
```

Of course, our sims often work with more than one thing, like the number of members of a family, or the number of fruit on a tree. They might need to solve a simple problem involving "numbers" greater than one. For example, are there enough fruits in this particular tree such that each member of the family can have one?

[^romance]: This essay is inspired by the very first book about mathematics or science I can remember reading, Gamow's "One, Two, Three, Infinity." In it , Gamow gave an account of a supposed primitive human tribe that could only count definitively to three, every larger number was "many." With time and maturity I see that we should be very careful about patronising actual humans who live in or have recently lived in what we may think is a primitive manner. For this reason, I speak only of sims and not of real people. Absolutely no inference should be drawn from our hypothetical sims to real people, if for no other reason than the obvious: Artificial life we might actually program is far more likely to reflect our prejudices about the nature of life than reality.

To solve problems like determining whether a tree holds enough fruit for the family, the sims developed the idea of a _path_ through things. A path is a mechanism for going through a set of things one at a time, however there is no way to get the size of a path, or access its things arbitrarily or in any other order. All we can do is follow the path, one thing at a time.

In JavaScript, we can use iterators and iterables to represent paths. Before we get into the sims' calculus, let's refresh our memories of how iterators and iterables work:

### iterators and iterables

In JavaScript, an **iterator** is any object that has a `.next()` method, which returns a plain-old-javascript-object that has a `.done` property. `.done` must be either `true` or `false`. If `.done` is `false`, the object must also have a `.value` property.

The simplest possible iterator looks like this:

```javascript
const ITER_NONE = {
 next() {
  return { done: true };
 }
};
```

Iterators in JavaScript can be used in a number of ways. The simplest is a loop:

```javascript
while (true) {
  const { value, done } = ITER_NONE.next();
  if (done) break;
  console.log(value);
}
  //=> Outputs nothing.
```

`ITER_NONE` doesn't iterate over anything. The next simplest iterator iterates over one element. Here's one possible example:

```javascript
const ITER_ONE = {
  done: false,
  value: '*',
  next() {
    const { done, value } = this;
    
    if (done) {
      return { done };
    else {
      this.done = true;
      return { done, value } 
    }
  }
}

while (true) {
  const { value, done } = ITER_ONE.next();
  if (done) break;
  console.log(value);
}
  //=> '*'
```

*Conceptually*, `ITER_ONE` is simple. The first time we call `.next()`, we get a `value` of `*` and a `done` of `false`. The next and every subsequent call, we get a `done` of true.

The implementation is a little awkward, and we'll soon see a much simpler way to write this. But for the moment, let's note the essential nature of an iterator: Most iterators are *stateful*. They return something, then maybe another thing, and another thing, and then they stop returning things.

Or do they? Here's an iterator that never stops returning something:

```javascript
const ITER_ONES = {
  done: false,
  value: '*',
  next() {
    const { done, value } = this;
    
    return { value, done };
  }
};
```

We won't try it here, but if you want to try outputing the valuesit retuns in a `while` loop, you will find it ouputs `*` to the console indefinitely. Our sims have no concept of numbers, but we do, and here's another iterator that never stops:

```javascript
const ITER_NUMBERS = {
  done: false,
  value: 0,
  next() {
    const { done, value } = this;
    
    this.value++;
    return { value, done };
  }
};
```

So what do we have so far?

- Iterators are objects with a `.next()` method that returns an object with a `done` property and, if `done` is `false`, a `value` property.
- Iterators are responsible for managing their own state.
- Some iterators never return `false` for `done`. If we naively loop over their values, we will go on forever.

Iterators in ordinary JavaScript usage are often associated with a collection of values, like an array, list, or set. The distinction between a collectrion and an iterator over its values is very important: *An iterator over the values in a collection is not a collection*.

In JavaScript, collections have a mechanism for providing a default iterator over their contents: If a collection implements a `[Symbol.iterator]` method, it is expected to return an iterator over the collection's contents.

Our sims don't have arrays, but we do,m and we can see that arrays implement a [Symbol.iterator] method:

```javascript
typeof Array.prototype[Symbol.iterator]
  //=> "function"
  
const oneTwoThree = [1, 2, 3];
const iterOneTwoThree = oneTwoThree[Symbol.iterator]();

while (true) {
  const { value, done } = iterOneTwoThree.next();
  if (done) break;
  console.log(value);
}
  //=>
    1
    2
    3
```

We can't see how, exactly, the iterator returned by `oneTwoThree[Symbol.iterator]()` is implemented, but we can see that it returns, successively, the values in the array.

Any object that has a `[Symbol.iterator]` method is expected to return an iterator. Such objects are called *iterables*, in the sense that they can be iterated over.

Iterables are quite handy in JavaScript, because there is syntactic support using them in various ways. One we'll use often is a `for..of` loop:

```javascript
for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3
```

There are others that are quite useful in everyday programming, including spreading an iterator into an array, destructing an iterator into variables, and spreading an iterator into arguments for a function call.

But for now, let us note:

- An iterable is *any* object that implements a `[Symbol.iterator]` method, and that method should return an iterator.
- Iterables can be used in `for..of` loops, amongst other places.
- It's handy to make collections iterables.

Before we move along, we should look at an important distinction. Most iterables return a *new* iterator every time we call `[Symbol.iterator]()`. We can test this with arrays:

```javascript
for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3

for (const n of oneTwoThree) {
  console.log(n);
}
  //=>
    1
    2
    3
```

We loop over `oneTwoThree` twice, and each time JavaScript invokes its `[Symbol.iterator]()` method, and each time we get a new iterator. Since it is a new iterator, each loop starts at the beginning and goes to the end, because each iterator object manages its own state independently.


We can make our own iterables, and they work exatcly the same way with things like `for...of` loops:
{
 next() {
  return { done: true };
 }
}
```javascript
const NONE = {
  [Symbol.iterator]() {
    return {
     next() {
      return { done: true };
     }
    };
  }
};

for (cont v of NONE) {
  console.log(v);
}
  //=> outputs nothing
```


"Iterator" and "Iterable" are both standard JavaScript terminology. But here's a non-standard term that will be helpful: We will call iterables like `Array.prototype[Symbol.iterator]` that always return a new iterator, *reiterables*.

A "reiterable" is an iterable that can be iterated over and will always start afresh. It seems odd to explicitly name this, isn't this how all iterables behave? Alas, no, and we will meet ietrables that are no reiterables in the next section.

### generators

Writinmg iterables and iterators by hand is a little complex, especially with all the state management. Borrowing a page or two from languages like Python, JavaScript provides **generators**, functions that when invoked, return an iterable.

The simplest possible generator looks like this:


