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

Before we get to the main bit of business, here's what we presume we understand: In JavaScript, a **generator function** is a function declared with an `*`. Here's the simplest possible generator function:

```javascript
const Empty = function * () {};
```

If you invoke a generator function, you get an object back, and you don't need to use a `return` keyword:

```javascript
Empty()
  //=> {}
```

This object is a **generator**. Generator functions always return generators.

What can we do with a generator? We can iterate over it (even though there's nothing to iterate over in an empty generator function):

```javascript
for (const something of Empty())
  console.log(something);
  //=> nothing happens!
```
Generator functions can `yield` values. When we iterate over the resulting generator, we get that value:

```javascript
const One = function * () {
  yield 1;
}

for (const something of One())
  console.log(something);
  //=> 1
```

If a generator function yields more than one value, the generator iterates over the values successively:

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

Generators are *iterable* because they implements the `[Symbol.iterator]` method:

```javascript
const Empty = function * () {};

const iterable = Empty();

typeof iterable[Symbol.iterator]
  //=> function
```

Generators are actually *iterators*, because they implement the `.next` method:

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

Generator functions can *flatten* an iterable with `yield *`:

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

That's it, we're ready to talk about...

---

# Generators for People Who Don’t Give a Shit About GettingStuffDone™

---

[![Plasma Generator](/assets/images/plasma-generator.jpg)](https://www.flickr.com/photos/willfolsom/6951127040)

---

### basic building blocks for generators

Let's start with a simple generator function, it takes zero or more values and returns an iterator over the values (if any):

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

`just` makes an iterable out of values. How do we get values out of an iterable? Here's `first`, it's an ordinary function that returns the first value yielded by an iterable:

```javascript
function first (iterable) {
  const iterator = iterable[Symbol.iterator]();

  const { done, value } = iterator.next();
  if (!done) return value;
};

first(['Hello', 'Java', 'Script'])
```

We can also `take` multiple elements. We use a generator function so that we can iterate over the elements we take:

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

The inverse of `first` is `rest`, a generator function that takes an `iterable` and yields all but the first value:

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

If we already have an iterator, we don't need `split`: Once you take the `first` value, the iterator will return the rest of the values automatically. But as we see in this example, we might have an expression that provides an iterator, so `split` lets us bind both values at once.

The inverse of splitting an iterable into `first` and `rest` is to `join` them:

```javascript
function * join (first, rest) {
  yield first;
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

With these basic building blocks in place, we can look at some interesting generator functions: Generator functions that `yield *` themselves.

---

[![Mirror, mirror](/assets/images/mirror.jpg)](https://www.flickr.com/photos/elsie/3878943067)

---

### self-referential generators

We have seen that generator functions can `yield *` iterators... Even those produced by other generator functions. What about themselves? Can a generator function yield itself? Consider:

```javascript
function * infiniteNumberOf (something) {
  yield * join(something, infiniteNumberOf(something));
}

for (const something of infiniteNumberOf(1))
  console.log(something);
  //=> 1
       1
       1
       ...
```

`infiniteNumberOf` yields an iterator that yields `something` an infinite number of times. So if we want an infinite number of `1`s, we can use `infiniteNumberOf(1)`. Taking an argument for a generator function that refers to itself is interesting. For example, we could write:

```javascript
function * from (first, increment = 1) {
  yield * join(first, from(first + increment, increment));
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
  yield * join(first, sequence(nextFn(first), nextFn));
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
function * sequencePairs (first, second, nextFn = (x, y) => y) {
  yield * join(first, sequencePairs(second, nextFn(first, second), nextFn));
}

const fibonacci = sequencePairs(0, 1, (x, y) => x + y);

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

We will come back to this sequence, but first, let's look at generator functions that transform other generators.

---

[![Body/Frame Assembly Line](/assets/images/body-frame.jpg)](https://www.flickr.com/photos/kojach/4082970890)

---

### generator functions that transform other generators

Our "self-referential generator functions" yield values that are derived from the values they've already yielded. In a sense, these generator functions transform themselves. Generator functions can, in fact, transform other generators (or more generally, transform any iterable).

The simplest example is `mapWith`:

```javascript
function * mapWith (fn, iterable) {
  const asSplit = split(iterable);

  if (asSplit.hasOwnProperty('first')) {
    const { first, rest } = asSplit;

    yield * join(fn(first),mapWith(fn, rest));
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

Another simple generator function that transforms an iterator is `filterWith`:

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

We can use `filterWith` and a self-referential generator function to make an [Unfaithful Sieve of Eratosthenes][1]:

[1]: http://raganwald.com/2016/04/25/hubris-impatient-sieves-of-eratosthenes.html "The Hubris of Impatient Sieves of Eratosthenes"

```javascript
function * primes (numbers = from(2)) {
  const { first, rest } = split(numbers);

  yield * join(first, filterWith((n) => n % first !== 0, primes(rest)));
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

These are great, but sometimes we want to transform more than one generator.

---

[![Zipper](/assets/images/zipper.jpg)](https://www.flickr.com/photos/southpaw2305/3474989098)

---

### generator functions that transform one or more generators

`mapWith` was a generator function that transformed an iterable by mapping its values with a unary function. Thus, `mapWith((x) => x*3, from(1))` gives us an iterator over the multiples of three.

But what about mapping over *two or more* iterables? How would that work? The simplest method is to iterate over all the iterables simultaneously, taking an element from each one, and mapping the pair of elements to a value. If any of them run out of values, stop:

```javascript
function * zipWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield * join(fn(...firsts), zipWith(fn, ...rests));
  }
}

const greetings = zipWith(
    (x, y) => `${x} ${y}`,
    ['hello', 'bonjour', 'hej'],
    ['frank', 'pascal', 'rognvoldr']
  );

for (const something of greetings)
  console.log(something);
  //=> "hello frank"
       "bonjour pascal"
       "hej rognvoldr"
```

This has an interesting possibility. We used `sequencePairs` to arrange things so that we could do a computation on successive elements of a self-referential sequence. What if we use `zipWith` self-referentially?

```javascript
function * fibonacci2 () {
  yield 0;
  yield 1;
  yield * zipWith(
      (x, y) => x + y,
      fibonacci2(),
      rest(fibonacci2())
    );
};
```

In this case, we zip an iterator with itself, but use `rest` to offset it by one. Thus, each element is zipped with the element preceding it. Let's use that trick again:

```javascript
function * phi () {
  yield * rest(
    zipWith(
      (x, y) => x / y,
      rest(fibonacci2()),
      fibonacci2()
    )
  );
};

for (const something of phi())
  console.log(something);
  //=> 1
       2
       1.5
       1.6666666666666667
       1.6
       1.625
       1.6153846153846154
       1.619047619047619
       1.6176470588235294
       1.6181818181818182
       ...
```

We have written a generator function that converges (slowly) on the Golden Ratio, `1.6180339...`. But let's look at `zipWith` more closely:

```javascript
function * zipWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield * join(fn(...firsts), zipWith(fn, ...rests));
  }
}
```

`zipWith` splits all of the iterables we supply. If we have a `first` for each iterable, it `yield *`'s the result of `join` the result of applying the `fn` to the `firsts` with the `zipWith` of the `rests`.

What happens if we only provide *one* iterable to `zipWith`?

```javascript
cont reciprocals = zipWith((n) => 1/n, phi());

for (const something of reciprocals)
  console.log(something);
  //=> 1
       0.5
       0.6666666666666666
       0.6
       0.625
       0.6153846153846154
       0.6190476190476191
       0.6176470588235294
       0.6181818181818182
       0.6179775280898876
       ...
```

It behaves just like `mapWith`! Now we understand that `mapWith` is a special case of `zipWith`! So let's consolidate our understanding, and call it `mapWith`:

```javascript
function * mapWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield * join(fn(...firsts), zipWith(fn, ...rests));
  }
}
```

This is good stuff, but let's take a moment and have a look at our programming style.

---

[![Image of the front of a generator, credit www.cwcs.co.uk](/assets/images/415-volts.jpg)](https://www.flickr.com/photos/122969584@N07/13780794954)

---

### writing generator functions in generator style

Let's pause for a moment and look at the way we've been writing our generator functions that transform other generators. Once more, `mapWith`:

```javascript
function * mapWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield * join(fn(...firsts), mapWith(fn, ...rests));
  }
}
```

Notice that we've written this to:

1. Be recursive, and;
2. To compose a new iterator with `join`, and;
3. To `yield *` the new iterator it composes.

This is written in *pure functional style*. It reads as if it was a function that only has to return one value for each invocation. Furthermore, its mental model is of transforming one generator function into another:

> The mapped generator consists of the function applied to the firsts of the argument iterables, joined with a mapping of the function to the rests of the iterables.

But that's not the only way that generator functions have to work. We can just as easily write:

```javascript
function * mapWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield fn(...firsts);
    yield * mapWith(fn, ...rests);
  }
}
```

Now we're saying:

> Yield the result of applying the function to the firsts of the argument iterables, then yield the values of mapping the function over the rests of the iterables.

Removing the `join` mean we're yielding something, suspending the generator function, then yielding the remainder later. This is stateful, which is mentally the opposite of the way that functional programming works. But that doesn't mean it's wrong.

Let's keep going with statefulness. Why not iterate instead of writing a recursive generator function?

```javascript
function * mapWith (fn, ...iterables) {
  const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());

  while (true) {
    const pairs = iterators.map((iterator) => iterator.next());
    const values = pairs.map((pair) => pair.value);
    const dones = pairs.map((pair) => pair.done);

    if (dones.find((done) => done)) {
      return;
    } else {
      yield fn(...values);
    }
  }
}
```

This reads in a different way:

> Get iterators for all the iterables, then repeat the following: Get all the values for all the iterators. If any iterator is done, we're done. If not, yield the result of applying the function to the values, and repeat.

This is exactly what generator functions were designed to do: To execute code while yielding values as we go. We can rewrite our other generator functions in iterative style:

```javascript
function * filterWith (fn, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (true) {
    const { value, done } = iterator.next();

    if (done) {
      return;
    } else if (fn(value)) {
      yield value;
    }
  }
}

function * infiniteNumberOf (something) {
  while (true) {
    yield something;
  }
}

function * from (number, increment = 1) {
  while (true) {
    yield number;
    number = number + increment;
  }
}

function * sequence (value, nextFn = (x) => x) {
  while (true) {
    yield value;
    value = nextFn(value);
  }
}

function * primes (numbers = from(2)) {

  while (true) {
    const { first, rest } = split(numbers);

    yield first;
    numbers = filterWith((n) => n % first !== 0, rest);
  }
}

function * sequencePairs (first, second, nextFn = (x, y) => y) {
  yield first;
  while (true) {
    yield second;
    [first, second] = [second, nextFn(first, second)]
  }
}
```

These no longer have the mathematical "purity" of the functional-style implementations, but then again, generator functions are not really functions, aren't really used like functions, and perhaps we shouldn't try to write them like functions.

---

[![Points Forever](/assets/images/points-forever.jpg)](https://www.flickr.com/photos/doomkitty/9111742097)

---

### the problem with mapping generator functions with themselves

Recall `fibonacci2` (now written with our new `mapWith`), which maps itself against itself:

```javascript
function * fibonacci2 () {
  yield 0;
  yield 1;
  yield * mapWith(
      (x, y) => x + y,
      fibonacci2(),
      rest(fibonacci2())
    );
};
```

And `phi`, which uses the same technique of mapping `fibonacci` against itself:

```javascript
function * phi () {
  yield * rest(
    mapWith(
      (x, y) => x / y,
      rest(fibonacci2()),
      fibonacci2()
    )
  );
};
```

These look like we're mapping iterables against themselves, but more accurately, we are comparing *generator functions* against themselves, which gives us the ability to write `fibonacci()` and generate a brand-new generator whenever we want.

This distinction is important. If we have an iterator, we can't restart it at the beginning whenever we like. That's not how iterators work: They statefully progress from beginning to end, you can't restart them or move backwards.

So the generator functions we wrote above only work because we can invoke `fibonacci()` and make new iterators whenever we want. If we tried to use a similar pattern with an iterable, it would break, because we can't use an iterator twice.

One approach is to rethink the way iterators work. As supplied, they operate on one value at a time. Fine. But what if they operated on more than one element at a time, in slices of a particular length?

```javascript
function * slices (length, iterable) {
  const iterator = iterable[Symbol.iterator]();
  let buffer = [...take(length, iterator)];

  if (buffer.length < length) return;

  let nextElementIndex = 0;

  while (true) {
    yield buffer;

    const { value, done } = iterator.next();

    if (done) return;

    buffer = buffer.slice(1);
    buffer.push(value);
  }
}

const numberAndNext = slices(2, from(1));

for (const something of numberAndNext)
  console.log(something);
  //=> [1,2]
       [2,3]
       [3,4]
       [4,5]
       ...
```

Now we can revisit our recursive `fibonacci2`:

```javascript
function * fibonacci3 () {
  yield 0;
  yield 1;
  yield * mapWith(
      ([x, y]) => x + y,
      slices(2, fibonacci3())
    );
};
```

We're still recursively calling `fibonacci`, but we are no longer trying to invoke it twice for each element we evaluate. Instead, we map over `slices` of `finbonacci`. We can do the same thing with `phi`:

```javascript
function * phi2 () {
  yield * rest(
    mapWith(
      ([x, y]) => x / y,
      slices(2, fibonacci3())
    )
  );
};
```

How do we know when we've converged?

```javascript
function within (tolerance) {
  return (([x, y]) => Math.abs(x - y) <= tolerance);
}
```

Let's apply it:

```javascript
const pairsOfPhi = slices(2, phi2());
const pairsWithinTolerance = filterWith(within(0.00000001), pairsOfPhi);
const firstPairWithinTolerance = first(pairsWithinTolerance);
const [_, estimate] = firstPairWithinTolerance;

estimate
  //=> 1.6180339901755971
```

But hang on, something's not quite right.

---

[![Sanyo bottom-bracket generator](/assets/images/sanyo-generator.jpg)](https://www.flickr.com/photos/tsackett/111598117)

---

### composing generator functions

Let's look at two lines from our phi-calculating code:

```javascript
const pairsWithinTolerance = filterWith(within(0.00000001), pairsOfPhi);
const firstPairWithinTolerance = first(pairsWithinTolerance);
```

The core logic is: `first(filterWith(...))`. What does it mean? "Take the first element of all the elements that pass the filter." We can make that a function:

```javascript
function firstWhen (filterFn, iterable) {
  return first(filterWith(filterFn, iterable));
}
```

`firstWhen` is useful, it's just like `Array.prototype.find`. We should keep it around. But remember when we were writing everything "functionally" above? Why can't we do the same with `firstWhen`? In functional programming, `compose` is a function that, well, *composes* two functions together. Thus `compose(a, b)(c) === a(b(c))`.

There are lots of examples around the internet, or in books like JavaScript Allongé:[^js]

[^js]: Shameless plug: [https://leanpub.com/javascriptallongesix](https://leanpub.com/javascriptallongesix)

```javascript
function compose(a, b) {
  return function (...args) {
    return a.call(this, b.apply(this, args));
  }
}

const a = (n) => `the result is ${n}`;
const b = (n) => n * n;
const c = compose(a, b);

c(16)
  //=> the result is 256
```

Looks good. Let's use it with `first` and `filterWith` to produce `firstWhen`:

```javascript
const firstWhen = compose(first, filterWith);

const pairsOfPhi = slices(2, phi());
const firstPairWithinTolerance = firstWhen(within(0.00000001), pairsOfPhi);
const [_, estimate] = firstPairWithinTolerance;

estimate
  //=> 1.6180339901755971
```

Fantastic! Let's use compose again, we're on a roll. If we have `firstWhen`, eventually we'll want `restWhen`:

```javascript
function * restWhen (filterFn, iterable) {
  yield * rest(filterWith(filterFn, iterable));
}

const squares = mapWith((x) => x * x, from(1));
const isOdd = (n) => n % 2 === 1;

restWhen(isOdd, squares)
  //=> 9
       25
       49
       81
       121
       169
       225
       ...
```

So let's use `compose` to do the same thing:

```javascript
const restWhen = compose(rest, filterWith);

restWhen(isOdd, squares)
  //=> 9
       25
       49
       81
       121
       169
       225
       ...
```

It is handy to be able to compose generator functions, but using `compose` to create generator functions teaches us something: **We can make generators with ordinary functions that invoke generator functions**.

But not always! Recall our recursive generator functions, like `infiniteNumberOf`:

```javascript
function * infiniteNumberOf (something) {
  yield * join(something, infiniteNumberOf(something));
}

[...take(10, infiniteNumberOf('spam'))]
  //=> ["spam","spam","spam","spam","spam","spam","spam","spam","spam","spam"]
```

We know we can also rewrite it as an ordinary function that returns a generator. Or can we?

```javascript
function infiniteNumberOf2 (something) {
  return join(something, infiniteNumberOf2(something));
}

[...take(10, infiniteNumberOf2('spam'))]
  //=> Maximum call stack size exceeded.
```

When invoked, a generator function immediately returns a generator. When we ask for the first value with with `.next`, it executes until it reaches a `yield`, then suspends its execution until we ask for another value with `.next`.

Thus, our `infiniteNumberOf` generator function returns a generator immediately. When we invoke `.next` on it, it invokes `.join`, and the `yield *` invokes `.next` on that generator. Which executes until it reaches a `yield` and yields `'spam'`. When we invoke `.next` again, it starts to evaluate he nested `infiniteNumberOf(something)`.

But when we invoke `infiniteNumberOf2`, an ordinary function, things are very different. Right away, it evaluates `join(something, infiniteNumberOf2(something))`. To do that, it evaluates the variable reference `something`, and the function invocation `infiniteNumberOf2(something)`. Which starts the cycle all over again and continues to infinity, or until we un out of stack.

The lesson is that we can write functions that return generators, but we must be careful lest the eager evaluation of ordinary functions destroys the lazy evaluation semantics we expect from generator functions.

---

# Generalizing Generators

---

[![Oware](/assets/images/oware.jpg)](https://www.flickr.com/photos/elpadawan/8479297425)

---

### invocations

Let's back up a bit. Consider this ridiculously simple generator, written in generator style:

```javascript
function * infiniteNumberOf (something) {
  while (true) {
    yield something;
  }
}
```

When we invoke it, we get back an *iterator*:

```javascript
const iterator = infiniteNumberOf('JavaScript Allongé');
```

From that point on, whenever we invoke `.next()` on the iterator, we get a "Plain Old JavaScript Object" back, with a `value` property:

```javascript
iterator.next();
  //=> {"value":"JavaScript Allongé", "done":false}

iterator.next();
  //=> {"value":"JavaScript Allongé", "done":false}

iterator.next();
  //=> {"value":"JavaScript Allongé", "done":false}
```

We can do the semantically same thing with plain-old-functions:

```javascript
function plentyOf (something) {
  return () => something;
}

const fn = plentyOf('JavaScript Allongé');

fn()
  //=> "JavaScript Allongé"

fn()
  //=> "JavaScript Allongé"

fn()
  //=> "JavaScript Allongé"
```

A generator makes a thingummy that when invoked, returns a value, and you can invoke it more than once, and you get a value each time. And we can make a function-making-function that returns a function, and you can invoke that function more than once, and you get a value each time.

Of course, you don't need to get the *same* value each time. Here's a generator and an equivalent function-making-function that produce squares of two:

```javascript
function * exponentsOfTwo () {
  let exponent = 0;

  while (true) {
    yield Math.pow(2, exponent++);
  }
}

const exponents = exponentsOfTwo();

exponents.next()
  //=> {"value":1,"done":false}

exponents.next()
  //=> {"value":2,"done":false}

exponents.next()
  //=> {"value":4,"done":false}

exponents.next()
  //=> {"value":8,"done":false}


function powersOfTwo () {
  let exponent = 0;

  return () => Math.pow(2, exponent++);
}

const fn = powersOfTwo();

fn()
  //=> 1

fn()
  //=> 2

fn()
  //=> 4

fn()
  //=> 8
```

We can see that internally, the fundamental difference between invoking a generator with `.next()` and invoking a function with `()`, is that if we want the function to maintain state, we do it by storing the state as bindings in an enclosing scope.

This is because every time we invoke the function, we start with a fresh invocation of the function, whereas with the iterator we have the same invocation, its just that when it yields a value, we suspend its invocation until we call `.next()` again.

---

[![Play](/assets/images/play.jpg)](https://www.flickr.com/photos/annieroi/4421442720)

---

### suspension and resumption

Let's look at suspending and resuming again. Here's a generator that gratitously makes this explicit:

```javascript
function * numbers () {
  let tens = 0;

  while (true) {
    yield tens + 0;
    yield tens + 1;
    yield tens + 2;
    yield tens + 3;
    yield tens + 4;
    yield tens + 5;
    yield tens + 6;
    yield tens + 7;
    yield tens + 8;
    yield tens + 9;
    ++tens;
  }
}
```

As we can see, it suspends and resumes its execution, moving on to the next yield statement each time. This is not the same thing as a function: Functions start a new invocation each time, with execution beginning at the top and moving to the end or to a return statement, which ends the invocation.

In fact, when a compiler translates ECMAScript 2015 code into ECMAScript 5, it has to translate the generators into functions. Since functions cannot suspend and resume their operation, the compiler has to transform generators into objects that act as state machines.

Here's how Babel translates our function (as of June, 2016):

```javascript
function numbers() {
  var tens;
  return regeneratorRuntime.wrap(function numbers$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          tens = 0;

        case 1:
          if (!true) {
            _context10.next = 25;
            break;
          }

          _context10.next = 4;
          return tens + 0;

        case 4:
          _context10.next = 6;
          return tens + 1;

        case 6:
          _context10.next = 8;
          return tens + 2;

        case 8:
          _context10.next = 10;
          return tens + 3;

        case 10:
          _context10.next = 12;
          return tens + 4;

        case 12:
          _context10.next = 14;
          return tens + 5;

        case 14:
          _context10.next = 16;
          return tens + 6;

        case 16:
          _context10.next = 18;
          return tens + 7;

        case 18:
          _context10.next = 20;
          return tens + 8;

        case 20:
          _context10.next = 22;
          return tens + 9;

        case 22:
          ++tens;
          _context10.next = 1;
          break;

        case 25:
        case "end":
          return _context10.stop();
      }
    }
  }, _marked[9], this);
```

Although this is not a particularly stellar example, it does illustrate the idea that sometimes, if we want a stateful function that can be called multiple times, a generator that suspends and resumes can provide a clearer way to express the statefulness versus a function or object that stores state in properties or variables.


---

### source code

<script src="https://gist.github.com/raganwald/702d4a24b1bdff9f9c1789c85b1f6979.js"></script>

---

[![Important Message](/assets/images/important-message.jpg)](https://www.flickr.com/photos/pdenker/6001236724)

---

### important message

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### notes
