---
title: "JavaScript Generators for People Who Don't Give a Shit About GettingStuffDone™"
layout: default
tags: [allonge]
---

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

[![Generators](/assets/images/generators.jpg)](https://www.flickr.com/photos/zabowski/2633434038)

---

### prerequisites

Before we get to the main bit of business, here's what we presume we understand: In JavaScript, a **generator** is a function declared with an `*`. Here's the simplest possible generator:

```javascript
const Empty = function * () {};
```

If you invoke a generator, you get an object back, and you don't need to use a `return` keyword:

```javascript
Empty()
  //=> {}
```

What can we do with this thing they return? We can iterate over it (even though there's nothing to iterate over in an empty generator):

```javascript
for (const something of Empty()) console.log(something);
  //=> nothing happens!
```
Generators can `yield` values:

```javascript
const One = function * () {
  yield 1;
}

for (const something of One()) console.log(something);
  //=> 1
```

If a generator yield more than one value, it iterates over the values successively:

```javascript
const OneTwo = function * () {
  yield 1;
  yield 2;
}

for (const something of OneTwo()) console.log(something);
  //=> 1
       2
```

Yielding is dynamic. For example, we can yield three values like this:

```javascript
const OneTwoThree = function * () {
  yield 1;
  yield 2;
  yield 3;
}
```

Or like this:

```javascript
const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}

for (const something of OneTwoThree()) console.log(something);
  //=> 1
       2
       3
```

The object returned when we invoke a generator is an iterable because it implements the `[Symbol.iterator]` method:

```javascript
const Empty = function * () {};

const iterable = Empty();

typeof iterable[Symbol.iterator]
  //=> function
```

The iterables returned by generators are actually *iterators*, because they implement the `.next` method:

```javascript
const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}

const iterator = OneTwoThree();

let { done, value } = iterator.next();

{ done, value }
  //=> {"done":false,"value":1}

({ done, value } = iterator.next());

{ done, value }
  //=> {"done":false,"value":2}

({ done, value } = iterator.next());

{ done, value }
  //=> {"done":false,"value":3}

({ done, value } = iterator.next());

{ done, value }
  //=> {"done":true}
```

And we can *flatten* an iterator with `yield *`:

```javascript
const catenate = function * (...iterables) {
  for (const iterable of iterables) {
    yield * iterable;
  }
}

const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}

const FourFive = function * () {
  yield 4;
  yield 5;
}

for (const something of catenate(OneTwoThree(), FourFive()))
  console.log(something);
  //=> 1
       2
       3
       4
       5
```

Or:

```javascript
const rest = function * (iterable) {
  const iterator = iterable[Symbol.iterator]();

  const { value, done } = iterator.next();

  if (done) {
    return;
  }
  else yield * iterator;
}

for (const something of rest(OneTwoThree()))
  console.log(something);
  //=> 2
       3
```

That's it, we're ready to talk about "Generators for People Who Don't Give a Shit About GettingStuffDone™."

---

[![Plasma Generator](/assets/images/plasma-generator.jpg)](https://www.flickr.com/photos/willfolsom/6951127040)

---

### basic building blocks for generators

Generators can take arguments. We've already seen the simplest possible generator:

```javascript
function * Empty () {};
```

Here's the second simplest, a generator that takes a value and returns an iterator over that value:

```javascript
function * just (value) {
  yield value;
};

for (const something of just('Hello')) console.log(something);
  //=> 'Hello'
```

A slightly more flexible implementation encompasses the functionality of `Empty`:

```javascript
function * just (...values) {
  yield * values;
};

for (const something of just()) console.log(something);
  //=> nothing happens!

for (const something of just('Hello')) console.log(something);
  //=> 'Hello'
```

We already saw `rest`:

```javascript
function * rest (iterable) {
  const iterator = iterable[Symbol.iterator]();

  iterator.next()
  yield * iterator;
};

for (const something of rest(['Hello', 'Java', 'Script'])) console.log(something);
  //=> Java
       Script
```

The inverse is `first`, it's an ordinary function:

```javascript
function first (iterable) {
  const iterator = iterable[Symbol.iterator]();

  const { done, value } = iterator.next();
  if (!done) return value;
};

first(['Hello', 'Java', 'Script'])
```

Sometimes you need both the `first` and the `rest` of an iterable, and you don't want to call them in succession because iterables are stateful. So it's convenient to use destructuring to get both at once:

```javascript
function split (iterable) {
  const iterator = iterable[Symbol.iterator]();

  const { done, value: first } = iterator.next();
  if (!done) {
    return { first, rest: iterator };
  }
};

const { first, rest } = split([1, 2, 3, 4, 5]);

console.log(first);
  //=> 1
for (const something of rest) console.log(something);
  //=> 2
       3
       4
       5
```

The inverse of splitting an iterable into `first` and `rest` is to `join` them. We'll use a generator:

```javascript
function * join (first, rest) {
  yield first;
  yield * rest;
};

const iterable = join(5, [4, 3, 2, 1]);

for (const something of iterable) console.log(something);
  //=> 5
       4
       3
       2
       1
```

We saw how to split the first element from a generator, we can `take` multiple elements:

```javascript
function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (done) return;
    else yield value;
  }
}

const iterable = take(3, [1, 2, 3, 4, 5]);

for (const something of iterable) console.log(something);
  //=> 1
       2
       3
```

### recursive generators

We can use what we have to

---

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
