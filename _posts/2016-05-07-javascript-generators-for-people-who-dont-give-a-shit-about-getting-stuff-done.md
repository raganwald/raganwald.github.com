---
title: "JavaScript Generators for People Who Don't Give a Shit About GettingStuffDone™"
layout: default
tags: [allonge]
---

[![Plasma Generator](/assets/images/plasma-generator.jpg)](https://www.flickr.com/photos/willfolsom/6951127040)

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

We can *flatten* an iterator with `yield *`:

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

[![Generators](/assets/images/generators.jpg)](https://www.flickr.com/photos/zabowski/2633434038)

---

### composing generators

Generators can take arguments. We've already seen the simplest possible generator:

```javascript
const Empty = function * () {};
```

Here's the second simplest, a generator that takes an iterable as its argument:

```javascript
const None = function * (iterable) {};

[...None(OneTwoThree())]
  //=> []

for (const something of None(OneTwoThree())) console.log(something);
  //=> nothing happens!
```

`None` always produces an empty iterable, no matter what you give it. You recall `OneTwoThree` from above? Here's another take on it:

```javascript
const OneTwoThreeII = function * () {
  const iterable = [1, 2, 3];
  for (const i of iterable) yield i;
};

[...OneTwoThreeII()]
  //=> [1, 2, 3]

for (const something of OneTwoThreeII()) console.log(something);
  //=> 1
       2
       3
```

Which leads us to:

```javascript
const I = function * (iterable) {
  for (const i of iterable) yield i;
};

[...I(OneTwoThree())]
  //=> [1, 2, 3]

for (const something of I([3, 2, 1])) console.log(something);
  //=> 3
       2
       1
```

Yielding all the values of an iterable is called *flattening* it in functional terms. It is so useful, there is a shortcut:

```javascript
const I = function * (iterable) {
  yield * iterable;
};

[...I(OneTwoThree())]
  //=> [1, 2, 3]

for (const something of I([3, 2, 1])) console.log(something);
  //=> 3
       2
       1
```

You recall that we could take an iterable and extract an iterator from it? This can be useful:

```javascript
const rest = function * (iterable) {
  const iterator = iterable[Symbol.iterator]();

  iterator.next();
  yield * iterator;
};

[...rest(OneTwoThree())]
  //=> [2, 3]

for (const something of rest([3, 2, 1])) console.log(something);
  //=> 2
       1
```

`rest` gives us an iterable that iterates over all the elements of an iterable except the first (if it has one).

We can make generators that take two or more iterables as arguments. Here's a very useful tool, `zipWith`


---

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
