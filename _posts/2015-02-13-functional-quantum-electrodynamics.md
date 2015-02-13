---
layout: default
title: "The Quantum Electrodynamics of Functional JavaScript"
tags: [allonge]
---

![Coffee served at the CERN particle accelerator](/assets/images/cern-coffee.jpg)

In our code so far ([Destructuring and Recursion in ES-6](http://raganwald.com/2015/02/02/destructuring.html) and [Tail Calls, Default Arguments, and Excessive Recycling in ES-6](http://raganwald.com/2015/02/07/tail-calls-defult-arguments-recycling.html)), we have used arrays and objects to represent the structure of data, and we have extensively used the ternary operator to write algorithms that terminate when we reach a base case.

For example, this `length` function uses a functions to bind values to names, POJOs to structure nodes, and the ternary function to detect the base case, the empty list.

{% highlight javascript %}
const EMPTY = {};
const OneTwoThree = { first: 1, rest: { first: 2, rest: { first: 3, rest: EMPTY } } };

OneTwoThree.first
  //=> 1
  
OneTwoThree.rest.first
  //=> 2
  
OneTwoThree.rest.rest.first
  //=> 3
  
const length = (node, delayed = 0) =>
  node === EMPTY
    ? delayed
    : length(node.rest, delayed + 1);

length(OneTwoThree)
  //=> 3
{% endhighlight %}

A very long time ago, mathematicians like Alonzo Church, Moses Schönfinkel, Alan Turning, and Haskell Curry and asked themselves if we really needed all these features to perform computations. They searched for a radically simpler set of tools that could accomplish all of the same things.

They established that arbitrary computations could be represented a small set of axiomatic components. For example, we don't need arrays to represent lists, or even POJOs to represent nodes in a linked list. We can model lists just using functions.

> [To Mock a Mockingbird](http://www.amazon.com/gp/product/0192801422/ref=as_li_ss_tl?ie=UTF8&tag=raganwald001-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0192801422) established the metaphor of songbirds for the combinators, and ever since then logicians have called the K combinator a "kestrel," the B combinator a "bluebird," and so forth. 

> The [oscin.es] library contains code for all of the standard combinators and for experimenting using the standard notation.

[To Mock a Mockingbird]: http://www.amazon.com/gp/product/0192801422/ref=as_li_ss_tl?ie=UTF8&tag=raganwald001-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=0192801422
[oscin.es]: http://oscin.es

Let's start with some of the building blocks of combinatory logic, the K, I, and V combinators, nicknamed the "Kestrel", the "Idiot Bird", and the "Vireo:"

{% highlight javascript %}
const K = (x) => (y) => x;
const I = (x) => (x);
const V = (x) => (y) => (z) => z(x)(y);
{% endhighlight %}

### the kestrel and the idiot

A *constant function* is a function that always returns the same thing, no matter what you give it. For example, `(x) => 42` is a constant function that always evaluates to 42. The kestrel, or `K`, is a function that makes constant functions. You give it a value, and it returns a constant function that gives that value.

For example:

{% highlight javascript %}
const K = (x) => (y) => x;

const fortyTwo = K(42);

fortyTwo(6)
  //=> 42

fortyTwo("Hello")
  //=> 42
{% endhighlight %}

The *identity function* is a function that evaluates to whatever parameter you pass it. So `I(42) => 42`. Very simple, but useful. Now we'll take it one more step forward: Passing a value to `K` gets a function back, and passing a value to that function gets us a value.

Like so:

{% highlight javascript %}
K(6)(7)
  //=> 6
  
K(12)(24)
  //=> 6
{% endhighlight %}

This is very interesting. Given two values, we can say that `K` always returns the *first* value: `K(x)(y) => x` (that's not valid JavaScript, but it's essentially how it works).

Now, an interesting thing happens when we pass functions to each other. Consider `K(I)`. From what we just wrote, `K(x)(y) => x` So `K(I)(x) => I`. Makes sense. Now let's tack one more invocation on: What is `K(I)(x)(y)`? If `K(I)(x) => I`, then `K(I)(x)(y) === I(y)` which is `y`.

Therefore, `K(I)(x)(y) => y`:

{% highlight javascript %}
K(I)(6)(7)
  //=> 7
  
K(I)(12)(24)
  //=> 24
{% endhighlight %}

Aha! Given two values, `K(I)` always returns the *second* value.

{% highlight javascript %}
K("primus")("secundus")
  //=> "primus"
  
K(I)("primus")("secundus")
  //=> "secundus"
{% endhighlight %}

If we are not feeling particularly academic, we can name our functions:

{% highlight javascript %}
const first = K,
      second = K(I);
      
first("primus")("secundus")
  //=> "primus"
  
second("primus")("secundus")
  //=> "secundus"
{% endhighlight %}

> This is very interesting. Given two values, we can say that `K` always returns the *first* value, and given two values, `K(I)` always returns the *second* value.

### backwardness

Our `first` and `second` functions are a little different than what most people are used to when we talk about functions that access data. If we represented a pair of values as an array, we'd write them like this:

{% highlight javascript %}
const first = ([first, second]) => first,
      second = ([first, second]) => second;
      
const latin = ["primus", "secundus"];
      
first(latin)
  //=> "primus"
  
second(latin)
  //=> "secundus"
{% endhighlight %}

Or if we were using a POJO, we'd write them like this:

{% highlight javascript %}
const first = ({first, second}) => first,
      second = ({first, second}) => second;
      
const latin = {first: "primus", second: "secundus"};
      
first(latin)
  //=> "primus"
  
second(latin)
  //=> "secundus"
{% endhighlight %}

In both cases, the functions `first` and `second` know how the data is represented, whether it be an array or an object. You pass the data to these functions, and they extract it.

But the `first` and `second` we built out of `K` and `I` don't work that way. You call them and pass them the bits, and they choose what to return. So if we wanted to use them with a two-element array, we'd need to have a piece of code that calls some code.

Here's the first cut:

{% highlight javascript %}
const first = K,
      second = K(I);
      
const latin = (selector) => selector("primus")("secundus");

latin(first)
  //=> "primus"
  
latin(second)
  //=> "secundus"
{% endhighlight %}

Our `latin` data structure is no longer a dumb data structure, its a function. And instead of passing `latin` to `first` or `second`, we pass `first` or `second` to `latin`. It's *exactly backwards* of the way we write functions that operate on data.

### the vireo

Given that our `latin` data is represented as the function `(selector) => selector("primus")("secundus")`, our obvious next step is to make a function that makes data. For arrays, we'd write `cons = (first, second) => [first, second]`. For objects we'd write: `cons = (first, second) => {first, second}`. In both cases, we take two parameters, and return the form of the data.

For "data" we access with `K` and `K(I)`, our "structure" is the function `(selector) => selector("primus")("secundus")`. Let's extract those into parameters:

{% highlight javascript %}
(first, second) => (selector) => selector(first)(second)
{% endhighlight %}

For consistency with the way combinators are written as functions taking just one parameter, we'll [curry] the function:

{% highlight javascript %}
(first) => (second) => (selector) => selector(first)(second)
{% endhighlight %}

[curry]: https://en.wikipedia.org/wiki/Currying

Let's try it, we'll use the word `tuple` for the function that makes data (When we need to refer to a specific tuple, we'll use the name `aTuple` by default):

{% highlight javascript %}
const first = K,
      second = K(I),
      tuple = (first) => (second) => (selector) => selector(first)(second);

const latin = tuple("primus")("secundus");

latin(first)
  //=> "primus"
  
latin(second)
  //=> "secundus"
{% endhighlight %}

It works! Now what is this `node` function? If we change the names to `x`, `y`, and `z`, we get: `(x) => (y) => (z) => z(x)(y)`. That's the V combinator, the Vireo! So we can write:

{% highlight javascript %}
const first = K,
      second = K(I),
      tuple = V;

const latin = tuple("primus")("secundus");

latin(first)
  //=> "primus"
  
latin(second)
  //=> "secundus"
{% endhighlight %}

> As an aside, the Vireo is a little like JavaScript's `.apply` function. It says, "take these two values and apply them to this function." There are other, similar combinators that apply values to functions. One notable iexample is the "thrush" or T combinator: It takes one value and applies it to a function. It is known to most programmers as `.tap`.

Armed with nothing more than `K`, `I`, and `V`, we can make a little data structure that holds two values, the `cons` cell of Lisp and the node of a linked list. Without arrays, and without objects, just with functions. We'd better try it out to check.

### lists with functions as data

Here's another look at linked lists using POJOs. We use the term `rest` instead of `second`, but it's otherwise identical to what we have above:

{% highlight javascript %}
const first = ({first, rest}) => first,
      rest  = ({first, rest}) => rest,
      tuple = (first, rest) => ({first, rest}),
      EMPTY = ({});
      
const l123 = tuple(1, tuple(2, tuple(3, EMPTY)));

first(l123)
  //=> 1

first(rest(l123))
  //=> 2

first(rest(rest(l123)))
  //=3
{% endhighlight %}

We can write `length` and `mapWith` functions over it:

{% highlight javascript %}
const length = (aTuple) =>
  aTuple === EMPTY
    ? delayed
    : 1 + length(rest(aTuple));

length(l123)
  //=> 3

const reverse = (aTuple, delayed = EMPTY) =>
  aTuple === EMPTY
    ? delayed
    : reverse(rest(aTuple), tuple(first(aTuple), delayed));

const mapWith = (fn, aTuple, delayed = EMPTY) =>
  aTuple === EMPTY
    ? reverse(delayed)
    : mapWith(fn, rest(aTuple), tuple(fn(first(aTuple)), delayed));
    
const doubled = mapWith((x) => x * 2, l123);

first(doubled)
  //=> 2

first(rest(doubled))
  //=> 4

first(rest(rest(doubled)))
  //=> 6
{% endhighlight %}

Can we do the same with the linked lists we build out of functions? Yes:

{% highlight javascript %}
const first = K,
      rest  = K(I),
      tuple = V,
      EMPTY = (() => {});
      
const l123 = tuple(1)(tuple(2)(tuple(3)(EMPTY)));

l123(first)
  //=> 1

l123(rest)(first)
  //=> 2

return l123(rest)(rest)(first)
  //=> 3
{% endhighlight %}

We write them in a backwards way, but they seem to work. How about `length`?

{% highlight javascript %}
const length = (aTuple) =>
  aTuple === EMPTY
    ? 0
    : 1 + length(aTuple(rest));
    
length(l123)
  //=> 3
{% endhighlight %}

And `mapWith`?

{% highlight javascript %}
const reverse = (aTuple, delayed = EMPTY) =>
  aTuple === EMPTY
    ? delayed
    : reverse(aTuple(rest), tuple(aTuple(first))(delayed));

const mapWith = (fn, aTuple, delayed = EMPTY) =>
  aTuple === EMPTY
    ? reverse(delayed)
    : mapWith(fn, aTuple(rest), tuple(fn(aTuple(first)))(delayed));
    
const doubled = mapWith((x) => x * 2, l123)

doubled(first)
  //=> 2

doubled(rest)(first)
  //=> 4

doubled(rest)(rest)(first)
  //=> 6
{% endhighlight %}

Presto, **we can use pure functions to represent a linked list**. And with care, we can do amazing things like use functions to represent numbers, build more complex data structures like trees, and in fact, anything that can be computed can be computed using just functions and nothing else.

But without building our way up to something insane like writing a JavaScript interpreter using JavaScript functions and no other data structures, let's take things another step in a slightly different direction.

We used functions to replace arrays and POJOs, but we still use JavaScript's built-in operators to test for equality (`===`) and to branch `?:`.

### say "please"

We keep using the same pattern in our functions: `aTuple === EMPTY ? doSomething : doSomethingElse`. This follows the philosophy we used with data structures: The function doing the work inspects the data structure.

We can reverse this: Instead of asking a tuple if it is empty and then deciding what to do, we can ask the tuple to do it for us. Here's `length` again:

{% highlight javascript %}
const length = (aTuple) =>
  aTuple === EMPTY
    ? delayed
    : 1 + length(rest(aTuple));
{% endhighlight %}

Let's presume we are working with a slightly higher abstraction, we'll call it a `list`. Instead of writing `length(list)` and examining a list, we'll write something like:

{% highlight javascript %}
const length = (list) => list(
  () => 0,
  (aTuple) => 1 + length(aTuple(rest)))
);
{% endhighlight %}

Now we'll need to write `first` and `rest` functions for a list, and those names will collide with the `first` and `rest` we wrote for tuples. So let's disambiguate our names:

{% highlight javascript %}
const tupleFirst = K,
      tupleRest  = K(I),
      tuple = V;
      
const first = (list) => list(
    () => "ERROR: Can't take first of an empty list",
    (aTuple) => aTuple(tupleFirst)
  );
      
const rest = (list) => list(
    () => "ERROR: Can't take first of an empty list",
    (aTuple) => aTuple(tupleRest)
  );

const length = (list) => list(
    () => 0,
    (aTuple) => 1 + length(aTuple(tupleRest)))
  );
{% endhighlight %}

We'll also write a handy list printer:

{% highlight javascript %}
const print = (list) => list(
    () => "",
    (aTuple) => `${aTuple(tupleFirst)} ${print(aTuple(tupleRest))}`
  );
{% endhighlight %}

How would all this work? Let's start with the obvious. What is an empty list?

{% highlight javascript %}
const EMPTYLIST = (whenEmpty, unlessEmpty) => whenEmpty()
{% endhighlight %}

And what is a node of a list?

{% highlight javascript %}
const node = (x) => (y) =>
  (whenEmpty, unlessEmpty) => unlessEmpty(tuple(x)(y));
{% endhighlight %}

Let's try it:

{% highlight javascript %}
const l123 = node(1)(node(2)(node(3)(EMPTYLIST)));

print(l123)
  //=> 1 2 3
{% endhighlight %}

We can write `reverse` and `mapWith` as well. We aren't being super-strict about emulating combinatory logic, we'll use default parameters:

{% highlight javascript %}
const reverse = (list, delayed = EMPTYLIST) => list(
  () => delayed,
  (aTuple) => reverse(aTuple(tupleRest), node(aTuple(tupleFirst))(delayed))
);

print(reverse(l123));
  //=> 3 2 1
  
const mapWith = (fn, list, delayed = EMPTYLIST) =>
  list(
    () => reverse(delayed),
    (aTuple) => mapWith(fn, aTuple(tupleRest), node(fn(aTuple(tupleFirst)))(delayed))
  );
  
print(mapWith(x => x * x, reverse(l123)))
  //=> 941
{% endhighlight %}

We have managed to provide the exact same functionality that `===` and `?:` provided, but using functions and nothing else.

### functions are not the real point

There are lots of similar texts explaining how to construct complex semantics out of functions. You can establish that `K` and `K(I)` can represent `true` and `false`, model magnitudes with [Church Numerals] or [Surreal Numbers], and build your way up to printing FizzBuzz.

The superficial conclusion reads something like this:

[Church Numerals]: https://en.wikipedia.org/wiki/Church_encoding
[Surreal Numbers]: https://en.wikipedia.org/wiki/Surreal_number

> Functions are a fundamental building block of computation. They are "axioms" of combinatory logic, and can be used to compute anything that JavaScript can compute.

However, that is not the interesting thing to note here. Practically speaking, languages like JavaScript already provide arrays with mapping and folding methods, choice operations, and other rich constructs. Knowing how to make a linked list out of functions is not really necessary for the working programmer. (Knowing that it can be done, on the other hand, is very important to understanding computer science.)

Knowing how to make a list out of just functions is a little like knowing that photons are the [Gauge Bosons] of the electromagnetic force. It's the QED of physics that underpins the Maxwell's Equations of programming. Deeply important, but not practical when you're building a bridge.

[Gauge Bosons]: https://en.wikipedia.org/wiki/Gauge_boson

So what *is* interesting about this? What nags at our brain as we're falling asleep after working our way through this?

### a return to backward thinking

To make tuples work, we did things *backwards*, we passed the `first` and `rest` functions to the tuple, and the tuple called our function. As it happened, the tuple was composed by the vireo (or V combinator): `(x) => (y) => (z) => z(x)(y)`.

But we could have done something completely different. We could have written a tuple that stored its elements in an array, or a tuple that stored its elements in a POJO. All we know is that we can pass the tuple function a function of our own, at it will be called with the elements of the tuple.

The exact implementation of a tuple is hidden from the code that uses a tuple. Here, we'll prove it:

{% highlight javascript %}
const first = K,
      second = K(I),
      tuple = (first) => (second) => {
        const pojo = {first, second};
        
        return (selector) => selector(pojo.first)(pojo.second);
      };

const latin = tuple("primus")("secundus");

latin(first)
  //=> "primus"
  
latin(second)
  //=> "secundus"
{% endhighlight %}

This is a little gratuitous, but it makes the point: The code that uses the data doesn't reach in and touch it: The code that uses the data provides some code and asks the data to do something with it.

The same thing happens with our lists. Here's `length` for lists:

{% highlight javascript %}
const length = (list) => list(
    () => 0,
    (aTuple) => 1 + length(aTuple(tupleRest)))
  );
{% endhighlight %}

We're passing `list` what we want done with an empty list, and what we want done with a list that has at least one element. We then ask `list` to do it, and provide a way for `list` to call the code we pass in.

We won't bother here, but it's easy to see how to swap our functions out and replace them with an array. Or a column in a database. This is fundamentally *not* the same thing as this code for the length of a linked list:

{% highlight javascript %}
const length = (node, delayed = 0) =>
  node === EMPTY
    ? delayed
    : length(node.rest, delayed + 1);
{% endhighlight %}

The line `node === EMPTY` presumes a lot of things. It presumes there is one canonical empty list value. It presumes you can compare these things with the `===` operator. We can fix this with an `isEmpty` function, but now we're pushing even more knowledge about the structure of lists into the code that uses them.

Having a list know itself whether it is empty hides implementation information from the code that uses lists. This is a fundamental principle of good design. It is a tenet of Object-Oriented Programming, but it is **not** exclusive to OOP: We can and should design data structures to hide implementation information from the code that use them, whether we are working with functions, objects, or both.

There are many tools for hiding implementation information, and we have now seen two particularly powerful patterns:

* Instead of directly manipulating part of an entity, pass it a function and have it call our function with the part we want.
* And instead of testing some property of an entity and making a choice of our own with `?:` (or `if`), pass the entity the work we want done for each case and let it test itself.

---

[ja6]: https://leanpub.com/b/buy-allonge-get-thesixedition-free

[reddit](http://www.reddit.com/r/javascript/comments/2vs2u8/the_quantum_electrodynamics_of_functional/) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-02-13-functional-quantum-electrodynamics.md)

---

postscript:

If you speak Ruby, Tom Stuart's *Programming with Nothing* is a [must-watch](http://rubymanor.org/3/videos/programming_with_nothing/) and a [must-read](http://codon.com/programming-with-nothing).

This post was extracted from the in-progress book, [JavaScript Allongé, The "Six" Edition][ja6]. Your feedback helps everyone, so please, join the discussion or submit an edit directly. Thank you!