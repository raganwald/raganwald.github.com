---
title: "The Genuine JavaScript Sieve of Eratosthenes"
layout: default
tags: [allonge]
---

### melissa e. o'neill

![Melissa E. O'Neill lecturing at Stanford](/assets/images/melissaoneill.jpg)

---

### hash checking

As described, the Sieve of Eratosthenes uses a large set of numbers and checks each one off. If we were to faithfully reproduce it as we iterate over prime numbers, we'd require space proportional to the cardinality of the largest prime returned. So if we collect 100 primes, we'd need space proportional to `541`, the 100th prime.

We don't want to do that, we want to maintain space proportional to the number of primes found. So for the 100th prime, we'd require space proportional to `100`. The ratio grows as we collect more primes, so this is important.

The first and obvious step is to use a data structure more accommodating of sparse data. Since JavaScript makes hash tables easy, we'll start with that.

Instead of our naïve lazy merge, let's put our prime iterators in a hash table, indexed by the next number to extract. Two iterators can have the same next number, so we'll keep a list of iterators for each number.

When we start, our `HashMerge` will have one iterable, at index `4`. Its remaining numbers will be `6`, `8`, and d so on. We then add another at `9`, with numbers `12`, `15`, and so on. We try removing `4`, and when we do so, we re-merge the iterator for multiples of two, but now it will be at number `6`, with remaining numbers `8`, `10`, and so on.

Thus, `_remove` is always relocating iterables to their next higher number. When two or more iterators end up at the same index (like `12`), all get relocated.

{% highlight javascript %}
class HashSieve {
  constructor () {
    this._hash = Object.create(null);
  }

  addAll (iterable) {
    const { first, rest } = destructure(iterable);

    if (this._hash[first]) {
      this._hash[first].push(rest);
    }
    else this._hash[first] = [rest];

    return this;
  }

  has (number) {
    if (this._hash[number]) {
      this._remove(number);
      return true;
    }
    else return false;
  }

  _remove (number) {
    const iterables = this._hash[number];

    if (iterables == null) return false;

    delete this._hash[number];
    iterables.forEach((iterable) => this.addAll(iterable));

    return number;
  }
}

function * Primes () {
  let prime = 2;
  const composites = new HashSieve();

  while (true) {
    yield prime;
    composites.addAll(multiplesOf(prime * prime, prime));

    while (composites.has(++prime)) {
      // do nothing
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

This is much better than our `MergeSieve`. The check for `has` involves the constant overhead of performing a hash lookup, of course, and that is more expensive than the `===` test of `MergeSieve`. But what happens when each sieve removes the no-longer-needed number?

-  When `MergeSieve` tests a composite number, it iterates. Because of the way `merge` is written, iterating requires an `if` statement for the number of iterables seen so far -1. In other words, every time it hits a composite number, if there are `p` primes less than the composite number, `MergeSieve` needs to perform `p-1` operations, regardless of how many prime factors the composite number actually has.
-  When `HashSieve` tests a composite number, it iterates and relocates each of the iterators at that number. There will be one iterator for each prime factor, and only the prime factors less than the square root of the composite number will be included. However, for each one, there is a large constant factor as we have to perform an insert in the has table. Finally, there is a single remove from the hash table. So `HashSieve` does fewer operations, but each is more expensive.

As the numbers grow, primes become scarcer, but the total number of primes grows. Therefore, `MergeSieve` gets slower and slower as it is performing operations for each prime discovered so far. `HashSieve` catches up and then gets relatively faster and faster.

---

### summary

Not all Sieves of Eratosthenes have the desired performance of time proportional to the number of prime factors for each composite number. Those that don't may or may not be useful for illustrating a point about mixing lazy and non-lazy operations, but they are "unfaithful" to the Sieve of Eratosthenes' performance and should not be considered authentic implementations.

(This essay is adapted from [The Genuine Sieve of Eratosthenes][g] by Melissa E. O'Neill)

[g]: https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf

---

### postscript: queues

Our `HashSieve` is much better than our `MergeSieve`, and the code looks simpler to boot. That being said, it could be even better. Hash tables are very nice, and fast for most purposes. But they are not perfect. Adding and removing elements involves monkeying around behind the scenes with hashing functions and buckets. Every time we look a number up, we run a hashing function on it.

Also, we only ever check the smallest number in the table with `.has`. There's actually no need for a fancy lookup that is actually checking all the numbers. If we knew what the smallest number was, we could check that with straight up `===`, just like `MergeSieve`. The complexity would, of course, involve figuring out what the next smallest number would be when removing iterables and re-merging them.

We'd need a [priority queue][pq].

[pq]: https://en.wikipedia.org/wiki/Priority_queue

---

### hashsieve source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>
