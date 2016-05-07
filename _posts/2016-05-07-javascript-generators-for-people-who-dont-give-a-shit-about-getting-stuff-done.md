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

Hmmm, we can spread it, but we don't get any values. We can also iterate over it, but there's nothing to iterate over:

```javascript
for (const something of Empty()) console.log(something);
  //=> nothing happens!
```

We call something you can iterate over, an *Iterable*. There's another, lower level way to iterate over things that we'll see a little later. Iterables are values, so we can stick them in a variable, pass them to functions, and so forth:

```javascript
const nothing = Empty();

[...nothing]
  //=> []
```

So our empty generator makes iterables that act like an empty collections. Can we make a generator that makes iterables that act like collections with a value? Yes, with `yield`:

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

When we yield multiple values, we get an iterable that acts like a collection with multiple values.

### iterables are like collections, but they aren't collections

Like collections, we can iterate over an iterable. But they are unlike collections in several important ways. At its deepest level, an iterable isn't a collection of fixed values. When we write:

```javascript
const OneTwoThree = function * () {
  yield 1;
  yield 2;
  yield 3;
}

const iterable = OneTwoThree();
```

Our value `iterable` is not a data structure in memory holding the values `1`, `2`, and `3`. It's a special object that invokes the generator's code to produce values as we iterate over it. We noted earlier that we can spread the iterable into an array and iterate over its values using a `for... of` loop.

Here's another way to iterate over its values:

```javascript
const OneTwoThree = function * () {
  yield 1;
  yield 2;
  yield 3;
}

const iterable = OneTwoThree();
let { done, value } = iterable.next();

{ done, value }
  //=> {"done":false,"value":1}

({ done, value } = iterable.next());

{ done, value }
  //=> {"done":false,"value":2}

({ done, value } = iterable.next());

{ done, value }
  //=> {"done":false,"value":3}

({ done, value } = iterable.next());

{ done, value }
  //=> {"done":true}
```

We can iterate over an iterable by repeatedly calling `.next()`. Every time we do so, we get back an object with a `done` property. While the iterable has values to yield, `done` is `false`, and it passes `value` along. When there are no more values to yield, `done` will be `true`.

Iterables could hold none or many values, and we don't know what those values are until we attempt to iterate over the iterable.

For example, what if we write:

```javascript
const MaybeOneTwoThree = function * () {
  if (Math.random() > .5) yield 1;
  if (Math.random() > .5) yield 2;
  if (Math.random() > .5) yield 3;
}

for (const something of MaybeOneTwoThree()) console.log(something);
  //=> 1
       3

for (const something of MaybeOneTwoThree()) console.log(something);
  //=> 2

for (const something of MaybeOneTwoThree()) console.log(something);
  //=> nothing happens
```

We get a different set of values each tie we run it, sometimes we get no values at all!

Now, we might thing that this is the same thing as making a function that dynamically generates an array. It isn't because the values are generated *when we actually iterate over the iterator*.

We can prove that.

```javascript
const TimeNowAndLater = function * () {
  yield new Date;
  yield new Date;
}

console.log([...TimeNowAndLater()])
  //=> ["2016-05-07T17:37:46.676Z","2016-05-07T17:37:46.676Z"]
```

Now let's iterate over it using `.next()`:

```javascript
const TimeNowAndLater = function * () {
  yield new Date;
  yield new Date;
}

const iterateOverTime = TimeNowAndLater();

console.log(iterateOverTime.next())
  //=> {"value":"2016-05-07T17:40:21.752Z","done":false}

console.log(iterateOverTime.next())
  //=> {"value":"2016-05-07T17:40:21.752Z","done":false}

console.log(iterateOverTime.next())
  //=> {"done":true}
```

This is what we'd expect. Let's do it again, but we'll perform an experiement:

```javascript
const TimeNowAndLater = function * () {
  yield new Date;
  yield new Date;
}

const iterateOverTime = TimeNowAndLater();

console.log(iterateOverTime.next())
  //=> {"value":"2016-05-07T17:41:39.425Z","done":false}
```

Now I will stop writing and make myself an espresso. Back in a few ticks...

...

Ok, I'm back. Let's continue:

```javascript
console.log(iterateOverTime.next())
  //=> {"value":"2016-05-07T17:44:54.055Z","done":false}

console.log(iterateOverTime.next())
  //=> {"done":true}
```

As we can see, the dates are calculated when we actually get a value from the iterator, not in advance. This has two very important ramifications:

1. We can make iterators that could describe very large collections, even infinite collections, and not take up a lot of space, because we don't need to calculate all of the values before we use them, and;
2. We can make iterators that are dynamic, not static.

We'll see how to take advantage of this later.

### iterables that aren't made by generators

Not all iterables are made by generators. For example, an array literal is not a generator. Can we iterate over an array? Of course!

```javascript
for (const something of [1, 2, 3]) console.log(something);
  //=> 1
       2
       3
```

How about using `.next()`?

```javascript
[1, 2, 3].next()
  //=> [1, 2, 3].next() is not a function
```

Nope. What's going on? Let's try to find out why a `for... of` loop works for both arrays and iterables, but `.next()` does not. Here's something interesting:

```javascript
const atom = Object.create(null);

for (const something of atom) console.log(something);
  //=> atom[Symbol.iterator] is not a function
```

When we use a `for... of` loop, JavaScript seems to be invoking a hidden method bound to `Symbol.iterator`. Does an array have one?

```javascript
typeof [][Symbol.iterator]
  //=> function
```

Indeed it does. How about the iterable we get from a generator?

```javascript
const Empty = function * () {};

typeof Empty()[Symbol.iterator]
  //=> function
```

Indeed it does. So now we know: *An iterable is an object with a* `[Symbol.iterator]` *method*.

What does the `[Symbol.iterator]` method return? *An iterator*. What is an iterator? An object with a `.next()` method.

So when we call `for (const something of iterable) console.log(something)`, what actually happens is that JavaScript translates it into something like:

```javascript
let done, value;
const iterator = iterable[Symbol.iterator]();

while (({done, value} = iterator.next()), !done) {
  const something = value;

  console.log(something);
}
```

Can something be an iterator *and* iterable? Yes! And this is an excellent practice. Note:

```javascript
let done, value;

const iterateOver123 = [1, 2, 3][Symbol.iterator]();

({done, value} = iterateOver123.next());

console.log(value)
  //=> 1
```

Now let's treat `iterateOver123` as an iterable:

```javascript
for(const something of iterateOver123) console.log(something);
  //=> 2
       3
```

Fundamentally, iterators are iterable, and they return themselves when you ask them for an iterator.

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
