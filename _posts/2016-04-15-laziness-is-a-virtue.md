---
title: "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"
layout: default
tags: [allonge]
---

### larry wall

[![Larry Wall and Camelia, the Perl 6 Mascot](/assets/images/Larry_Wall_and_Camelia.jpg)](https://en.wikipedia.org/wiki/Perl_6#/media/File:FOSDEM_2015_Larry_Wall_and_Camelia_the_Perl6_logo.jpg)

---

### laziness and eagerness

In computing, "laziness" is a broad term, generally referring to not doing any work unless you need it. Whereas its opposite is "eagerness," doing as much work as possible in case you need it later.

Consider this JavaScript:

```javascript
function ifThen (a, b) {
  if (a) return b;
}

ifThen(1 === 0, 2 + 3)
  //=> undefined
```

Now, here's the question: Does JavaScript evaluate `2+3`? You probably know the answer: Yes it does. When it comes to passing arguments to a function invocation, JavaScript is *eager*, it evaluates all of the expressions, and it does so whether the value of the expression is used or not.[^constant]

[^constant]: A few people have pointed out that a [sufficiently smart compiler](http://c2.com/cgi/wiki?SufficientlySmartCompiler) can notice that `2+3`involves two constants and a fixed operator, and therefore it can be compiled to `5` in advance. JavaScript does not *necessarily* perform this optimization, but if it did, we could substitute something like `x + y` and get to the same place in the essay.

If JavaScript was *lazy*, it would not evaluate `2+3` in the expression `ifThen(1 === 0, 2 + 3)`. So is JavaScript an "eager" language? Mostly. But not always! If we write: `1 === 0 ? 2 + 3 : undefined`, JavaScript does *not* evaluate `2+3`. Operators like `?:` and `&&` and `||`, along with program control structures like `if`, are lazy. You just have to know in your head what is eager and what is lazy.

And if you want something to be lazy that isn't naturally lazy, you have to work around JavaScript's eagerness. For example:

```javascript
function ifThenEvaluate (a, b) {
  if (a) return b();
}

ifThenEvaluate(1 === 0, () => 2 + 3)
  //=> undefined
```

JavaScript eagerly evaluates `() => 2 + 3`, which is a function. But it doesn't evaluate the expression in the body of the function until it is invoked. And it is not invoked, so `2+3` is not evaluated.

Wrapping expressions in functions to delay evaluation is a longstanding technique in programming. They are colloquially called [thunks](https://en.wikipedia.org/wiki/Thunk), and there are lots of interesting applications for them.

### generating laziness

The bodies of functions are a kind of lazy thing: They aren't evaluated until you invoke the function. This is related to `if` statements, and every other kind of control flow construct: JavaScript does not evaluate statements unless the code actually encounters the statement.

Consider this code:

```javascript
function containing(value, list) {
  let listContainsValue = false;

  for (const element of list) {
    if (element === value) {
      listContainsValue = true;
    }
  }

  return listContainsValue;
}
```

You are doubtless chuckling at its naïveté. Imagine this list was the numbers from one to a billion--e.g. `[1, 2, 3, ..., 999999998, 999999999, 1000000000]`--and we invoke:

```javascript
const billion = [1, 2, 3, ..., 999999998, 999999999, 1000000000];

containing(1, billion)
  //=> true
```

We get the correct result, but we iterate over every one of our billion numbers first. Awful! Small children and the otherwise febrile know that you can `return` from anywhere in a JavaScript function, and the rest of its evaluation is abandoned. So we can write this:

```javascript
function containing(list, value) {
  for (const element of list) {
    if (element === value) {
      return true;
    }
  }

  return false;
}
```

This version of the function is lazier than the first: It only does the minimum needed to determine whether a particular list contains a particular value.

From `containing`, we can make a similar function, `findWith`:

```javascript
function findWith(predicate, list) {
  for (const element of list) {
    if (predicate(element)) {
      return element;
    }
  }
}
```

`findWith` applies a predicate function to lazily find the first value that evaluates truthily. Unfortunately, while `findWith` is lazy, its argument is evaluated eagerly, as we mentioned above. So let's say we want to find the first number in a list that is greater than `99` and is a palindrome:

```javascript
function isPalindromic(number) {
  const forwards = number.toString();
  const backwards = forwards.split('').reverse().join('');

  return forwards === backwards;
}

function gt(minimum) {
  return (number) => number > minimum;
}

function every(...predicates) {
  return function (value) {
    for (const predicate of predicates) {
      if (!predicate(value)) return false;
    }
    return true;
  };
}

const billion = [1, 2, 3, ..., 999999998, 999999999, 1000000000];

findWith(every(isPalindromic, gt(99)), billion)
  //=> 101
```

It's the same principle as before, of course, we iterate through our billion numbers and stop as soon as we get to `101`, which is greater than `99` and palindromic.

But JavaScript eagerly evaluates the arguments to `findWith`. So it evaluates `isPalindromic, gt(99))` and binds it to `predicate`, then it eagerly evaluates `billion` and binds it to `list`.

Binding one value to another is cheap. But what if we had to _generate_ a billion numbers?

```javascript
function NumbersUpTo(limit) {
  const numbers = [];
  for (let number = 1; number <= limit; ++number) {
    numbers.push(number);
  }
  return numbers;
}

findWith(every(isPalindromic, gt(99)), NumbersUpTo(1000000000))
  //=> 101
```

`NumbersUpTo(1000000000)` is eager, so it makes a list of all billion numbers, even though we only need the first `101`. This is the problem with laziness: We need to be lazy all the way through a computation.

Luckily, we just finished working with generators[^lastessay] and we know exactly how to make a lazy list of numbers:

[^lastessay]: [“Programs must be written for people to read, and only incidentally for machines to execute”](https://raganwald.com/2016/03/17/programs-must-be-written-for-people-to-read.html)

```javascript
function * Numbers () {
  let number = 0;
  while (true) {
    yield ++number;
  }
}

findWith(every(isPalindromic, gt(99)), Numbers())
  //=> 101
```

Generators yield values lazily. And `findWith` searches lazily, so we can find `101` without first generating an infinite array of numbers. JavaScript still evaluates `Numbers()` eagerly and binds it to `list`, but now it's binding an iterator, not an array. And the `for (const element of list) { ... }` statement lazily takes values from the iterator just as it did from the `billion` array.

### the sieve of eratosthenes

> We start with a table of numbers (e.g., 2, 3, 4, 5, . . . ) and progressively cross off numbers in the table until the only numbers left are primes. Specifically, we begin with the first number, p, in the table, and:
>
> 1. Declare p to be prime, and cross off all the multiples of that number in the table, starting from p squared, then;
>
>  2. Find the next number in the table after p that is not yet crossed off and set p to that number; and then repeat from step 1.

Here is the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), written in eager style:

```javascript
function compact (list) {
  const compacted = [];

  for (const element of list) {
    if (element != null) {
      compacted.push(element);
    }
  }

  return compacted;
}

function PrimesUpTo (limit) {
  const numbers = NumbersUpTo(limit);

  numbers[0] = undefined; // `1` is not a prime
  for (let i = 1; i <= Math.ceil(Math.sqrt(limit)); ++i) {
    if (numbers[i]) {
      const prime = numbers[i];

      for (let ii = i + prime; ii < limit; ii += prime) {
        numbers[ii] = undefined;
      }
    }
  }

  return compact(numbers);

}

PrimesUpTo(100)
  //=> [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]
```

Let's take a pass at writing the Sieve of Eratosthenes in lazy style. First off, a few handy things we've already seen in this blog, and in [JavaScript Allongé][ja]:

[ja]: https://leanpub.com/javascriptallongesix

```javascript
function * range (from = 0, to = null) {
  let number = from;

  if (to == null) {
    while (true) {
      yield number++
    }
  }
  else {
    while (from <= to) {
      yield number++;
    }
  }
}

function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (!done) yield value;
  }
}
```

With those in hand, we can write a generator that maps an iterable to a sequence of values with every `nth` element changed to `null`:[^genuine]

[^genuine]: This is the simplest and most naïve implementation that is recognizably identical to the written description. In [The Genuine Sieve of Eratosthenes](https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf), Melissa E. O’Neill describes how to write a lazy functional sieve that is much faster than this implementation, although it abstracts away the notion of crossing off multiples from a list.

```javascript
function * nullEveryNth (skipFirst, n, iterable) {
  const iterator = iterable[Symbol.iterator]();

  yield * take(skipFirst, iterator);

  while (true) {
    yield * take(n - 1, iterator);
    iterator.next();
    yield null;
  }
}
```

That's the core of the "sieving" behaviour: take the front element of the list of numbers, call it `n`, and sieve every `nth` element afterwards.

Now we can apply `nullEveryNth` recursively: Take the first unsieved number from the front of the list, sieve its multiples out, and yield the results of sieving what remains:

```javascript
function * sieve (iterable) {
  const iterator = iterable[Symbol.iterator]();
  let n;

  do {
    const { value } = iterator.next();

    n = value;
    yield n;
  } while (n == null);

  yield * sieve(nullEveryNth(n * (n - 2), n, iterator));
}
```

With `sieve` in hand, we can use `range` to get a list of numbers from `2`, sieve those recursively, then we `compact` the result to filter out all the `nulls`, and what is left are the primes:

```javascript
const Primes = compact(sieve(range(2)));
```

Besides performance, did you spot the full-on bug? Try running it yourself, it won't work! The problem is that at the last step, we called `compact`, and `compact` is an eager function, not a lazy one. So we end up trying to build an infinite list of primes before filtering out the nulls.

We need to write a lazy version of `compact`:

```javascript
function * compact (list) {
  for (const element of list) {
    if (element != null) {
      yield element;
    }
  }
}
```

And now it works!

```javascript
take(100, Primes())
  //=>
    [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
     53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107,
     109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167,
     173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229,
     233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283,
     293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359,
     367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431,
     433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491,
     499, 503, 509, 521, 523, 541]
```

When we write things in lazy style, we need lazy versions of all of our usual operations. For example, here's an eager implementation of `unique`:

```javascript
function unique (list) {
  const orderedValues = [];
  const uniqueValues = new Set();

  for (const element of list) {
    if (!uniqueValues.has(element)) {
      uniqueValues.add(element);
      orderedValues.push(element);
    }
  }
  return orderedValues;
}
```

Naturally, we'd need a lazy implementation if we wanted to find the unique values of lazy iterators:

```javascript
function * unique (iterable) {
  const uniqueValues = new Set();

  for (const element of iterable) {
    if (!uniqueValues.has(element)) {
      uniqueValues.add(element);
      yield element;
    }
  }
}
```

And so it goes with all of our existing operations that we use with lists: We need lazy versions we can use with iterables, and we have to use the lazy operations throughout: We can't mix them.

### it comes down to types

This brings us to an unexpected revelation.

Generators and laziness can be wonderful. Exciting things are happening with using generators to emulate synchronized code with asynchronous operations, for example. But as we've seen, if we want to write lazy code, we have to be careful to be consistently lazy. If we accidentally mix lazy and eager code, we have problems.

This is a [symmetry](https://raganwald.com/2015/03/12/symmetry.html) problem.  And at a deeper level, it exposes a problem with the "duck typing" mindset: There is a general idea that as long as objects handle the correct interface--as long as they respond to the right methods--they are interchangeable.

But this is not always the case. The eager and lazy versions of `compact` both quack like ducks that operate on lists, but one is lazy and the other is not. "Duck typing" does not and cannot capture difference between a function that assures laziness and another that assures eagerness.

Many other things work this way, for example escaped and unescaped strings. Or obfuscated and native IDs. To distinguish between things that have the same interfaces, but also have semantic or other contractural differences, we need *types*.

We need to ensure that our programs work with each of the types, using the correct operations, even if the incorrect operations are also "duck compatible" and appear to work at first glance.

---

Follow-up: [The Hubris of Impatient Sieves of Eratosthenes](https://raganwald.com/2016/04/25/hubris-impatient-sieves-of-eratosthenes.html)

---

### the full source

<script src="https://gist.github.com/raganwald/cdfbd4c7b8aaf75469e2b404892718df.js"></script>

---

### notes

