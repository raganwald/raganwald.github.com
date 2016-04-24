---
title: "“Programs must be written for people to read, and only incidentally for machines to execute”"
layout: default
tags: [allonge]
---

### hal abelson

[![Photo of Hal Abelson by Joi Ito](/assets/images/HalAbelson.jpg)](https://www.flickr.com/photos/35034362831@N01/2108746065)

---

### the fibonacci numbers

In mathematics, the Fibonacci numbers or [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_number) are numbers in the following integer sequence: `0, 1, 1, 2, 3, 5, 8, 13, 21, …`.[^hist]

[^hist]: The numbers were originally given as `1, 1, 2, 3, 5, 8, 13, 21, …`, but it is more convenient for modern purposes to begin with `0` and `1`.

The rule for determining the sequence is quite simple to explain:

0. The first number is `0`.
0. The second number is `1`.
0. Every subsequent number is the sum of the two previous numbers.

Thus, the third number is `1` (0 + 1), the fourth number is `2` (1 + 1), and that makes the fifth number `3` (1 + 2), the sixth number `5` (2 + 3) and so on _ad infinitum_.

There are many ways to write a program that will output the Fibonacci numbers. each method optimizes for some particular purpose. We'll start by optimizing for being as close as possible to the written description of the numbers:

```javascript
function fibonacci () {
  console.log(0);
  console.log(1);

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
```

This is a reasonable first crack, but we can do better.

The sample above prints the numbers out to infinity. Which is the letter of the definition, but not useful for most purposes. If we only wanted, say, the first 10 or first 100, or any arbitrary number of fibonacci numbers? We'd have to weave logic about when to stop into our code:

```javascript
function fibonacci (numberToPrint) {
  console.log(0);

  if (numberToPrint === 1) return;

  console.log(1);

  if (numberToPrint === 2) return;

  let [previous, current] = [0, 1];

  for(let numberPrinted = 2; numberPrinted <= numberToPrint; ++numberPrinted) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
```

The logic for the number of results we want is buried inside the middle of our code. Ideally, the definition of the sequence can be written completely independently of the mechanism for figuring out how many numbers we need.

And there's another problem. How do we know what we want to do with the numbers? maybe we want to print them out, but then again, maybe we want to do something else, like stuff them in an array, or count how many are even and how many are odd?

---

### separating concerns

Our code at the moment entangles these concerns, and our first improvement is to separate the concerns by rewriting our algorithm as a [generator](http://raganwald.com/2015/11/03/a-coding-problem.html "Solving a Coding Problem with Iterators and Generators"). Generators are an excellent way of separating "what we do with the steps of a calculation" from "how we calculate the steps."

```javascript
function * fibonacci () {
  yield 0;
  yield 1;

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    yield current;
  }
}
```

Our generator _yields_ the values of the fibonacci function instead of logging them to the console. So instead of calling a function and things happen, we call `fibonacci` and get an _iterator_. That iterator can be used in a `for` loop, we can call its `Symbol.iterator` function to extract the values in sequence, or better still, we can take advantage of standard operations on generators and iterators, like `take`.

`take` is a function that turns an iterator that yields many values (even an infinite number), and yields no more than a certain number of values. We use it when we want to (cough) take a certain number of values from an iterator.

We can find an implementation of `take` in an [npm module](https://github.com/jb55/take-iterator), or just borrow some code from [JavaScript Allongé][ja]:

[ja]: https://leanpub.com/javascriptallongesix

```javascript
function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (!done) yield value;
  }
}
```

And then log them to the console:

```javascript
for (let n of take(10, fibonacci())) {
  console.log(n);
}
```

The code above calls `fibonacci()` to get an iterator over the Fibonacci numbers, then `take(10, fibonacci())` turns that into an iterator over the first ten numbers of the Fibonacci numbers, then we run a `for` loop over those.

To show that we are now able to be much more flexible, here we can splat the same values into an array:

```javascript
[...take(10, fibonacci())]
```

We won't get into counting evens and odds just yet, we've already made the point that we can make our `fibonacci` function more readable for people by ruthlessly pairing it down to do just one thing and combining it with other functions and code externally, rather than stuffing the other code inside our function.

---

### simplicity

Turning `fibonacci` into a generator requires understanding what a generator is, and how the `take` operation converts a generator with a possibly infinite number of values into a generator that produces a fixed number of values.

It's almost certainly not worth learning all this _just_ for Fibonacci numbers, but if we do learn these things and then "internalize" them, it becomes a marvellous win, because we can write something like:

```javascript
function * fibonacci () {
  yield 0;
  yield 1;

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    yield current;
  }
}
```

And we are simply and very directly reproducing the definition as it was given to us, without cluttering it up with a lot of other concerns that dilute the basic thing we want to communicate.

But if we don't know about generators, or we know about generators but aren't familiar with operations like `take`, or we have never written a generator but vaguely know that clever people can use them to create some keywords for serializing asynchronous code but we don't need to know how it works as long as we have an `async` keyword and a compiler...

Well, then, this code just looks like mathematical wankery, and we will write a blog post congratulating ourselves on doing the "simple" thing and just writing:

```javascript
function fibonacci (numberToPrint) {
  console.log(0);

  if (numberToPrint === 1) return;

  console.log(1);

  if (numberToPrint === 2) return;

  let [previous, current] = [0, 1];

  for(let numberPrinted = 2; numberPrinted <= numberToPrint; ++numberPrinted) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
```

And then when we build larger and larger programs, at each step of the way eschewing an abstraction or technique because not using the technique we don't know is "simpler," and we are 100% certain at every step that we have done the right thing and avoided writing "clever" code.

It seems obvious that understanding the capabilities of our tools and how to use them in direct and obvious ways to do the things they were designed to do is not "clever." So what is "clever code?"

---

### clever code

Here is the naïve way to extract a _particular_ Fibonacci number from our generator:

```javascript
const fibonacciAt = (index) =>
  [...take(index + 1, fibonacci())][index];

fibonacciAt(7)
  //=> 13
```

Take all the values up to the one we want, splat them into an array, and then take the one we want. This is very wasteful of space, and really, we're trying to write:

```javascript
const fibonacciAt = (index) => [...fibonacci()][index];
```

But the way JavaScript works, that would first try to create an infinitely long array, then it would run out of space. So sticking `take` in the expression is mixing what we want to write with some workaround for JavaScript being an [eagerly evaluated language](https://en.wikipedia.org/wiki/Eager_evaluation).

Mixing two things together is not what we want to do, so even though on the surface `[...take(index + 1, fibonacci())][index]` looks clever because it's so terse, it's _the wrong kind of clever_.

This gives us a hint about when some inscrutable code is an abstraction that maybe we ought to learn, and when it's just "clever:" If it's short because it only does one thing, that's good. If it's short but mixes concerns, maybe it's just clever.

If taking a set of values from an iterator is a standard operation, maybe we can separate "how we take a particular number" from "how we calculate the numbers." Our first crack looks like this:

```javascript
const at = (index, iterable) => [...take(index+1, iterable)][index];

at(7, fibonacci())
  //=> 13
```

We are still using `take` as a workaround for JavaScript, but now we've tucked it inside the `at` function, and being able to write `at(7, fibonacci())` is short and whatever we do with that expression won't be cluttered up with implementation details.

For example, we could rewrite `at` so that it doesn't create a long array just to ignore all but the last value:

```javascript
function at (index, iterable) {
  const iterator = iterable[Symbol.iterator]();
  let value = undefined;

  for (let i = 0; i <= index; ++i) {
    value = iterator.next().value;
  }

  return value;
}

at(7, fibonacci())
  //=> 13
```

Separating concerns is more valuable than mixing them in terse code for precisely this reason: You can work on the separate pieces independently.

---

### writing for an audience

Let's look at `fibonacci` again:

```javascript
function fibonacci () {
  console.log(0);
  console.log(1);

  let [previous, current] = [0, 1];

  while (true) {
    [previous, current] = [current, current + previous];
    console.log(current);
  }
}
```

This is _procedural_: It's a recipe for calculating the values one by one, as you might give it to a school child to practise arithmetic. Which is fine, _but it's just arithmetic_. Math is more than arithmetic.

What if the written instructions were: "The sequence of Fibonacci numbers are the numbers 0, 1, and sum of composing the sequence with itself offset by one." That's a more _geometric_ way to visualize the numbers, and it requires some mental facility with recursion and operations on sequences.

Working along those lines, the simplest implementation starts with `zipWith`, an operation that composes two iterators using a supplied "zipper" function:

```javascript
function * zipWith (zipper, ...iterables) {
  const iterators = iterables.map(i => i[Symbol.iterator]());

  while (true) {
    const pairs = iterators.map(j => j.next()),
          dones = pairs.map(p => p.done),
          values = pairs.map(p => p.value);

    if (dones.indexOf(true) >= 0) break;
    yield zipper(...values);
  }
};

zipWith((x, y) => x + y, [1, 2, 3], [1000, 2000, 3000])
  //=> iterator over 1001, 2002, 3003
```

For offsetting a sequence by one, we can use `tail`, which iterates over all the values of an iterator except its "head:"

```javascript
function * tail (iterable) {
  const iterator = iterable[Symbol.iterator]();

  iterator.next();
  yield * iterator;
}
```

Given these two, if we had a `fibonacci` generator, we could yield the values of composing it with itself offset by one like this:

```javascript
function * fibonacci () {
  yield * zipWith((x, y) => x + y, fibonacci(), tail(fibonacci()));
}
```

What about the first two values?

```javascript
function * fibonacci () {
  yield 0;
  yield 1;
  yield * zipWith((x, y) => x + y, fibonacci(), tail(fibonacci()));
}
```

Now, there is a performance implication of this expression, but let's set that aside for a moment to consider: Which is better? The expression that describes composing a sequence with itself? Or the expression that describes procedurally generating numbers?

In other words, do we think in arithmetic or geometry?

The answer seems easy: If we're talking about Fibonacci, go with geometry. It is, after all, a _mathematics_ function. If you ever did have to write it for a program, anybody looking at the code ought to have enough of a background in mathematics to appreciate composing sequences recursively. For the same reason, if you wanted to write  [this](http://raganwald.com/2015/12/20/an-es6-program-to-compute-fibonacci.html):

```javascript
import { zero, one } from 'big-integer';

let times = (...matrices) =>
  matrices.reduce(
    ([a, b, c], [d, e, f]) => [
        a.times(d).plus(b.times(e)),
        a.times(e).plus(b.times(f)),
        b.times(e).plus(c.times(f))
      ]
  );

let power = (matrix, n) => {
  if (n === 1) return matrix;

  let halves = power(matrix, Math.floor(n / 2));

  return n % 2 === 0
         ? times(halves, halves)
         : times(halves, halves, matrix);
}

let fibonacciAt = (n) =>
  n < 2
  ? n
  : power([one, one, zero], n - 1)[0];
```

That would be fine as well. It is math, anybody looking at it ought to have the mathematics background or be prepared to look it up. As a car driver, I expect the steering wheel in the usual place and to find the other controls as a driver would expect them. But I appreciate that the engine will be designed for the mechanically inclined.

This analogy of the driver and the automobile applies to our "geometric" expression:

```javascript
function * fibonacci () {
  yield 0;
  yield 1;
  yield * zipWith((x, y) => x + y, fibonacci(), tail(fibonacci()));
}
```

The mathematician in the driver's seat may be happy, but the programmer working with the engine realizes that this expression recursively generates generators. Nice car, but it's a gas guzzler.

We can fix this, but once again, we do our utmost to separate how we fix it from the code itself:

```javascript
function memoize (generator) {
  const memos = {},
        iterators = {};

  return function * (...args) {
    const key = JSON.stringify(args);
    let i = 0;

    if (memos[key] == null) {
      memos[key] = [];
      iterators[key] = generator(...args);
    }

    while (true) {
      if (i < memos[key].length) {
        yield memos[key][i++];
      }
      else {
        const { done, value } = iterators[key].next();

        if (done) {
          return;
        } else {
          yield memos[key][i++] = value;
        }
      }
    }
  }
}

const mfibs = memoize(function * () {
  yield 0;
  yield 1;
  yield * zipWith(plus, mfibs(), tail(mfibs()));
});
```

Some code has multiple audiences, and separating the code's concerns enables each piece to speak to specialists in the appropriate domain without demanding that anybody reading it be familiar with both mathematics and the efficient reuse of previously computed values.

---

### "writing for people to read"

Code that is written in a particular domain can and should be written for programmers who are proficient with the tools of their trade. In ES6, that includes generators and common operations on sequences like `take`, `tail`, and `zipWith`.

Also, code that is written for a particular domain can and should be written for programmers who have domain-knowledge. A Fibonacci function should be written for the reader who has familiarity with mathematics. Code is written for humans to read, but there is a presumption that humans choosing to read it will have or be prepared to acquire the knowledge appropriate for that domain.[^business]

[^business]: Code written for the business domain can and should have abstractions appropriate for business software. Like state machines, domain-specific languages, batch jobs, and so forth.

When there are multiple concerns, each requiring attention to a different domain, we separate those concerns. This is why the engine of a car is hidden away from the driver and the passengers, and it is why the mechanics of computing a fibonacci number is separated from the programming issues of how to implement things like `take`, `tail`, `zipWith`, or `memoize`.

(discuss on [hacker news](https://news.ycombinator.com/item?id=11474000) or [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-03-17-programs-must-be-written-for-people-to-read.md))

---

### notes
