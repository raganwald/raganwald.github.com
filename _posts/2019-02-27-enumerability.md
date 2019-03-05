---
title: "Enumerations, Denumerables, and Cardinals"
tags: [allonge,noindex]
---

### enumerables and enumerations

In programming language jargon, an _enumerable_ is a value that can be accessed sequentially, or iterated over. Different languages use the term in slightly different ways, although they all have some relation to its basic definition.

In JavaScript, objects (including collections like arrays) can have [enumerable properties]. For example, the array `['one', 'two', 'three', 'infinity']` has three enumerable properties, `0`, `1`, `2`, and `3`. It also has a non-enumerable property, `length`.

[enumerable properties]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties

```javascript
const gamow = ['one', 'two', 'three', '∞'];

for (const n in gamow) {
  console.log(n);
}
  //=>
    0
    1
    2
    3
```

Notice that when JavaScript talks about properties being enumerable, it refers to what we would call the indices of the properties, not the values bound to those indices. You can see this as well when we enumerate the properties of a Plain Old JavaScript Object:

```javascript
const dictionary = {
  'one': 1,
  'two': 2,
  'three': 3,
  '∞': Infinity
};

for (const n in dictionary) {
  console.log(n);
}
  //=>
  'one'
  'two'
  'three'
  '∞'
```

In JavaScript, we do not say that the elements of an array or the values of an object are enumerable, we just say that some of the properties of any object (including arrays) are enumerable.

Ruby uses the word slightly differently. In Ruby, [`Enumerable`][ruby-enumerable] is a `module` that is used as other languages would use a mixin. It applies to collections like arrays, and for a collection that provides a way to access the elements sequentially with a `.each` method, the `Enumerable` module adds a number of useful methods.

[ruby-enumerable]: http://ruby-doc.org/core/Enumerable.html

In Ruby, we would say that a class or object that "mixes in" the module `Enumerable`, is "enumerable."

So which is it? Are collections enumerable? The indices of the collections? Or their elements?

Informally speaking, the line we will take in this essay is that the term is imprecise in programming jargon, and that it is the elements of a collection that are enumerable. When we say "This array is enumerable," that is a shorthand in programming jargon for saying that its elements are enumerable, and some interafce is provided for accessing its elements in sequence.

That conflicts with the technial way that JavaScript uses the word, but we will shrug and say that iterating over the indices of an object is one particular interface for accessing the elements of a collection, as are other ways like using an actual iterator.

In Mathematics, an [enumeration] is a complete, ordered list of all of the elements of a set or collection. There can be more than one enumeration for the same collection, and the collections need not have a finite number of elements.

[enumeration]: https://en.wikipedia.org/wiki/Enumeration

For example, here are two slightly different enumerations for the integers: `0, -1, 1, -2, 2, -3, 3, -4, 4, ...` and `0, -1, 1, 2, -2, -3, 3, 4, -4 ...`. We have no way to write out the complete enumeration, because although each integer is of finite size, there are an infinite number of them.

Naturally, not all enumerations are infinite in size. Here are two enumerations of the set ("whole numbers less than or equal to four"): `0, 1, 2, 3, 4` and `4, 3, 2, 1, 0`.

It is very interesting and useful that an enumeration is a separate entity from the collection it enumerates. We are going to work with enumerations in this essay.

---

### enumerations in javascript

*awkward, mixes describing our style with discussing composition*

In JavaScript, we can use generators as enumerations. We can write almost anything we want in a generator, e.g.

```javascript
function * anEnumerationOfIntegers () {
  yield 0;
  let i = 1;
  while (true) {
    yield -i;
    yield i++;
  }
}

for (const i of anEnumerationOfIntegers()) {
  console.log(i);
}
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

We can also make simple enumerations and find ways to compose them. We are going to use a very consistent style. Unless otherwise noted, we are going to work with the very simplest kind of generator, a generator function that takes no arguments, like `anEnumerationOfIntegers` above.

Sometimes, we want to parameterize a generator. Instead of writing a generator that takes parameters, we will consistently write functions that take parameters and return simple generators. So instead of writing timething like:

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
const thunderbirds = downTo(10, 0);

for (const i of thunderbirds()) {
  console.log(i);
}
  //=>
    10
    9

    ...

    3
    2
    1
    0
```

