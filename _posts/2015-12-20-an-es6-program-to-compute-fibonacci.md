---
title: An ES6 function to compute the nth Fibonacci number
layout: default
tags: [allonge]
---

![Fibonacci Spiral](/assets/images/fibonacci.png)

Once upon a time, programming interviews would include a [fizz-buzz](http://raganwald.com/2007/01/dont-overthink-fizzbuzz.html "Don't Overthink FizzBuzz") problem to weed out the folks who couldn't string together a few lines of code. We can debate when and how such things are appropriate interview questions, but one thing that is always appropriate is to use them as inspiration for practising our own skills.[^candid]

[^candid]: Actually, let me be candid: I just like programming, and I find it's fun, even if I don't magically transform myself into a 10x programming ninja through putting in 10,000 hours of practice. But practice certainly doesn't hurt.

There are various common problems offered in such a vein, including fizz-buzz itself, computing certain prime numbers, and computing Fibonacci number. [A few years back][2008], I had a go at writing my own Fibonacci function. When I started researching approaches, I discovered an intriguing bit of matrix math, so I learned something while practicing my skills.[^closed]

[2008]: http://raganwald.com/2008/12/12/fibonacci.html

[^closed]: There is a [closed-form solution](http://en.wikipedia.org/wiki/Fibonacci_number#Closed-form_expression) to the function `fib`, but floating point math has some limitations you should be aware of before [using it in an interview](http://raganwald.com/2013/03/26/the-interview.html). Naturally, if you're running into some of those limits, you would use a BigInt library such as [BigInteger.js](https://github.com/peterolson/BigInteger.js).

### enter the matrix

One problem with calculating a Fibonacci number is that naïve algorithms require _n_ additions. This is obviously expensive for large values of _n_. But of course, there are some interesting things we can do to improve on this.

In this solution, we observe that we can express the Fibonacci number `F(n)` using a 2x2 matrix that is raised to the power of _n_:

    [ 1 1 ] n      [ F(n+1) F(n)   ]
    [ 1 0 ]    =   [ F(n)   F(n-1) ]


On the face of it, raising someting to the power of _n_ turns _n_ additions into _n_ multiplications. _n_ multiplications sounds worse than _n_ additions, however there is a trick about raising something to a power that we can exploit. Let's start by writing some code to multiply matrices:

[Multiplying two matrices](http://www.maths.surrey.ac.uk/explore/emmaspages/option1.html "Matrices and Determinants") is a little interesting if you have never seen it before:

    [ a b ]       [ e f ]   [ ae + bg  af + bh ]
    [ c d ] times [ g h ] = [ ce + dg  cf + dh ]

Our matrices always have diagonal symmetry, so we can simplify the calculation because _c_ is always equal to _b_:

    [ a b ]       [ d e ]   [ ad + be  ae + bf ]
    [ b c ] times [ e f ] = [ bd + ce  be + cf ]

Now we are given that we are multiplying two matrices with diagonal symmetry. Will the result have diagonal symmetry? In other words, will `ae + bf` always be equal to `bd + ce`? Remember that `a = b + c` at all times and `d = e + f` provided that each is a power of `[[1,1], [1,0]]`. Therefore:

    ae + bf = (b + c)e + bf
            = be + ce + bf
    bd + ce = b(e + f) + ce
            = be + bf + ce

That simplifies things for us, we can say:

    [ a b ]       [ d e ]   [ ad + be  ae + bf ]
    [ b c ] times [ e f ] = [ ae + bf  be + cf ]

And thus, we can always work with three elements instead of four. Let's express this as operations on arrays:

    [a, b, c] times [d, e, f] = [ad + be, ae + bf, be + cf]

Which we can code in JavaScript, using array destructuring:

```javascript
let times = (...matrices) =>
  matrices.reduce(
    ([a,b,c], [d,e,f]) => [a*d + b*e, a*e + b*f, b*e + c*f]
  );

times([1, 1, 0]) // => [1, 1, 0]
times([1, 1, 0], [1, 1, 0]) // => [2, 1, 1]
times([1, 1, 0], [1, 1, 0], [1, 1, 0]) // => [3, 2, 1]
times([1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0]) // => [5, 3, 2]
times([1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0]) // => [8, 5, 3]
```

To get exponentiation from multiplication, we could write out a naive implementation that constructs a long array of copies of `[1, 1, 0]` and then calls `times`:

```javascript
let naive_power = (matrix, n) =>
  times(...new Array(n).fill([1, 1, 0]));

naive_power([1, 1, 0], 1) // => [1, 1, 0]
naive_power([1, 1, 0], 2) // => [2, 1, 1]
naive_power([1, 1, 0], 3) // => [3, 2, 1]
naive_power([1, 1, 0], 4) // => [5, 3, 2]
naive_power([1, 1, 0], 5) // => [8, 5, 3]
{%endhighlight %}

Very interesting, and less expensive than multiplying any two arbitrary matrices, but we are still performing _n_ multiplications when we raise a matrix to the _nth_ power. What can we do about that?

### exponentiation with matrices

Now let's make an observation: instead of accumulating a product by iterating over the list, let's [Divide and Conquer](http://www.cs.berkeley.edu/~vazirani/algorithms/chap2.pdf). Let's take the easy case: Don't you agree that `times([1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0])` is equal to `times(times([1, 1, 0], [1, 1, 0]), times([1, 1, 0], [1, 1, 0]))`?

This saves us an operation, since `times([1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0])` is implemented as:

```javascript
times([1, 1, 0],
  times([1, 1, 0],
    times([1, 1, 0], [1, 1, 0]))
{%endhighlight %}

Whereas `times(times([1, 1, 0], [1, 1, 0]), times([1, 1, 0], [1, 1, 0]))` can be implemented as:

```javascript
let double = times([1, 1, 0], [1, 1, 0]),
    quadruple = times(double, double);
{%endhighlight %}

This only requires two operations rather than three. Furthermore, this pattern is recursive. For example, `naive_power([1, 1, 0], 8)` requires seven operations:

```javascript
times([1, 1, 0],
  times([1, 1, 0],
    times([1, 1, 0],
      times([1, 1, 0],
        times([1, 1, 0],
          times([1, 1, 0],
            times([1, 1, 0], [1, 1, 0])))))))
{%endhighlight %}

However, it can be formulated with just three operations:

```javascript
let double = times([1, 1, 0], [1, 1, 0]),
    quadruple = times(double, double),
    octuple = times(quadruple, quadruple);
{%endhighlight %}

Of course, we left out how to deal with odd numbers. Fixing that also fixes how to deal with even numbers that aren't neat powers of two:

```javascript
let power = (matrix, n) => {
  if (n === 1) return matrix;

  let halves = power(matrix, Math.floor(n / 2));

  return n % 2 === 0
         ? times(halves, halves)
         : times(halves, halves, matrix);
}

power([1, 1, 0], 1) // => [1, 1, 0]
power([1, 1, 0], 2) // => [2, 1, 1]
power([1, 1, 0], 3) // => [3, 2, 1]
power([1, 1, 0], 4) // => [5, 3, 2]
power([1, 1, 0], 5) // => [8, 5, 3]
{%endhighlight %}

Now we can perform exponentiation of our matrices, and we take advantage of the symmetry to perform _log2n_ multiplications.

### and thus to fibonacci

We can now write our complete fibonacci function:

```javascript
let times = (...matrices) =>
  matrices.reduce(
    ([a,b,c], [d,e,f]) => [a*d + b*e, a*e + b*f, b*e + c*f]
  );

let power = (matrix, n) => {
  if (n === 1) return matrix;

  let halves = power(matrix, Math.floor(n / 2));

  return n % 2 === 0
         ? times(halves, halves)
         : times(halves, halves, matrix);
}

let fibonacci = (n) =>
  n < 2
  ? n
  : power([1, 1, 0], n - 1)[0];

fibonacci(62)
  // => 4052739537881
{%endhighlight %}

If we'd like to work with very large numbers, JavaScript's integers are insufficient. Using a library like [BigInteger.js](https://github.com/peterolson/BigInteger.js), our solution becomes:

```javascript
import { zero, one } from 'big-integer';

let times = (...matrices) =>
  matrices.reduce(
    ([a, b, c], [d, e, f]) => [
        a.times(d).plus(b.times(e)),
        a.times(e).plus(b.times(f)),
        b.times(e).plus(c.times(f))
      ]
  );

let power = (matrix, n) => {
  if (n === 1) return matrix;

  let halves = power(matrix, Math.floor(n / 2));

  return n % 2 === 0
         ? times(halves, halves)
         : times(halves, halves, matrix);
}

let fibonacci = (n) =>
  n < 2
  ? n
  : power([one, one, zero], n - 1)[0];
{%endhighlight %}

Let's stretch our wings and calculate the 19,620,614th Fibonacci number:[^1962]

[^1962]: 1962-06-14 is a number near and dear to me :-)

```javascript
fibonacci(19620614).toString()
  // =>
    29554981652302145421961363135286189884298419359021591207414
    94029404508891979849589048890639433083583865137532017734839
    03976989846431379560920380384049354648973349793444866743699
    77583527866834756211404857224578913159290369224744375346007
    69568427064684727742279727974589543524504574566687346018118
    // ...
    // ...69,490 lines elided...
    // ...
    44917243010555501044826365112091652635017254277919365055752
    92134790638460565443537453870610661665070132289987927432062
    35114452925784094009088430159367013806505734580798084002841
    21219542644844237050682927035326929321204843947060841278604
    7707601726389614978163177
{%endhighlight %}

([full result, as calculated in Safari](/19620614.fibonacci.txt))

We're done. And this is a win over the typical recursive or even iterative solution for large numbers, because while each operation is more expensive, we only perform _log2n_ operations.[^notfastest]

[^notfastest]: No, this isn't [the fastest implementation](http://blade.nagaokaut.ac.jp/cgi-bin/scat.rb/ruby/ruby-talk/194815 "Fast Fibonacci method") by far. But it beats the pants off of a naïve iterative implementation.

(This is a translation of a blog post written in [2008]. It feels cleaner than the Ruby original, possibly because of the destructuring, and possibly because writing functions is idiomatic JavaScript, whereas refining core classes is idiomatic Ruby. What do you think? Discuss on [Hacker News](https://news.ycombinator.com/item?id=10771440).)

---

notes:
