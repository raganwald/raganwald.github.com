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

{% highlight javascript %}
function ifThen (a, b) {
  if (a) return b;
}

ifThen(1 === 0, 2 + 3)
  //=> undefined
{% endhighlight %}

Now, here's the question: Does JavaScript compute `2+3`? You probably know the answer: Yes it does. When it comes to passing arguments to a function invocation, JavaScript is *eager*, it evaluates all of the expressions, and it does so whether the value of the expression is used or not.

If JavaScript was *lazy*, it would not evaluate `2+3` in the expression `ifThen(1 === 0, 2 + 3)`. So is JavaScript an "eager" language? Mostly. But not always! If we write: `1 === 0 ? 2 + 3 : undefined`, JavaScript does *not* evaluate `2+3`. Operators like `?:` and `&&` and `||`, along with program control structures like `if`, are lazy. You just have to know in your head what is eager and what is lazy.

And if you want something to be lazy that isn't naturally lazy, you have to work around JavaScript's eagerness. For example:

{% highlight javascript %}
function ifThenEvaluate (a, b) {
  if (a) return b();
}

ifThenEvaluate(1 === 0, () => 2 + 3)
  //=> undefined
{% endhighlight %}

JavaScript eagerly evaluates `() => 2 + 3`, which is a function. But it doesn't evaluate the expression in the body of the function until it is invoked. And it is not invoked, so `2+3` is not evaluated.

Wrapping expressions in functions to delay evaluation is a longstanding technique in programming. They are colloquially called [thunks](https://en.wikipedia.org/wiki/Thunk), and there are lots of interesting applications for them.

### generating laziness

The bodies of functions are a kind of lazy thing: They aren't evaluated until you invoke the function. This is related to `if` statements, and every other kind of control flow construct: JavaScript does not evaluate statements unless the code actually encounters the statement.

Consider this code:

{% highlight javascript %}
function containing(value, list) {
  let listContainsValue = false;

  for (const element of list) {
    if (element === value) {
      listContainsValue = true;
    }
  }

  return listContainsValue;
}
{% endhighlight %}

You are doubtless chuckling at its naïveté. Imagine this list was the numbers from one to a billion--e.g. `[1, 2, 3, ..., 999999998, 999999999, 1000000000]`--and we invoke:

{% highlight javascript %}
const billion = [1, 2, 3, ..., 999999998, 999999999, 1000000000];

containing(1, billion)
  //=> true
{% endhighlight %}

We get the correct result, but we iterate over every one of our billion numbers first. Awful! Small children and the otherwise febrile know that you can `return` from anywhere in a JavaScript function, and the rest of its evaluation is abandoned. So we can write this:

{% highlight javascript %}
function containing(list, value) {
  for (const element of list) {
    if (element === value) {
      return true;
    }
  }

  return false;
}
{% endhighlight %}

This version of the function is lazier than the first: It only does the minimum needed to determine whether a particular list contains a particular value.

From `containing`, we can make a similar function, `findWith`:

{% highlight javascript %}
function findWith(predicate, list) {
  for (const element of list) {
    if (predicate(element)) {
      return element;
    }
  }
}
{% endhighlight %}

`findWith` applies a predicate function to lazily find the first value that evaluates truthily. Unfortunately, while `findWith` is lazy, its argument is evaluated eagerly, as we mentioned above. So let's say we want to find the first number in a list that is greater than `99` and is a palindrome:

{% highlight javascript %}
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
{% endhighlight %}

It's the same principle as before, of course, we iterate through our billion numbers and stop as soon as we get to `101`, which is greater than `99` and palindromic.

But JavaScript eagerly evaluates the arguments to `findWith`. So it evaluates `isPalindromic, gt(99))` and binds it to `predicate`, then it eagerly evaluates `billion` and bids it to `list`.

Binding one value to another is cheap. But what if we had to _generate_ a billion numbers?

{% highlight javascript %}
function NumbersUpTo(limit) {
  const numbers = [];
  for (let number = 1; number <= limit; ++number) {
    numbers.push(number);
  }
  return numbers;
}

findWith(every(isPalindromic, gt(99)), NumbersUpTo(1000000000))
  //=> 101
{% endhighlight %}

`NumbersUpTo(1000000000)` is eager, so it makes a list of all billion numbers, even though we only need the first `101`. This is the problem with laziness: We need to be lazy all the way through a computation.

Luckily, we just finished working with generators[^lastessay] and we know exactly how to make a lazy list of numbers:

[^lastessay]: [“Programs must be written for people to read, and only incidentally for machines to execute”](http://raganwald.com/2016/03/17/programs-must-be-written-for-people-to-read.html)

{% highlight javascript %}
function * Numbers () {
  let number = 0;
  while (true) {
    yield ++number;
  }
}

findWith(every(isPalindromic, gt(99)), Numbers())
  //=> 101
{% endhighlight %}

Generators yield values lazily. And `findWith` searches lazily, so we can find `101` without first generating an infinite array of numbers. JavaScript still evaluates `Numbers()` eagerly and binds it to `list`, but now it's binding an iterator, not an array. And the `for (const element of list) { ... }` statement lazily takes values from the iterator just as it did from the `billion` array.

### but beware!

Here is the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), written in eager style:

{% highlight javascript %}
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
{% endhighlight %}

We can use generators and operations on generators to do all kinds of things lazily. Here's our first pass at a lazy Sieve of Eratosthenes\:

{% highlight javascript %}
function * Numbers () {
  let number = 0;
  while (true) {
    yield ++number;
  }
}

function * take (numberToTake, iterable) {
  const iterator = iterable[Symbol.iterator]();

  for (let i = 0; i < numberToTake; ++i) {
    const { done, value } = iterator.next();
    if (!done) yield value;
  }
}

function * rest (iterable) {
  const iterator = iterable[Symbol.iterator]();

  iterator.next();
  yield * iterator;
}

function * nullEveryNth (n, iterable) {
  const iterator = iterable[Symbol.iterator]();

  while (true) {
    for (let i = 1; i < n; ++i) {
      const { done, value } = iterator.next();

      if (done) return;
      yield value;
    }
    const { done, value } = iterator.next();
    if (done) return;
    yield null;
  }
}

function * sieve (iterable) {
  const iterator = iterable[Symbol.iterator]();

  const { done, value } = iterator.next();

  if (done) return;

  yield value;
  yield * nullEveryNth(value, sieve(iterator));
}

function * Primes () {
  const numbersFrom2 = rest(Numbers());

  yield * compact(sieve(numbersFrom2));
}
{% endhighlight %}

Did you spot the bug? Try running it yourself, it won't work! The problem is that at the last step, we called `compact`, and `compact` is an eager function, not a lazy one. So we end up trying to build an infinite list of primes before filtering out the nulls.

We need to write:

{% highlight javascript %}
function * existingValues (list) {
  for (const element of list) {
    if (element != null) {
      yield element;
    }
  }
}

function * Primes () {
  const numbersFrom2 = rest(Numbers());

  yield * existingValues(sieve(numbersFrom2));
}
{% endhighlight %}

And now it works!

{% highlight javascript %}
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
{% endhighlight %}

When we write things in lazy style, we need lazy versions of all of our usual operations. For example, here's an eager implementation of `unique`:

{% highlight javascript %}
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
{% endhighlight %}

Naturally, we'd need a lazy implementation if we anted to find the unique values of lazy iterators:

{% highlight javascript %}
function * unique (iterable) {
  const uniqueValues = new Set();

  for (const element of iterable) {
    if (!uniqueValues.has(element)) {
      uniqueValues.add(element);
      yield element;
    }
  }
}
{% endhighlight %}

And so it goes with all of our existing operations that we use with lists: We need lazy versions we can use with iterables, and we have to use the lazy operations throughout: We can't mix them.

### it comes down to types

This brings us to an unexpected revelation.

Generators and laziness can be wonderful. Exciting things are happening with using generators to emulate synchronized code with asynchronous operations, for example. But as we've seen, if we want to write lazy code, we have to be careful to be consistently lazy. If we accidentally mix lazy and eager code, we have problems.

This is a [symmetry](http://raganwald.com/2015/03/12/symmetry.html) problem.  And at a deeper level, it exposes a problem with the "duck typing" mindset: There is a general idea that as long as objects handle the correct interface--as long as they respond to the right methods--they are interchangeable.

But this is not always the case. The functions `compact` and `existingValues` both quack like ducks that operate on lists, but one is lazy and the other is not. "Duck typing" does not and cannot capture difference between a function that assures laziness and another that assures eagerness.

Many other things work this way, for example escaped and unescaped strings. Or obfuscated and native IDs. To distinguish between things that have the same interfaces, but also have semantic or other contractural differences, we need *types*.

We need to ensure that our programs work with each of the types, using the correct operations, even if the incorrect operations are also "duck compatible" and appear to work at first glance.

---

### notes