Just as functions can return generators, functions can also take generators as arguments. Here's a function that merges a finite number of generators into a single enumeration:

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

for (const i of integers()) {
  console.log(i);
}
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

And another that zips generators together to make a new generator:

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

for (const s of zip(a, naturals)()) {
  console.log(s);
}
  //=>
    ["", 0]
    ["a", 1]
    ["aa", 2]
    ["aaa", 3]
    ["aaaa", 4]

    ...
```

We're going to make some more enumerations, and some tools for composing them, but before we do, let's talk about why writing enumerations is interesting.

### denumerables and verification

*way too long. simply and possibly split in two after simplifying*

A [countable set] is any set (or collection) for which we can construct at least one enumeration. Or to put it in more formal terms, we can put the elements of the set into a one-to-one correspondance with some subset of the natural numbers. [Denumerables][countable set] are countable sets with an infinite number of elements.

[countable set]: https://en.wikipedia.org/wiki/Countable_set

As programmers, we experiment with such ideas by writing code. So instead of coming up with an elaborate proof that such-and-such a set is countable, we write an enumeration for it. If we can enumerate a set, we can put it into a 1-to-1 correspondence with a subset of the natural numbers.

In the example above, zipping an enumeration of strings (`''`, `'a'`, `'aa'`, ...) with the natural numbers clearly puts them in a one-to-one correspondance with the natural numbers. Since that is possible with any enumeration, if we can enumerate a set, it is a countable set. If we can enumerate a set, and it has an infinite number of elements, it is denumerable.

Before we look at other examples of denumerable sets, let's point out a few things about enumerations. First, if we say we have an enumeration of a finite countable set, it is easy to verify that the enumeration is correct. We inspect its output, and verify that it outputs every element of the set, no more, and no less.

If it outputs an element that is not in the set, or fails to output an element that is in the set, it is not an enumeration of the set. That is straightforward with finite sets (although the inspection may take a while with really big enumerations, like enumerating all of the stars in the night sky).

But what about enumerating a denumerable set? How do we know that an enumeration is correct? There are two ways, one formal, one empirical. In the formal verification, we examine the algorithm for the enumeration itself, and use formal methods prove that it must eventually output every element of the set, and that it never outputs an element not in the set.

Or do we? If the set is denumerable, it has an infinite number of elements. No enumeration can eventually output all of its elements: A correct enumeration must run forever. Instead, what we say is that we wish to prove that the enumeration never outputs an element that is not in the set, and for any element we choose, the enumeration will output that element in a finite number of iterations.

The empirical method has a similar flavour, but replaces the rigorous proof with testing. In the empirical method, we come up with elements of the set, run the enumeration, and verify through observation that first, none of the elements output by the enumeration are not in the set, and second, that the elements we chose are eventually output by the enumeration.

The relationship between the formal and empirical methods are isomorphic to the relationship between formal verification of program behaviour and writing tests.

---

### cardinality

The cardinality of a set is a measure of its size. Two sets have the same cardinality if their elements can be put into a one-to-one correspondence with each other. Cardinalities can also be compared. If the elements of set A can be put into a one-to-one correspondance with a subset of the elements of set B, but the elements of set B cannot be put into a one-to-one correspondence with set A, we say that A has a lower cardinality than B.

Obviously, the cardinalities of finite sets are natural numbers. For example, the cardinality of `[0, 1, 2, 3, Infinity]` is `4`, the same as its length.

The cardinality of infinite sets was studied by [Georg Cantor][Cantor]. As has been noted many times, the cardinality of infinite sets can be surprising to those thinking about it for the first time. For example, all infinite subsets of the natural numbers have the same cardinality as the natural numbers.

[Cantor]: https://en.m.wikipedia.org/wiki/Georg_Cantor

We can demonstrate that by putting them into a one-one-correspondance with the natural numbers:

```javascript
const naturals = upTo(0, Infinity);
const evens = upTo(0, Infinity, 2);

