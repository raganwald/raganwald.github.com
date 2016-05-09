---
title: "JavaScript Generators for People Who Don't Give a Shit About GettingStuffDone™"
layout: default
tags: [allonge, noindex]
---

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

[![Generators](/assets/images/generators.jpg)](https://www.flickr.com/photos/zabowski/2633434038)

---

### author's note

The title is, of course, a joke. Everyone cares about getting stuff done, that's how we make the world a better place. But alongside progress and productivity, there is also room for pleasure and whimsey and light-hearted joking.

An alternate title could just as easily be, "JavaScript Generators for People Who Enjoy the Pleasure of Working Things Out." I'm one of those people, and I enjoyed writing this post. I hope you enjoy reading it and perhaps you'll even try a few whimsical JavaScript generators of your own.

If you do, please share them with me.

---

[![RadioShack 20-242: Hand crank for charging the battery pack. Also charges cell phones.
](/assets/images/radio-shack.jpg)](https://www.flickr.com/photos/capcase/10632896854)

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
for (const something of Empty())
  console.log(something);
  //=> nothing happens!
```
Generators can `yield` values:

```javascript
const One = function * () {
  yield 1;
}

for (const something of One())
  console.log(something);
  //=> 1
```

If a generator yield more than one value, it iterates over the values successively:

```javascript
const OneTwo = function * () {
  yield 1;
  yield 2;
}

for (const something of OneTwo())
  console.log(something);
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

for (const something of OneTwoThree())
  console.log(something);
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

Here's another simple generator, it takes zero or more values and returns an iterator over the values (if any):

```javascript
function * just (...values) {
  yield * values;
};

for (const something of just())
  console.log(something);
  //=> nothing happens!

for (const something of just('Hello'))
  console.log(something);
  //=> 'Hello'
```

We already saw `rest`:

```javascript
function * rest (iterable) {
  const iterator = iterable[Symbol.iterator]();

  iterator.next()
  yield * iterator;
};

for (const something of rest(['Hello', 'Java', 'Script']))
  console.log(something);
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

  if (done) {
    return { rest: [] };
  } else {
    return { first, rest: iterator };
  }
};

const { first, rest } = split([1, 2, 3, 4, 5]);

console.log(first);
  //=> 1
for (const something of rest)
  console.log(something);
  //=> 2
       3
       4
       5
```

(Note that if you don't *have* a `first`, you don't *get* a first.)

The inverse of splitting an iterable into `first` and `rest` is to `join` them. We'll use a generator for this. To maintain symmetry with `split`, we'll fake named keywords with destructuring, and use the same rule: If you don't supply a `first`, it won't join a `first`:

```javascript
function * join (unjoined) {
  const {first, rest} = unjoined;

  if (unjoined.hasOwnProperty('first')) {
    yield first;
  }
  yield * rest;
};

const iterable = join(5, [4, 3, 2, 1]);

for (const something of iterable)
  console.log(something);
  //=> 5
       4
       3
       2
       1
```

We saw how to split the first element from a generator, we can also `take` multiple elements. We use a generator so that we can iterate over the elements we take:

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

for (const something of iterable)
  console.log(something);
  //=> 1
       2
       3
```

With these basic building blocks in place, we can look at some interesting generators: Generators that `yield *` themselves.

---

[![Mirror, mirror](/assets/images/mirror.jpg)](https://www.flickr.com/photos/elsie/3878943067)

---

### self-referential generators

We have seen that generators can `yield *` iterators... Even those produced by other generators. What about themselves? Can a generator yield itself? Consider:

```javascript
function * ones () {
  yield * join({ first: 1, rest: ones()});
}

for (const something of ones())
  console.log(something);
  //=> 1
       1
       1
       ...
```

`ones` yields an iterator formed by joining `1` with what it generates. Which is the join of `1` with what it generates. Which us the join of `1` with... And so on *ad infinitum*. Of course, it needn't be just `1`:

```javascript
function * infiniteNumberOf (something) {
  yield * join({
    first: something,
    rest: infiniteNumberOf(something)
  });
}

for (const something of infiniteNumberOf(1))
  console.log(something);
  //=> 1
       1
       1
       ...
```

`infiniteNumberOf` yields an iterator that yields `something` an infinite number of times. So if we want an infinite number of `1`s, we can use `infiniteNumberOf(1)`. Taking an argument for a generator that refers to itself is interesting. For example, we could write:

```javascript
function * from (first, increment = 1) {
  yield * join({first, rest: from(first + increment, increment)});
}

for (const something of from(1))
  console.log(something);
  //=> 1
       2
       3
       ...
```

Handy. What we have here is a sequence that calculates each element based on the element before it and an amount to increment. What if we wanted to apply some other function?

```javascript
function * sequence (first, nextFn = (x) => x) {
  yield * join({first, rest: sequence(nextFn(first), nextFn)});
}

const powersOfTwo = sequence(2, (x) => x * 2);

for (const something of powersOfTwo)
  console.log(something);
  //=> 2
       4
       8
       16
       ...
```

Or what if we want to use a function that works on the trailing two elements, instead of the last element yielded so far?

```javascript
function * sequence2 (first, second, nextFn = (x, y) => y) {
  yield * join({first, rest: sequence2(second, nextFn(first, second), nextFn)});
}

const fibonacci = sequence2(0, 1, (x, y) => x + y);

for (const something of fibonacci)
  console.log(something);
  //=> 0
       1
       1
       2
       3
       5
       8
       13
       ...
```

We will come back to this sequence, but first, let's look at generators that transform other generators.

---

[![Body/Frame Assembly Line](/assets/images/body-frame.jpg)](https://www.flickr.com/photos/kojach/4082970890)

---

### generators that transform other generators

Our "self-referential generators" yield values that are derived from the values they've already yielded. In a sense, these generators transform themselves. Generators can, in fact, transform other generators (or more generally, transform any iterable).

The simplest example is `mapWith`:

```javascript
function * mapWith (fn, iterable) {
  const asSplit = split(iterable);

  if (asSplit.hasOwnProperty('first')) {
    const { first, rest } = asSplit;

    yield * join({
      first: fn(first),
      rest: mapWith(fn, rest)
    });
  }
}

const squares = mapWith((x) => x*x, from(1));

for (const something of squares)
  console.log(something);
  //=> 1
       4
       9
       16
       25
       ...
```

Another simple generator that transforms an iterator is `filterWith`:

```javascript
function * filterWith (fn, iterable) {
  const asSplit = split(iterable);

  if (asSplit.hasOwnProperty('first')) {
    const { first, rest } = asSplit;

    if (fn(first)) {
      yield first;
    }
    yield * filterWith(fn, rest);
  }
}

const odds = filterWith((x) => x % 2 === 1, from(1));

for (const something of odds)
  console.log(something);
  //=> 1
       3
       5
       7
       9
       ...
```

We can use `filterWith` and a self-referential generator to make an [Unfaithful Sieve of Eratosthenes][1]:

[1]: http://raganwald.com/2016/04/25/hubris-impatient-sieves-of-eratosthenes.html "The Hubris of Impatient Sieves of Eratosthenes"

```javascript
function * primes (numbers = from(2)) {
  const { first, rest } = split(numbers);

  yield * join({first, rest: filterWith((n) => n % first !== 0, rest)});
}

for (const something of primes())
  console.log(something);
  //=> 2
       3
       5
       7
       11
       13
       ...
```

People who are fussy about GettingStuffDone™ will go on a bit about whether linearly recursive functions call themselves in tail position, then pore over language implementations debating whether optimization is available to generators. Such people will often convert generators like `mapWith` and `filterWith` by hand into loops:

```javascript
function * mapWith (fn, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (true) {
    const { done, value } = iterator.next();

    if (done) {
      return;
    }
    else yield fn(value);
  }
}

function * filterWith (fn, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (true) {
    const { done, value } = iterator.next();

    if (done) {
      return;
    }
    else if (fn(value)) {
      yield value;
    }
  }
}
```

We don't, of course, care about that here.

---

[![Zipper](/assets/images/zipper.jpg)](https://www.flickr.com/photos/southpaw2305/3474989098)

---

### generators that transform more than one generator

`mapWith` was a generator that transformed an iterable by mapping its values with a unary function. Thus, `mapWith((x) => x*3, from(1))` gives us an iterator over the multiples of three.

But what about mapping over *two* iterables? How would that work? The simplest method is to iterate over both iterables simultaneously, taking an element from each one, and mapping the pair of elements to a value.

Like this:

```javascript
function * zipWith (fn, iterableA, iterableB) {
  const { first, rest } = split(iterable);

  yield * join(fn(first), mapWith(fn, rest));
}

const squares = mapWith((x) => x*x, from(1));

for (const something of squares)
  console.log(something);
  //=> 1
       4
       9
       16
       25
       ...
```

---

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### source code

<script src="https://gist.github.com/raganwald/702d4a24b1bdff9f9c1789c85b1f6979.js"></script>

### notes
