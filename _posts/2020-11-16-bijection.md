---
title: "A Rational Visit to Hilbert's Grand Hotel"
tags: [allonge, noindex]
---

[Hilbert's paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of infinite sets: It demonstrates that a fully occupied hotel with infinitely many rooms may still accommodate additional guests, even infinitely many of them, and this process may be repeated infinitely often.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

When we [last][hhr] looked at Hilbert's Hotel, we demonstrated some properties of countably infinite sets by building JavaScript [generators][g] for them. The principle was that if you can write a generator for all of the elements of an infinite set, and if you can show that every element of the set must be generated within a finite number of calls to the generator, then you have found a way to put the infinite set into a 1-to-1 correspondance with the [positive natural numbers][natural] (1, 2, ...∞), and thus proved that they have the same cardinality, i.e. they have the same size.

[hhr]: http://raganwald.com/2015/04/24/hilberts-school.html
[g]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
[natural]: https://en.wikipedia.org/wiki/Natural_number

Today we're going to look at other ways in which two infinite sets can be related, and in doing so, we'll review the properties of [bijective], [injective], and [surjective] functions.

[bijective]: https://en.wikipedia.org/wiki/Bijection
[injective]: https://en.wikipedia.org/wiki/Injective_function
[surjective]: https://en.wikipedia.org/wiki/Surjective_function

---

## The Night Clerk

---

In Hilbert's Grand Hotel, there are a [countably infinite][ci] number of rooms, and they have been numbered 1, 2, 3, and so on. Every evening, an infinite number of guests arrive, stay for one night, and then leave the next day. That evening, another infinite number of guests arrive, and the process begins anew.

[ci]: https://en.wikipedia.org/wiki/Countably_infinite

The night clerk is responsible for assigning every guest a room. The night clerk's problem, then, is to take an infinite number of guests, and give each one their own unique natural number. Given the definition of an infinite set of guests, if we can devise an algorithm to assign each guest their own room number, we know that the set of guests is countably infinite. Conversely, if we can show that there is at least one guest that cannot be assigned a room number, we know that the set is [uncountable].

[uncountable]: https://en.wikipedia.org/wiki/Uncountable_set

We'll illustrate the principle with one example, and thereafter we'll dispense with the metaphor. One evening, an infinite number of guests arrive, each presenting a ticket bearing a unique positive even number. Can the night clerk register them all? Certainly! Each guest can be dispatched to the room number that matches the number of their ticket. This shows that the set of all even numbers is countable.

The night clerk's general problem is to devise a correspondence between guests and natural numbers. That is, for each guest there is a natural number, and no two guests have the same natural number. In the example given, the correspondance is given by the [identity] function: Every even number is its own unique natural number. In JavaScript:

[identity]: https://en.wikipedia.org/wiki/Identity_function

```javascript
const p = ticketNumber => ticketNumber;
```

---

## injection

---

Using identity to establish a correspondence between positive even numbers and positive natural numbers establishes an [injection] between even numbers and natural numbers. "Injection" is the mathematical term for a one-to-one relationship, i.e. For each even number, there is exactly one natural number, and for each natural number, there is *at most* one even number.

To give another example of an injection, consider the set of all canonical forms of the positive [rational] numbers. That is, the sent of all positive [irreducible fractions]. Can we establish a one-to-one relationship between positive irreducible fractions and the natural numbers?

[rational]: https://en.wikipedia.org/wiki/Rational_number
[irrediducible franctions]: https://en.wikipedia.org/wiki/Irreducible_fraction

Certainly we can, and to do so we'll borrow a trick we used in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language][fractran], [Gödel Numbering]. Given a finite ordered set of positive natural numbers, we can map them to a single number using prime factorization. In the case of a numerator and denominator, we can map the pair to a single natural number with this JavaScript:

[fractran]: http://raganwald.com/2020/05/03/fractran.html
[Gödel Numbering]: https://en.wikipedia.org/wiki/Gödel_numbering

```javascript
const p = (numerator, denominator) => Math.pow(2, numerator) * Math.pow(3, denominator);

p(7, 8)
  //=> 839808
```

Because every positive natural number can be reduced to a unique prime factorization, we know that no two positive irreducible fractions could resolve to the same natural number. This shows that the number of irreducible fractions is countable: There is one natural number for every irreducible fraction, and there is at most one irreducible fraction for every natural number.

---

## bijection

---

We established that there is one natural number for every irreducible fraction, and there is *at most* one irreducible fraction. It is certainly *at most* one, because there are lots of natural numbers that don't map to positive irreducible fractions using the Gödel Numbering scheme. The numbers two and three don't map to positive irreducible fractions: `2` would map to `2/0`, and `3` would map to `0/3`. And any number divisible by a prime larger than two or three also wouldn't map to an irreducible fraction using Gödel Numbering.

The set of all irreducible fractions maps to a proper subset of all natural numbers, specifically the set of all natural numbers whose prime factorization includes both primes two and three but no other primes. But mappings don't always have to work this way.

Let's recall the very first example, positiv even numbers. When mapping positive even numbers to natural numbers using the identify function, positive each even numbers map to exactly one positive natural number, but the positive natural numbers do not map to exactly one positive even number: None of the odd positive natural numbers map to a positive natural even number.

But we would arrange our mapping differently. What if we used this function for mapping positive even numbers to positive natural numbers?

```javascript
const p = even => even / 2;

p(42)
  //=> 21
```

Now every positive even number maps to exactly one positive natural number, and every positive natural number maps to exactly one positive even number:

```javascript
const q = natural => natural * 2;

q(21)
  //=> 42
```

We saw that the mapping from positive even numbers to positive natural numbers using identity was an injection: It maps one-to-exactly-one in one direction, and one-to-at-most-one in the other.

There's a also a name for the mapping from positive even numbers to positive natural numbers using division: It's a [bijection]. The  name implies symmetry between the two relationships, and indeed it maps one-to-exactly-one in one both directions.

[bijection]: https://en.wikipedia.org/wiki/Bijective_function

Bijections between infinities are useful, because they establish that both infinities have the same cardinality. Using identity to map even numbers to positive natural numbers established that they are countable. Using division to establish a bijection with the positive natural numbers established that they are countably infinite. Which is to say, there are exactly as many positive even natural numbers as there are positive natural numbers.



---

### appendix: a generator of prime numbers

This code from [The Hubris of Impatient Sieves of Eratosthenes](http://raganwald.com/2016/04/25/hubris-impatient-sieves-of-eratosthenes.html) implements a naïve JavaScript generator that yields the prime numbers in ascending order:

```javascript
function * multiplesOf (startingWith, n) {
  let number = startingWith;

  while (true) {
    yield number;
    number = number + n;
  }
}

function destructure (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value } = iterator.next();

  if (!done) {
    return { first: value, rest: iterator }
  }
}

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
```

### notes