for (const s of zip(evens, naturals)()) {
  console.log(s);
}
  //=>
    [0, 0]
    [2, 1]
    [4, 2]
    [6, 3]
    [8, 4]

    ...
```

The even numbers have the same cardinality as the natural numbers.

---

### products of enumerables

Sets can be created from the [Cartesian product] (or simply "product") of two or more enumerables. For example, the set of all rational numbers is the product of the set of all natural numbers and the set of all positive natural numbers: A rational number can be expressed as a natural number numerator, divided by a positive natural number denominator.

The product of two sets can be visualized with a table. Here we are visualizing the rational numbers:

[Cartesian product]: https://en.wikipedia.org/wiki/Cartesian_product

|     |  1|  2|  3|...|
|-----|---|---|---|---|
|**0**|0/1|0/2|0/3|...|
|**1**|1/1|1/2|1/3|...|
|**2**|2/1|2/2|2/3|...|
|**3**|3/1|3/2|3/3|...|
|<strong>&vellip;</strong>|&vellip;|&vellip;|&vellip;| |<br/><br/>

There are plenty of naïve product functions. Here's one that operates on generators:

```javascript
function mapGeneratorWith (fn, g) {
  return function * () {
    for (const e of g()) yield fn(e);
  }
}

function nprod2 (g1, g2) {
  return function * () {
  	for (const e1 of g1()) {
      console.log('1');
      for (const e2 of g2()) {
        yield [e1, e2];
      }
    }
  }
}

const zeroOneTwoThree = upTo(0, 3);
const oneTwoThree = upTo(1, 3);

const twelveRationals = mapGeneratorWith(
  ([numerator, denominator]) => `${numerator}/${denominator}`,
  nprod2(zeroOneTwoThree, oneTwoThree)
);

for (const fraction of twelveRationals()) {
  console.log(fraction);
}
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

The naïve approach iterates through all of the denominators members for each of the numerator's members. This is fast and simple, and works just fine for generators that only yield a finite number of elements. However, if we apply this to denumerables, it doesn't work:

```javascript
const naturals = upTo(0, Infinity);
const positives = upTo(1, Infinity);

const rationals =
      mapGeneratorWith(
        ([numerator, denominator]) => `${numerator}/${denominator}`,
      	nprod2(naturals, positives)
	);

for (const s of rationals()) {
  console.log(s);
}
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

A naïve product of two or more sets, where at least one of the sets is denumerable, is not an enumeration of the product of the sets. An enumeration of a denumerable guarantees that every element of the set appears in a finite number of outputs. Or likewise, that it puts the elements of the denumerable set into a one-to-one correspondance with the natural numbers.

The naïve product approach to enumerating the rationals does not output any element with a numerator greater than zero in a finite number of outputs. `14/6`, `19/62`, ... All of the fractions we can think of greater than zero never appear. They cannot be put into a one-to-one correspondance with the natural numbers.

This can be proven by assuming the contrary and then deriving a contradiction. Let us take a fraction greater than zero, `1962/614`. We are assuming that fractions with a non-zero numerator appear after a finite number of outputs, so there is some finite number, **n**, that represents the position of `1962/614` in the enumeration.

Let us scroll down the output looking for `n`. According to our algorithm, at position `n`, we will find `0/n`. But our assertion is that we will find `1962/614`. We can't find both, therefore the assumption that `1962/614` appears in a finite number of outputs is false, and the naïve product cannot enumerate denumerables.

---

### enumerating the product of denumerables

To enumerate the naïve product of two denumerables, we took the elements "row by row," to use the table visualization. This did not work, and neither would taking the elements column by column. What does work, is to take the elements _diagonal by diagonal_.

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

const rationals = mapGeneratorWith(
  ([numerator, denominator]) => `${numerator}/${denominator}`,
  prod2(naturals, positives)
);

for (const rational of rationals()) {
  console.log(rational);
}
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

### flattening denumerables

We previously looked at `merge`, a function that would merge a finite number of denumerables. It would not work for a denumerable number of denumerables, as it takes the elements "column-by-column," like a naïve product.

Consider this generator that generates exponents of natural numbers:

```javascript
const exp =
  n =>
    mapGeneratorWith(
      p => Math.pow(n, p),
      upTo(1, Infinity)
    );

