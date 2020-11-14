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

The night clerk is responsible for assigning every guest a room. The night clerk's problem, then, is to take an infinite number of guests, and give each one their own unique natural number. Given the definition of an infinite set of guests, if we can devise an algorithm to assign each guest thier own room number, we know that the set of guests is countably infinite. Conversely, if we can show that there is at least one guest that cannot be assigned a room number, we know that the set is [uncountable].

[uncountable]: https://en.wikipedia.org/wiki/Uncountable_set

We'll illustrate the principle with one example, and thereafter we'll dispense with the metaphor. One evening, an infinite number of guests arrive, each presenting a ticket bearing a unique positive even number. Can the night clerk register them all? Certainly! Each guest can be dispatched to the room number that matches the number of their ticket. This shows that the set of all even numbers is countable.

The night clerk's general problem is to devise a correspondence between guests and natural numbers. That is, for each guest there is a natural number, and no two guests have the same natural number. In the example given, the correspondance is given by the [identity] function: Every even number is its own unique natural number. In JavaScript:

[identity]: https://en.wikipedia.org/wiki/Identity_function

```javascript
const f = ticketNumber => ticketNumber;
```

## injection

Using identity to establish a correspondence between even numbers and natural numbers establishes an [injection] between even numbers and natural numbers. "Injection" is the mathematical term for a one-to-one relationship, i.e. For each even number, there is exactly one natural number, and for each natural number, there is *at most* one even number.

To give another example of an injection, consider the set of all canonical forms of the [rational] numbers. That is, the sent of all [irreducible fractions]. Can we establish a one-to-one relationship between irreducible fractions and the natural numbers?

[rational]: https://en.wikipedia.org/wiki/Rational_number
[irrediducible franctions]: https://en.wikipedia.org/wiki/Irreducible_fraction

Certainly we can, and to do so we'll borrow a trick we used in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language][fractran], [Gödel Numbering]. Given a finite ordered set of numbers, we can map them to a single number using prime factorization. In the case of a numerator and denominator, we can map the pair to a single natural number with this JavaScript:

[fractran]: http://raganwald.com/2020/05/03/fractran.html
[Gödel Numbering]: https://en.wikipedia.org/wiki/Gödel_numbering

```javascript
const f = (numerator, denominator) => Math.pow(2, numerator) * Math.pow(3, denominator);

f(7, 8)
  //=> 839808
```

Because every positive natural number can be reduced to a unique prime factorization, we know that no two irreducible fractions could resolve to the same natural number. This shows that the number of irreducible fractions is countable: There is one natural number for every irreducible fraction, and there is at most one irreducible fraction for every natural number.

## bijection

We established that there is one natural number for every irreducible fraction, and there is *at most* one irreducible fraction. It is certainly *at most* one, because there are lots of natural numbers that don't map to irreducible fractions using the Gödel Numbering scheme. The numbers two and three don't map to orredu. And any number divisible by a prime larger than two or three.

The set of all irreducible fractions maps to a proper subset of all natual numbers, specifically the set of all natural numbers whose prime factorization includes both primes two and three but no other primes. But mappings don't always have to work this way.

Consider the set of all finite ordered lists of natural numbers. That's all human knowledge, because a list of numbers can encode anything we can say or write or see or hear or measure. That's everything computable, because it encodes every possible Turing Machine.

A Gödel Numbering from finite lists of numbers to natural numbers will map the lists of numbers to the set of all positive natural numbers. Unlike mapping from irreducible fractions to natural numbers with Gödel Numbering, Gödel Numbering from finite lists of numbers to natural numbers has a different converse mapping: Every positive natural number maps to *exactly* one list of natural numbers.

The mapping between finite lists of numbers and natural numbers using Gödel Numbering thus has a different quality to the mapping between irreducible fractions and natural numbers using Gödel Numbering. While they both are one-to-exactly-one, the mapping between natural numbers and irreducible fractions and was one-to-at-most-one, while the mapping between natural numbers and finite lists of numbers is one-to-exactly-one.

We saw that the mapping from irreducible fractions to natural numbers was an injection. There's a also a name for the mapping from finite lists of numbers and natural numbers: It's a [bijection]. The very name implies asymmetry between the two relationshps.

[bijection]: https://en.wikipedia.org/wiki/Bijective_function

---

### notes