---
layout: default
tags: [allonge, noindex]
---

In [the last post][last], we looked at the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes).

[last]: http://raganwald.com/2016/04/15/laziness-is-a-virtue.html "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"

The definition is:

> We start with a table of numbers (e.g., 2, 3, 4, 5, . . . ) and progressively cross off numbers in the table until the only numbers left are primes. Specifically, we begin with the first number, p, in the table, and:
>
> 1. Declare p to be prime, and cross off all the multiples of that number in the table, starting from p squared, then;
>
>  2. Find the next number in the table after p that is not yet crossed off and set p to that number; and then repeat from step 1.

The solution given was the most naïve possible mapping from words to code:

{% highlight javascript %}
// General-Purpose Lazy Operations

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

function * compact (list) {
  for (const element of list) {
    if (element != null) {
      yield element;
    }
  }
}

// The implementation

function * nullEveryNth (skipFirst, n, iterable) {
  const iterator = iterable[Symbol.iterator]();

  yield * take(skipFirst, iterator);

  while (true) {
    yield * take(n - 1, iterator);
    iterator.next();
    yield null;
  }
}

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

const Primes = compact(sieve(range(2)));
{% endhighlight %}

This is naïve in the sense that it mimics what a child does when the sieve is explained to them for the first time. Given a big table of numbers, they start crossing them out using what we know to be modulo arithmetic: They scan forward number by number, counting as they go:

> One TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out), one TWO (cross out)...
>
> One two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out), one two THREE (cross out)...
>
> One two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out)...

This conforms to the description given above, but it has the performance characteristics of [Trial Division](https://en.wikipedia.org/wiki/Trial_division): Every number, whether prime or not, must be 'touched' by every prime smaller than it.

Whereas, if we can eliminate 'counting past every number,' we can get to a place where every number is only touched by its prime factors.

### altering our metaphor

Instead of thinking of "crossing numbers out of a list," let's think of the sieve in the title: Let's imagine we are going to build an actual sieve, a filter that takes another list of numbers and 'filters out' the ones that aren't prime.

We are going to need some operations. From here on in, all operations assume that they are dealing with _ordered lists_. We won't give them fancy names like `mergeOrderedList`, we'll just call them `merge` or whatever, and if we were bundling them up for use elsewhere, we'd namespace them in a module.

We've seen `take` above: It transforms a possibly infinite iterator into a finite iterator with at most `numberToTake` elements. `merge` performs a naïve merge of two ordered iterators. `unique` removes duplicates from an ordered list. And `destructure` takes any iterable and returns an object with the first element and the remainder of the iterable's elements. It's designed to be used with JavaScript's destructuring assignment.

{% highlight javascript %}
// General-Purpose Lazy Operations

function * merge (aIterable, bIterable) {
  const aIterator = aIterable[Symbol.iterator]();
  const bIterator = bIterable[Symbol.iterator]();
  let { done: aDone, value: aValue } = aIterator.next();
  let { done: bDone, value: bValue } = bIterator.next();

  while (true) {
    if (aDone && bDone) {
      return;
    } else if (aDone) {
      yield bValue;
      yield * bIterator;
      return;
    } else if (bDone) {
      yield aValue;
      yield * aIterator;
      return;
    } else if (aValue <= bValue) {
      yield aValue;
      ({ done: aDone, value: aValue } = aIterator.next());
    } else {
      yield bValue;
      ({ done: bDone, value: bValue } = bIterator.next());
    }
  }
}

function * unique (iterable) {
  const iterator = iterable[Symbol.iterator]();
  let lastYielded = {};
  let { done, value } = iterator.next();

  while (!done) {
    if (value !== lastYielded) {
      yield value;
      lastYielded = value;
    }
    ({ done, value } = iterator.next());
  }
}

function destructure (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();

  if (!done) {
    return { first: value, rest: iterator }
  }
}
{% endhighlight %}

With these in hand, we can write our sieve in a new way. As we collect primes, we create a list of composite numbers by collecting the multiples of each primes, starting with the prime squared. So for two, our composites are `4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, ...`. For three, they're `9, 12, 15, 18, 21, 24, ...`, and for five they're `25, 30, 35, 40, 45, ...`.

{% highlight javascript %}
function * multiplesOf (startingWith, n) {
  let number = startingWith;

  while (true) {
    yield number;
    number = number + n;
  }
}
{% endhighlight %}

By successively merging them together, we get a list of numbers that aren't prime. The merge of the composites above is `4, 6, 8, 9, 10, 12, 12, 14, 15, 16, 18, 18, 20, 21, 22, 24, 24, 25, ...`, which we can pass to `unique` to get `4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, ...``. To derive the primes, we start with `2` and iterate upwards. If our prime candidate is less than the lowest composite number, we `yield` it and merge its multiples with our list of composites. Whenever the prime candidate is the same as the lowest composite number, we don't yield it, and we also get the next lowest composite number.

{% highlight javascript %}
function * Primes () {
  let prime = 2;
  let { first: lowestCompositeNumber,
        rest: remainingCompositeNumbers
      } = destructure(multiplesOf(prime * prime, prime));

  yield prime++;

  while (true) {
    if (prime < lowestCompositeNumber) {
      remainingCompositeNumbers = unique(merge(remainingCompositeNumbers, multiplesOf(prime * prime, prime)));
      yield prime++;
    } else  {
      ++prime;
      ({ first: lowestCompositeNumber,
        rest: remainingCompositeNumbers
      } = destructure(remainingCompositeNumbers));
    }
  }
}

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

So far so good, but looking at our implementation of `merge`, we can see that the way it works is that as we take things from a collection of lists merged together, we're invoking a series of comparisons, one for each list. So every time we come across a composite number, we're invoking one comparison for each prime less than or equal to the square root of the composite number.

This is roughly equivalent in performance to our naïve implementation from [the last post][last], the only improvement is that we don't need to do all the checking for primes.

Nevertheless, this is a step towards a better implementation in a different way: By isolating the composites in their own lazy structure, we can swap out the naïve merge for something faster.

Like a [priority queue][pq].

[pq]: https://en.wikipedia.org/wiki/Priority_queue

*to be continued*
