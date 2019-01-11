---

# IGNORE THE FOLLOWING

---





Getting back to JavaScript now, when we write `[first, ...rest]` to gather or spread arrays, we're emulating the semantics of `car` and `cdr`, but not the implementation. We're doing something laborious and memory-inefficient compared to using a linked list as Lisp did and as we can still do if we choose.

That being said, it is easy to understand and helps us grasp how literals and destructuring works, and how recursive algorithms ought to mirror the self-similarity of the data structures they manipulate. And so it is today that languages like JavaScript have arrays that are slow to split into the equivalent of a `car`/`cdr` pair, but instructional examples of recursive programs still have echoes of their Lisp origins.

### so why arrays

If `[first, ...rest]` is so slow, why does JavaScript use arrays instead of making everything a linked list?

Well, linked lists are fast for a few things, like taking the front element off a list, and taking the remainder of a list. But not for iterating over a list: Pointer chasing through memory is quite a bit slower than incrementing an index. In addition to the extra fetches to dereference pointers, pointer chasing suffers from cache misses. And if you want an arbitrary item from a list, you have to iterate through the list element by element, whereas with the indexed array you just fetch it.

We have avoided discussing rebinding and mutating values, but if we want to change elements of our lists, the naïve linked list implementation suffers as well: When we take the `cdr` of a linked list, we are sharing the elements. If we make any change other than cons-ing a new element to the front, we are changing both the new list and the old list.

Arrays avoid this problem by pessimistically copying all the references whenever we extract an element or sequence of elements from them.

For these and other reasons, almost all languages today make it possible to use a fast array or vector type that is optimized for iteration, and even Lisp now has a variety of data structures that are optimized for specific use cases.

