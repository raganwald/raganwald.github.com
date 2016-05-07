---
title: "JavaScript Generators for People Who Don't Give a Shit About GettingStuffDone™"
layout: default
tags: [allonge, noindex]
---

[![Espresso](/assets/images/prime-espresso.jpg)](https://www.flickr.com/photos/cahadikincreations/8459301889)

---

In JavaScript, a **generator** is a function declared with an `*`. Here's the simplest possible generator:

```javascript
const Empty = function * () {};
```

If you invoke a generator, you get an object back:

```javascript
Empty()
  //=> {}
```

This is completely unlike a normal function! Compare and contrast:

```javascript
Empty()
  //=> {}

const fEmpty = function () {};

fEmpty()
  //=> undefined
```

Generators return something even though they don't have a `return` statement. What can we do with this thing they return?

We can spread it into an Array:

```javascript
[...Empty()]
  //=> []
```

Hmmm, we can spread it, but we dont get any values.

We can iterate over it, but there's nothing to iterate over:

```javascript
for (const something of Empty()) console.log(something);
  //=> nothing happens!
```

We call something you can iterate over, an *Iterable*. There's another, lowever level way to iterate over things that we'll seee a little later.

So our empty generator acts like an empty collection. Can we make a generator that acts like a collection with a value? Yes, with `yield`:

```javascript
const One = function * () {
  yield 1;
}

[...One()]
  //=> [1]

for (const something of One()) console.log(something);
  //=> 1
```

How about yielding two values? Yes, we can yield twice:

```javascript
const OneTwo = function * () {
  yield 1;
  yield 2;
}

[...OneTwo()]
  //=> [1, 2]

for (const something of OneTwo()) console.log(something);
  //=> 1
       2
```

Interestingly, yielding can be dynamic. For example, we can yield three values like this:

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

[...OneTwoThree()]
  //=> [1, 2, 3]

for (const something of OneTwoThree()) console.log(something);
  //=> 1
       2
       3
```

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

---

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
