---
title: "A Rational Visit to Hilbert's Grand Hotel"
tags: [allonge, noindex]
---

[Hilbert's paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of infinite sets: It demonstrates that a fully occupied hotel with infinitely many rooms may still accommodate additional guests, even infinitely many of them, and this process may be repeated infinitely often.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

When we [last][hhr] looked at Hilbert's Hotel, we demonstrated some properties of countably infinite sets by building JavaScript [generators][g] for them. The principle was that if you can write a generator for all of the elements of an infinite set, and if you can show that every element of the set must be generated within a finite number of calls to the generator, then you have found a way to put the infinite set into a 1-to-1 correspondance with the [natural numbers][natural] (0, 1, 2, ...∞), and thus proved that they have the same cardinality, i.e. they have the same size.

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

In Hilbert's Grand Hotel, there are a [countably infinite][ci] number of rooms, and they have been numbered 0, 1, 2, 3, and so on. Every evening, an infinite number of guests arrive, stay for one night, and then leave the next day. That evening, another infinite number of guests arrive, and the process begins anew.

[ci]: https://en.wikipedia.org/wiki/Countably_infinite

The night clerk is responsible for assigning every guest a room. The night clerk's problem, then, is to take an infinite number of guests, and give each one their own unique natural number. Given the definition of an infinite set of guests, if we can devise an algorithm to assign each guest thier own room number, we know that the set of guests is countably infinite. Conversely, if we can show that there is at least one guest that cannot be assigned a room number, we know that the set is [uncountable].

[uncountable]: https://en.wikipedia.org/wiki/Uncountable_set

We'll illustrate the principle with one example, and thereafter we'll dispense with the metaphor. One evening, an infinite number of guests arrive, each presenting a ticket bearing a unique even number. Can the night cleark regster them all? Certainly! Each guest can be dispatched to the room number that matches the number of their ticket. This shows that the set of all even numbers is countable.

---

### notes