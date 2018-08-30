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

Recursive functions are easy to grasp, especially if they are simple. We're going to construct one that computes the exponent of a number.[^fib] If we want to compute something like `2^8` (two to the power of eight), we can compute it like this: `2 * 2 * 2 * 2 * 2 * 2 * 2 * 2`. That requires seven multiplications. So, any time we want to raise some number `x` to the exponent `n`, the naïve method requires `n-1` multiplications.

```javascript
2 * 2 * 2 * 2 * 2 * 2 * 2 * 2
  //=> 256
```

[^fib]: This basic pattern was originally discussed in an essay about a different recursive function, [writing a matrix multiplication implemntation of fibonacci](http://raganwald.com/2015/12/20/an-es6-program-to-compute-fibonacci.html).

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
  if (n === 1) {
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

So far, so good!

### recursion and binding

Now how does our `exponent` function actually perform recursion. The immediate answer is, "it calls itself when the work to be performed is not the base case."

---

## Notes

[^little-omega]: The "little omega" notation comes from David C Keenan's delightful [To Dissect a Mockingbird](http://dkeenan.com/Lambda/) web page.
