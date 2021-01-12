---
title: "Invertible Functions"
tags: [allonge, noindex, mermaid]
---

[![Grand Hotel](/assets/invertible/grand-hotel.jpg)](https://www.flickr.com/photos/jannerboy62/31444461695)

---

## Invertible Functions

Consider these two functions:

```javascript
const evenToNatural = even => even / 2;

const naturalToEven = natural => natural * 2;
```

`evenToNatural` and `naturalToEven` are _inversions_ of each other:

```javascript
evenToNatural(14)
  //=> 7

naturalToEven(7)
  //=> 14
```

Which is to say, each function inverts or reverses the computation of the other function. This implies that for all `n ∈ N`:

```javascript
n === evenToNatural(naturalToEven(n)) &&
n === naturalToEven(evenToNatural(n))
```

And, subject to JavaScript's implementation limitations, this expression is `true`.[^disclaimer]

[^disclaimer]: We're making a number of assumptions here that are fairly obvious. For example, we are assuming that the input to `evenToNatural` and `naturalToEven` is a number, and that the number is not one for which the underlying implementation will do something unusual. This is why actual math and actual computer science is hard: Making the jump from demonstrating that something is true to **proving** that it is true means embracing rigour and detail, not just focusing on the pleasant "aha!" moments.

A function `f` is considered _invertible_ if there also exists a function `g` such that `f` and `g` are inversions of each other. `evenToNatural` is an invertible function, because `naturalToEven` is its inversion, and vice-versa.

The following functions are also invertible, even though we do not give their inversions:

```javascript
const increment = n => n + 1;

const cons = ([head, tail]) => [head, ...tail];
```

The `cons` function given implies that where compound types like lists or maps are concerned, we base our reasoning on structural equality, not referential equality.[^equality]

[^equality]: Structural (or "semantic") equality is when two compound objects behave identically. Referential (or "physical") equality is when two references refer to the same entity in the language's implementation. JavaScript uses referential equality by default, but this is not what we want for the purposes of exploring invertible functions.

Some functions are their own inversion. This still makes them invertible functions. `I`—also known as the "identity" or "idiot bird" function—is its own inversion. Other functions that are their own inversions include:

```javascript
const oddsAndEvens = n => n % 2 === 0 ? n + 1 : n - 1;

const positiveNegative = n => -n;
```

### functions that aren't invertible

For a function to be invertible, it must map exactly one elements of its input to exactly one element of its output. Thus, any function for which two or more different inputs produce the same output cannot be invertible:

```javascript
const square = n => n * n;

const roundTen = Math.floor(n / 10) * 10;

const collatz = n => n % 2 === 0 ? n / 2 : 3 * x + 1;
```

`square` is not invertible because every positive output has two possible inputs, one positive and one negative. Presuming that we are sticking with natural numbers, `roundTen` has ten possible inputs for each output. And `collatz` has multiple possible inputs as well: For example, if the output is `10`, the input could be `3` or `20`.[^collatz]

[^collatz]: We touched on [The Collatz Conjecture] in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language](http://raganwald.com/2020/05/03/fractran.html).

[The Collatz Conjecture]: https://en.wikipedia.org/wiki/Collatz_conjecture

When there are multiple inputs for the same output, what would an inversion of the function return for that output? For example, if we assume the function `ztalloc` inverts `collatz`, what does `ztalloc(10)` return? Three? Or Twenty?

Returning two different values where one is expected isn't possible, which is why a function that is invertible must have exactly one unique input for each unique output.

### Invertible functions and compound values

Invertible functions can't have two outputs. They also can't have two inputs. Therefore, this function is not invertible as written:

```javascript
const cons = (head, tail) => [head, ...tail];
```

Instead, we must find a way to represent multiple inputs as a single compound value.

For example, we can rewrite our function to take a single tuple as input, and rely on the semantics of structural equality, as we mentioned above:[^equality]

```javascript
const cons = ([head, tail]) => [head, ...tail];
```

Now our function can be inverted:

```javascript
const carcdr = ([head, ...tail]) => [head, tail];
```

In general, all functions mapping multiple inputs to one output can be rewritten as taking a list or other compound value as an input and returning a single value.

---

## Composing Invertible Functions

The most basic rule of composition for invertible functions is this. If `f` and `g` are invertible functions, `⁻¹` as a suffix denotes "the inversion of" a function, then:

`(f ֯  g)⁻¹ = (g⁻¹ ֯  f⁻¹)`

If we compose two invertible functions, the inversion of that composition can be computed by taking the composition of the inversions of each function, in reverse order:

```javascript
const plusOne = n => n + 1;
const minusOne = n => n - 1;

const timesTwo = n => n * 2;
const dividedByTwo = n => n / 2;

const compose = (f, g) => n => f(g(n));

const plusOneTimesTwo = compose(plusOne, timesTwo);
const dividedByTwoMinusOne = compose(dividedByTwo, minusOne);

plusOneTimesTwo(42)
  //=> 85

dividedByTwoMinusOne(85)
  //=> 42
```

Having a well-defined pattern for composing invertible functions is the basis for reasoning about invertible functions. Let's take an example, converting between primitive numbers and their binary representation.

### converting between numbers and their binary representation

Here's a function that converts a non-negative natural number into a list form of its binary representation, without relying on JavaScript's capabilities for parsing and representing numbers in various bases:

```javascript
const toBinary = n => {
  const b = [];

  do {
    const bit = n % 2;
    n = Math.floor(n / 2);

    b.unshift(bit);
  } while (n > 0);

  return b;
};

toBinary(0)
  //=> [0]

toBinary(1)
  //=> [1]

toBinary(6)
  //=> [1, 1, 0]

toBinary(23)
  //=> [1, 0, 1, 1, 1]
```

And here's its inversion, a function that converts the list form of a non-negative natural number's binary representation into the number:

```javascript
function fromBinary(b) {
  let n = 0;

  for (const bit of b) {
    n *= 2;
    n += bit;
  }

  return n;
};

fromBinary([0])
  //=> 0

fromBinary([1])
  //=> [1]

fromBinary(6)
  //=> [1, 1, 0]

fromBinary(23)
  //=> [1, 0, 1, 1, 1]
```

We can tell from careful inspection that for non-negative naturals within implementation bounds, `toBinary` and `fromBinary` are inversions of each other. But even with such a simple function, it requires examination to determine that they are inversions of each other.

This is especially true because the two functions are written in different styles, one uses a `do... while` loop, the other a `for... of` loop, and the ways in which they do basic arithmetic aren't obviously symmetrical the way `n => n + 1` and `n => n - 1` are.

Let's approach this problem from the perspective of making it easier to generate two functions that are inversions of each other. We'll use function composition to help.

### refactoring to use invertible functions

We're going to refactor these two invertible functions, beginning by extracting an invertible function at the core of each function's loop:

```javascript
const divideByTwoWithRemainder = n => [Math.floor(n / 2), n % 2];

const multiplyByTwoWithRemainder = ([n, r]) => n * 2 + r;
```

We can satisfy ourselves that these two functions are inversions of each other, then write:

```javascript
const toBinary = n => {
  const b = [];
  let bit;

  do {
    [n, bit] = divideByTwoWithRemainder(n);

    b.unshift(bit);
  } while (n > 0);

  return b;
};

function fromBinary(b) {
  let n = 0;

  for (const bit of b) {
    n = multiplyByTwoWithRemainder([n, bit]);
  }

  return n;
};
```

Now we have a small pair of invertible functions, each of which is wrapped in some ceremony to apply them. We'll refactor the ceremony next.

### refactoring to folds and unfolds

> In functional programming, `fold` (also termed `reduce`, `accumulate`, `aggregate`, `compress`, or `inject`) refers to a family of higher-order functions that analyze a recursive data structure and through use of a given combining operation, recombine the results of recursively processing its constituent parts, building up a return value.
>
> Fold is in a sense dual to `unfold`, which takes a seed value and apply a function corecursively to decide how to progressively construct a corecursive data structure.--[Wikipedia](https://en.wikipedia.org/wiki/Fold_%28higher-order_function%29)

Here is a higher-order `fold` that takes a `base` (sometimes called a "seed") value, plus a combining function. It is specific to lists. To make it useful for our purposes, instead of the combining function taking two arguments, this fold expects its combining function to take a one argument, a list with two elements.

It is implemented as a loop, because loops are trivially equivalent to linear recursion. It is also implemented as a higher-order function that returns a function. we'll see why in a moment:

```javascript
const foldList = ([base, combiner]) =>
  list => {
    let folded = base;

    for (const element of list) {
      folded = combiner([folded, element]);
    }

    return folded;
  };
```

We can use it with our `multiplyByTwoWithRemainder` function to generate `fromBinary`:

```javascript
const fromBinary = foldList([0, multiplyByTwoWithRemainder]);
```

And here's `unfoldToList`. Our unfold is also written as a loop. We will use a simple equality test that works for primitive values and strings, but not objects and especially not maps of any kind.[^prodequal] We also  note that this flavour of unfold is written as an eager right unfold, which is to say, it assembles its list in the reverse order of our fold. That's different from how unfolds are usually written, but then again, most people aren't trying to invert a fold.

We'll use our unfold to derive `toBinary`:

[^prodequal]: For production use, deep equality must be carefully crafted to match the semantics of the entities we wish to compare.

```javascript
const deepEqual = (a, b) => {
  if (a instanceof Array && b instanceof Array) {
    if (a.length !== b.length) {
      return false;
    } else {
      for (let i = 0; i < a.length; ++i) {
        if (!deepEqual(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  } else if (a instanceof Array || b instanceof Array) {
    return false;
  } else {
    return a === b;
  }
};

const unfoldToList = ([base, uncombiner]) =>
  folded => {
    let list = [];
    let element;

    while (!deepEqual(folded, base)) {
      [folded, element] = uncombiner(folded);
      list.unshift(element);
    }

    return list;
  };

const toBinary = unfoldToList([0, divideByTwoWithRemainder]);
```

### why refactoring to fold and unfold matters

Using `foldList`, `unfoldToList`, `multiplyByTwoWithRemainder`, and `divideByTwoWithRemainder` to derive the invertible functions `fromBinary` and `toBinary` feels like a lot of work if that's all we want to do.

However, let's think about what `foldList` and `unfoldToList` really do: They repeatedly apply an invertible function to a value. This is analogous to composing an invertible function with itself. From this we infer that if we use an invertible combiner with `foldList`, we get an invertible fold. And if we use an invertible uncombiner with `unfoldToList`, we get an invertible unfold.

Now we have something: `foldList` and `unfoldToList` are higher-order invertible functions. This helps us reason, because once we've satisfied ourselves that `foldList` and `unfoldToList` are higher-order invertible functions, we can use them to compose functions, and all we have to satisfy ourselves with is the invertibility of our arguments.

And it's much easier to satisfy ourselves that one-liners like `n => [Math.floor(n / 2), n % 2]` and `([n, r]) => n * 2 + r` are invertible than functions with arbitrary loops and conditions.

Thus, we see the utility of the following function that makes higher-order invertible folds and unfolds:

```javascript
const foldUnfoldList = ([base, combiner, uncombiner]) => [
  foldList([base, combiner]), unfoldToList([base, uncombiner])
];

const [fromBinary, toBinary] = foldUnfoldList([
  0, multiplyByTwoWithRemainder, divideByTwoWithRemainder
]);
```

By writing higher-order functions for composing invertible functions that preserve "invertibility," we make it easier to reason about what our code does.

And so it goes for all composition, really: Composing functions with well-understood patterns like folding and unfolding makes it easier for us to reason about what our code does.

---

*leftovers below*

## Hilbert's Hotel and Invertible Functions

[Hilbert's Paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of infinite sets: It demonstrates that a fully occupied hotel with infinitely many rooms may still accommodate additional guests, even infinitely many of them, and this process may be repeated infinitely often.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

When we [last][hhr] looked at Hilbert's Hotel, we demonstrated some properties of [countably infinite][ci] sets by building JavaScript [generators][g]. The principle was that if we can write a generator for all of the elements of an infinite set, and if we can show that every element of the set must be generated within a finite number of calls to the generator, then we have found a way to put the infinite set into a one-to-one correspondance with the [positive natural numbers][natural] (1, 2, ...∞), and thus proved that they have the same [cardinality].

[hhr]: http://raganwald.com/2015/04/24/hilberts-school.html
[g]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
[natural]: https://en.wikipedia.org/wiki/Natural_number
[cardinality]: https://en.wikipedia.org/wiki/Cardinality

### mapping sets to sets

Another way to put two sets into a one-to-one correspondance with each other is to write functions that map elements of the sets to each other. For example, here are two functions: One maps even numbers to natural numbers, the other maps natural numbers to even numbers:

### invertible functions

Amongst other things, invertible functions are a handy way to map sets to each other and show that they have the same cardinality. Take the set of even numbers, and the set of natural numbers: The existence of the function `evenToNatural` and the knowledge that it is invertible proves the two sets have the same cardinality. For any even number, there is one and only one natural number, and for every natural number, there is one and only one even number. Our functions tell us which ones they are.

In
### mapping natural numbers to irreducible fractions

An [irreducible fraction] is a fraction in which the numerator and denominator are integers that have no other common divisors than 1.

[irreducible fractions]: https://en.wikipedia.org/wiki/Irreducible_fraction

 Invertible functions are another way to put sets into a one-to-one correspondance with each other.

If, for two sets A and B, there exist two functions f and g such that for every `a ∈ A, f(a) = b` and `b ∈ B`. Likewise, for every `b ∈ B, g(b) = a` and `a ∈ A`. If f and g are also inversions of each other,

Today we're going to look at other ways in which two infinite sets can be related, and in doing so, we'll review the properties of [injective] and [bijective] mappings. We'll then use those as a springboard for exploring reversible functions.

[bijective]: https://en.wikipedia.org/wiki/Bijection
[injective]: https://en.wikipedia.org/wiki/Injective_function
[surjective]: https://en.wikipedia.org/wiki/Surjective_function

---

[![Key](/assets/invertible/key.jpg)](https://www.flickr.com/photos/26344495@N05/32743331307)

---

## The Night Clerk at Hilbert's Hotel

---

In Hilbert's Grand Hotel, there are a [countably infinite][ci] number of rooms, and they have been numbered 1, 2, 3, and so on. Every evening, an infinite number of guests arrive, stay for one night, and then leave the next day. That evening, another infinite number of guests arrive, and the process begins anew.

[ci]: https://en.wikipedia.org/wiki/Countably_infinite

The night clerk is responsible for assigning every guest a room. The night clerk's problem, then, is to take an infinite number of guests, and give each one their own unique natural number. Given the definition of an infinite set of guests, if we can devise an algorithm to assign each guest their own room number, we know that the set of guests is countably infinite. Conversely, if we can show that there is at least one guest that cannot be assigned a room number, we know that the set is [uncountable].

[uncountable]: https://en.wikipedia.org/wiki/Uncountable_set

---

### even numbers, irreducible fractions, and injection

We'll illustrate the principle with one example, and thereafter we'll dispense with the metaphor. One evening, an infinite number of guests arrive, each presenting a ticket bearing a unique positive even number. Can the night clerk register them all? Certainly! Each guest can be dispatched to the room number that matches the number of their ticket. This shows that the set of all even numbers is countable.

The night clerk's general problem is to devise a correspondence between guests and natural numbers. That is, for each guest there is a natural number, and no two guests have the same natural number. In the example given, the correspondance is given by the [identity] function: Every even number is its own unique natural number. In JavaScript:

[identity]: https://en.wikipedia.org/wiki/Identity_function

```javascript
const I = x => x;

const evenToNatural = I;
```

Using identity to establish a correspondence between positive even numbers and positive natural numbers establishes an [injection] between even numbers and natural numbers. "Injection" is mathematical jargon for a one-to-one relationship, i.e. For each even number, there is exactly one natural number, and for each natural number, there is *at most* one even number.

[injection]: https://en.wikipedia.org/wiki/Injective_function

To give another example of an injection, consider the set of all canonical forms of the positive [rational] numbers. That is, the sent of all positive [irreducible fractions]. To review, a positive irreducible ration is a rational number where the numerator and denominator are coprime.[^coprime] `1/1`, `1/3`, and `5/3` are irreducible fractions. `4/2` is not an irreducible fraction, because four and two are both divisible by two, and thus it can be reduced to `2/1`.

[^coprime]: Two numbers are coprime if their greatest common divisor is 1.

Can we establish a one-to-one relationship between positive irreducible fractions and the natural numbers?

[rational]: https://en.wikipedia.org/wiki/Rational_number


Certainly we can, and to do so we'll use [Gödel Numbering], a trick we used in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language][FRACTRAN]. Given a finite ordered set of positive natural numbers, we can map them to a single number using [prime factorization].

[FRACTRAN]: http://raganwald.com/2020/05/03/fractran.html
[Gödel Numbering]: https://en.wikipedia.org/wiki/Gödel_numbering
[prime factorization]: https://en.wikipedia.org/wiki/Integer_factorization

In the case of a numerator and denominator, we can map the pair to a single natural number with this JavaScript:

```javascript
const fractionToNatural = (numerator, denominator) => Math.pow(2, numerator) * Math.pow(3, denominator);

fractionToNatural(7, 8)
  //=> 839808
```

Because every positive natural number can be reduced to a unique prime factorization,[^fundamental] we know that no two positive irreducible fractions could resolve to the same natural number.

[^fundamental]: The [fundamental theorem of arithmetic](https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic) is that every integer has a unique prime factorization.

This shows that the number of irreducible fractions is countable: There is one natural number for every irreducible fraction, and there is at most one irreducible fraction for every natural number.

---

### even numbers, irreducible fractions, and bijection

We established that there is one natural number for every irreducible fraction, and there is *at most* one irreducible fraction for every natural number. It is certainly *at most* one, because there are lots of natural numbers that don't map to positive irreducible fractions using the Gödel Numbering scheme.

The numbers two and three don't map to positive irreducible fractions: `2` would map to `2/0`, and `3` would map to `0/3`. And any number divisible by a prime larger than two or three also wouldn't map to an irreducible fraction using Gödel Numbering.

The set of all irreducible fractions maps to a proper subset of all natural numbers, specifically the set of all natural numbers whose prime factorization includes both primes two and three but no other primes. But mappings don't always have to work this way.

Let's recall the very first example, positive even numbers. When mapping positive even numbers to natural numbers using the identify function, positive each even numbers map to exactly one positive natural number, but the positive natural numbers do not map to exactly one positive even number: None of the odd positive natural numbers map to a positive natural even number.

But we would arrange our mapping differently. What if we used this function for mapping positive even numbers to positive natural numbers?

```javascript
const evenToNatural = even => even / 2;

evenToNatural(42)
  //=> 21
```

Now every positive even number maps to exactly one positive natural number, and every positive natural number maps to exactly one positive even number:

```javascript
const naturalToEven = natural => natural * 2;

naturalToEven(21)
  //=> 42
```

We saw that the mapping from positive even numbers to positive natural numbers using identity was an injection: It maps one-to-exactly-one in one direction, and one-to-at-most-one in the other.

There's a also a name for the mapping from positive even numbers to positive natural numbers using division: It's a [bijection]. The name implies symmetry between the two relationships, and indeed it maps one-to-exactly-one in one both directions.

[bijection]: https://en.wikipedia.org/wiki/Bijective_function

Bijections between infinities are useful, because they establish that both infinities have the same cardinality. Using identity to map even numbers to positive natural numbers established that they are countable. Using division to establish a bijection with the positive natural numbers established that they are [countably infinite][ci]. Which is to say, there are exactly as many positive even natural numbers as there are positive natural numbers.

---

[![Fractional Hugs And Kisses](/assets/invertible/fractional-hugs-and-kisses.jpg)](https://www.flickr.com/photos/clearlyambiguous/60431147)

---

## a bijective mapping between positive irreducible fractions and positive natural numbers

---

Bijections with the natural numbers have other uses. They provide a way of enumerating an infinite set: If we have a way of mapping natural numbers to exactly one positive irreducible fraction, we can generate all of the fractions by generating the positive natural numbers and mapping them to the positive irreducible fractions, without having to filter out positive natural numbers that do not map to positive irreducible fractions.

Consider trying to generate the 10,000th positive irreducible fraction. How many positive natural numbers would we have to try to find it using the Gödel Numbering function? If we could devise a bijective mapping between positive irreducible fractions and positive natural numbers, we could simply feed it `10000` and get an immediate answer.

There are a number of such mappings. We're going to construct one based on the [Euclidean algorithm] for determining the [greatest common divisor] of two integers.

[Euclidean algorithm]: https://en.wikipedia.org/wiki/Euclidean_algorithm
[greatest common divisor]: https://en.wikipedia.org/wiki/Greatest_common_divisor

---

### the euclidean algorithm for determining the greatest common divisor of two integers

Given two integers `p` and `q`, the Euclidean algorithm for determining the greatest common divisor of two integers in its most simple form works like this:

- If `p === q`, stop.
  - If `p === q === 1`, the original `p` and `q` are coprime;
  - If `p === q > 1`, `p` (and `q`) is the greatest common divisor of the two original numbers.
- If `p` > `q`, then return the greatest common divisor of `p-q, q`;
- If `q > p`, then return the greatest common divisor of `p, q-p`;

Here it is in JavaScript:

```javascript
const gcd = (p, q) => {
  if (p > q) {
    return gcd(p-q, q);
  } else if (p < q) {
    return gcd(p, q-p);
  } else {
    return p;
  }
};

gcd(42, 15)
  //=> 3

gcd(42, 14)
  //=> 14

gcd(42, 13)
  //=> 1
```

Consider how this algorithm works. If we consider give it any pair of positive natural numbers, it reduces one or the other repeatedly until both are equal. Thus, all pairs of positive numbers eventually converge on a positive natural number. Here are the intermediate results of the above three calculations:

<div class="mermaid">
graph LR
  42/15 --> 27/15 --> 12/15 --> 12/3 --> 9/3 --> 6/3 --> 3/3
</div>

<div class="mermaid">
graph LR
  42/14 --> 28/14 --> 14/14
</div>

<div class="mermaid">
graph LR
  42/13 --> 29/13 --> 16/13 --> 3/13 --> 3/10 --> 3/7 --> 3/4 --> 3/1 --> 2/1 --> 1/1
</div>

Every pair of positive natural numbers traces a **path** through the set of all pairs of positive natural numbers, terminating with a pair of equal natural numbers. And as it happens, this algorithm partitions the set of all pairs of positive natural numbers into a forest of trees. One tree has a 'root' of `1/1`. The next has a root of `2/2`, the next a root of `3/3` and so on.

We're interested in the tree with a root of `1/1`, because the set of all pairs of numbers that resolve to a root of `1/1` is the set of all pairs of numbers that are coprime, and the set of all pairs of coprime natural numbers is the set of all irreducible fractions, because an irreducible fraction is a fraction where the numerator and denominator are coprime.

---

### the irreducible tree

The tree with a root of `1/1`, is, of course, infinite. But here is a small part of the tree that illustrates its shape. Every node is a positive irreducible fraction:

<div class="mermaid">
graph TD
  2/1 --> 1/1
  1/2 --> 1/1
  3/1 --> 2/1
  2/3 --> 2/1
  3/2 --> 1/2
  1/3 --> 1/2
  4/1 --> 3/1
  3/4 --> 3/1
  5/3 --> 2/3
  2/5 --> 2/3
  5/2 --> 3/2
  3/5 --> 3/2
  4/3 --> 1/3
  1/4 --> 1/3
</div>

How doos this help us map positive irreducible fractions to positive natural numbers? Note that our upside-down tree is a binary tree: There are exactly two child nodes for every node. One represents adding `p` to `q`, the other adding `q` to `p`. But working from leaf back to root, at each step we must either subtract `p` from `q` or subtract `q` from `p`, depending upon which is bigger.

In doing so, we are forming a path through the space of pairs of positive natural numbers. What we're looking for is an encoding of our path that forms a bijection with the set of positive natural numbers. And there is a very simple one, thanks to this being a binary tree.

---

### encoding paths as numbers

Since at each step we either subtract `p` from `q` or subtract `q` from `p` until we reach the root, what we can do is make a note of which one we subtract at every step. Let's say we call subtracting `p` from `q` a `0`, and subtracting `q` from `p` a `1`.

We can produce a list of 1s and 0s representing our path by modifying the `gcd` algorithm:

```javascript
const toPath = (p, q, path = []) => {
  if (p > q) {
    return toPath(p-q, q, [1].concat(path));
  } else if (p < q) {
    return toPath(p, q-p, [0].concat(path));
  } else {
    return path;
  }
};

toPath(5, 3)
  //=> [1, 0, 1]

toPath(1, 3)
  //=> [0, 0]

toPath(1, 1)
  //=> []
```

Here's our diagram again, with the paths shown:

<div class="mermaid">
graph TD
  2/1 ==1==> 1/1
  1/2 ==0==> 1/1
  3/1 --> 2/1
  2/3 ==0==> 2/1
  3/2 --> 1/2
  1/3 ==0==> 1/2
  4/1 --> 3/1
  3/4 --> 3/1
  5/3 ==1==> 2/3
  2/5 --> 2/3
  5/2 --> 3/2
  3/5 --> 3/2
  4/3 --> 1/3
  1/4 --> 1/3
</div>

The paths can be converted to positive natural numbers by prefixing them with a `1` and treating the number as binary:

```javascript
const toNatural = path => {
  const prependedPath = [1].concat(path);
  let n = 0;
  let powerOfTwo = 1;

  for (const element of prependedPath.reverse()) {
    n += element * powerOfTwo;
    powerOfTwo *= 2;
  }

  return n;
};

toNatural(toPath(5, 3))
  //=> 13

toNatural(toPath(1, 3))
  //=> 4

toNatural(toPath(2, 1))
  //=> 3

toNatural(toPath(1, 2))
  //=> 2

toNatural(toPath(1, 1))
  //=> 1
```

This mechanism converts positive irreducible fractions to positive natural numbers. It has "more moving parts" than the Gödel Numbering approach, but it is more useful, in that it is a bijection and not an injection. To see how that works, we have to not just convert fractions to natural numbers, but go the other way around and map positive natural numbers to irreducible fractions.

To do that, we'll reverse our approach. We'll start by converting positive natural numbers to paths, and then we'll convert paths to positive irreducible fractions.

---

### converting numbers back to fractions with paths

Our first step in reversing our mapping will be to generate paths from natural numbers:


```javascript
const fromNatural = natural => {
  const path = [];
  let n = natural;
  while (n > 1) {
    path.push(n % 2);
    n = Math.floor(n/2);
  }

  return path;
};


fromNatural(13)
  //=> [1, 0, 1]

fromNatural(4)
  //=> [0, 0]

fromNatural(3)
  //=> [1]

fromNatural(2)
  //=> [0]

fromNatural(1)
  //=> []
```

The second step will be to reconstruct fractions from paths. This is straightforward: Where we constructed the path by noting whether we subtracted `p` from `q` or `q` from `p`, when reconstructing we'll go in the other direction and use the path to decide whether to add `p` to `q` or add `q` to `p`.

Before we jump back into the code, here's our tree again, this time with the root at the top so we can more easily see the paths we'll follow:

<div class="mermaid">
graph TD
  1/1 ==1==> 2/1
  1/1 ==0==> 1/2
  2/1 -->    3/1
  2/1 ==0==> 2/3
  1/2 -->    3/2
  1/2 ==0==> 1/3
  3/1 -->    4/1
  3/1 -->    3/4
  2/3 ==1==> 5/3
  2/3 -->    2/5
  3/2 -->    5/2
  3/2 -->    3/5
  1/3 -->    4/3
  1/3 -->    1/4
</div>

Getting a fraction from a path is performed by starting with the root and then adding `p` to `q` or `q` to `p` for each step of the path. When there are no steps, we stick with the root.

Starting with `[1, 1]`:

* The path `[]` returns `[1, 1]` because there's nothing to follow;
* The path `[0, 0]` becomes `[1, 2]` because when the step is `0`, we turn `[p, q]` into `[p, p+q]`, and `[1, 1+1]` is `[1, 2]`, And again, the second step is `0`, so turning `[p, q]` into `[p, p+q]` means turning `[1, 2]` into `[1, 1+2]`, which is `[1, 3]`
* Using the above logic, the path `[1, 0, 1]` is treated as `[p+q, q]`, `[p, p+q]`, `[p+q, q]` and thus `[1, 1]` becomes `[2, 1]`, `[2, 3]`, and finally `[5, 3]`

Some code to do this for us:

```javascript
const fromPath = (path, root = [1, 1]) => {
  if (path.length === 0) {
    return root;
  } else {
    const [head, ...butHead] = path;
    const [p, q] = root;

    const nextRoot = head === 0 ? [p, p+q] : [p+q, q];

    return fromPath(butHead, nextRoot);
  }
};

fromPath(fromNatural(13)
  //=> [5, 3]

fromPath(fromNatural(4)
  //=> [1, 3]

fromPath(fromNatural(3)
  //=> [2, 1]

fromPath(fromNatural(2)
  //=> [1, 2]

fromPath(fromNatural(1)
  //=> [1, 1]
```

---

### the final bijection

And now we can express the final mapping from positive canonical fraction to positive natural number:

```javascript
const fractionToNatural = fraction => toNatural(toPath(fraction));
```

And positive natural number to positive canonical fraction:

```javascript
const naturalToFraction = natural => fromPath(fromNatural(natural));
```

Every positive canonical fraction maps to exactly one positive natural number (via `fractionToNatural`), and every positive natural number maps to exactly one positive canonical fraction (via `naturalToFraction`). Therefore this is a bijection between the set of all positive canonical fractions and the set of all positive natural numbers, which implies that the set of all positive canonical fractions has exactly the same cardinality as the set of all positive natural numbers: Both are countably infinite.

---

![Green U Turn](/assets/invertible/green-u-turn.jpg)

---

## Reversibility

*Coming soon, thoughts on reversible functions and concatenative programming...*

---

### notes