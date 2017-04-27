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

In combinatory logic, just as `K` is known as the "Kestrel,", `K(I)` is known as the "Kite."

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

> As an aside, the Vireo is a little like JavaScript's `.apply` function. It says, "take these two values and apply them to this function." There are other, similar combinators that apply values to functions. One notable example is the "thrush" or T combinator: It takes one value and applies it to a function. It is known to most programmers as `.tap`. We'll see some more combinators later in this essay.

```

From there, we could have gone on two build trees, mapping functions, and much more. But let's go in a different direction.

### pairs of functions

One of the things you can do with a pair, is make a pair of functions:

```javascript
const left = (x) => `${x} is left-handed`;
const right = (x) => `${x} is right-handed`;
const leftOrRight = V(left)(right);
```

Now we can apply a selector to our pair and then evaluate whatever comes up:

```javascript
leftOrRight(K)('Lesley')
  //=> "Lesley is left-handed"

leftOrRight(K(I))('Reginald')
  //=> "Reginald is right-handed"
```

This is a little like a ternary expression in JavaScript. We have an value that evaluates to either `K` or `K(I)`, and then we take a value and apply it to either of two functions. An ordinary ternary expression has two values, but we use functions for our values and pass them an argument.

Our expression `V(functionOne)(functionTwo)` creates a new function that takes a selector and returns a function that takes an argument. And it models a choice between two paths.

### error handling

How can we use it? Let's consider ordinary and exceptional control flow. In JavaScript, you can write a function like this:

```javascript
const isString = (x) => x instanceof String || typeof x === 'string';
const notEmpty = (x) => x.length > 0;
const titlecaseString = (str) =>
  str
    .split(' ')
    .map( (s) => s[0].toUpperCase() + s.slice(1).toLowerCase() )
    .join(' ');

function titlecase(str) {
  if (isString(str)) {
    if (notEmpty(str)) {
      return titlecaseString(str);
    } else {
      console.log(`this string is empty`);
    }
  } else {
    console.log(`${str} is not a string`);
  }
  return str;
}
```

Our `titlecase` function wraps `titlecaseString` in two layers of error-checking, one to check that its argument is a string, and the other to check that it is not empty.[^not-empty]

[^not-empty]: It seems quite a bit simpler to simply define that the titlecase of an empty string is an empty string, but we don't have all the requirements for how this function is to be used, and perhaps there is some sane reason to require that we are actually trying to titlecase a non-empty string.

This kind of error handling can easily be replicated using our pairs of functions, but just as we can see that the "normal" JavaScript version is an ugly mess of nesting, we can anticipate that writing it out using functions would be just as messy. But let's take a crack at it anyways.

Before we begin, let's write ourselves a little helper function. Our problem is that our predicate functions like `isString` and `notEmpty` return JavaScript booleans, but we do our selection of alternatives with `K` and `K(I)`. So let's write an explicit coercion:

```javascript
const asSelector = (fn) => (arg) => fn(arg) ? first : second; // K and K(I) respectively

const notStringSelector = asSelector(isString);
const notEmptySelector = asSelector(notEmpty);
```

Armed with these selectors, we can write functions that check whether something is a string or not:

```javascript
const notString = (x) => {
  console.log(`${x} is not a string`);
};

const whenString = (x) => V(I)(notString)(notStringSelector(x))(x);

whenString(42)
  //=> "42 is not a string"
    undefined

whenString('Forty-two')
  //=> "Forty-two"
```

In the interests of purity, a truly combinatorial solution would get rid of the `(notStringSelector(x))` by selecting a combinator that parenthesized our expression appropriately. The one we want is the "Dickcissel," abbreviated "D2:"

```javascript
const D2 = (v) => (w) => (x) => (y) => (z) => v(w)(x)(y(z));

const whenString = (x) => D2(V)(I)(notString)(notStringSelector)(x)(x);
```

"Warblers" are combinators that duplicate arguments. The one we want is a "Warbler Quadrice Removed," or `W****`. JavaScript is quite strict about names not including stars, so we'll call it `W____`. With the warbler quadrice removed, we can reduce our `whenString` to a "point-free expression," an exercise in purity:

```javascript
const W____ = (u) => (v) => (w) => (x) => (y) => (z) => u(v)(w)(x)(y)(z)(z);

const whenString = W____(D2)(V)(I)(notString)(notStringSelector);
```

Now all `whenString` does is pass the value through when it is a string. If we just wanted to titlecase it, we could write:

```javascript
const titlecase =  W____(D2)(V)(titlecaseString)(notString)(notStringSelector);

titlecase('reginald braithwaite')
  //=> "Reginald Braithwaite"

titlecase(42)
  //=> "42 is not a string"
    NaN
```

It works, but can we do more?
