---
layout: default
title: "Tail Calls, Default Arguments, and Excessive Recycling in ES-6"
---

The `mapWith` and `foldWith` functions we wrote in [Destructuring and Recursion in ES6](/2015/02/02/destructuring.html) are useful for illustrating the basic principles behind using recursion to work with self-similar data structures, but they are not "production-ready" implementations. One of the reasons they are not production-ready is that they consume memory proportional to the size of the array being folded.

Let's look at how. Here's our extremely simple `mapWith` function again:

{% highlight javascript %}
const mapWith = (fn, [first, ...rest]) =>
  first === undefined
    ? []
    : [fn(first), ...mapWith(fn, rest)];
                                              
mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}

Let's step through its execution. First, `mapWith((x) => x * x, [1, 2, 3, 4, 5])` is invoked. `first` is not `undefined`, so it evaluates [fn(first), ...mapWith(fn, rest)]. To do that, it has to evaluate `fn(first)` and `mapWith(fn, rest)`, then evaluate [fn(first), ...mapWith(fn, rest)].

This is roughly equivalent to writing:

{% highlight javascript %}
const mapWith = function (fn, [first, ...rest]) {
  if (first === undefined) {
    return [];
  }
  else {
    const _temp1 = fn(first),
          _temp2 = mapWith(fn, rest),
          _temp3 = [_temp1, ..._temp2];
          
    return _temp3;
  }
}
{% endhighlight %}

Note that while evaluating `mapWith(fn, rest)`, JavaScript must retain the value `first` or `fn(first)`, plus some housekeeping information so it remembers what to do with `mapWith(fn, rest)` when it has a result. JavaScript cannot throw `first` away. So we know that JavaScript is going to hang on to `1`.

Next, JavaScript invokes `mapWith(fn, rest)`, which is semantically equivalent to `mapWith((x) => x * x, [2, 3, 4, 5])`. And the same thing happens: JavaScript has to hang on to `2` (or `4`, or both, depending on the implementation), plus some housekeeping information so it remembers what to do with that value, while it calls the equivalent of `mapWith((x) => x * x, [3, 4, 5])`.

This keeps on happening, so that JavaScript collects the values `1`, `2`, `3`, `4`, and `5` plus housekeeping information by the time it calls `mapWith((x) => x * x, [])`. It can start assembling the resulting array and start discarding the information it is saving.

That information is saved on a *call stack*, and it is quite expensive. Furthermore, doubling the length of an array will double the amount of space we need on the stack, plus double all the work required to set up and tear down the housekeeping data for each call (these are called *call frames*, and they include the place where the function was called, an environment, and so on).

In practice, using a method like this with more than about 50 items in an array may cause some implementations to run very slow, run out of memory and freeze, or cause an error.

{% highlight javascript %}                                                  
mapWith((x) => x * x, [
   0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  90, 91, 92, 93, 94, 95, 96, 97, 98, 99,
   0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
  50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
  70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81, 82, 83, 84, 85, 86, 87, 88, 89,
  90, 91, 92, 93, 94, 95, 96, 97, 98, 99
])
  //=> ???
{% endhighlight %}

Is there a better way? Several, in fact, fast algorithms is a very highly studied field of computer science. The one we're going to look at here is called *tail-call optimization*, or "TCO."

### tail-call optimization

A "tail-call" occurs when a function's last act is to invoke another function, and then return whatever the other function returns. For example, consider the `maybe` function decorator:

{% highlight javascript %}
const maybe = (fn) =>
  function (...args) {
    if (args.length === 0) {
      return;
    }
    else {
      for (let arg in args) {
        if (arg == null) return;
      }
      return fn.apply(this, args);
    }
  }
{% endhighlight %}

There are three places it returns. The first two don't return anything, they don't matter. But the third is `fn.apply(this, args)`. This is a tail-call, because it invokes another function and returns its result. This is interesting, because after sorting out what to supply as arguments (`this`, `args`), JavaScript can throw away everything in its current stack frame. It isn't going to do any more work, so it can throw its existing stack frame away.

And in fact, it does exactly that: It throws the stack frame away, and does not consume extra memory when making a `maybe`-wrapped call. That being said, one wrapping is not a big deal. But consider this:

{% highlight javascript %}
const length = ([first, ...rest]) =>
  first === undefined
    ? 0
    : 1 + length(rest);
{% endhighlight %}
        
