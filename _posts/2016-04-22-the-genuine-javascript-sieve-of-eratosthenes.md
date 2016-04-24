---
title: "The Genuine JavaScript Sieve of Eratosthenes"
layout: default
tags: [allonge]
---

### melissa e. o'neill

![Melissa E. O'Neill lecturing at Stanford](/assets/images/melissaoneill.jpg)

---

### the trap door

Althea and Ben were sharing an espresso. "Althea," Ben began, "I'm prepping for my interview with XL, and I did some googling for their interview questions..." Althea died a little inside *That conversation*, they thought. Programmers were notorious for taking interview questions extremely personally.

"Oh?" Althea said aloud, trying not to encourage the conversation along those lines.

"Well, they have five or six slots that they run, one phone screen and then the rest in a single-day onslaught." Althea nodded. Regardless of the content of each slot, having a selection of interviewers work with a candidtae could be helpful in getting a balanced perspective.

"So one of them is an algorithms slot, and one of the posters on `trapdoor.jobs` said they asked about generating streams of primes."

"In a strange coïncidence, I was just reading a blog post about lazily generating prime numbers on `tweaker.news`, I wonder if they read the same article and turned it into an interview question?"

Althea laughed. "If they did, prepare for a terrible interview. If you're thinking of [the same post that I read][last], the algorithm is wrong! Or at least, terrible."

[last]: http://raganwald.com/2016/04/15/laziness-is-a-virtue.html "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"

Ben nodded. "I saw something to that effect in the comments, but since the article wasn't precisely about prime numbers, I guess the author thought it was ok."

Althea frowned. "It's never ok to post terrible code. Somebody can and will ship it to prduction. Or foist it on impressionable interns as the Gospel Truth. Stuff like this is why the industry ignores forty years of CS research, and..."

Ben tuned out of Althea's rant for a moment. When they finally ran out of steam, Ben resumed:

"I quietly got in touch with a buddy that works there, and they told me that they do a lot of stuff with streaming events, and that while they don't think there's a direct correlation between generating primes and job performance, they do take the attitude that manipulating lazy lists is sufficiently close to working with streams to be relevant."

Althea considered this. "Maybe, go on..."

Ben went on. "So I took a crack at it as an exercise. I stressed the use of iterators in my algorithm, as this seems to be what they're looking for."

### the unfaithful sieve

Ben started off. "I had a look at the `tweaker.news` post. It described its algorithm as the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes). The definition of which is:"

> We start with a table of numbers (e.g., 2, 3, 4, 5, . . . ) and progressively cross off numbers in the table until the only numbers left are primes. Specifically, we begin with the first number, p, in the table, and:
>
> 1. Declare p to be prime, and cross off all the multiples of that number in the table, starting from p squared, then;
>
>  2. Find the next number in the table after p that is not yet crossed off and set p to that number; and then repeat from step 1.

"The code in the blog post was the most naïve possible mapping from words to code:"

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

Althea chimed in: "Naïve is right! This mimics what a child does when the sieve is explained to them for the first time. Given a big table of numbers, they start crossing them out using what we know to be modulo arithmetic: They scan forward number by number, counting as they go:"

> One TWO (cross out), one TWO (cross out), one TWO (cross out), ...
>
> One two THREE (cross out), one two THREE (cross out), one two THREE (cross out), ...
>
> One two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), ...

---

### ben's sieve

Ben continued. "Yes, it's naïve, but it's terrible for other reasons: I dislike how everything is jumbed together. And it looks to me like the author was focused on showing how carelessly using an eager version of `compact` would break everything, rather than writing a good lazy sieve."

"I figured I'd rewrite it from scratch. The main decision I made was to extract the sieve into its own object. In this day and age, there's no need to be all fussy about pure functional programming if you aren't actually using a pure functional language."

"The important thing is to avoid terrible stateful antipatterns and action-at-a-distance. So I created a `Sieve`, an object with a constructor and two methods of note:

0. `addAll(iterable)` adds all the elements of `iterable` to our sieve. It is required that the elements of `iterable` be ordered, and that the first element of `iterable` be larger than the lowest number of any iterable already added.
0. `has(number)` tests whether `number` is present in our sieve. It is required that successive calls to `has` must provide numbers that increase. In other words, calls to `has` are also ordered. Since calls to `has` are ordered by definition, the sieve is free to internally discard `number` if it returns `true`.

"Given a sieve object, my generator for primes is much simpler:"

{% highlight javascript %}
function * Primes () {
  let prime = 2;
  const composites = new Sieve();

  while (true) {
    yield prime;
    composites.addAll(multiplesOf(prime * prime, prime));

    while (composites.has(++prime)) {
      // do nothing
    }
  }
}
{% endhighlight %}

Althea nodded and Ben cracked his knuckles metaphorically.

"So now to write the `Sieve` class. Instead of "crossing out" numbers in a list, I decided to *merge* lists of composite numbers together. Here is a generator that takes two ordered lists and merges them naïvely:"

{% highlight javascript %}
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
{% endhighlight %}

"We need to work with ordered lists that are also unique, so this generator lazily eliminates duplicates in a stream:"

{% highlight javascript %}
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
{% endhighlight %}

"As I worked, I needed to to get the `first` element of a list and the `rest` of a list on a regular basis. Here's a helper that works very nicely with JavaScript's destructuring assignment:"

{% highlight javascript %}
function destructure (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();

  if (!done) {
    return { first: value, rest: iterator }
  }
}
{% endhighlight %}

Althea chafed at Ben's style of going through all the preliminaries before getting to the main business. It was very *academic*, but not the most effective way to communicate how code is written and what it does.

Ben continued "With these in hand, we can write our sieve in the new way. As we collect primes, we create a list of composite numbers by collecting the multiples of each primes, starting with the prime squared. So for two, our composites are `4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, ...`. For three, they're `9, 12, 15, 18, 21, 24, ...`, and for five they're `25, 30, 35, 40, 45, ...`."

{% highlight javascript %}
function * multiplesOf (startingWith, n) {
  let number = startingWith;

  while (true) {
    yield number;
    number = number + n;
  }
}
{% endhighlight %}

"By successively merging them together, we get a list of numbers that aren't prime. The merge of the composites above is `4, 6, 8, 9, 10, 12, 12, 14, 15, 16, 18, 18, 20, 21, 22, 24, 24, 25, ...`, which we can pass to `unique` to get `4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, ...`."

WIth a flourish, Ben finally revealed his work. "Here is my `MergeSieve` class. It implements `addAll` by merging the new iterator with its existing iterator of composite numbers, and it implements `has` by checking whether the number provided is equal to the first number in its list. If it is, it removes the first."

{% highlight javascript %}
class MergeSieve {
  constructor () {
    this._first = undefined;
    this._rest = [];
  }

  addAll (iterable) {
    this._rest = unique(merge(this._rest, iterable));
    if (this._first == null) {
      ({
        first: this._first,
        rest: this._rest
      } = destructure(this._rest));
    }
  }

  has (number) {
    while (this._first < number) {
      this._removeFirst();
    }
    if (number === this._first) {
      this._removeFirst();
      return true;
    }
    else return false;
  }

  _removeFirst () {
    ({
      first: this._first,
      rest: this._rest
    } = destructure(this._rest));
  }
}
{% endhighlight %}

"And it works flawlessly!"

{% highlight javascript %}
function * Primes () {
  let prime = 2;
  const composites = new MergeSieve();

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

The exposition ran out of steam like a clock winding down. Ben looked at Althea, anxiously. "What do you think?"

"Ben," Althea began, "This is much cleaner than the code from the blog." Ben nodded. "But," Althea continued, "If you were to show this to me in an interview, I would ask you about performance. Does this improve on the original? Or is it the same thing, dressed up in nicer code?"


"Do you see the problem with this code? It has the performance characteristics of [Trial Division](https://en.wikipedia.org/wiki/Trial_division): Every number, whether prime or not, must be 'touched' by every prime smaller than it, whether it is divisible by that prime or not. Melissa O'Neill calls this an 'Unfaithful Sieve' in her paper [The Genuine Sieve of Eratosthenes][g]."

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
