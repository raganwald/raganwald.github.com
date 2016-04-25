---
title: "The Hubris of Impatient Sieves of Eratosthenes"
layout: default
tags: [allonge]
---

[![Espresso](/assets/images/prime-espresso.jpg)](https://www.flickr.com/photos/cahadikincreations/8459301889)

---

### the hubris of blog post authors

Althea and Ben were sipping feature espressos at their local indie coffee shop. "Althea," Ben began, "I'm prepping for interviews with you-know-who, so I've been trying to read as many algorithm blog posts as I can, just to catch up on all the stuff I've forgotten now that Ive been working for a few years..." Althea died a little inside. *That conversation*. Programmers were notorious for taking interview questions extremely personally.

"Oh?" Althea tried to discourage Ben with overt disinterest. It was futile, of course: Ben carried on.

"Well, I was just reading a blog post about [lazily generating prime numbers][last], and I remember being asked to write a program to generate primes back when I first entered the industry."

[last]: http://raganwald.com/2016/04/15/laziness-is-a-virtue.html "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"

Althea laughed. "If you're thinking of the same post that I read, the algorithm is wrong! Or at least, terrible."

Ben nodded. "I saw something to that effect on [Hacker News](https://news.ycombinator.com/item?id=11518248), but since the article wasn't precisely about prime numbers, I guess the OP[^OP] thought it was ok."

[^OP]: OP: Short for *Original Poster*. Used on online message boards and forums.

Althea frowned. "It's never ok to post terrible code. It's an enormous act of arrogance and hubris to think that just because you can write something and publish it to the whole world, that you therefore should just publish any old thing on your mind without taking care and consideration to make sure it's right!"

"Somebody can and will ship it to production. Or foist it on impressionable interns as the Gospel Truth. Stuff like this is why the industry ignores forty years of CS research, and..."

Ben tuned out the rest of Althea's rant, then resumed his anecdote when the storm subsided:

### the unfaithful sieve

Ben pulled up the blog post on a laptop. "The code in the blog post was the most naïve possible mapping from the written description of the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) to code:"

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

```

Althea chimed in: "Naïve is right! This mimics what a child does when the sieve is explained to them for the first time. Given a big table of numbers, they start crossing them out using what we know to be modulo arithmetic: They scan forward number by number, counting as they go:"

> One TWO (cross out), one TWO (cross out), one TWO (cross out), ...
>
> One two THREE (cross out), one two THREE (cross out), one two THREE (cross out), ...
>
> One two three four FIVE (cross out), one two three four FIVE (cross out), one two three four FIVE (cross out), ...

---

[![Prime Numbers](/assets/images/primes.jpg)](http://www.geek.com/science/geek-answers-why-should-we-care-about-prime-numbers-1574269/)

---

### ben's sieve

Ben continued. "Yes, it's naïve, but it's terrible for other reasons: I dislike how everything is jumbled together. And it looks to me like the author was focused on showing how carelessly using an eager version of `compact` would break everything, rather than writing a good lazy sieve."

"I figured I'd rewrite it from scratch. The main decision I made was to extract the sieve into its own object. In this day and age, there's no need to be all fussy about pure functional programming if you aren't actually using a pure functional language."

"The important thing is to avoid terrible stateful anti-patterns and action-at-a-distance. So I created a `Sieve`, an object with a constructor and two methods of note:

0. `addAll(iterable)` adds all the elements of `iterable` to our sieve. It is required that the elements of `iterable` be ordered, and that the first element of `iterable` be larger than the lowest number of any iterable already added.<br/><br/>
0. `has(number)` tests whether `number` is present in our sieve. It is required that successive calls to `has` must provide numbers that increase. In other words, calls to `has` are also ordered. Since calls to `has` are ordered by definition, the sieve is free to internally discard `number` if it returns `true`.

"Given a `sieve` object, my generator for primes is much simpler:"

```javascript
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
```

Althea nodded and Ben cracked his knuckles metaphorically.

"So now to write the `Sieve` class. Instead of "crossing out" numbers in a list, I decided to *merge* lists of composite numbers together. Here is a generator that takes two ordered lists and merges them naïvely:"

```javascript
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
```

"We need to work with ordered lists that are also unique, so this generator lazily eliminates duplicates in a stream:"

```javascript
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
```

"As I worked, I needed to to get the `first` element of a list and the `rest` of a list on a regular basis. Here's a helper that works very nicely with JavaScript's destructuring assignment:"

```javascript
function destructure (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();

  if (!done) {
    return { first: value, rest: iterator }
  }
}
```

Althea chafed at Ben's style of going through all the preliminaries before getting to the main business. It was very *academic*, but not the most effective way to communicate how code is written and what it does.

Ben continued "With these in hand, I could write the sieve in the new way. As we collect primes, we create a list of composite numbers by collecting the multiples of each primes, starting with the prime squared. So for two, our composites are `4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, ...`. For three, they're `9, 12, 15, 18, 21, 24, ...`, and for five they're `25, 30, 35, 40, 45, ...`."

```javascript
function * multiplesOf (startingWith, n) {
  let number = startingWith;

  while (true) {
    yield number;
    number = number + n;
  }
}
```

"By successively merging them together, we get a list of numbers that aren't prime. The merge of the composites above is `4, 6, 8, 9, 10, 12, 12, 14, 15, 16, 18, 18, 20, 21, 22, 24, 24, 25, ...`, which we can pass to `unique` to get `4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, ...`."

With a flourish, Ben finally revealed his work. "Here is my `MergeSieve` class. It implements `addAll` by merging the new iterator with its existing iterator of composite numbers, and it implements `has` by checking whether the number provided is equal to the first number in its list. If it is, it removes the first."

```javascript
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
```

"And it works flawlessly!"

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

The exposition ran out of steam like a clock winding down. Ben looked at Althea, anxiously. "What do you think?"

---

### althea's feedback

"Ben," Althea began, "This is much cleaner than the code from the blog."

Ben nodded. "But," Althea continued, "If you were to show this to me in an interview, I would ask you about performance. Does this improve on the original? Or is it the same thing, dressed up in nicer code?"

"Let's look at the OP's original code. For each prime, the algorithm stepped through the numbers, counting one-TWO, one-TWO, or one-two-THREE, one-two-THREE, and so on. So each prime stepped through all the numbers larger than it. Actually, there's a prime-squared optimization, but roughly speaking, we can see that in the OP's code, every number `n` must be touched by all the primes smaller than `n`, whether they are factors of `n` or not.""

"Melissa O'Neill calls this an 'Unfaithful Sieve' in her paper [The Genuine Sieve of Eratosthenes][g]."

[g]: https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf

Ben thought about this, then agreed that for every number `n`, the OP's code required an operation for each prime smaller than `n`. In the OP's naïve sieve, checking a number like `26` required a comparison for the multiples of `2`, `3`, `5`, `7`, `11` and so on up to `23` even though `26` is only divisible by `2` and `13`.

Althea switched to Ben's code.

"Now let's look at this implementation of `merge`. The way it works is that as we take things from a collection of lists merged together, we're invoking a series of comparisons, one for each list. So every time we come across a composite number, we're invoking one comparison for each prime less than the composite number."

"Again, there's a prime-squared optimization, but the larger factor for computing the time complexity of this algorithm is how many operations are required for each composite number. And in this respect, your algorithm is almost identical to the OP's algorithm."

"The *ideal* performance of the Sieve of Eratosthenes is that every composite number gets crossed out once for each of its factors less than its square root. Therefore, a number like `26` would get crossed out for `2`, but not `3`, `5`, or any other prime including `13`, its other factor."

"So what we want is an algorithm where we only have to check a composite's prime factors, and even then only those less than its square root."

Ben looked a little glum. "Well, at least I'm hearing this from you and not from an interviewer trying to impress themselves by tearing me down!"

They both laughed wryly. It's almost impossible to interview for tech jobs without encountering the phenomena of an interviewer who thinks the purpose of an interview is to make other people feel stupid.[^ridiculous]

[^ridiculous]: Belittling interviewees on the basis of the interviewer's superior understanding of a contrived problem is a ridiculous practice. First and foremost, interviews exist to find and filter people, not to bolster the egos of interviewers. Second, an interview question is carefully selected beforehand, and the interviewer has the luxury of knowing and studying the question in advance. It is not a level playing field for comparing the experience and knowledge of interviewer and interviewee.

---

### althea and bob pair

Espressos finished, Althea and Ben ordered another round and started pairing in the coffee shop.

Althea pointed out that the merge algorithm is useful if you always need the lowest composite number. But in truth, the sieve does not *need* the lowest composite number, it merely needs to know if the number it is testing is *any* of the lowest multiples of the primes seen so far.

So when testing `26`, we need to know if it is any of the smallest of each of our `multiplesOf` iterators: `26` (2x13), `27` (3x9), `30` (5x10), `49` (7x7), `121` (11x11), `169` (13x13), `289` (17x17), `361` (19x19), or `529` (23x23). It's true that if we know that `26` is the smallest of the nine iterators seen so far, it is very cheap to test whether `26 === 26`.

But as we've seen, the naïve merge means we need eight tests to determine that `26` is the smallest. What if it was cheaper to check whether `26` is anywhere in the set `26, 27, 30, 49, 121, 169, 289, 361, 529`?

Ben thought about Althea's revelation. "We could use a set! Checking for membership in a set is more expensive than `===`, but once we have a lot of primes, it'll be way cheaper than doing comparisons."

Althea nodded and suggested Ben try coding that.

"But wait!" A thought struck Ben. "A set is great, but after finding that `26` is in the set, we need to remove `26` from the set and insert `28`, the next multiple of two. We'd need to associate iterators with each of the values... So we need a dictionary."

Ben started coding, with Althea providing feedback. Fuelled by an excellent Blue Mountain pour-over, the code flowed from keyboard to screen.

---

[![Espresso extraction](/assets/images/espresso-flow.jpg)](https://www.flickr.com/photos/schill/14576345751)

---

### the hash merge

Ben placed the prime iterators into a hash table, indexed by the next value for the iterator. Thus, the keys of the table were composites, and the values of the table were lists of iterators (a single composite might have two or more iterators, for example `12`).

He spoke aloud as he walked through his new implementation:

"When we start, our `HashMerge` will have one iterable, at index `4`. Its remaining numbers will be `6`, `8`, and so on. We then add another at `9`, with numbers `12`, `15`, and so on. We try removing `4`, and when we do so, we re-merge the iterator for multiples of two, but now it will be at number `6`, with remaining numbers `8`, `10`, and so on."

"Thus, `_remove` is always relocating iterables to their next higher number. When two or more iterators end up at the same index (like `12`), all get relocated."

```javascript
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
```

"This is much better than my original `MergeSieve`. The check for `has` involves the constant overhead of performing a hash lookup, of course, and that is more expensive than the `===` test of `MergeSieve`. But what happens when each sieve removes the no-longer-needed number?

-  When `MergeSieve` tests a composite number, it iterates. Because of the way `merge` is written, iterating requires an `if` statement for the number of iterables seen so far -1. In other words, every time it hits a composite number, if there are `p` primes less than the composite number, `MergeSieve` needs to perform `p-1` operations, regardless of how many prime factors the composite number actually has.<br/><br/>
-  When `HashSieve` tests a composite number, it iterates and relocates each of the iterators at that number. There will be one iterator for each prime factor, and only the prime factors less than the square root of the composite number will be included. However, for each one, there is a large constant factor as we have to perform an insert in the has table. Finally, there is a single remove from the hash table. So `HashSieve` does fewer operations, but each is more expensive.

"As the numbers grow, primes become scarcer, but the total number of primes grows. Therefore, `MergeSieve` gets slower and slower as it is performing operations for each prime discovered so far. `HashSieve` catches up and then gets relatively faster and faster."

Althea congratulated him. "You've got it!"

"So," Ben smiled, "I guess the problem as that the OP had the hubris to write about a lazy algorithm, but not one that was impatient enough to run quickly!"

"Absolutely!" Althea was reassuring. "This has improved on the OP's code style *and* performance. And now you're ready to discuss the Sieve of Eratosthenes with greater rigour."

"What's there to discuss?" For someone who had only hours before written their own Unfaithful Sieve, Ben was was exhibiting some hubris of his own: "This is way faster. Given the number of broken sieves on the internet, I'll bet this is better than anything the interviewer sees from anyone else."

---

### the final point

Althea tried her best Han Solo impersonation: "Don't get cocky, kid! After all, if I could read [The Genuine Sieve of Eratosthenes][g], so could anybody else looking for a job. And besides, that's not the point."

"The point," Althea said patiently--Ben was, after all, a friend--"The point is that even when setting out to implement an algorithm with the best of intentions, a small error in the selection of a data structure can have a major effect on its behaviour."

"Software is built in layers of abstractions. In the OP's case, using a counter to null out the composite numbers was the right abstraction but the wrong implementation. And in *your* case, Ben, using a naïve merge to was also the right abstraction: You were able to write a prime sieve that used `===` for comparisons, it ought to have been wicked fast. But the implementation of the merge let you down, it was as slow as the OP's counting."

"So the lesson is, studying algorithms is not about studying abstractions. It's about the implementations, at every level of detail."

Ben considered. "Ok, fair enough. In that case, how do I know whether the hash table implementation is fast enough?"

Althea grinned: "If you do some more research, you will discover that this is not the fast-*est* implementation. But for production code, with all of the requirements and trade-offs that come into play, it may be fast *enough*."

"After all, we can't keep tweaking the same thing over and over again for diminishing returns. We need to move on and find big gains somewhere else. That's why impatience can be a virtue: We programmers should always be hungry for important work to do."

---

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-04-25-hubris-impatient-sieves-of-eratosthenes.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
