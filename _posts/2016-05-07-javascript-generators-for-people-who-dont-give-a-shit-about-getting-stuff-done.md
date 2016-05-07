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

So our empty generator acts like and empty collection. Can we make a generator that acts like a collection with a value? Yes, with `yield`:

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

Interestingly, yielding is titally dynamic. For example, we can yield three values like this:

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


---

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
