---
title: "The Genuine Sieve of Eratosthenes"
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

Whereas, if we can eliminate 'counting past every number,' we can get towards[^towards] a place where every number is only touched by its prime factors.

[^towards]: It seems so simple to say, "cross off every multiple of a prime." But what's the real cost of calculating the multiples of each prime? In an idealized computer, that's one operation, because we have hardware that adds numbers in one step. But for a human, that might involve one step for each digit in the result. Likewise, we can say "cross off the multiple," an idealized computer can write to an indexed data structure in one step. But for a human, that effort might actually involve scanning the numbers on a chart by eye. Is that actually sequential? The real cost of an algorithm is very sensitive to the data structures we use and the way we implement them.

---

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
class MergeSieve {
  constructor () {
    this._first = undefined;
    this._rest = [];
  }

  merge (iterable) {
    this._rest = unique(merge(this._rest, iterable));
    if (this._first == null) {
      ({
        first: this._first,
        rest: this._rest
      } = destructure(this._rest));
    }

    return this;
  }

  has (number) {
    return number === this._first;
  }

  remove (number) {
    if (number !== this._first) throw 'illegal';

    ({
      first: this._first,
      rest: this._rest
    } = destructure(this._rest));

    return number;
  }
}

function * Primes () {
  let prime = 2;
  const composites = new MergeSieve();

  while (true) {
    yield prime;
    composites.merge(multiplesOf(prime * prime, prime));

    while (composites.has(++prime)) {
      composites.remove(prime)
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

So far so good, but looking at our implementation of `merge`, we can see that the way it works is that as we take things from a collection of lists merged together, we're invoking a series of comparisons, one for each list. So every time we come across a composite number, we're invoking one comparison for each prime less than the composite number.

Therefore, checking a number like `26` requires a comparison for the multiples of `2`, `3`, `5`, `7`, `11` and so on up to `23` even though it's only divisible by `2` and `13`. This is roughly equivalent in performance to our naïve implementation from [the last post][last].

The *ideal* performance of the Sieve of Eratosthenes is that every composite number gets crossed out once for each of its factors less than its square root. Therefore, a number like `26` will get crossed out for `2`, but not `3`, `5`, or any other prime including `13`, its other factor.

Nevertheless, this is a step towards a better implementation in a different way: By isolating the composites in their own lazy structure, we can swap out the naïve merge for something faster.

---

### hash checking

As described, the Sieve of Eratosthenes uses a large set of numbers and checks each one off. If we were to faithfully reproduce it as we iterate over prime numbers, we'd require space proportional to the cardinality of the largest prime returned. So if we collect 100 primes, we'd need space proportional to `541`, the 100th prime.

We don't want to do that, we want to maintain space proportional to the number of primes found. So for the 100th prime, we'd require space proportional to `100`. The ratio grows as we collect more primes, so this is important.

The first and obvious step is to use a data structure more accommodating of sparse data. Since JavaScript makes hash tables easy, we'll start with that.

Instead of our naïve lazy merge, let's put our prime iterators in a hash table, indexed by the next number to extract. Two iterators can have the same next number, so we'll keep a list of iterators for each number.

When we start, our `HashMerge` will have one iterable, at index `4`. Its remaining numbers will be `6`, `8`, and d so on. We then add another at `9`, with numbers `12`, `15`, and so on. We try removing `4`, and when we do so, we re-merge the iterator for multiples of two, but now it will be at number `6`, with remaining numbers `8`, `10`, and so on.

Thus `remove` is always relocating iterables to their next higher number. When two or more iterators end up at the same index (like `12`), all get relocated.

{% highlight javascript %}
class HashSieve {
  constructor () {
    this._hash = Object.create(null);
  }

  merge (iterable) {
    const { first, rest } = destructure(iterable);

    if (this._hash[first]) {
      this._hash[first].push(iterable);
    }
    else this._hash[first] = [iterable];

    return this;
  }

  has (number) {
    return !!this._hash[number];
  }

  remove (number) {
    const iterables = this._hash[number];

    if (iterables == null) return false;

    delete this._hash[number];
    iterables.forEach((iterable) => this.merge(iterable));

    return number;
  }
}

function * Primes () {
  let prime = 2;
  const composites = new HashSieve();

  while (true) {
    yield prime;
    composites.merge(multiplesOf(prime * prime, prime));

    while (composites.has(++prime)) {
      composites.remove(prime)
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

---

### queues

This is much better, and the code looks simpler to boot. That being said, it could be better. Hash tables are very nice, and fast for most purposes. But they are not perfect. Adding and removing elements involves monkeying around behind the scenes with hashing functions and buckets. Every time we look a number up, we run a hashing function on it.

If we measure performance in JavaScript, we may be very happy because the HashTable implementation baked into the engine while our own code runs in its interpreter. And that might be good enough. But as curious people, we might ask ourselves if we aren't getting more than we need... And paying more than we need for it.

For one thing, we only ever check the smallest number in the table with `.has`. There's actually no need for a fancy lookup that is actually checking all the numbers. If we knew what the smallest number was, we could check that with straight up `===`. The complexity would, of course, involve figuring out what the next smallest number would be when removing iterables and re-merging them.

So what we need is

Like a [priority queue][pq].

[pq]: https://en.wikipedia.org/wiki/Priority_queue

*to be continued*

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>
