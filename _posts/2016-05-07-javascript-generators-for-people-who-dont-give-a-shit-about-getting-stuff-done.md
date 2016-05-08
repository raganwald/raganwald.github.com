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

If you invoke a generator, you get an object back, and you don't need to use a `return` keyword:

```javascript
Empty()
  //=> {}
```

This is completely unlike a normal function. What can we do with this thing they return? We can iterate over it, but there's nothing to iterate over:

```javascript
for (const something of Empty()) console.log(something);
  //=> nothing happens!
```

If you can iterate over something with a `for... of` loop, we call it an *iterable*. Iterables are values, so we can stick them in a variable, pass them to functions, and so forth:

```javascript
const nothing = Empty();

for (const something of nothing) console.log(something);
  //=> nothing happens!
```

So our empty generator makes iterables that act like an empty arrays. Can we make a generator that makes iterables that act like arrays with a value? Yes, with `yield`:

```javascript
const One = function * () {
  yield 1;
}

for (const something of One()) console.log(something);
  //=> 1
```

How about yielding two values? Yes, we can yield twice:

```javascript
const OneTwo = function * () {
  yield 1;
  yield 2;
}

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

for (const something of OneTwoThree()) console.log(something);
  //=> 1
       2
       3
```

When we yield multiple values, we get an iterable that acts like an array with multiple values.

---

### iterables

So what is an iterable, anyways? We have two examples, we can make our own iterable with a generator:

```javascript
const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}
```

And every array is an iterable: `[1, 2, 3]`. What do they have in common? Let's perform an experiment: What happens if we take something that isn't an iterable and try to use it as an iterable? In a strict language, the compiler would complain before we even tried to execute this code, but JavaScript is far more forgiving, it won't complain until we try to evaluate our code:

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

Indeed it does. So now we know: *An iterable is an object with a* `[Symbol.iterator]` *method*. What does the `[Symbol.iterator]` method return? *An iterator*.

---

### array iterators

What is an iterator? An iterator is a stateful object with a `.next()` method. An array is an iterable, but it is not an iterator:

```javascript
const array = [1, 2, 3];
typeof array.next
  //=> undefined

const iterator = array[Symbol.iterator];
typeof iterator.next
  //=> function
```

What does this `.next` method do? It repeatedly returns the next value as we iterate over the values in the array:

```javascript
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

We iterate over an iterator by repeatedly calling `.next()`. Every time we do so, we get back an object with a `done` property. While the iterator has values to yield, `done` is `false`, and it passes `value` along. When there are no more values to yield, `done` will be `true`.

Iterables could hold none or many values, and we don't know what those values are until we actually iterate. There is no `.length` property, no ability to access an arbitrary value, just the ability to serially fetch the next value until we're told that we are done.

Iterators are stateful. If we want to iterate over an array again, we need to fetch another iterator by calling the array's `[Symbol.iterator]` method again:

```javascript
const anotherIterator = array[Symbol.iterator];

let { done, value } = another_iterator.next();

{ done, value }
  //=> {"done":false,"value":1}

({ done, value } = another_iterator.next());

{ done, value }
  //=> {"done":false,"value":2}

({ done, value } = another_iterator.next());

{ done, value }
  //=> {"done":false,"value":3}

({ done, value } = another_iterator.next());

{ done, value }
  //=> {"done":true}
```

To summarize, arrays are iterables, because they have a `[Symbol.iterator]` method, but they are not iterators, because they don't have a `.next` method. The `for... of` loop requires an iterable.

### generated iterators

So what about our generators? Generator functions are neither iterables nor iterators themselves:

```javascript
const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}

typeof OneTwoThree[Symbol.iterator]
  //=> undefined

typeof OneTwoThree.next
  //=> undefined
```

But when *invoked*, they return iterables:

```javascript
const OneTwoThree = function * () {
  for (let i = 1; i <= 3; ++i) yield i;
}

const iterable = OneTwoThree();

typeof iterable[Symbol.iterator]
  //=> function

for (const something of iterable) console.log(something);
  //=> 1
       2
       3
```

Now, the iterable returned by a generator isn't exactly like an array, even though they both have a `[Symbol.iterator]` method. How can we tell? Well, the iterators returned by calling `[Symbol.iterator]` on an array aren't themselves iterable:

```javascript
const array = [1, 2, 3];

const arrayIterator = array[Symbol.iterator]();

typeof arrayIterator.next
  //=> function

typeof arrayIterator[Symbol.iterator]
  //=> function
```

What about the iterators produced by calling

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

We get a different set of values each time we run it, sometimes we get no values at all!

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