[![Symbolics "old style" keyboard](/assets/images/ayoayo/symbolics.jpg)](https://www.flickr.com/photos/mrbill/5336327890)

*[Symbolics, Inc.][Symbolics] was a computer manufacturer headquartered in Cambridge, Massachusetts, and later in Concord, Massachusetts, with manufacturing facilities in Chatsworth, California. Symbolics designed and manufactured a line of Lisp machines, single-user computers optimized to run the Lisp programming language.*

[Symbolics]: https://en.wikipedia.org/wiki/Symbolics

---

###  wherein we travel back in time to the dawn of functional programming

A very long time ago, many of the functional tools we take for granted today--like `map` and `filter` functions--were first being explored with the [Lisp] programming language.

[Lisp]: https://en.wikipedia.org/wiki/Lisp_(programming_language)

Lisp grew to have a rich set of high-performance datatypes, but in its earliest incarnations, most of its data was built around something called a [cons] cell. A cons cell was a place in memory big enough to hold two pointers. The underlying hardware was such that operations on cons cells were very fast.

[cons]: https://en.wikipedia.org/wiki/cons

Cons cells had two parts, an _address register_, and a _decrement register_. You created a cons cell by _cons-ing_ two values together. You could access the individual parts with two functions, `car` ("contents of address register"), and `cdr` ("contents of decrement register").

"Lisp" was actually spelled LISP in those days, because it wasn't a word, it was an acronym. It stood for "LISt Processing," because the central idea in Lisp was the manipulation of lists. Lists were Lisp's primary data type.

Cons cells were used to make [linked lists][ll], so a list that we'd represent in JavaScript as `[1, 2, 3]` would look like this in Lisp:[^well-actually-diagrams]

[ll]: https://en.wikipedia.org/wiki/Linked_list

<div class="mermaid">
  graph LR
    one(( ))-- car -->a["1"]
    one-- cdr -->two(( ))
    two-- car -->b["2"]
    two-- cdr -->three(( ))
    three-- car -->c["3"]
    three-- cdr -->null["fa:fa-ban null"]
</div>

[^well-actually-diagrams]: Well, actually, they used a slightly different kind of diagram to notate the relationship between cons cells,. They were little rectangles divided in half vertically, with the left-hand side the `car`, and the right-hand side the `cdr`, and they'd use a diagonal slash to denote `null`. But the diagramming tool I use for this blog doesn't do that, so let's move on.

The last cons cell in the list would have `null` for its `cdr`, and `null` was a shorthand for the empty list.

Now, because every list was a linked list by default, some things were very fast, and some not-so-much so. The fastest thing in the world was to separate a list into the first element and a list containing the rest of the elements. The first element was always the `car` of the list. In our diagram above, the `car` of the list is `1`.

What about the rest of the list? Well, if we take the `cdr` of the list, we get:

<div class="mermaid">
  graph LR
    two(( ))-- car -->b["2"]
    two-- cdr -->three(( ))
    three-- car -->c["3"]
    three-- cdr -->null["fa:fa-ban null"]
</div>

That's a list containing `2` and `3`. So in Lisp, it was always fast to get the first element of a list and the rest of a list. Now, you could get any element of a list by traversing the list pointer by pointer. So if you wanted to do something with a list, like sum the elements of a list, you'd write a linearly recursive function like this:

```javascript
function sum (list, acc = 0) {
  if (list == null) {
    return acc;
  } else {
    const { car: first, cdr: rest } = list;

    return sum(rest, acc + first);
  }
}

const oneTwoThree = {
  car: 1,
  cdr: {
    car: 2,
    cdr: {
      car: 3,
      cdr: null
    }
  }
};

sum(oneTwoThree)
  //=> 6
```

We've put it in slightly more idiomatic JavaScript by using a plain-old-JavaScript-object instead of a cons cell, and using fancy destructuring instead of a `car` and `cdr` function, but if we ignore the fact that the original cons cells were many many orders of magnitude faster than using objects with properties, we have the general idea:

It was ridiculously fast to separate a list into the `first` and `rest`, and as a result, many linear algorithms that operated on lisps were organized around repeatedly (by recursion or looping) getting the first and rest of a list.

## Garbage, Garbage Everywhere

But what about today's JavaScript? Today, we can write a list with an array. And we can get the `first` and `rest` with destructuring:

```javascript
function sum (list, acc = 0) {
  if (list.length === 0) {
    return acc;
  } else {
    const [first, ...rest] = list;

    return sum(rest, acc + first);
  }
}

const oneTwoThree = [1, 2, 3];

sum(oneTwoThree)
  //=> 6
```

This is easier on the eyes, and just as mathematically elegant. But today, when we write something like `[first, ...rest] = list`, it's very fast to get `first`. But for `rest`, the system calls `.slice(1)`. That makes a new array that is a copy of the old array, omitting element `0`. That is much slower, and since these copies are temporary, hammers away at the garbage collector.

We're only working with three elements at a time, so we can afford to chuckle at the performance implications. But the important takeaway is that it is important to match algorithms to data structures, because what is fast with one data structure may be slow with another.

What is fast with a linked list is slow with an array.

And most importantly, if there are two ways to do something, and one is more elegant, it may be possible to find a data structure that makes the elegant approach fast. We should never rush to trade elegance for performance without further investigation.



We have now seen how to use [Tail Calls](#tail) to execute `mapWith` in constant space:

```javascript
const mapWith = (fn, [first, ...rest], prepend = []) =>
  first === undefined
    ? prepend
    : mapWith(fn, rest, [...prepend, fn(first)]);

mapWith((x) => x * x, [1, 2, 3, 4, 5])
  //=> [1,4,9,16,25]
```

But when we try it on very large arrays, we discover that it is *still* very slow. Much slower than the built-in `.map` method for arrays. The right tool to discover why it's still slow is a memory profiler, but a simple inspection of the program will reveal the following:

Every time we call `mapWith`, we're calling `[...prepend, fn(first)]`. To do that, we take the array in `prepend` and push `fn(first)` onto the end, creating a new array that will be passed to the next invocation of `mapWith`.

Worse, the JavaScript Engine actually copies the elements from `prepend` into the new array one at a time. That is very laborious.[^cow]

[^cow]: It needn't always be so: Programmers have developed specialized data structures that make operations like this cheap, often by arranging for structures to share common elements by default, and only making copies when changes are made. But this is not how JavaScript's built-in arrays work.

The array we had in `prepend` is no longer used. In GC environments, it is marked as no longer being used, and eventually the garbage collector recycles the memory it is using. Lather, rinse, repeat: Ever time we call `mapWith`, we're creating a new array, copying all the elements from `prepend` into the new array, and then we no longer use `prepend`.

We may not be creating 3,000 stack frames, but we are creating three thousand new arrays and copying elements into each and every one of them. Although the maximum amount of memory does not grow, the thrashing as we create short-lived arrays is very bad, and we do a lot of work copying elements from one array to another.

> **Key Point**: Our `[first, ...rest]` approach to recursion is slow because that it creates a lot of temporary arrays, and it spends an enormous amount of time copying elements into arrays that end up being discarded.

So here's a question: If this is such a slow approach, why do some examples of "functional" algorithms work this exact way?





### summary

Although we showed how to use tail calls to map and fold over arrays with `[first, ...rest]`, in reality this is not how it ought to be done. But it is an extremely simple illustration of how recursion works when you have a self-similar means of constructing a data structure.

[hacker news](https://news.ycombinator.com/item?id=9019554) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-02-07-tail-calls-defult-arguments-recycling.md)

---

This post was extracted from a draft of the book, [JavaScript Allongé, The "Six" Edition][ja6]. The extracts so far:

* [OOP, Javascript, and so-called Classes](http://raganwald.com/2015/05/11/javascript-classes.html),
* [Left-Variadic Functions in JavaScript](http://raganwald.com/2015/04/03/left-variadic.html),
* [Partial Application in ECMAScript 2015](http://raganwald.com/2015/04/01/partial-application.html),
* [The Symmetry of JavaScript Functions](http://raganwald.com/2015/03/12/symmetry.html),
* [Lazy Iterables in JavaScript](http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html),
* [The Quantum Electrodynamics of Functional JavaScript](http://raganwald.com/2015/02/13/functional-quantum-electrodynamics.html),
* [Tail Calls, Default Arguments, and Excessive Recycling in ES-6](http://raganwald.com/2015/02/07/tail-calls-defult-arguments-recycling.html), and:
* [Destructuring and Recursion in ES-6](http://raganwald.com/2015/02/02/destructuring.html).

[ja6]: https://leanpub.com/b/buyjavascriptallongthesixeditiongetjavascriptallongfree

---
