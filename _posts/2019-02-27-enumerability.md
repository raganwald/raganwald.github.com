---
title: "Enumerations, Denumerables, Recursion, and Infinity"
tags: [allonge,mermaid,recursion]
---

*Warning: This is an unfinished work. Feel free to share it on Twitter or other conventional social media, but I ask you not to post it on Hacker News or Reddit until it is finished.*

In programming language jargon, an _enumerable_ is a value that can be accessed sequentially, or iterated over. Different languages use the term in slightly different ways, although they all have some relation to its basic definition.

In Mathematics, an [enumeration] is a complete, ordered list of all of the elements of a set or collection. There can be more than one enumeration for the same collection, and the collections need not have a finite number of elements.

[enumeration]: https://en.wikipedia.org/wiki/Enumeration

For example, here are two slightly different enumerations for the integers: `0, -1, 1, -2, 2, -3, 3, -4, 4, ...` and `0, -1, 1, 2, -2, -3, 3, 4, -4 ...`. We have no way to write out the complete enumeration, because although each integer is of finite size, there are an infinite number of them.[^finite]

[^finite]: Nat all enumerations are infinite in size. Here are two enumerations of the set ("whole numbers less than or equal to four"): `0, 1, 2, 3, 4` and `4, 3, 2, 1, 0`.

In this essay, we are going focus on enumerations over infinite sets. We will examine a number of ways to compose enumerations, including recursive enumerations that are composed with themselves.

---

[![code.close()](/assets/images/enumerations/code.close().jpg)](https://www.flickr.com/photos/ruiwen/3260095534)

---

### enumerations in javascript

In JavaScript, we can use generators as enumerations, e.g.

```javascript
function * integers () {
  yield 0;
  let i = 1;
  while (true) {
    yield -i;
    yield i++;
  }
}

integers()
  //=>
    0
    -1
    1
    -2
    2
    -3
    3
    -4
    4

    ...
```

In this essay, we will write the simplest possible enumerations, and build more complex enumerations using composition.

Sometimes, we want to parameterize a generator. Instead of writing a generator that takes parameters, we will consistently write functions that take parameters as arguments, and return simple generators that take no arguments.

So instead of writing:

```javascript
function * upTo (i, limit, by = 1) {
	for (let i = start; i <= limit; i += by) yield i;
}

function * downTo (i, limit, by = 1) {
	for (let i = start; i >= limit; i -= by) yield i;
}
```

We shall instead write:

```javascript
function upTo (start, limit, by = 1) {
  return function * upTo () {
    for (let i = start; i <= limit; i += by) yield i;
  };
}

function downTo (start, limit, by = 1) {
  return function * downTo () {
    for (let i = start; i >= limit; i -= by) yield i;
  }
}
```

These are functions that return generators, so we can write things like:

```javascript
const positives = upTo(1, Infinity);

positives()
  //=>
    1
    2
    3
    4
    5

    ...
```

Just as functions can return generators, functions can also take generators as arguments and return new generators. Here's a function that merges a finite number of generators into a single enumeration:

```javascript
function merge (...generators) {
  return function * merged () {
    const iterables = generators.map(g => g());

    while (true) {
      const values =
        iterables
      	 .map(i => i.next())
         .filter(({done}) => !done)
         .map(({value}) => value)
      if (values.length === 0) break;
      yield * values;
    }
  }
}

const naturals = upTo(0, Infinity);
const negatives = downTo(-1, -Infinity);

const integers = merge(naturals, negatives);

integers()
  //=>
    0
    -1
    1
    -2
    2
    -3
    3
    -4
    4

    ...
```

Thanks to composing simple parts, we wrote `const integers = merge(naturals, negatives)` instead of writing `function * integers () { ... }`. Here's another function that zips generators together. It has many uses, one of which is to put the output of a generator into a 1-to-1 correspondance with the natural numbers:

```javascript
function zip (...generators) {
  return function * zipped () {
    const iterables = generators.map(g => g());

    while (true) {
      const values =
        iterables
      	 .map(i => i.next())
         .filter(({done}) => !done)
         .map(({value}) => value)
      if (values.length === 0) break;
      yield values;
    }
  }
}

function * a () {
  let a = '';

  while (true) {
    yield a;
    a = `${a}a`;
  }
}

zip(a, naturals)()
  //=>
    ["", 0]
    ["a", 1]
    ["aa", 2]
    ["aaa", 3]
    ["aaaa", 4]

    ...
```

We're going to make some more enumerations, and some tools for composing them, but before we do, let's talk about why enumerations are interesting.

---

[![numbers](/assets/images/enumerations/numbers.jpg)](https://www.flickr.com/photos/morebyless/9423385629)

---

### enumerating denumerables

A [countable set] is any set (or collection) for which we can construct at least one enumeration. Or to put it in more formal terms, we can put the elements of the set into a one-to-one correspondance with some subset of the natural numbers. [Denumerables][countable set] are countable sets with an infinite number of elements, meaning they can be put into a 1-to-1 correspondance with the entire set of natural numbers.

[countable set]: https://en.wikipedia.org/wiki/Countable_set

In our examples above, `naturals`, `negatives`, `positives`, and `a` are all enumerations of denumerable sets.

When enumerating denumerables, things can sometimes be tricky. If we say that an enumeration puts the elements of a denumerable into a 1-to-1 correspondance with the natural numbers, we must provide the following guarantee: **Every element of the enumeration correspondes to a finite natural number.** And in the case of an enumeration we write on a computer, it follows that for any member of the set, there is a natural number `n`, such that the member of the set appears as the `nth` element output by the enumeration.

So in our example of `function * a { ... }` above, we know that we can name any element, such as `aaaaaaaaaa`, and indeed, it will appear as the tenth output of the enumeration (and corresponds to the natural number `0`).

As we will see in more detail below, this sometimes means we must be careful how we arrange our enumerations. Recall `merge` from above.

```javascript
const integers = merge(naturals, negatives);

integers()
  //=>
    0
    -1
    1
    -2
    2
    -3
    3
    -4
    4

    ...
```

Merge yields alternate elements from its constituent enumerations. Is the `merge` of two enumerations also an enumeration? If that were so, we could take any finite integer and show that it can be put into a one-to-one correspondance with the integers. Consider `zip(naturals, integers)`. Its output will be `[0, 0]`, `[1, -1]`, `[2, 1]`, `[3, -2]`, `[4, 2]` ...

If `integers` is an enumeration, then for any finite integer `i`, there will be some output `[n, i]` where `n` is a natural number. This is the case: If `i` is zero or a positive number, then `zip(naturals, integers)` will output `[i * 2, i]`. And if `i` is a negative number, then `zip(naturals, integers)` will output `[Math.abs(i * 2) - 1, i]`.

---

[![sinkhole](/assets/images/enumerations/sinkhole.jpg)](https://www.flickr.com/photos/salim/6066739796/9423385629)

---

### false enumerations

Every finite integer is associated with a natural number, and the existence of `merge(naturals, negatives)` proves that the natural numbers and the integers have the exact same cardinality, despite the natural numbers being a proper subset of the integers.

But what if we had written this:

```javascript
function concatenate (...generators) {
  return function * concatenated () {
    for (const generator of generators) {
      yield * generator();
    }
  }
}

const notAllIntegers = concatenate(naturals, negatives);

notAllIntegers()
  //=>
    0
    1
    2
    3
    4
    5

    ...
```

As written, `concatenate` does **not** provide a correct enumeration over the integers, because we can name an integer, `-1`, that will not appear after a finite number of outputs. We can prove that, and the way we prove it helps get into the correct mindset for dealing with infinite enumerations:

Let's assume that `-1` does appear after a finite number of outputs. If we can show this leads to a contradiction, then we will know that our assumption is wrong, and that `-1` does not appear after a finite number of outputs.

We'll start by zipping `notAllIntegers` with the natural numbers:

```javascript
zip(naturals, notAllIntegers)()
  //=>
    [0, 0]
    [1, 1]
    [2, 2]
    [3, 3]
    [4, 4]
    [5, 5]

    ...
```

If `notAllIntegers` is an enumeration of the integers, then after a finite number of outputs, the enumeration will produce `[n, -1]`, where `n` is a natural number. However, after `n + 1` outputs, `zip(naturals, notAllIntegers)` will output `[n, n]`, not `[n, -1]`. And this is true for *any* finite `n`, no matter how large. Since the enumeration cannot output both `[n, -1]` and `[n, n]`, it follows that our assumption that `-1` appears after a finite number of outputs, must be incorrect.

`notAllIntegers` is not an enumeration of the integers, and therefore `concatenate` is not a function that takes two enumerations and returns an enumeration over the union of its inputs.

As we saw, merging the naturals with the negatives does enumerate the integers, and we will use this idea repeatedly: *When we want to enumerate the elements of multiple enumerations, we must find a way to interleave their elements, not concatenate them.*

---

[![clay](/assets/images/enumerations/clay.jpg)](https://www.flickr.com/photos/deanhochman/45731896564)

---

### cardinality

The cardinality of a set is a measure of its size. Two sets have the same cardinality if their elements can be put into a one-to-one correspondence with each other. Cardinalities can also be compared. If the elements of set A can be put into a one-to-one correspondance with a subset of the elements of set B, but the elements of set B cannot be put into a one-to-one correspondence with set A, we say that A has a lower cardinality than B.

Obviously, the cardinalities of finite sets are natural numbers. For example, the cardinality of `[0, 1, 2, 3, Infinity]` is `5`, the same as its length.

The cardinality of infinite sets was studied by [Georg Cantor][Cantor]. As has been noted many times, the cardinality of infinite sets can be surprising to those thinking about it for the first time. As we saw above, a set that is a proper superset of the natural numbers can still have the same cardinality as the natural numbers.

Despite there being an infinite number of negative numbers that are integers but are not natural numbers, the set of all integers is not larger than the set of natural numbers. The two sets have exactly the same cardinality.

In addition to there being infinitely large supersets of the natural numbers, there are also infinitely large subsets of the natural numbers, and they also have the same cardinality as the natural numbers.

[Cantor]: https://en.m.wikipedia.org/wiki/Georg_Cantor

We can demonstrate that by putting an example enumeration of even numbers into a one-one-correspondance with the natural numbers:

```javascript
const naturals = upTo(0, Infinity);
const evens = upTo(0, Infinity, 2);

zip(evens, naturals)()
  //=>
    [0, 0]
    [2, 1]
    [4, 2]
    [6, 3]
    [8, 4]

    ...
```

The even numbers have the same cardinality as the natural numbers. That is the paradox of infinity: The set of all even natural numbers is a proper subset of the set of all natural numbers, but nevertheless, they are the same size.

---

[![multiplication machine](/assets/images/enumerations/multiplication.jpg)](https://www.flickr.com/photos/ideonexus/2556802769)

---

### products of enumerables

Sets can be created from the [cartesian product] (or simply "product") of two or more enumerables. For example, the set of all rational numbers is the product of the set of all natural numbers and the set of all positive natural numbers: A rational number can be expressed as a natural number numerator, divided by a positive natural number denominator.

[Cartesian product]: https://en.wikipedia.org/wiki/Cartesian_product

The product of two sets can be visualized with a table. Here we are visualizing the rational numbers:[^terms]

[^terms]: These rational numbers are not reduced to the lowest terms: Thus, this enumeration produces `1/2`, `2/4`, `3/6`, and so forth. There are other enumerations that do produce the rationals in lowest terms, but we will use this one because it demonstrates taking the product of two enumerations.

|     |  1|  2|  3|...|
|-----|---|---|---|---|
|**0**|0/1|0/2|0/3|...|
|**1**|1/1|1/2|1/3|...|
|**2**|2/1|2/2|2/3|...|
|**3**|3/1|3/2|3/3|...|
|<strong>&vellip;</strong>|&vellip;|&vellip;|&vellip;| |<br/><br/>

There are plenty of naïve product functions. Here's one that operates on generators:

```javascript
function mapWith (fn, g) {
  return function * () {
    for (const e of g()) yield fn(e);
  }
}

function nprod2 (g1, g2) {
  return function * () {
  	for (const e1 of g1()) {
      for (const e2 of g2()) {
        yield [e1, e2];
      }
    }
  }
}

const zeroOneTwoThree = upTo(0, 3);
const oneTwoThree = upTo(1, 3);

const twelveRationals = mapWith(
  ([numerator, denominator]) => `${numerator}/${denominator}`,
  nprod2(zeroOneTwoThree, oneTwoThree)
);

twelveRationals()
  //=>
    0/1
    0/2
    0/3
    1/1
    1/2
    1/3
    2/1
    2/2
    2/3
    3/1
    3/2
    3/3
```

The naïve approach iterates through all of the denominators members for each of the numerator's members. This is fast and simple, and works just fine for generators that only yield a finite number of elements. However, if we apply this to enumerations of denumerable sets, it doesn't work:

```javascript
const naturals = upTo(0, Infinity);
const positives = upTo(1, Infinity);

const rationals =
      mapWith(
        ([numerator, denominator]) => `${numerator}/${denominator}`,
      	nprod2(naturals, positives)
	);

rationals()
  //=>
    0/1
    0/2
    0/3
    0/4
    0/5
    0/6
    0/7
    0/8
    0/9
    0/10
    0/11
    0/12

    ...
```

A naïve product of two or more enumerations, where at least one of the sets is denumerable, is not an enumeration of the product of the sets. It doesn't work for the exact same reason that concatenating multiple infinite enumerations does not produce a valid infinite enumeration.

We can prove this with the same logic as above: If we zip the output with the natural numbers, we'll get `[0, '0/1']`, `[1, '0/2']`, `[2, '0/3']`, ...

If this was a valid enumeration, every rational number would appear in a finite number of iterations, so we should be able to find `[n, '1962/614']` in a finite number of outputs. Whatever `n` is, we will actually find `[n, '0/n+1']`, not `[n, '1962/614']`. Therefore the naïve product cannot enumerate denumerables.

---

[![Sunset on the roof. ](/assets/images/enumerations/roof.jpg)](https://www.flickr.com/photos/volvob12b/14284648729)

---

### correctly enumerating the product of denumerables

To enumerate the naïve product of two denumerables, we took the elements of two enumerations "row by row," to use the table visualization. This did not work, and neither would taking the elements column by column. What does work, is to take the elements of the enumerations _diagonal by diagonal_.

Here's our table again:

|     |  1|  2|  3|...|
|-----|---|---|---|---|
|**0**|0/1|0/2|0/3|...|
|**1**|1/1|1/2|1/3|...|
|**2**|2/1|2/2|2/3|...|
|**3**|3/1|3/2|3/3|...|
|<strong>&vellip;</strong>|&vellip;|&vellip;|&vellip;| |<br/><br/>

If we take the elements diagonal by diagonal, we will output: `0/1`, `0/2`, `1/1`, `0/3`, `1/2`, `2/1`, ...

Because of the order in which we access the elements of the generators, we cannot rely on iterating through the generators in order. We will build a random-access abstraction, `at()`. There is a simple schlemiel implementation:[^schlemiel]

[^schlemiel]: This is called a "schlemiel" implementation, because every time we wish to access a generator's element, we enumerate all of the elements of the generator from the beginning. This requires very little memory, but is wasteful of time. A memoized version is listed below.

```javascript
function at (generator, index) {
  let i = 0;

  for (const element of generator()) {
    if (i++ === index) return element;
  }
}

function * a () {
  let a = '';

  while (true) {
    yield a;
    a = `${a}a`;
  }
}

at(a, 42)
  //=> "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
```

With `at` in hand, our `prod2` function looks like this:

```javascript
function prod2 (g1, g2) {
  return function * () {
  	for (const sum of naturals()) {
      for (const [i1, i2] of zip(upTo(0, sum), downTo(sum, 0))()) {
        yield [at(g1, i1), at(g2, i2)];
      }
    }
  }
}

const rationals = mapWith(
  ([numerator, denominator]) => `${numerator}/${denominator}`,
  prod2(naturals, positives)
);

rationals()
  //=>
    0/1
    0/2
    1/1
    0/3
    1/2
    2/1
    0/4
    1/3
    2/2
    3/1

    ...
```

As the product is output row-by-row, we can now say with certainty that no matter which element we care to name, it has appeared as the nth element for some finite value of n.

At the enormous cost of computing resources, we have an enumeration that enumerates the product of two denumerable sets, and we used it to enumeration rational numbers. This demonstrates that the rational numbers have the same cardinality of the natural numbers, and that any product of two denumerable sets is also denumerable.

---

[![braided recursion](/assets/images/enumerations/braided.png)](https://www.flickr.com/photos/martinlatter/2203634579)

---

### enumerating a denumerable number of denumerables

We previously looked at `merge`, a function that would merge a finite number of denumerables. It would not work for a denumerable number of denumerables, as it takes the elements "column-by-column," like a naïve product.

Consider this generator that generates exponents of natural numbers:

```javascript
const exp =
  n =>
    mapWith(
      p => Math.pow(n, p),
      upTo(1, Infinity)
    );

const twos = exp(2);

twos()
  //=>
    2
    4
    8
    16
    32
    64
    128
    256
    512
    1024

    ...
```

If we compose it with a mapping, we can get a generator, that generates generators, that generate powers of natural numbers:

```javascript
const naturalPowersEnumerations = mapWith(exp, naturals);

naturalPowers
  //=>
    0, 0, 0, 0, 0, ...
    1, 1, 1, 1, 1, ...
    2, 4, 8, 16, 32, ...
    3, 9, 27, 81, 243, ...
    4, 16, 64, 256, 1024, ...
    5, 25, 125, 625, 3125, ...
    6, 36, 216, 1296, 7776, ...
    7, 49, 343, 2401, 16807, ...

    ...
```

We now wish to merge all of these values into a single generator. We can use `prod2` to merge a denumerable number of denumerables with a little help from `at`.

We will call our function `flatten`:

```javascript
const flatten =
  denumerableOfDenumerables =>
    mapWith(
      ([denumerables, index]) => at(denumerables, index),
      prod2(denumerableOfDenumerables, naturals)
    );

const naturalPowers = flatten(naturalPowersEnumerations);

flatten(naturalPowers)
  //=>
    0
    0
    1
    0
    1
    2
    0
    1
    4
    3

    ...
```

This verifies that the sum of a denumerable number of infinite enumerations, is also an enumeration, and therefore that the sum of a denumerable number of denumerables is also denumerable.

---

[![twin](/assets/images/enumerations/twin.jpg)](https://www.flickr.com/photos/fabiovenni/2399016990)

---

### de-duplication

`flatten(naturalPowersEnumerations)` is not an enumeration of a set, it is an enumeration of a bag. The set of all natural powers is a proper subset of the bag of all natural numbers, so we can infer that the set of all natural numbers is denumerable. But if we want to be pedantic, we should construct an enumeration of the natural powers without duplicates.

One way to do that is to filter out the ones we;'ve already seen:

```javascript
function uniq (generator) {
  return function * uniqued () {
    const seen = new Set();

    for (const element of generator()) {
      if (seen.has(element)) {
        continue;
      } else {
        seen.add(element);
        yield element;
      }
    }
  }
}

const powers =
  uniq(
    flatten(
      mapWith(exp, naturals)
    )
  );

powers()
  //=>
    0
    1
    2
    4
    3
    8
    9
    16
    27
    5
    32
    81

    ...
```

Of course, `uniq` requires memory equal to the number of unique element seen so far, and this we know that it would require an infinite amount of space to enumerate the infinite set of natural powers. But then again, it would also require an infinite amount of time, so we are worrying about whether we run out of space in the Universe before or after we encounter the heat-death of the Universe.

As long as we know that an enumeration will output every finite element in a finite amount of time *and requires no more than a finite amount of space*, that is sufficient for our purposes today. And our purpose here was to demonstrate definitely that the set of natural powers, like every proper subset of the set of natural numbers, is denumerable.[^heh]

[^heh]: Actually, the set of all natural powers is identical to the set of all natural numbers, but enumerating it as powers gives us a different enumeration than enumerating the natural numbers in order.

---

[![recursive](/assets/images/enumerations/recursive.jpg)](https://www.flickr.com/photos/lamenta3/5410914893)

---

### exponentiation of denumerables

Back to products. The product of two denumerables is denumerable. Take denumerable sets `a`, `b`, `c`, and `d`. `a` and `b` are denumerable, and we know that `prod2(a, b)` is denumerable. Therefore `prod2(prod2(a, b), c)` is denumerable, and so is `prod2(prod2(prod2(a, b), c), d)`.

We can build `prod` on this basis. It's a function that takes a finite number of denumerables, and returns an enumeration over their elements, by using `prod2`:

```javascript
function prod (first, ...rest) {
  if (rest.length === 0) {
    return mapWith(
    	e => [e],
    	first
      );
  } else {
    return mapWith(
      ([eFirst, eRests]) => [eFirst].concat(eRests),
      prod2(first, prod(...rest))
    );
  }
}

const threeD = prod(naturals, naturals, naturals);

threeD()
  //=>
    [0, 0, 0]
    [0, 0, 1]
    [1, 0, 0]
    [0, 1, 0]
    [1, 0, 1]
    [2, 0, 0]
    [0, 0, 2]
    [1, 1, 0]
    [2, 0, 1]
    [3, 0, 0]
    [0, 1, 1]
    [1, 0, 2]

    ...
```

We now have `prod`, a function that enumerates the product of any number of denumerables.

In arithmetic, exponentiation is the multiplying of a number by itself a certain number of times. For example, three to the power of 4 (`3^4`), is equivalent to three multiplied by three multiplied by three multiplied by three (`3*3*3*3`). Or we might say that it is the product of four threes.

We can take the exponent of denumerables as well. Here is the absolutely naïve implementation:

```javascript
const exponent = (generator, n) => prod(...new Array(n).fill(generator));

const threeD = exponent(naturals, 3);

threeD()
  //=>
    [0, 0, 0]
    [0, 0, 1]
    [1, 0, 0]
    [0, 1, 0]
    [1, 0, 1]
    [2, 0, 0]
    [0, 0, 2]
    [1, 1, 0]
    [2, 0, 1]
    [3, 0, 0]
    [0, 1, 1]
    [1, 0, 2]

    ...
```

`exponent` works for any finite exponent of a denumerable set. When we were looking at flatten, we made a function, `exp`, that generates the exponents of a natural number.

We can do a similar thing with the exponents of a denumerable:

```javascript
const exponentsOf =
  generator =>
    mapWith(
      p => exponent(generator, p),
      upTo(1, Infinity)
    );

exponentsOf(naturals)
  //=>
    [0], [1], [2], [3], [4], [5], ...
    [0, 0], [0, 1], [1, 0], [0, 2], [1, 1], [2, 0], ...
    [0, 0, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 0, 1], [2, 0, 0], ...
    [0, 0, 0, 0], [0, 0, 0, 1], [1, 0, 0, 0], [0, 1, 0, 0], [1, 0, 0, 1], [2, 0, 0, 0], ...
    [0, 0, 0, 0, 0], [0, 0, 0, 0, 1], [1, 0, 0, 0, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 1], [2, 0, 0, 0, 0], ...
    ...
````

It seems very extravagant to start thinking about an enumeration of enumerations of elements of a single denumerable (like the natural numbers), but we could look at all those elements another way: We are looking at all of the possible products of a denumerable.

We can flatten them into a single denumerable, of course:

```javascript
const products = generator => flatten(exponentsOf(generator));

products(naturals)
  //=>
    [0]
    [1]
    [0, 0]
    [2]
    [0, 1]
    [0, 0, 0]
    [3]
    [1, 0]
    [0, 0, 1]
    [0, 0, 0, 0]
    [4]
    [0, 2]
    [1, 0, 0]
    [0, 0, 0, 1]
    [0, 0, 0, 0, 0]
    [5]
    [1, 1]
    [0, 1, 0]
    [1, 0, 0, 0]
    [0, 0, 0, 0, 1]

    ...
```

It will take a good long while, but this generator will work its way diagonal by diagonal through all of the finite positive exponents of a denumerable, which shows that not only is the set of any one exponent of a denumerable denumerable, but so is the set of all exponents of a denumerable.

Of course, we are omitting one very important exponent, `0`. This only produces one product, `[]`. We will fix our `product` to include it:

```javascript
function cons (head, generator) {
  return function * () {
    yield head;
    yield * generator();
  }
}

const products = generator => cons([], flatten(exponentsOf(generator)));

products(naturals)()
  //=>
    []
    [0]
    [1]
    [0, 0]
    [2]
    [0, 1]

    ...
```

And now we have shown that the set containing all of the finite products (including what we might call the zeroth product) of a denumerable is also denumerable, by dint of having written an enumeration for it.

---

[![big_blue](/assets/images/enumerations/big-blue.jpg)](https://www.flickr.com/photos/49250831@N07/4515391074)

---

### the set of all finite subsets of a denumerable

The set of all finite products of a denumerable is interesting for several reasons. One of them is that the set of all finite products of a denumerable is a superset of the set of all finite subsets of a denumerable. Intuitively, it would seem that if we know that if we can enumerate the finite products of a denumerable, then the set of all finite subsets of a denumerable must also be enumerable.

The direct way to establish this is to write the enumeration we want. Let's start by establishing our requirement.

The set of all finite products of the natural numbers contains entries like `[]`, `[0]`, `[0, 0]`, `[0, 1]`, `[1, 0]`, `[0, 0, 0]`, `[0, 0, 1]`, `[0, 1, 0]`, `[1, 0, 0]`, `[0, 1, 1]`, &c. However for the purpose of enumerating the set of all finite subsets of a denumerable, the only sets that matter are `{}`, `{0}`, `{0, 1}`, .... The ordering of elements is irrelevant, as are duplicate elements.

We start with `combination`. Given a generator and a number of elements `k`, `combination` enumerates over all the ways that `k` elements can be selected from the generator's elements. Obviously, the k-combinations of a denumerable are also denumerable.

```javascript
function slice (generator, n, limit = Infinity) {
  return function * sliced () {
    let i = 0;

    for (const element of generator()) {
      if (i++ < n) continue;
      if (i > limit) break;

      yield element;
    }
  }
}

function combination (generator, k) {
  if (k === 1) {
    return mapWith(
      e => [e],
      generator
    )
  } else {
    return flatten(
      mapWith(
        index => {
          const element = at(generator, index);
          const rest = slice(generator, index + 1);

          return mapWith(
            arr => (arr.unshift(element), arr),
            combination(rest, k - 1)
          );
        },
        naturals
      )
    );
  }
}

combination(naturals, 3)()
  //=>
    [0, 1, 2]
    [0, 1, 3]
    [1, 2, 3]
    [0, 2, 3]
    [1, 2, 4]
    [2, 3, 4]
    [0, 1, 4]
    [1, 3, 4]
    [2, 3, 5]
    [3, 4, 5]
    [0, 2, 4]
    [1, 2, 5]
    [2, 4, 5]
    [3, 4, 6]
    [4, 5, 6]
    [0, 3, 4]
    [1, 3, 5]
    [2, 3, 6]
    [3, 5, 6]
    [4, 5, 7]

    ...
```

Now what about all finite subsets? Well, that's very similar to `products`. We want a denumerable of denumerables, the first being all the subsets of size `1`, the next all the subsets of size `2`, then `3`, and so on. We flatten all those together, and cons the empty set onto the front:

```javascript
const subsets =
  generator =>
    cons(
      [],
      flatten(
        mapWith(
          k => combination(generator, k),
          naturals
        )
      )
    );

subsets(naturals)
  //=>
    []
    [0]
    [1]
    [0, 1]
    [2]
    [0, 2]
    [0, 1, 2]
    [3]
    [1, 2]
    [0, 1, 3]

    ...
```

And now we have shown that the set of all finite subsets of a denumerable, is also denumerable.

---

[![Underside of Blackfriars Bridge on Southbank, London](/assets/images/enumerations/bridge.jpg)](https://www.flickr.com/photos/mikedixson/16156585425)

---

### recursive enumerables

A common example of recursion is to output the [fibonacci sequence][fib]. Here's an iterative enumeration:

[fib]: https://en.wikipedia.org/wiki/Fibonacci_number

```javascript
function * simpleFib () {
  const two = [0, 1];

  while (true) {
    yield two[0];

    two.push(two[0] + two[1]);
    two.shift();
  }
}

simpleFib()
  //=>
    0
    1
    1
    2
    3
    5
    8
    13
    21
    34

    ...
```

It can also be expressed recursively using `at`, but we will will take a different approach. Let's start with a function that takes any enumeration, and sums pairs of its elements:

```javascript
const pairSum =
  generator =>
    mapWith(
      ([a, b]) => a + b,
      zip(generator, slice(generator, 1))
    );

pairSum(naturals)
  //=>
    1
    3
    5
    7
    9
    11
    13
    15
    17
    19

    ...
```

In this case, it is outputting `0 + 1`, `1 + 2`, `2 + 3`, and so on. We can `cons` a couple of numbers onto the front:

```javascript
const pairSumStartingWithZeroAndOne =
  generator =>
    cons(0,
      cons(1,
        mapWith(
          ([a, b]) => a + b,
          zip(generator, slice(generator, 1))
        )
      )
    );

pairSumStartingWithZeroAndOne(naturals)
  //=>
    0
    1
    1
    3
    5
    7
    9
    11
    13
    15
    17
    19

    ...
```

And now to pull the rabbit out of the hat:

```javascript
function * fibonacci () {
  yield *
    cons(0,
      cons(1,
        mapWith(
          ([a, b]) => a + b,
          zip(fibonacci, slice(fibonacci, 1))
        )
      )
    )();
}

fibonacci()
  //=>
    0
    1
    1
    2
    3
    5
    8
    13
    21
    34
```

We now have an enumeration of the fibonacci sequence that is defined in terms of itself. What makes it work is that it is "seeded" with the first two elements, and thereafter every element we return is computed in terms of the sum of the previous two elements.

This is a general pattern for making recursive enumerations: If they can be defined in terms of a previous element of themselves, they can be expressed as a recursive generator.

Here's a much simpler example:

```javascript
function * naturals () {
  yield * cons(0,
    mapWith(
      n => n + 1,
      naturals
    )
  )();
}

naturals()
  //=>
    0
    1
    2
    3
    4

    ...
```

Once again we have a pattern where we 'seed' an enumeration with an initial value, and thereafter the remaining values are computed from the enumeration itself. Since it always stays "one step ahead of itself," we get an infinite enumeration.

Now let's keep this pattern in mind as we revisit `products`.

---

[![tree](/assets/images/enumerations/tree.jpg)](https://www.flickr.com/photos/cluczkow/4405669180)

---

### taking the products of products

Back to `products`. To recap:

```javascript
const products = generator => cons([], flatten(exponentsOf(generator)));

products(naturals)()
  //=>
    []
    [0]
    [1]
    [0, 0]
    [2]
    [0, 1]
    [0, 0, 0]
    [3]
    [1, 0]
    [0, 0, 1]
    [0, 0, 0, 0]
    [4]
    [0, 2]
    [1, 0, 0]
    [0, 0, 0, 1]
    [0, 0, 0, 0, 0]
    [5]
    [1, 1]
    [0, 1, 0]
    [1, 0, 0, 0]
    [0, 0, 0, 0, 1]
    [0, 0, 0, 0, 0, 0]

    ...
```

The definition of `products` looks familiar: `generator => cons([], flatten(exponentsOf(generator)))`. Once again, we have a generator that is defined as a seed value cons'd onto an operation we perform with another enumeration. What if we make `products` recursive? What if we define it in terms of itself?

```javascript
function * productsOfProducts () {
  yield * cons([],
    flatten(exponentsOf(productsOfProducts))
  )();
}

productsOfProducts()
  //=>
    []
    [[]]
    [[[]]]
    [[], []]
    [[[[]]]]
    [[], [[]]]
    [[], [], []]
    [[[], []]]

    ...
```

`productsOfProducts` is very interesting: The seed value is an empty array, and every value thereafter represents one of the products of `products` with itself. The result is a series of ways to nest arrays. Another way to look at these nested arrays is to visualize them as tree topologies:

<div class="mermaid">
  graph LR
    0.0(( ))
</div>
<div class="mermaid">
  graph LR
    1.1(( ))-->1.0(( ))
</div>
<div class="mermaid">
  graph LR
    2.2(( ))-->2.1(( ))
    2.1-->2.0(( ))
</div>
<div class="mermaid">
  graph LR
    3.3(( ))-->3.0a(( ))
    3.3-->3.0b(( ))
</div>
<div class="mermaid">
  graph LR
    4.4(( ))-->4.2(( ))
    4.2(( ))-->4.1(( ))
    4.1-->4.0(( ))
</div>
<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
</div>
<div class="mermaid">
  graph LR
    6.6(( ))-->6.0a(( ))
    6.6-->6.0b(( ))
    6.6-->6.0c(( ))
</div>
<div class="mermaid">
  graph LR
    7.7(( ))-->7.3(( ))
    7.3-->7.0a(( ))
    7.3-->7.0b(( ))
</div>

`productsOfProducts` enumerates every finite tree topology!

---

[![Night by Aristide Maillol French](/assets/images/enumerations/night.jpg)](https://www.flickr.com/photos/rverc/9744043168)

---

### two caveats about enumerating trees with `productsOfProducts`

`productsOfProducts` does appear to enumerate all of the topologies of finite trees, but with two important caveats.

First, Although the printed representation of `productOfProduct`'s elements look like trees, in actual fact each element uses structure sharing, so although thr output `[[], [[]]]` may look like it respresents:

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
</div>

Internally, because it uses structure sharing, it's not a tree, it's internall a directed acyclic graph that looks like this:

<div class="mermaid">
  graph LR
    5.5(( ))-->0(( ))
    5.5-->5.1(( ))
    5.1-->0(( ))
</div>

We will develope an enumeration of trees that are internally trees as well.

The second caveat is a little more subtle. Our recursive version of the Fibonacci sequence outputs the elements in order. This has many advantages. One of them is that the Fibonacci sequence is constantly increasting in magnitude. If we pair the Fibonacci sequence with the natural numbers, for any two pairs `n1, f1` and `n2, f2`, we know that if `n1 < n2`, then `f1 < f2`.

This is very a very useful quality for an enumeration, as it means that for any finite number `n`, we only need to enumerate a finite number of elements of the Fibonacci sequence to determine whether `n` is a member of the sequence:

```javascript
function whileWith (predicate, generator) {
  return function * whiled () {
    for (const element of generator()) {
      if (predicate(element)) {
        yield element;
      } else {
        break;
      }
    }
  }
}

function isFib (n) {
  const fibsUpToN = whileWith(x => x <= n, fibonacci);

  for (const f of fibsUpToN()) {
    if (f === n) return true;
  }

  return false;
}

isFib(5)
  //=> true

isFib(42)
  //=> false
```

Unfortunately, `productsOfProducts` doesn't have the same quality, although the number of nodes in each tree does grow over time, it does not do so monotonically. Sometimes, the number of nodes output is fewer than the previous number of nodes.

We'll now develop an enumeration of trees that does not share structures, and never outputs a tree with fewer nodes than any of its predecessors.

---

[![Ocean Light](/assets/images/enumerations/ocean-light.jpg)](https://www.flickr.com/photos/orijoy/8738209580)

---

### enumerating trees

We begin with a function that, given a tree expressed as nested arrays, returns an enumeration over all the ways we can add one node to the tree:

```javascript
function plusOne (tree) {
  const deepClone = tree => tree.map(deepClone);

  return function * plused () {
  	yield deepClone(tree).concat([[]]);

    for (let index = 0; index < tree.length; ++index) {
      const child = tree[index];

      for (const plussedChild of plusOne(child)()) {
        yield tree.slice(0, index)
          .concat([ plussedChild ])
          .concat(tree.slice(index + 1));
      }
    };
  }
}

plusOne([[], [[]]])
  //=>
    [[], [[]], []]
    [[[]], [[]]]
    [[], [[], []]]
    [[], [[[]]]]
```

This is equivalent to taking this tree:

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
</div>

And returning these trees:

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
    5.5-->new[ ]
</div>

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
    5.0a-->new[ ]
</div>

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
    5.1-->new[ ]
</div>

<div class="mermaid">
  graph LR
    5.5(( ))-->5.0a(( ))
    5.5-->5.1(( ))
    5.1-->5.0b(( ))
    5.0b-->new[ ]
</div>

Now, given `plusOne`, we can take a generator of trees and return all of the ways that all of those trees could have a node added to them:

```javascript
function concat (generatorOfGenerators) {
  return function * concated () {
    for (const generator of generatorOfGenerators()) {
      yield * generator();
    }
  }
}

const plusOneAll = generator =>
  concat(mapWith(plusOne, generator));
```

`concat` is very much like `concatenate` from above, but it operates on a generator of generators. As we saw with `concatenate`, this is only going to work if the generators it is "concat-ing" are finite in length. We can have an infinite number of finite generators, but we can't try to `concat` any infinite generators with each other.

Now we can use recursion to make an infinite generator of generators. The first generator returns all of the ways to make a tree with a single node. The next generator will return all of the ways to add one to `[]`, so it will return `[[]]`, which is all of the trees with two nodes. The next generator returns all of teh ways to add a single node to that, so we get `[[], []]` and `[[[]]]`, all of the trees with two node.

Every successive generator returns all of the trees with one additional node. So in essence, we have put the positive numbers into a one-to-one correspondance with the ways to enumerate trees with that number of nodes. When we `concat` all those together, we get the an enumeratipon of all finite trees, in such an order that the number of nodes never descreases:

```javascript
function just (...elements) {
  return function * () {
    yield * elements;
  }
}

function * treesBySize () {
  yield * cons(just([]),
    mapWith(plusOneAll, treesBySize)
  )();
}

const trees = concat(treesBySize);

trees()
  //=>
    []
    [[]]
    [[], []]
    [[[]]]
    [[], [], []]
    [[[]], []]
    [[], [[]]]
    [[[]], []]
    [[[], []]]
    [[[[]]]]

    ...

```

Now let's take advantage of the ordering property just as we did with `isFib`.


---

[![brackets](/assets/images/enumerations/brackets.jpg)](https://www.flickr.com/photos/tomek_niedzwiedz/33136033302)

---

### recognizing strings of balanced parentheses

JavaScript happens to print arrays using `[` and `]` and `,`. But it's not the only way to represent nested arrays as strings. We could use the Lisp convention, which uses `(` and `)`, and since whitespace is optional in Lisp, let's leave it out:

```javascript
function pp (array) {
  return `(${array.map(pp).join('')})`;
}

const balanced = mapWith(pp, trees);

balanced()
  //=>
    ()

    (())

    (()())
    ((()))

    (()()())
    ((())())
    (()(()))
    ((())())
    ((()()))
    (((())))

    (()()()())
    ((())()())
    (()(())())
    (()()(()))
    ((())()())
    ((()())())
    (((()))())
    ((())(()))
    (()(())())
    ((())(()))
    (()(()()))
    (()((())))
    ((())()())
    ((()())())
    (((()))())
    ((())(()))
    ((()())())
    ((()()()))
    (((())()))
    ((()(())))
    (((()))())
    (((())()))
    (((()())))
    ((((()))))

    ...
```

We are enumerating every finite [balanced parentheses][brutal] string, and because our enumeration is ordered by number of nodes, and each node has two characters, our strings are also ordered by length. Which allows us to write a recognizer for whether a string representes balanced parentheses:

[brutal]: http://raganwald.com/2019/02/14/i-love-programming-and-programmers.html "A Brutal Look at Balanced Parentheses, Computing Machines, and Pushdown Automata"

```javascript
function isBalanced (str) {
  const balancedUpToStrLength = whileWith(b => b.length <= str.length, balanced);

  for (const b of balancedUpToStrLength()) {
    if (b === str) return true;
  }

  return false;
}
```

It requires exponential time to return an answer, but we are not concerned with such petty engineering considerations today :-)

---

# Notes