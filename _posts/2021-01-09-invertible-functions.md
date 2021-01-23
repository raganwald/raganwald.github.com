---
title: "Invertible Functions"
tags: [allonge, noindex, mermaid]
---

[![Bach Puzzle Canon](/assets/invertible/bach-puzzle-canon.png)](https://godel-escher-bach.fandom.com/wiki/Crab_Canon)

---

## Invertible Functions

---

In this essay, we're going to work with **invertible functions**. A function is invertible if it has an [inverse function]. Consider:

[inverse function]: https://en.wikipedia.org/wiki/Inverse_function

```javascript
const evenToNatural = even => even / 2;

const naturalToEven = natural => natural * 2;
```

`evenToNatural` and `naturalToEven` are _inverses_ of each other:

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

A function `f` is considered _invertible_ if there also exists a function `g` such that `f` and `g` are inverses of each other. `evenToNatural` is an invertible function, because `naturalToEven` is its inverse, and vice-versa.

The following functions are also invertible, even though we do not give their inverses:

```javascript
const increment = n => n + 1;

const cons = ([head, tail]) => [head, ...tail];
```

The `cons` function given implies that where compound types like lists or maps are concerned, we base our reasoning on structural equality, not referential equality.[^equality]

[^equality]: Structural (or "semantic") equality is when two compound objects behave identically. Referential (or "physical") equality is when two references refer to the same entity in the language's implementation. JavaScript uses referential equality by default, but this is not what we want for the purposes of exploring invertible functions.

Some functions are their own inverse. This still makes them invertible functions. `I`—also known as the "identity" or "idiot bird" function—is its own inverse.[^I]

[^I]: `const I = x => x;`

Other functions that are their own inverses include:

```javascript
const oddsAndEvens = n => n % 2 === 0 ? n + 1 : n - 1;

const positiveNegative = n => -n;
```

### functions that return the same output for different inputs aren't invertible

For a function to be invertible, it must map exactly one elements of its input to exactly one element of its output. Thus, any function for which two or more different inputs produce the same output cannot be invertible:

```javascript
const square = n => n * n;

const roundTen = Math.floor(n / 10) * 10;

const collatz = n => n % 2 === 0 ? n / 2 : 3 * x + 1;

const butFirst = ([first, ...rest]) => rest;
```

`square` is not invertible because every positive output has two possible inputs, one positive and one negative. Presuming that we are sticking with natural numbers, `roundTen` has ten possible inputs for each output. And `collatz` has multiple possible inputs as well: For example, if the output is `10`, the input could be `3` or `20`.[^collatz]

[^collatz]: We touched on [The Collatz Conjecture] in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language](http://raganwald.com/2020/05/03/fractran.html).

[The Collatz Conjecture]: https://en.wikipedia.org/wiki/Collatz_conjecture

When there are multiple inputs for the same output, what would an inverse of the function return for that output? For example, if we assume the function `ztalloc` inverts `collatz`, what does `ztalloc(10)` return? Three? Or Twenty?

Finally, `butFirst` isn't invertible because it has infinitely many inputs that produce the same output. For example, all lists of length one produce as output the empty list `[]`.

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

If `f` and `g` are invertible functions, and `⁻¹` as a suffix denotes "the inverse of" a function, then `(f ֯  g)⁻¹ = (g⁻¹ ֯  f⁻¹)`.

Thus, if we compose two invertible functions, the inverse of that composition can be computed by taking the composition of the inverses of each function, in reverse order:

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

Keeping track of functions and their inverses can be a bit of a headache, especially as we compose invertible functions. To keep things relatively simple, we'll introduce an object to do the work for us:

```javascript
const R = {
  _inverses: new Map(),
  add([f, g]) {
    this._inverses.set(f, g);
    this._inverses.set(g, f);

    return f;
  },
  has(f) {
    return this._inverses.has(f);
  },
  get(f) {
    return this._inverses.get(f);
  }
};

R.add(plusOneTimesTwo, dividedByTwoMinusOne);

R.get(dividedByTwoMinusOne)(42)
  //=> 85

R.get(plusOneTimesTwo)(85)
  //=> 42
```

Let's write a `compose` method for `R` that composes a list of invertible functions and their inverses simultaneously:

```javascript
const R = {
  // ...

  compose(fns) {
    const composition = argument =>
      fns.reduceRight((value, fn) => fn(value), argument);
    const inverse = argument =>
      fns.reduce((value, fn) => this.get(fn)(value), argument);

    return this.add([composition, inverse]);
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

Here's a function that converts a positive natural number into the list form of its binary representation, without relying on JavaScript's capabilities for parsing and representing numbers in various bases:

```javascript
const toBinaryNaive = n => {
  const b = [];

  while (n !== 0) {
    const bit = n % 2;
    n = Math.floor(n / 2);

    b.unshift(bit);
  }

  return b;
};

toBinaryNaive(1)
  //=> [1]

toBinaryNaive(6)
  //=> [1, 1, 0]

toBinaryNaive(23)
  //=> [1, 0, 1, 1, 1]
```

And here's its inverse, a function that converts the list form of a positive natural number's binary representation into the number:

```javascript
function fromBinaryNaive(b) {
  let n = 0;

  for (const bit of b) {
    n *= 2;
    n += bit;
  }

  return n;
};

fromBinaryNaive([1])
  //=> 1

fromBinaryNaive([1, 1, 0])
  //=> 6

fromBinaryNaive([1, 0, 1, 1, 1])
  //=> 23
```

We can tell from careful inspection that for positive naturals within implementation bounds, `toBinaryNaive` and `fromBinaryNaive` are inverses of each other. But even with such a simple function, it requires examination to determine that they are inverses of each other.

This is especially true because the two functions are written in different styles, one uses a `while` loop, the other a `for... of` loop, and the ways in which they do basic arithmetic aren't obviously symmetrical the way `n => n + 1` and `n => n - 1` are.

When we used simple composition of invertible functions, we were able to _derive_ the composition of their inverses automatically. It's possible to use that same approach to make more complex functions like `toBinary`. We'll see how in the next section.

### refactoring to use invertible functions

We're going to refactor these two invertible functions, beginning by extracting a pair of inverses at the core of each function's loop:

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

  while (n > 0) {
    [n, bit] = divideByTwoWithRemainder(n);

    b.unshift(bit);
  }

  return b;
};

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

    while (!deepEqual(folded, base)) {
      [folded, element] = uncombiner(folded);
      list.unshift(element);
    }

    return list;
  };

const toBinaryUnfold = unfoldToList([0, R.get(multiplyByTwoWithRemainder)]);
```

We have demonstrated another form of composition of invertible functions: Given a common `base`, `foldList` of an invertible function is the inverse of `unfoldToList` of its inverse.

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

`R.foldList`, and `R.unfoldToList` are higher-order invertible functions. This helps us compose new invertible functions by applying linear recursion to invertible functions like `divideByTwoWithRemainder`. Once we're satisfied that one-liners like `n => [Math.floor(n / 2), n % 2]` and `([n, r]) => n * 2 + r` are invertible, we can compose `toBinary` and `from Binary` out of them, confident that `toBinary` and `from Binary` will also be invertible.

By writing higher-order functions for composing invertible functions that preserve "invertibility," we make it easier to reason about what our code does. And so it goes for all composition: Composing functions with well-understood patterns like folding and unfolding makes it easier for us to reason about what our code does.

Now let's look at a "contrived" problem we will solve with invertible functions.

---

[![Grand Hotel](/assets/invertible/grand-hotel.jpg)](https://www.flickr.com/photos/jannerboy62/31444461695)

---

## The Night Clerk at Hilbert's Hotel

---

[Hilbert's Paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of countably infinite sets: It demonstrates that although it may seem "obvious" that some infinite sets are larger than others, many of them are in fact equal in cardinality to the set of natural numbers.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

The proposition is that the Grand Hotel has a countably infinite number of rooms, each of which is denoted by a natural number. The hotel's Night Clerk has the problem of coming up with an algorithm for assigning an infinite number of guests to the countably infinite number of rooms.

### kurt gödel and the irreducible fractions club

A positive [irreducible fraction][irreducible fractions] is a [rational] number where the numerator and denominator are coprime.[^coprime] `1/1`, `1/3`, and `5/3` are irreducible fractions. `4/2` is not an irreducible fraction, because four and two are both divisible by two, and thus it can be reduced to `2/1`.

[rational]: https://en.wikipedia.org/wiki/Rational_number
[irreducible fractions]: https://en.wikipedia.org/wiki/Irreducible_fraction
[^coprime]: Two numbers are coprime if their greatest common divisor is 1.

One night at the Grand Hotel, an infinite number of guests show up. They're members of the Irreducible Fractions Club, and each member of the club is given their own unique irreducible fraction as an identifier.

The Night Clerk has to assign the guests to rooms, and comes up with an idea: Write an invertible function that maps positive irreducible numbers to positive natural numbers. That way, each guest can use the function mapping positive irreducible fractions to natural numbers to find their room. And given an occupied room, we can use the function mapping positive natural numbers to positive irreducible fractions to find the guest.

In JavaScript terms, we need a function that maps lists of two coprime numbers to numbers, and another that maps numbers to lists of two coprime numbers. The Night Clerk's first attempt is based on [prime factorization]:[^fractran]

[^fractran]: [Prime factorization][prime factorization] is a trick the Night Clerk read about in [Remembering John Conway's FRACTRAN, a ridiculous, yet surprisingly deep language][FRACTRAN].

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

This works fine, but it assigns guests to a subset of the rooms of the Grand Hotel. It's undesirable to have empty rooms at any hotel, even one with an infinite number of rooms. And from a maths perspective, this doesn't demonstrate that there are an equal number of positive irreducible fractions as there are positive natural numbers, because there are an infinite number of positive natural numbers that are not associated with a positive irreducible fraction, e.g. the numbers one through five, and anything divisible by a prime larger than three.

The Night Clerk decides to try again, this time taking advantage of an interesting rule about the relationship between members of the irreducible fraction club.

### the irreducible fractions club family tree

The Irreducible Fractions Club has an interesting rule: Each member of the club is required to recruit exactly two more members of the club, who in turn must recruit two more members of the club, and so forth. Furthermore, they have a specific rule for assigning irreducible fractions to new members.

The founder's fraction was `1 / 1`. The founder's recruits were the fractions `2 / 1` and `1 / 2`. Their recruits were given the fractions `3 / 1`, `2 / 3` and `3 / 2`, `1 / 3` respectively. And this tree of recruits and names continues, to infinity. The rules for constructing the Irreducible Fractions Club's "family tree" are as follows:

1. All members are given a unique irreducible fraction;
2. Irreducible fractions are of the form `n / d`, representing a numerator and denominator;
3. Every member has two recruits. If the member is `n / d`, their two recruits are always `n + d / d` and `n / n + d`.
4. The founder is `1 / 1`.

From this, the tree grows "upwards" to infinity:

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

The club claims that every irreducible fraction appears exactly once somewhere in the tree, and therefore, there is exactly one club member for every irreducible fraction.[^club-claim]

[^club-claim]: The club is correct. The club's rules for recruiting and assigning fractions to the recruits do guarantee that there is exactly one member for every irreducible fraction. This is a direct consequence of the [Euclidean algorithm] for determining the [greatest common divisor] of two integers.

[Euclidean algorithm]: https://en.wikipedia.org/wiki/Euclidean_algorithm
[greatest common divisor]: https://en.wikipedia.org/wiki/Greatest_common_divisor


The Night Clerk observes that if every irreducible fraction appears exactly once somewhere in the tree, there is a unique path from the founding fraction `1 / 1` to every irreducible fraction, and if we label the arcs from each parent to child with a `0` and a `1`, each unique path has a unique encoding as a list of `0`s and `1`s.

For example, the path from  `1 / 1` to `2 / 5` encoded as `[1, 1, 0]`, while the path from `1 / 1` to `1 / 2` is encoded as `[0, 0]`:

<div class="mermaid">
graph TD
  2/3 ==0==> 2/5
  1/1 ==1==> 2/1
  1/1 ==0==> 1/2
  2/1 -->    3/1
  2/1 ==0==> 2/3
  1/2 -->    3/2
  1/2 ==0==> 1/3
  3/1 -->    4/1
  3/1 -->    3/4
  2/3 -->    5/3
  3/2 -->    5/2
  3/2 -->    3/5
  1/3 -->    4/3
  1/3 -->    1/4
</div>

### mapping irreducible fractions to paths

Let's formalize an algorithm for going from irreducible fractions to paths. Given some irreducible fraction `n / d`, we know that if `n` and `d` are both `1`, the path will be `[]` (the empty path). If it's some other irreducible fraction, we have to find its parent and determine whether the arc between fraction and parent is labeled `0` or `1`.

At each step, we go from `n / d` to either `n / d - n` or `n - d / d`. And if `n < d`, we go from `n / d` to `n / d - n` along a path labeled `0`. While if `n > d`, we go from `n / d` to `n - d / d` along a path labeled `1`.

That's enough to write an unfold, representing irreducible fractions as a list with two numbers:

```javascript
const irreducibleToParentAndArc = ([n, d]) =>
  n < d ? [[n, d - n], 0] : [[n - d, d], 1];

const irreducibleToPath = unfoldToList([[1, 1], irreducibleToParentAndArc]);

irreducibleToPath([2, 5])
  //=> [1, 0, 0]

irreducibleToPath([1, 3	])
  //=> [0, 0]
```

Hmmm. If we can write an unfold around the uncombiner function `([n, d]) => n < d ? [[n, d - n], 0] : [[n - d, d], 1]`, does that mean that if we can write an inverse, we can get a fold as well? Yes:

```javascript
const parentAndArcToIrreducible = ([[n, d], arc]) =>
  arc === 0 ? [n, n + d] : [n + d, d];

const pathToIrreducible = foldList([[1, 1], parentAndArcToIrreducible]);

pathToIrreducible([1, 0, 0])
  //=> [2, 5]

pathToIrreducible([0, 0])
  //=> [1, 3]
```

And from this, it follows that:

```javascript
const pathToIrreducible = R.foldList([
  [1, 1],
  R.add([
    ([[n, d], arc]) =>
      arc === 0 ? [n, n + d] : [n + d, d],
    ([n, d]) =>
      n < d ? [[n, d - n], 0] : [[n - d, d], 1]
  ])
]);

pathToIrreducible([1, 0, 0])
  //=> [2, 5]

pathToIrreducible([0, 0])
  //=> [1, 3]

R.get(pathToIrreducible)([2, 5])
  //=> [1, 0, 0]

R.get(pathToIrreducible)([1, 3])
  //=> [0, 0]
```

### a wild infinite loop appears

The Night Clerk has one more step to complete: Going from positive natural numbers to paths. We have already seen invertible functions for converting between positive natural numbers and binary representations, but there's a problem. Let's take a look:

```
 1 :             [1]
 2 :          [1, 0]
 3 :          [1, 1]
 4 :       [1, 0, 0]
 5 :       [1, 0, 1]
 6 :       [1, 1, 0]
 7 :       [1, 1, 1]
 8 :    [1, 0, 0, 0]
 9 :    [1, 0, 0, 1]
10 :    [1, 0, 1, 0]
11 :    [1, 0, 1, 1]
12 :    [1, 1, 0, 0]
13 :    [1, 1, 0, 1]
14 :    [1, 1, 1, 0]
15 :    [1, 1, 1, 1]
16 : [1, 0, 0, 0, 0]
17 : [1, 0, 0, 0, 1]
18 : [1, 0, 0, 1, 0]
19 : [1, 0, 0, 1, 1]
```

Every number greater than zero has a binary representation that starts with a `1`. If we map these directly to paths, we only get half of the tree:

<div class="mermaid">
graph TD
  2/3 --1--> 2/5
  1/1 --1--> 2/1
  2/1 --1--> 3/1
  2/1 --0--> 2/3
  3/1 --1--> 4/1
  3/1 --0--> 3/4
  2/3 --0--> 5/3
  1/1  -.->  1/2
  1/2  -.->  3/2
  1/2  -.->  1/3
  3/2  -.->  5/2
  3/2  -.->  3/5
  1/3  -.->  4/3
  1/3  -.->  1/4
</div>

Although the binary representation cannot be taken directly as paths, it can be used. If we remove the frontmost `1` from every representation, we get an enumeration of every path in the tree:

```
 1 :             [1] :          [1]
 2 :          [1, 0] :          [0]
 3 :          [1, 1] :          [1]
 4 :       [1, 0, 0] :       [0, 0]
 5 :       [1, 0, 1] :       [0, 1]
 6 :       [1, 1, 0] :       [1, 0]
 7 :       [1, 1, 1] :       [1, 1]
 8 :    [1, 0, 0, 0] :    [0, 0, 0]
 9 :    [1, 0, 0, 1] :    [0, 0, 1]
10 :    [1, 0, 1, 0] :    [0, 1, 0]
11 :    [1, 0, 1, 1] :    [0, 1, 1]
12 :    [1, 1, 0, 0] :    [1, 0, 0]
13 :    [1, 1, 0, 1] :    [1, 0, 1]
14 :    [1, 1, 1, 0] :    [1, 1, 0]
15 :    [1, 1, 1, 1] :    [1, 1, 1]
16 : [1, 0, 0, 0, 0] : [0, 0, 0, 0]
17 : [1, 0, 0, 0, 1] : [0, 0, 0, 1]
18 : [1, 0, 0, 1, 0] : [0, 0, 1, 0]
19 : [1, 0, 0, 1, 1] : [0, 0, 1, 1]
```

We'll need an invertible way to remove the `1` from the head of each list. There is a way, but we must be careful. This won't work, even though it looks like it works:

```javascript
const corrigansTail = R.add([
  [head, ...tail] => tail,
  tail => [1, ...tail]
]);

corrigansTail([1, 0, 0])
  //=> [0, 0]

R.get(corrigansTail)([0, 0])
  //=> [1, 0, 0]
```

This is the problem:

```javascript
 corrigansTail([7, 0, 0])
   //=> [0, 0]

 R.get(corrigansTail)([0, 0])
   //=> [1, 0, 0]
```

There are inputs for which `corrigansTail` will accept and output a value, but it's proposed inverse will not take the resulting output and return the original input.

As we saw earlier when discussing invertible functions, `[head, ...tail] => tail` is not invertible. It can't be, as it loses information. It outputs fewer bits than it takes as an argument.

But consider this:

```javascript
const butLastAndLast = list => [
  list.slice(0, list.length - 1),
  list[list.length - 1]
];

const append =
  ([list, element]) => [...list, element];

const tail = R.unfoldToList([
  [1],
  R.add([butLastAndLast, append])
]);

tail([1, 0, 0])
  //=> [0, 0]

R.get(tail)([0, 0])
  //=> [1, 0, 0]
```

`tail` has the same effect as `corrigansTail` for lists beginning with `1`, but when we give it a list beginning with another number, it does not return a result:

```javascript
tail([7, 0, 0])
  //=> 💀
```

Functions that don't return are undesirable in production, but from a semantic perspective, they fit the bill as much as functions that raise helpful exceptions. To be invertible, there must exist a function such that for every value that `ttail` returns, its inverse takes `tail`'s output as its input and returns `tail`'s input.

Input that don't produce outputs don't count, so `tail` is invertible: Every output it actually produces is an input to its inverse function.

---

[![Key](/assets/invertible/key.jpg)](https://www.flickr.com/photos/26344495@N05/32743331307)

---

## Finding Rooms for The Irreducible Fractions Club

The Night Clerk now has what they need to map positive invertible fractions to positive natural numbers, which means that given a member of the Irreducible Fractions Club, they can assign them to a room in the Grand Hotel:

```javascript