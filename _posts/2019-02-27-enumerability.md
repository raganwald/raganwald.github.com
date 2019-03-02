---
title: "Enumerations, Denumerables, and Cardinals"
tags: [allonge,mermaid,noindex]
---

### enumeables and enumerations

In programming language jargon, an _enumerable_ is a value that can be accessed sequentially, or iterated over. Different languages use the term in slightly different ways, although they all have some relation to its basic definition.

In JavaScript, objects (including collections like arrays) can have [enumerable properties]. For example, the array `['one', 'two', 'three', 'infinity']` has three enumberable properties, `0`, `1`, `2`, and `3`. It also has a non-enumerable property, `length`.

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

In JavaScript, we do not say that the elements of an array or the values of an object are enumerable, we just say that some of the properties of any objct (including arrays) are enumerable.

Ruby uses the word slightly differently. In Ruby, [`Enumerable`][ruby-enumerable] is a `module` that is used as other languages would use a mixin. It applies to collections like arrays, and for a collection that provides a way to access the elements sequentially with a `.each` method, the `Enumerable` module adds a number of useful methods.

[ruby-enumerable]: http://ruby-doc.org/core/Enumerable.html

In Ruby, we would say that a class or object that "mixes in" the module `Enumerable`, is "enumerable."

So which is it? Are collections enumerable? The indices of the collections? Or their elements?

Informally speaking, the line we will take in this essay is that the term is imprecise in programming jargon, and that it is the elements of a collection that are enumerable. When we say "This array is enumerable," that is a shorthand in programming jargon for saying that its elements are enumerable, and some interafce is provided for acessing its elements in sequence.

That conflicts with the technial way that JavaScript uses the word, but we will shrug and say that iterating over the indices of an object is one particular interface for accessing the elements of a collection, as are other ways like using an actual iterator.

In Mathematics, an [enumeration] is a complete, ordered list of all of the elements of a set or collection. There can be more than one enumeration for the same collection, and the collections need not have a finite number of elements.

[enumeration]: https://en.wikipedia.org/wiki/Enumeration

For example, here are two slightly different enumerations for the integers: `0, -1, 1, -2, 2, -3, 3, -4, 4, ...` and `0, -1, 1, 2, -2, -3, 3, 4, -4 ...`. We have no way to write out the complete enumeration, because although each integer is of finite size, there are an infinite number of them.

Naturally, not all enumerations are infinite in size. Here are two enumerations of the set ("whole numbers less than or equal to four"): `0, 1, 2, 3, 4` and `4, 3, 2, 1, 0`.

It is very interesting and useful that an enumeration is a separate entity from the collection it enumerates. We are going to work with enumerations in this essay.

---

### enumerations in javascript

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

We can also make simple enumerations and find ways to compose them. We are going to use a very consistent style. Unless otherwise noted, we are going to work with the very simplest kind of generator, a geneator function that takes no arguments, like `anEnumerationOfIntegers` above.

Sometimes, we want to paramaterize a generator. Instead of writing a generator that takes parameters, we will consistently write functions that take parameters and return simple generators. So instead of writing timething like:

```javascript
function * upTo (i, limit) {
  while (i <= limit) yield i++;
}

function * downTo (i, limit) {
  while (i >= limit) yield i--;
}
```

We shall instead write:

```javascript
function upTo (i, limit) {
  return function * upTo () {
  	while (i <= limit) yield i++;
  };
}

function downTo (i, limit) {
  return function * downTo () {
  	while (i >= limit) yield i--;
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

Just as functions can return generators, functions can also take generators as arguments. Here's a function that merges generators into a single enumeration:

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

const wholeNumbers = upTo(0, Infinity);
const negativeIntegers = downTo(-1, -Infinity);
const integers = merge(wholeNumbers, negativeIntegers);

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

We're going to make some more enumerations, and some tools for composing them, but before we do, let;'s talk about why writing enumerations is interesting.

### denumerables


- enumerating a set proves that it is countable/cardinality one

- simple examples of subsets of integers being equal in cardinality to integers
  - integers equal to whole numbers

- tuples
  - why "counting" doesn't work.
  - rational numbers

- generalized n-ples

- the set of all n-ples

---

- self-reference