The `length` function calls itself, but it is not a tail-call, because it returns `1 + length(rest)`, not `length(rest)`.

The problem can be stated in such a way that the answer is obvious: `length` does not call itself in tail position, because it has to do two pieces of work, and while one of them is in the recursive call to `length`, the other happens after the recursive call.

The obvious solution?

### converting non-tail-calls to tail-calls

The obvious solution is push the `1 +` work into the call to `length`. Here's our first cut:

{% highlight javascript %}
const lengthDelaysWork = ([first, ...rest], numberToBeAdded) =>
  first === undefined
    ? 0 + numberToBeAdded
    : lengthDelaysWork(rest, 1 + numberToBeAdded)

lengthDelaysWork(["foo", "bar", "baz"], 0)
  //=> 3
{% endhighlight %}
      
This `lengthDelaysWork` function calls itself in tail position. The `1 +` work is done before calling itself, and by the time it reaches the terminal position, it has the answer. Now that we've seen how it works, we can clean up the `0 + numberToBeAdded` business. But while we're doing that, it's annoying to remember to call it with a zero. Let's fix that:

{% highlight javascript %}
const lengthDelaysWork = ([first, ...rest], numberToBeAdded) =>
  first === undefined
    ? numberToBeAdded
    : lengthDelaysWork(rest, 1 + numberToBeAdded)
  
const length = (n) =>
  lengthDelaysWork(n, 0);
{% endhighlight %}
      
Or we could use partial application:

{% highlight javascript %}
const callLast = (fn, ...args) =>
    (...remainingArgs) =>
      fn(...remainingArgs, ...args);
  
const length = callLast(lengthDelaysWork, 0);

length(["foo", "bar", "baz"])
  //=> 3
{% endhighlight %}
      
This version of `length` calls uses `lengthDelaysWork`, and JavaScript optimizes that not to take up memory proportional to the length of the string. We can use this technique with `mapWith`:

{% highlight javascript %}
const mapWithDelaysWork = (fn, [first, ...rest], prepend) =>
  first === undefined
    ? prepend
    : mapWithDelaysWork(fn, rest, [...prepend, fn(first)]);
    
const mapWith = callLast(mapWithDelaysWork, []);
                                              
mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}
      
We can use it with ridiculously large arrays:

{% highlight javascript %}
mapWith((x) => x * x, [
     0,    1,    2,    3,    4,    5,    6,    7,    8,    9,  
    10,   11,   12,   13,   14,   15,   16,   17,   18,   19,  
    20,   21,   22,   23,   24,   25,   26,   27,   28,   29,  
    30,   31,   32,   33,   34,   35,   36,   37,   38,   39,  
    40,   41,   42,   43,   44,   45,   46,   47,   48,   49,  
    50,   51,   52,   53,   54,   55,   56,   57,   58,   59,  
    60,   61,   62,   63,   64,   65,   66,   67,   68,   69,  
    70,   71,   72,   73,   74,   75,   76,   77,   78,   79,  
    80,   81,   82,   83,   84,   85,   86,   87,   88,   89,  
    90,   91,   92,   93,   94,   95,   96,   97,   98,   99,
    
  // ...
  
  2980, 2981, 2982, 2983, 2984, 2985, 2986, 2987, 2988, 2989,
  2990, 2991, 2992, 2993, 2994, 2995, 2996, 2997, 2998, 2999 ])
  
  //=> [0,1,4,9,16,25,36,49,64,81,100,121,144,169,196, ...
{% endhighlight %}
    
Brilliant! We can map over large arrays without incurring all the memory and performance overhead of non-tail-calls. And this basic transformation from a recursive function that does not make a tail call, into a recursive function that calls itself in tail position, is a bread-and-butter pattern for programmers using a language that incorporates tail-call optimization.

### factorials

Introductions to recursion often mention calculating factorials:

> In mathematics, the factorial of a non-negative integer `n`, denoted by `n!`, is the product of all positive integers less than or equal to `n`. For example:

{% highlight javascript %}
5! = 5  x  4  x  3  x  2  x  1 = 120.
{% endhighlight %}

The naïve function for calcuating the factorial of a positive integer follows directly from the definition:

{% highlight javascript %}
const factorial = (n) =>
  n == 1
  ? n
  : n * factorial(n - 1);
  
factorial(1)
  //=> 1
  
factorial(5)
  //=> 120
{% endhighlight %}

While this is mathematically elegant, it is computational [filigree]. 

[filigree]: https://en.wikipedia.org/wiki/Filigree

Once again, it is not tail-recursive, it needs to save the stack with each invocation so that it can take the result returned and compute `n * factorial(n - 1)`. We can do the same conversion, pass in the work to be done:

{% highlight javascript %}
const factorialWithDelayedWork = (n, work) =>
  n === 1
  ? work
  : factorialWithDelayedWork(n - 1, n * work);
  
const factorial = (n) =>
  factorialWithDelayedWork(n, 1);
{% endhighlight %}
      
Or we could use partial application:

{% highlight javascript %}
const callLast = (fn, ...args) =>
    (...remainingArgs) =>
      fn(...remainingArgs, ...args);
  
const factorial = callLast(factorialWithDelayedWork, 1);
  
factorial(1)
  //=> 1
  
factorial(5)
  //=> 120
{% endhighlight %}

As before, we wrote a `factorialWithDelayedWork` function, then used partial application (`callLast`) to make a `factorial` function that took just the one argument and supplied the initial work value.

### default arguments

Our problem is that we can directly write:

{% highlight javascript %}
const factorial = (n, work) =>
  n === 1
  ? work
  : factorial(n - 1, n * work);
  
factorial(1, 1)
  //=> 1
  
factorial(5, 1)
  //=> 120
{% endhighlight %}

But it is hideous to have to always add a `1` parameter, we'd be demanding that everyone using the `factorial` function know that we are using a tail-recursive implementation.

What we really want is this: We want to write something like `factorial(6)`, and have JavaScript automatically know that we really mean `factorial(6, 1)`. But when it calls itself, it will call `factorial(5, 6)` and that will not mean `factorial(5, 1)`.

JavaScript provides this exact syntax, it's called a *default argument*, and it looks like this:

{% highlight javascript %}
const factorial = (n, work = 1) =>
  n === 1
  ? work
  : factorial(n - 1, n * work);
  
factorial(1)
  //=> 1
  
factorial(6)
  //=> 720
{% endhighlight %}

By writing our parameter list as `(n, work = 1) =>`, we're stating that if a second parameter is not provided, `work` is to be bound to `1`. We can do similar thngs with our other tail-recursive functions:

{% highlight javascript %}
const length = ([first, ...rest], numberToBeAdded = 0) =>
  first === undefined
    ? numberToBeAdded
    : length(rest, 1 + numberToBeAdded)

length(["foo", "bar", "baz"])
  //=> 3
  
const mapWith = (fn, [first, ...rest], prepend = []) =>
  first === undefined
    ? prepend
    : mapWith(fn, rest, [...prepend, fn(first)]);
                                              
mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}

Now we don't need to use two functions. A default argument is concise and readable.

## Garbage, Garbage Everywhere

![Garbage Day](/assets/images/garbage.jpg)
    
