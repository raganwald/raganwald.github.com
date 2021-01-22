---
title: "Invertible Functions"
tags: [allonge, noindex, mermaid]
---

[![Bach Puzzle Canon](/assets/invertible/bach-puzzle-canon.png)](https://godel-escher-bach.fandom.com/wiki/Crab_Canon)

---

## Invertible Functions

---

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

Some functions are their own inversion. This still makes them invertible functions. `I`—also known as the "identity" or "idiot bird" function—is its own inversion.[^I]

[^I]: `const I = x => x;`

Other functions that are their own inversions include:

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

### invertible functions and compound values

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

[![Fractional Hugs And Kisses](/assets/invertible/fractional-hugs-and-kisses.jpg)](https://www.flickr.com/photos/clearlyambiguous/60431147)

---

## Composing Invertible Functions

---

If `f` and `g` are invertible functions, and `⁻¹` as a suffix denotes "the inversion of" a function, then `(f ֯  g)⁻¹ = (g⁻¹ ֯  f⁻¹)`.

Thius, if we compose two invertible functions, the inversion of that composition can be computed by taking the composition of the inversions of each function, in reverse order:

```javascript
const plusOne = n => n + 1;
const minusOne = n => n - 1;

const timesTwo = n => n * 2;
const dividedByTwo = n => n / 2;

const compose = fns => argument =>
  fns.reduceRight((value, fn) => fn(value), argument);

const plusOneTimesTwo = compose([plusOne, timesTwo]);
const dividedByTwoMinusOne = compose([dividedByTwo, minusOne]);

plusOneTimesTwo(42)
  //=> 85

dividedByTwoMinusOne(85 )
  //=> 42
```

Keeping track of functions and their inversions can be a bit of a headache, especially as we compose invertible functions. To keep things relatively simple, we'll introduce an object to do the work for us:

```javascript
const R = {
  _inversions: new Map(),
  add([f, g]) {
    this._inversions.set(f, g);
    this._inversions.set(g, f);

    return f;
  },
  has(f) {
    return this._inversions.has(f);
  },
  get(f) {
    return this._inversions.get(f);
  }
};

R.add(plusOneTimesTwo, dividedByTwoMinusOne);

R.get(dividedByTwoMinusOne)(42)
  //=> 85

R.get(plusOneTimesTwo)(85)
  //=> 42
```

Let's write a `compose` method for `R` that composes a list of invertible functions and their inversions simultaneously:

```javascript
const R = {
  // ...

  compose(fns) {
    const composition = argument =>
      fns.reduceRight((value, fn) => fn(value), argument);
    const inversion = argument =>
      fns.reduce((value, fn) => this.get(fn)(value), argument);

    return this.add([composition, inversion]);
  }
};

R.add([plusOne, minusOne]);
R.add([timesTwo, dividedByTwo]);

plusOneTimesTwo(42)
  //=> 85

R.get(plusOneTimesTwo)(85)
  //=> 42
```

We'll use this later.

### converting between numbers and their binary representation

Here's a function that converts a non-negative natural number into the list form of its binary representation, without relying on JavaScript's capabilities for parsing and representing numbers in various bases:

```javascript
const toBinaryNaive = n => {
  const b = [];

  do {
    const bit = n % 2;
    n = Math.floor(n / 2);

    b.unshift(bit);
  } while (n > 0);

  return b;
};

toBinaryNaive(0)
  //=> [0]

toBinaryNaive(1)
  //=> [1]

toBinaryNaive(6)
  //=> [1, 1, 0]

toBinaryNaive(23)
  //=> [1, 0, 1, 1, 1]
```

And here's its inversion, a function that converts the list form of a non-negative natural number's binary representation into the number:

```javascript
function fromBinaryNaive(b) {
  let n = 0;

  for (const bit of b) {
    n *= 2;
    n += bit;
  }

  return n;
};

fromBinaryNaive([0])
  //=> 0

fromBinaryNaive([1])
  //=> 1

fromBinaryNaive([1, 1, 0])
  //=> 6

fromBinaryNaive([1, 0, 1, 1, 1])
  //=> 23
```

We can tell from careful inspection that for non-negative naturals within implementation bounds, `toBinaryNaive` and `fromBinaryNaive` are inversions of each other. But even with such a simple function, it requires examination to determine that they are inversions of each other.

This is especially true because the two functions are written in different styles, one uses a `do... while` loop, the other a `for... of` loop, and the ways in which they do basic arithmetic aren't obviously symmetrical the way `n => n + 1` and `n => n - 1` are.

When we used simple composittion of invertibvle functions, we were able to _derive_ the composition of their inversions automatically. We'll apply the same approach here.

### refactoring to use invertible functions

We're going to refactor these two invertible functions, beginning by extracting a pair of inversions at the core of each function's loop:

```javascript
const divideByTwoWithRemainder = R.add([
  n => [Math.floor(n / 2), n % 2],
  ([n, r]) => n * 2 + r
]);
```

Now we can write:

```javascript
const toBinaryRefactored = n => {
  const b = [];
  let bit;

  do {
    [n, bit] = divideByTwoWithRemainder(n);

    b.unshift(bit);
  } while (n > 0);

  return b;
};

toBinaryRefactored(0)
  //=> [0]

toBinaryRefactored(1)
  //=> [1]

toBinaryRefactored(6)
  //=> [1, 1, 0]

toBinaryRefactored(23)
  //=> [1, 0, 1, 1, 1]

function fromBinaryRefactored(b) {
  let n = 0;

  for (const bit of b) {
    n = R.get(divideByTwoWithRemainder)([n, bit]);
  }

  return n;
};

fromBinaryRefactored([0])
  //=> 0

fromBinaryRefactored([1])
  //=> 1

fromBinaryRefactored([1, 1, 0])
  //=> 6

fromBinaryRefactored([1, 0, 1, 1, 1])
  //=> 23
```

We'll refactor the loops next.

### refactoring to folds and unfolds

> In functional programming, `fold` (also termed `reduce`, `accumulate`, `aggregate`, `compress`, or `inject`) refers to a family of higher-order functions that analyze a recursive data structure and through use of a given combining operation, recombine the results of recursively processing its constituent parts, building up a return value.
>
> Fold is in a sense dual to `unfold`, which takes a seed value and apply a function corecursively to decide how to progressively construct a corecursive data structure.--[Wikipedia](https://en.wikipedia.org/wiki/Fold_%28higher-order_function%29)

Here is a higher-order `fold` that takes a `base` (sometimes called a `seed`) value, plus a `combiner` function. It is specific to lists. To make it useful for our purposes, instead of the combining function taking two arguments, this fold expects its combiner function to take a one argument, a list with two elements.

It is implemented as a loop, because loops are trivially equivalent to linear recursion. It is also implemented as a higher-order function that returns a function:

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

We use it with our `multiplyByTwoWithRemainder` function to generate `fromBinaryFold`:

```javascript
const fromBinaryFold = foldList([0, multiplyByTwoWithRemainder]);
```

And here's `unfoldToList`. Our unfold is also written as a loop. We will use a simple equality test that works for primitive values and strings, but not objects and especially not maps of any kind.[^prodequal]

[^prodequal]: For production use, deep equality must be carefully crafted to match the semantics of the entities we wish to compare.

This unfold is written as an "eager right unfold," which is to say, it assembles its list in the reverse order of our fold. That's different from how unfolds are usually written, but then again, most people aren't trying to invert a fold.

We'll use our unfold to derive `toBinaryUnfold`:

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

    do {
      [folded, element] = uncombiner(folded);
      list.unshift(element);
    } while (!deepEqual(folded, base))

    return list;
  };

const toBinaryUnfold = unfoldToList([0, R.get(multiplyByTwoWithRemainder)]);
```

We have demonstrated another form of composition of invertible functions: Given a common base, `foldList` of an invertible function is the inversion of `unfoldToList` of its inversion.

Let's add this to `R`:

```javascript
const R = {
  // ...

  foldList([base, combiner]) {
    const folder = foldList([base, combiner]);
    const unfolder = unfoldToList([base, this.get(combiner)]);

    return this.add([folder, unfolder]);
  },
  unfoldToList([base, uncombiner]) {
    const unfolder = unfoldToList([base, uncombiner]);
    const folder = foldList([base, this.get(uncombiner)]);

    return this.add([unfolder, folder]);
  }
};

const toBinary = R.unfoldToList([0, divideByTwoWithRemainder]);

toBinary(0)
  //=> [0]

toBinary(1)
  //=> [1]

toBinary(6)
  //=> [1, 1, 0]

toBinary(23)
  //=> [1, 0, 1, 1, 1]

const fromBinary = R.get(toBinary);

fromBinary([0])
  //=> 0

fromBinary([1])
  //=> 1

fromBinary([1, 1, 0])
  //=> 6

fromBinary([1, 0, 1, 1, 1])
  //=> 23
```

### why refactoring to fold and unfold matters

`R.foldList`, and `R.unfoldToList` are higher-order invertible functions. This helps us compose new invertible functions by applyiung linear recursion to invertible functions like `divideByTwoWithRemainder`. Once we're satisfied that one-liners like `n => [Math.floor(n / 2), n % 2]` and `([n, r]) => n * 2 + r` are invertible, we can compose `toBinary` and `from Binary` out of them, confident that `toBinary` and `from Binary` will also be invertible.

By writing higher-order functions for composing invertible functions that preserve "invertibility," we make it easier to reason about what our code does. And so it goes for all composition: Composing functions with well-understood patterns like folding and unfolding makes it easier for us to reason about what our code does.

Now let's look at a "contrived" problem we will solve with invertible functions.

---

[![Grand Hotel](/assets/invertible/grand-hotel.jpg)](https://www.flickr.com/photos/jannerboy62/31444461695)

---

## The Night Clerk at Hilbert's Hotel

---

[Hilbert's Paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of countably infinite sets: It demonstrates that although it may seem "obvious" that some infinite sets are larger than others, many of them are in fact equal in cardinality to the set of natural numbers.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

The proposition is that the Grand Hotel has a countably infinite number of rooms, each of which is denoted by a natural number. The hotel's night clerk has the problem of coming up with an algorithm for assigning an infinite number of guests to the countably infinite number of rooms.

### gödel and irreducible fractions

A positive [irreducible fraction][irreducible fractions] is a [rational] number where the numerator and denominator are coprime.[^coprime] `1/1`, `1/3`, and `5/3` are irreducible fractions. `4/2` is not an irreducible fraction, because four and two are both divisible by two, and thus it can be reduced to `2/1`.

[rational]: https://en.wikipedia.org/wiki/Rational_number
[irreducible fractions]: https://en.wikipedia.org/wiki/Irreducible_fraction
[^coprime]: Two numbers are coprime if their greatest common divisor is 1.

One night at the Grand Hotel, an infinite number of guests show up. They're members of a club that reveres irreducible fractions, and each member of the club is given their own unique irreducible fraction as an identifier.

The night clerk has to assign the guests to rooms, and comes up with an idea: Write an invertible function that maps positive irreducible numbers to positive natural numbers. That way, each guest can use the function mappping positive irreducible fractions to natural numbers to find their room. And given an occupied room, we can use the function mapping positive natural numbers to positive irreducible fractions to find the guest.

In JavaScript terms, we need a function that maps lists of two coprime numbers to numbers, and another that maps numbers to lists of two coprime numbers. The night clerk's first attempt is based on [prime factorization]:[^fractran]

[^fractran]: [Prime factorization][prime factorization] is a trick the night clerk read about in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language][FRACTRAN].

[FRACTRAN]: http://raganwald.com/2020/05/03/fractran.html
[prime factorization]: https://en.wikipedia.org/wiki/Integer_factorization

```javascript
const guestToRoom = ([n, d]) => 2**n * 3**d;

const roomToGuest = n => [2, 3].reduce(
  (acc, prime) => {
    let exponent = 0;

    while (n >= prime && n % prime === 0) {
      ++exponent;
      n /= prime;
    }

    return acc.concat([exponent]);
  },
  []
);

guestToRoom([1, 1])
  //=> 6

guestToRoom([1, 2])
  //=> 18

guestToRoom([3, 2])
  //=> 72

guestToRoom([1, 3])
  //=> 54

guestToRoom([2, 1])
  //=> 12

guestToRoom([3, 1])
  //=> 24

guestToRoom([2, 3])
  //=> 108
```

This works fine, but it assigns guests to a subset of the rooms of the Grand Hotel. It's undesireable to have empty rooms at any hotel, even one with an infinite number of rooms. And from a maths perspective, this doesn't demonstrate that there are an equal number of positive irreducible fractions as there are positive natural numbers, because there are an infinite number of positive natural numbers that are not associated with a positive irreducible fraction, e.g. the numbers one through five, and anything divisible by a prime larger than three.

The night clerk decides to try againn, this time taking advantage of an interesting rule about the relationship between members of the irreducible fraction club.

### the irreducible fraction family tree

The irreducible fractions club has an interesting rule: Each member of the club is required to recruit exactly two more meembers of the club, who in turn must recruit two more members of the club, and so forth. Furthermore, they have a specific rule for assigning irreducible fractions to new members.

The founder's fraction was `1 / 1`. `1 / 1`'s two recruits were the fractions `2 / 1` and `1 / 2`. Their recruits were given the fractions `3 / 1`, `2 / 3` and `3 / 2`, `1 / 3` respectively. And this tree of recruits and names continues, to infinity. The rules for constructing the irreducible fraction "family tree" are as follows:

1. All members are given a unique irreducible fraction;
2. Irreducible fractions are of the form `n / d`, representing a numerator and denominator;
3. Every member has two recruits. If the member is `n / d`, their two recruits are always `n + d / d` and `n / n + d`.
4. The founder is `1 / 1`.

From this, the tree grows, starting with:

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

The club claims that every irreducible fraction appears exactly once somewhere in the tree, and therefore, there is a club member for every irreducible fraction.

The night clerk observes that if every irreducible fraction appears exactly once somewhere in the tree, there is a unique path to every irreducible fraction from the founding fraction `1 / 1`. For example, the path to `2 / 5` is `1 / 1 >> 2 / 1 >> 2 / 3 >> 2 / 5`.

### mapping irreducible fractions to paths

Let's formalize an algorithm for going from irreducible fractions to paths. Given some irreducible fraction `n / d`, we know that if `n` and `d` are both `1`, the path will be `[]` (the empty path). If it's some other irreducible fraction, we have to find its parent and determine whethert the arc between fraction and parent is labeled `0` or `1`.

The paths can be simplified by observing that at each step, we go from `n / d` to either `n + d / d` or `n / n + d`. The night clerk encodes these two options as `0` and `1`. Therefore, we can encode `2 / 5` as the path `[0, 1, 1]`.  Now the night clerk prepends the path with an extra `1`, like this: `[1, 0, 1, 1]`. And what happens if we take those 1s and 0s and treat them as a binary number?

We get the positive natural number eleven. Therefore, the irreducible fraction `2 / 5` maps to the positive natural number `11`. If we take `[]` as the empty path for `1 / 1`, its positive natural number will be `1`, and its two immediate children will be `3` and `2`. Their children will be `7`, `6` and `5`, `4` respectively. And so the positive natural numbers will grow as the tree grows.

We can use paths as the basis for an invertible function to map positive natural numbers to positive irreducible fractions. Our algorithm will be:

1. Map

Let's start with the easy bit:

```javascript
const appendElementToList =
  ([list, element]) => [...list, element];

const removeElementFromList =
  list => [list.slice(0, list.length - 1), list[list.length - 1]];

const [prependOne, removeOne] = foldUnfoldList([
  [1],
  appendElementToList,
  removeElementFromList
]);
```

---

# JUNK BELOW


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

[rational]: https://en.wikipedia.org/wiki/Rational_number
[^coprime]: Two numbers are coprime if their greatest common divisor is 1.

Can we establish a one-to-one relationship between positive irreducible fractions and the natural numbers?



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



[![Key](/assets/invertible/key.jpg)](https://www.flickr.com/photos/26344495@N05/32743331307)

---

## Reversibility

*Coming soon, thoughts on reversible functions and concatenative programming...*

---

### notes