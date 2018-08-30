---
tags: [recursion, noindex]
---

### combinators

The word "combinator" has a precise technical meaning in mathematics:

> "A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments."--[Wikipedia][combinators]

[combinators]: https://en.wikipedia.org/wiki/Combinatory_logic "Combinatory Logic"

In this essay, we will be using a much looser definition of "combinator:" Pure functions that act on other functions to produce functions. If Objects are nouns and Methods are verbs, **Combinators are the adverbs of programming**.

If we were learning Combinatorial Logic, we'd start with the most basic combinators like `S`, `K`, and `I`, and work up from there to practical combinators. We'd learn that the fundamental combinators are named after birds following the example of Raymond Smullyan's famous book [To Mock a Mockingbird][mock]. Needless to say, the title of the book and its central character is the inspiration for this essay!

[mock]: http://www.amazon.com/gp/product/B00A1P096Y/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B00A1P096Y&linkCode=as2&tag=raganwald001-20

There are an infinite number of combinators, but in this article we will focus on the *mockingbird*, also called the `M` combinator, or sometimes the ω or "little omega."[^little-omega]

### a recursive function

> As the number of people discussing recursion in an online forum increases, the probability that someone will quote the definition for recursion as "recursion: see 'recursion'" approaches one.

Recursive functions are easy to grasp, especially if they are simple. We're going to construct one that computes the exponent of a number. If we want to compute something like `2^8` (two to the power of eight), we can compute it like this: `2 * 2 * 2 * 2 * 2 * 2 * 2 * 2`. That requires seven multiplications. So, any time we want to raise some number `x` to the exponent `n`, the naïve method requires `n-1` multiplications.

```javascript
2 * 2 * 2 * 2 * 2 * 2 * 2 * 2
  //=> 256

function naiveExponent (x, n) {
  if (n === 0) {
    return 1;
  } else if (n === 1) {
    return x;
  } else {
    return x * naiveExponent(x, n - 1);
  }
}

naiveExponent(2, 8)
  //=> 256
```

Obviously, we can implement this more efficiently with iteration. It's so easy to convert this by hand that we won't show it here.[^tail]

[^tail]: It's also straightforward to convert this recursive function to a tail-recursive function, and then to an iterative form. See [A Trick of the Tail](http://raganwald.com/2018/05/27/tail.html) for a fuller explanation.

Now let's make an observation: Given a list of numbers to multiply, instead of performing each multiplication independently, let's [Divide and Conquer](http://www.cs.berkeley.edu/~vazirani/algorithms/chap2.pdf). Let's take the easy case: Can we agree that `2 * 2 * 2 * 2 * 2 * 2 * 2 * 2` is equal to `(2 * 2 * 2 * 2) * (2 * 2 * 2 * 2)`? That seems like the same number of operations (there are still seven `*`s), but if we write it like this, we save three operations:

```javascript
const square = x => x * x;

square(2 * 2 * 2 * 2)
  //=> 256
```
Now we perform three multiplications to compute `2 * 2 * 2 * 2`, and one more to square it, producing `256`. We can use the same reasoning again: `2 * 2 * 2 * 2` is equivalent to `(2 * 2) * (2 * 2)`, or `square(2 * 2)`. Which leads us to:

```javascript
const square = x => x * x;

square(square(2 * 2))
  //=> 256

square(square(square(2)))
  //=> 256
```

Now we're only performing three multiplications, not seven. We can write a version of this that works with any exponent that is a power of two:

```javascript
function exponent (x, n) {
  if (n === 0) {
    return 1;
  } else if (n === 1) {
    return x;
  } else {
    return exponent(x * x, n / 2);
  }
}

exponent(2, 8)
  //=> 256
```

Handling exponents that aren't neat powers of two involves checking whether the supplied exponent is even or odd:

```javascript
function exponent (x, n) {
  if (n === 0) {
    return 1;
  } else if (n === 1) {
    return x;
  } else if (n % 2 === 1) {
    return x * exponent(x * x, Math.floor(n / 2));
  } else {
    return exponent(x * x, n / 2);
  }
}

exponent(2, 7)
  //=> 128
```

So far, so good![^fib]

[^fib]: This basic pattern was originally discussed in an essay about a different recursive function, [writing a matrix multiplication implemntation of fibonacci](http://raganwald.com/2015/12/20/an-es6-program-to-compute-fibonacci.html).

### recursion and binding

Question: _How does our `exponent` function actually perform recursion?_ The immediate answer is, "It calls itself when the work to be performed is not the base case" (the base case for exponentiation is an exponent of `0` or `1`). How does it call itself? Well, when we have a function declaration (like above), or a named function expression, the function is bound to its own name within the body of the function automatically.

So within the body of the `exponent` function, the function itself is bound to the name `exponent`, and that's what it calls. This is obvious to most programmers, and it's how we nearly always implement recursion.

But it's not _always_ exactly what we want. Our `exponent` function is an improvement over `naiveExponent`, but of we want even more performance, we might consider [memoizing](https://en.wikipedia.org/wiki/Memoization) the function.

Here's a memoization decorator, snarfed from [Time, Space, and Life As We Know It
](http://raganwald.com/2017/01/12/time-space-life-as-we-know-it.html):

```
const memoized = (fn, keymaker = JSON.stringify) => {
  const lookupTable = new Map();

  return function (...args) {
    const key = keymaker.call(this, args);

    return lookupTable[key] || (lookupTable[key] = fn.apply(this, args));
  }
};
```

We can make a memoized version of our `exponent` function:

```javascript
const mExponent = memoized(exponent);

mExponent(2, 8)
  //=> 256, performs three multiplications
mExponent(2, 8)
  //=> 256, returns the memoized result without further multiplications
```

There is a hitch with this solution: Although we are invoking `mExponent`, internally `exponent` is invoking itself directly, without memoization. So if we write:

```javascript
const mExponent = memoized(exponent);

mExponent(2, 8)
  //=> 256, performs three multiplications
mExponent(2, 9)
  //=> 512, performs four multiplications
```

When we invoke `exponent(2, 8)`, we also end up invoking `exponent(4, 4)`, `exponent(16, 2)`, and `exponent(256, 1)`. We want those memoized. That way, when we invoke `exponent(2, 9)`, and it invoked `exponent(4, 4)`, the result is memoized and it need do no further computation.

Our problem here is that `exponent` is "hard-wired" to call `exponent`, _not_ `mExponent`. So it never invoked the memoized version of the function.

We can work around that like this:

```javascript
const mExponent = memoized(function (x, n) {
  if (n === 0) {
    return 1;
  } else if (n === 1) {
    return x;
  } else if (n % 2 === 1) {
    return x * mExponent(x * x, Math.floor(n / 2));
  } else {
    return mExponent(x * x, n / 2);
  }
});

mExponent(2, 8)
  //=> 256, performs three multiplications
mExponent(2, 9)
  //=> 512, performs only one multiplication
```

In many cases this is fine. But conceptually, writing it this way means that our exponent function needs to know whether it is memoized or not.

---

## Notes

[^little-omega]: The "little omega" notation comes from David C Keenan's delightful [To Dissect a Mockingbird](http://dkeenan.com/Lambda/) web page.