We have now seen how to use [Tail Calls](#tail) to execute `mapWith` in constant space:

{% highlight javascript %}
const mapWith = (fn, [first, ...rest], prepend = []) =>
  first === undefined
    ? prepend
    : mapWith(fn, rest, [...prepend, fn(first)]);
                                                  
mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
{% endhighlight %}

But when we try it on very large arrays, we discover that it is *still* very slow. Much slower than the built-in `.map` method for arrays. The right tool to discover why it's still slow is a memory profiler, but a simple inspection of the program will reveal the following:

Every time we call `mapWith`, we're calling `[...prepend, fn(first)]`. To do that, we take the array in `prepend` and push `fn(first)` onto the end, creating a new array that will be passed to the next invocation of `mapWith`.

Worse, the JavaScript Engine actually copies the elements from `prepend` into the new array one at a time. That is very laborious.[^cow]

[^cow]: It needn't always be so: Programmers have developed specialized data structures that make operations like this cheap, often by arranging for structures to share common elements by default, and only making copies when changes are made. But this is not how JavaScript's built-in arrays work.

The array we had in `prepend` is no longer used. In GC environments, it is marked as no longer being used, and eventually the garbage collector recycles the meory it is using. Lather, rinise, repeat: Ever time we call `mapWithDelaysWork`, we're throwing an existing array away and creating a new one.

We may not be creating 3,000 stack frames, but we are creating an empty array, an array with one element, and array with two elements, an array with three elements, and so on up to an array with three thousand elements that we eventually use. Although the maximum amount of memory does not grow, the thrashing as we create short-lived arrays is very bad, and we do a lot of work copying elements from one array to another.

If this is so bad, why do some examples of "functional" algorithms work this exact way?

![The IBM 704](/assets/images/IBM704.jpg)

### some history

Once upon a time, there was a programming language called [Lisp], an acronym for LISt Processing. Lisp was one of the very first high-level languages. As mentioned previously, the very first implementation was written for the [IBM 704] computer. (The very first FORTRAN implementation was also written for the 704).

[Lisp]: https://en.wikipedia.org/wiki/Lisp_(programming_language)
[IBM 704]: https://en.wikipedia.org/wiki/IBM_704

The 704 had a 36-bit word, meaning that it was very fast to store and retrieve 36-bit values. The CPU's instruction set featured two important macros: `CAR` would fetch 15 bits representing the Contents of the Address part of the Register, while `CDR` would fetch the Contents of the Decrement part of the register. In broad terms, this means that a single 36-bit word could store two separate 15-bit values and it was very fast to save and retrieve pairs of values. If you had two 15-bit values and wished to write them to the register, the `CONS` macro would take the values and write them to a 36-bit word.

Thus, `CONS` put two values together, `CAR` extracted one, and `CDR` extracted the other. Lisp's basic data type is often said to be the list, but in actuality it was the "cons cell," the term used to describe two 15-bit values stored in one word. The 15-bit values were used as pointers that could refer to a location in memory, so in effect, a cons cell was a little data structure with two pointers to other cons cells.

Lists were represented as linked lists of cons cells, with each cell's head pointing to an element and the tail pointing to another cons cell.

Here's the scheme in JavaScript, using two-element arrays to represent cons cells:

{% highlight javascript %}
const cons = (a, d) => [a, d],
      car  = ([a, d]) => a,
      cdr  = ([a, d]) => d;
{% endhighlight %}
      
We can make a list by calling `cons` repeatedly, and terminating it with `null`:

{% highlight javascript %}
const oneToFive = cons(1, cons(2, cons(3, cons(4, cons(5, null)))));

oneToFive
  //=> [1,[2,[3,[4,[5,null]]]]]
{% endhighlight %}

Here's where things get interesting. If we want the head of a list, we call `car` on it:

{% highlight javascript %}
car(oneToFive)
  //=> 1
{% endhighlight %}
      
`car` is very fast, it simply extracts the first element of the cons cell.

But what about the rest of the list? `cdr` does the trick:

{% highlight javascript %}
cdr(oneToFive)
  //=> [2,[3,[4,[5,null]]]]
{% endhighlight %}
      
Again, it's just extracting a reference from a cons cell, it's very fast. In Lisp, it's blazingly fast because it happens in hardware. There's no making copies of arrays, the time to `cdr` a list with five elements is the same as the time to `cdr` a list with 5,000 elements, and no temporary arrays are needed.

Thus, an operation like `[first, ...rest] = someArray`  that can be very slow with JavaScript is lightning-fast in Lisp, because `[first, ...rest]` is really a `car` and a `cdr` if we're making lists our of cons cells. Likewise, an operation like `someArray = [something, ...moreElements]` is lightning-fast in Lisp because we're only creating one new cons cell, we aren't duplicating the entire array.

Alas, although lists made out of cons cells are very fast for prepending elements and "shifting" elements off the front, they are slow for iterating over elements because the computer has to "pointer chase" through memory, it's much faster to increment a register and fetch the next item. And it's excruciating to attempt to access an arbitrary item, you have to iterate from the beginning, every time.

So FORTRAN used arrays, and in time Lisp added vectors that work like arrays, and with a new data structure came new algorithms. And so it is today that languages like JavaScript have arrays that are slow to split into a `car`/`cdr` pair, but are lightning fast to access any one item given an index.

### summary

Although we showed how to use tail calls to map and fold over arrays with `[first, ...rest]`, in reality this is not how it ought to be done. But it is an extremely simple illustration of how recursion works when you have a self-similar means of constructing a data structure.

[edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-02-07-tail-calls-defult-arguments-recycling.md)

---