const twos = exp(2);

for (const powerOfTwo of twos()) {
  console.log(powerOfTwo);
}
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

If we compose it with a mapping, we can get a generator that generates generators that generate powers of natural numbers:

```javascript
const naturalPowers = mapGeneratorWith(exp, naturals);

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
    mapGeneratorWith(
      ([denumerables, index]) => at(denumerables, index),
      prod2(denumerableOfDenumerables, naturals)
    );

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

This verifies for us that the sum of a denumerable number of denumerables is also denumerable.

---

### exponentiation of denumerables

Back to products. The product of two denumerables is denumerable.

By inference, the product of three or more denumerables is also denumerable, because the denumerability of the product operation is transitive. Take denumerable sets `a`, `b`, `c`, and `d`. `a` and `b` are denumerable, and we know that `prod2(a, b)` is denumerable. Therefore `prod2(prod2(a, b), c)` is denumerable, and so is `prod2(prod2(prod2(a, b), c), d)`.

We can build `prod` on this basis. It's a function that takes a finite number of denumerables, and returns an enumeration over their elements, by using `prod2`:

```javascript
function prod (first, ...rest) {
  if (rest.length === 0) {
    return mapGeneratorWith(
    	e => [e],
    	first
      );
  } else {
    return mapGeneratorWith(
      ([eFirst, eRests]) => [eFirst].concat(eRests),
      prod2(first, prod(...rest))
    );
  }
}

const threeD = prod(naturals, naturals, naturals);

for (const triple of threeD()) {
  console.log(triple);
}
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
function exponent (generator, n) {
  return prod(...new Array(n).fill(generator));
}

const threeD = exponent(naturals, 3);

for (const triple of threeD()) {
  console.log(triple);
}
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
    mapGeneratorWith(
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

for (const product of products(naturals)()) {
  console.log(product);
}
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

### the set of all finite subsets of a denumerable

The set of all finite products of a denumerable is interesting for several reasons. One of them is that the set of all finite products of a denumerable is a superset of the set of all finite subsets of a denumerable. Intuitively, it would sem that if we know that if we can enumerate the finite products of a denumerable, then the set of all finite subsets of a denumerable must also be enumerable.

The direct way to establish this is to write the enumeration we want. Let's start by establishing our requirement.

The set of all finite products of the natural numbers contains entries like `[]`, `[0]`, `[0, 0]`, `[0, 1]`, `[1, 0]`, `[0, 0, 0]`, `[0, 0, 1]`, `[0, 1, 0]`, `[1, 0, 0]`, `[0, 1, 1]`, &c. However for the purpose of enumerating the set of all finite subsets of a denumerable, the only sets that matter are `{}`, `{0}`, `{0, 1}`, .... The ordering of elements is irrelevant, as are duplicate elements.

We start with `combination`. Given a generator and a number of elements `k`, `combination` enumerates over all the ways that `k` elements can be selected from the generator's elements. Obviously, the k-combinations of a denumerable are also denumerable.

```javascript
function combination (generator, k) {
  if (k === 1) {
    return mapGeneratorWith(
      e => [e],
      generator
    )
  } else {
    return flatten(
      mapGeneratorWith(
        index => {
          const element = at(generator, index);
          const rest = slice(generator, index + 1);

          return mapGeneratorWith(
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
        mapGeneratorWith(
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

### trees

