---
layout: default
title: "Success and Failure in Functional JavaScript"
tags: [allonge]
---

![Coffee served at the CERN particle accelerator](/assets/images/cern-coffee.jpg)

In  ([The Quantum Electrodynamics of Functional JavaScript](hhttp://raganwald.com/2015/02/13/functional-quantum-electrodynamics.html), we saw how to use just three of combinatory logic's basic building blocks--the K, I, and V combinators--to build lists out of just functions.

To recap tersely, we started with some of the building blocks of combinatory logic, the K, I, and V combinators, nicknamed the "Kestrel", the "Idiot Bird", and the "Vireo:"

```javascript
const K = (x) => (y) => x;
const I = (x) => (x);
const V = (x) => (y) => (z) => z(x)(y);

```

From there, we determined that `K` was useful for selecting the *first* of two values, while `KI` was useful for selecting the *second: of two values:

```javascript
K("primus")("secundus")
  //=> "primus"

K(I)("primus")("secundus")
  //=> "secundus"
```


> [To Mock a Mockingbird](http://www.amazon.com/gp/product/0192801422/ref=as_li_ss_tl?ie=UTF8&tag=raganwald001-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0192801422) established the metaphor of songbirds for the combinators, and ever since then logicians have called the K combinator a "kestrel," the B combinator a "bluebird," and so forth.

> The [oscin.es] library contains code for all of the standard combinators and for experimenting using the standard notation.

[To Mock a Mockingbird]: http://www.amazon.com/gp/product/0192801422/ref=as_li_ss_tl?ie=UTF8&tag=raganwald001-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0192801422
[oscin.es]: http://oscin.es

We then constructed a `pair` function that makes a data structure (like a Lisp "cons" cell):

```javascript
const first = K,
      second = K(I),
      pair = (first) => (second) => (selector) => selector(first)(second);

const latin = pair("primus")("secundus");

latin(first)
  //=> "primus"

latin(second)
  //=> "secundus"
```

Changing the names in our definition to `x`, `y`, and `z`, we got: `(x) => (y) => (z) => z(x)(y)`. the V combinator, or Vireo! So we could also write:

```javascript
const first = K,
      second = K(I),
      pair = V;

const latin = pair("primus")("secundus");

latin(first)
  //=> "primus"

latin(second)
  //=> "secundus"
```

> As an aside, the Vireo is a little like JavaScript's `.apply` function. It says, "take these two values and apply them to this function." There are other, similar combinators that apply values to functions. One notable example is the "thrush" or T combinator: It takes one value and applies it to a function. It is known to most programmers as `.tap`.

Armed with nothing more than `K`, `I`, and `V`, we made a little data structure that holds two values, the `cons` cell of Lisp and the node of a linked list. Without arrays, and without objects, just with functions:

```javascript
const first = ({first, rest}) => first,
      rest  = ({first, rest}) => rest,
      pair = (first, rest) => ({first, rest}),
      EMPTY = ({});

const l123 = pair(1, pair(2, pair(3, EMPTY)));

first(l123)
  //=> 1

first(rest(l123))
  //=> 2

first(rest(rest(l123)))
  //=3
```

From there, we could have gone on two build trees, mapping functions, and much more. But let's go in a different direction.

---

If you speak Ruby, Tom Stuart's *Programming with Nothing* is a [must-watch](http://rubymanor.org/3/videos/programming_with_nothing/) and a [must-read](http://codon.com/programming-with-nothing).
