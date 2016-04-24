---
title: "The Genuine JavaScript Sieve of Eratosthenes"
layout: default
tags: [allonge]
---

[![Espresso](/assets/images/prime-espresso.jpg)](https://www.flickr.com/photos/cahadikincreations/8459301889)

---

### althea and ben talk interviews

Althea and Ben were sipping feature espressos at their local indie coffee shop. "Althea," Ben began, "I'm prepping for my interview with RealTime, and I did some googling for their interview questions..." Althea died a little inside. *That conversation*. Programmers were notorious for taking interview questions extremely personally.

"Oh?" Althea tried to discourage Bob with overt disinterest. It was futile, of course: Bob carried on.

"Well, they have five or six slots that they run, one phone screen and then the rest in a single-day onslaught." Althea nodded. Regardless of the content of each slot, having a selection of interviewers work with a candidate could be helpful in getting a balanced perspective.

"So one of the slots is algorithms, and one of the posters on `trapdoor.jobs` said they asked about generating streams of primes."

"In a strange coïncidence, I was just reading a blog post about lazily generating prime numbers on `tweaker.news`, I wonder if they read the same article and turned it into an interview question?"

Althea laughed. "If they did, prepare for a terrible interview. If you're thinking of [the same post that I read][last], the algorithm is wrong! Or at least, terrible."

[last]: http://raganwald.com/2016/04/15/laziness-is-a-virtue.html "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"

Ben nodded. "I saw something to that effect in the comments, but since the article wasn't precisely about prime numbers, I guess the OP[^OP] thought it was ok."

[^OP]: OP: Short for *Original Poster*. Used on online message boards and forums.

Althea frowned. "It's never ok to post terrible code. Somebody can and will ship it to production. Or foist it on impressionable interns as the Gospel Truth. Stuff like this is why the industry ignores forty years of CS research, and..."

Ben tuned out the rest of Althea's rant, then resumed his anecdote when the storm subsided:

"I quietly got in touch with a buddy that works there, and they told me that they do a lot of stuff with streaming events, and that while they don't think there's a direct correlation between generating primes and job performance, they do take the attitude that manipulating lazy lists is sufficiently close to working with streams to be relevant."

Althea considered this. "Maybe, go on..."

Ben went on. "So I took a crack at it as an exercise. I stressed the use of iterators in my algorithm, as this seems to be what they're looking for."

### the unfaithful sieve

"I had a look at the `tweaker.news` post. It described its algorithm as the [Sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes). The definition of which is:"

> We start with a table of numbers (e.g., 2, 3, 4, 5, . . . ) and progressively cross off numbers in the table until the only numbers left are primes. Specifically, we begin with the first number, p, in the table, and:
>
> 1. Declare p to be prime, and cross off all the multiples of that number in the table, starting from p squared, then;
>
>  2. Find the next number in the table after p that is not yet crossed off and set p to that number; and then repeat from step 1.

Bob pulled up the blog post on a laptop. "The code in the blog post was the most naïve possible mapping from words to code:"

```javascript
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
```

"And it works flawlessly!"

```javascript
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
```

The exposition ran out of steam like a clock winding down. Ben looked at Althea, anxiously. "What do you think?"

---

### althea's feedback

"Ben," Althea began, "This is much cleaner than the code from the blog."

Ben nodded. "But," Althea continued, "If you were to show this to me in an interview, I would ask you about performance. Does this improve on the original? Or is it the same thing, dressed up in nicer code?"

"Let's look at the OP's original code. For each prime, the algorithm stepped through the numbers, counting one-TWO, one-TWO, or one-two-THREE, one-two-THREE, and so on. So each prime stepped through all the numbers larger than it. Actually, there's a prime-squared optimization, but roughly speaking, we can see that in the OP's code, every number `n` must be touched by all the primes smaller than `n`, whether they are factors of `n` or not.""

"Melissa O'Neill calls this an 'Unfaithful Sieve' in her paper [The Genuine Sieve of Eratosthenes][g]."

Bob thought about this, then agreed that for every number `n`, the OP's code required an operation for each prime smaller than `n`. In the OP's naïve sieve, checking a number like `26` required a comparison for the multiples of `2`, `3`, `5`, `7`, `11` and so on up to `23` even though `26` is only divisible by `2` and `13`.

Althea switched to Bob's code.

"Now let's look at this implementation of `merge`. The way it works is that as we take things from a collection of lists merged together, we're invoking a series of comparisons, one for each list. So every time we come across a composite number, we're invoking one comparison for each prime less than the composite number."

"Again, there's a prime-squared optimization, but the larger factor for computing the time complexity of this algorithm is how many operations are required for each composite number. And in this respect, your algorithm is almost identical to the OP's algorithm."

"The *ideal* performance of the Sieve of Eratosthenes is that every composite number gets crossed out once for each of its factors less than its square root. Therefore, a number like `26` would get crossed out for `2`, but not `3`, `5`, or any other prime including `13`, its other factor."

"So what we want is an algorithm where we only have to check a composite's prime factors, and even then only those less than its square root."

Bob looked a little glum. "Well, at least I'm hearing this from you and not from an interviewer trying to impress themselves by tearing me down!"

They both laughed wryly. It's almost impossible to interview for tech jobs without encountering the phenomena of an interviewer who thinks the purpose of an interview is to make other people feel stupid.[^ridiculous]

[^ridiculous]: Belittling interviewees on the basis of the interviewer's superior understanding of a contrived problem is a ridiculous practice. First and foremost, interviews exist to find and filter people, not to bolster the egos of interviewers. Second, an interview question is carefully selected beforehand, and the interviewer has the luxury of knowing and studying the question in advance. It is not a level playing field for comparing the experience and knowledge of interviewer and interviewee.

---

### althea and bob pair

Espressos finished, Althea and Bob ordered another round and started pairing in the coffee shop.

Althea pointed out that the merge algorithm is useful if you always need the lowest composite number. But in truth, the sieve does not *need* the lowest composite number, it merely needs to know if the number it is testing is *any* of the lowest multiples of the primes seen so far.

So when testing `26`, we need to know if it is any of the smallest of each of our `multiplesOf` iterators: `26` (2x13), `27` (3x9), `30` (5x10), `49` (7x7), `121` (11x11), `169` (13x13), `289` (17x17), `361` (19x19), or `529` (23x23). It's true that if we know that `26` is the smallest of the nine iterators seen so far, it is very cheap to test whether `26 === 26`.

But as we've seen, the naïve merge means we need eight tests to determine that `26` is the smallest. What if it was cheaper to check whether `26` is anywhere in the set `26, 27, 30, 49, 121, 169, 289, 361, 529`?

Bob thought about Althea's revelation. "We could use a set! Checking for membership in a set is more expensive than `===`, but once we have a lot of primes, it'll be way cheaper than doing comparisons."

Althea nodded and suggested Bob try coding that.

"But wait!" A thought struck Bob. "A set is great, but after finding that `26` is in the set, we need to remove `26` from the set and insert `28`, the next multiple of two. We'd need to associate iterators with each of the values... So we need a dictionary."

Bob started coding, with Althea providing feedback. Fuelled by an excellent Blue Mountain pour-over, the code flowed from keyboard to screen.

---

[![Espresso extraction](/assets/images/espresso-flow.jpg)](https://www.flickr.com/photos/schill/14576345751)

---

### the hash merge

Bob placed the prime iterators into a hash table, indexed by the next value for the iterator. Thus, the keys of the table were composites, and the values of the table were lists of iterators (a single composite might have two or more iterators, for example `12`).

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

---

### the wrap-up

"So," Bob smiled, "I'm ready for my interview with RealTime. Thanks!"

"Sure!" Althea was reassuring. "You have improved on the OP's code style *and* performance. And now you're ready to discuss the algorithm with greater rigour."

"What's there to discuss?" Bob was self-congratulatory: "This is way faster. Given the number of broken sieves on the internet, I'll bet this is better than anything the interviewer can write."

Althea tried her best Han Solo impersonation: "Don't get cocky, kid! After all, if I could read [The Genuine Sieve of Eratosthenes][g], so could the interviewer. And it could be *even faster*. But this is probably good enough for the purposes of a interview."

[g]: https://www.cs.hmc.edu/~oneill/papers/Sieve-JFP.pdf


(discuss on [hacker news](https://news.ycombinator.com/item?id=11561641) or [edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-04-22-genuine-javascript-sieve-of-eratosthenes.md))

---

### source code

<script src="https://gist.github.com/raganwald/78b086166c0712b49e5160edca5ebadd.js"></script>

---

### notes
