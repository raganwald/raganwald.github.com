---
layout: default
title: "Another Look at Lisp"
tags: [allonge, recursion, mermaid]
---

![The IBM 704](/assets/images/IBM704.jpg)

---

###  wherein we travel back in time to the dawn of functional programming

Once upon a time, there was a programming language called [Lisp], an acronym for LISt Processing.[^lisp] Lisp was one of the very first high-level languages, the very first implementation was written for the [IBM 704] computer. (The very first FORTRAN implementation was also written for the 704).

[Lisp]: https://en.wikipedia.org/wiki/Lisp_(programming_language)
[IBM 704]: https://en.wikipedia.org/wiki/IBM_704
[^lisp]: Lisp is still very much alive, and one of the most interesting and exciting programming languages in use today is [Clojure](http://clojure.org/), a Lisp dialect that runs on the JVM, along with its sibling [ClojureScript](https://github.com/clojure/clojurescript), Clojure that transpiles to JavaScript.

The 704 had a 36-bit word, meaning that it was very fast to store and retrieve 36-bit values. The CPU's instruction set featured two important macros: `CAR` would fetch 15 bits representing the Contents of the Address part of the Register, while `CDR` would fetch the Contents of the Decrement part of the Register.

In broad terms, this means that a single 36-bit word could store two separate 15-bit values and it was very fast to save and retrieve pairs of values. If you had two 15-bit values and wished to write them to the register, the `CONS` macro would take the values and write them to a 36-bit word.

Thus, `CONS` put two values together, `CAR` extracted one, and `CDR` extracted the other. Lisp's basic data type is often said to be the list, but in actuality it was the "cons cell," the term used to describe two 15-bit values stored in one word. The 15-bit values were used as pointers that could refer to a location in memory, so in effect, a [cons cell][cons] was a little data structure with two pointers to other cons cells.

[cons]: https://en.wikipedia.org/wiki/cons

Lists were represented as linked lists of cons cells, with each cell's head pointing to an element and the tail pointing to another cons cell.

> Having these instructions be very fast was important to those early designers: They were working on one of the first high-level languages (COBOL and FORTRAN being the others), and computers in the late 1950s were extremely small and slow by today's standards. Although the 704 used core memory, it still used vacuum tubes for its logic. Thus, the design of programming languages and algorithms was driven by what could be accomplished with limited memory and performance.

Here's the scheme in JavaScript, using two-element arrays to represent cons cells:

```javascript
const cons = (a, d) => [a, d],
      car  = ([a, d]) => a,
      cdr  = ([a, d]) => d;
```

We can make a list by calling `cons` repeatedly, and terminating it with `null`:

```javascript
const oneToFive = cons(1, cons(2, cons(3, cons(4, cons(5, null)))));

oneToFive
  //=> [1,[2,[3,[4,[5,null]]]]]
```

Notice that though JavaScript displays our list as if it is composed of arrays nested within each other like Russian Dolls, in reality the arrays refer to each other with references, so `[1,[2,[3,[4,[5,null]]]]]` is our way to represent:

<div class="mermaid">
  graph LR
    one(( ))-- car -->a["1"]
    one-- cdr -->two(( ))
    two-- car -->b["2"]
    two-- cdr -->three(( ))
    three-- car -->c["3"]
    three-- cdr -->four(( ))
    four-- car -->d["4"]
    four-- cdr -->five(( ))
    five-- car -->e["5"]
    five-- cdr -->null["fa:fa-ban null"];
</div>


This is a [Linked List](https://en.wikipedia.org/wiki/Linked_list), it's just that those early Lispers used the names `car` and `cdr` after the hardware instructions, whereas today we use words like `element` and `next`. But it works the same way: If we want the head of a list, we call `car` on it:

```javascript
car(oneToFive)
  //=> 1
```

`car` is very fast, it simply extracts the first element of the cons cell. And what about the rest of the list? `cdr` does the trick:

```javascript
cdr(oneToFive)
  //=> [2,[3,[4,[5,null]]]]
```

That's another linked list too:

<div class="mermaid">
  graph LR
    two(( ))-- car -->b["2"]
    two-- cdr -->three(( ))
    three-- car -->c["3"]
    three-- cdr -->four(( ))
    four-- car -->d["4"]
    four-- cdr -->five(( ))
    five-- car -->e["5"]
    five-- cdr -->null["fa:fa-ban null"];
</div>

Again, it's just extracting a reference from a cons cell, it's very fast. In Lisp, it's blazingly fast because it happens in hardware. There's no making copies of arrays, the time to `cdr` a list with five elements is the same as the time to `cdr` a list with 5,000 elements, and no temporary arrays are needed. In JavaScript, it's still much, much, much faster to get all the elements except the head from a linked list than from an array. Getting one reference to a structure that already exists is faster than copying a bunch of elements.

So now we understand that in Lisp, a lot of things use linked lists, and they do that in part because it was what the hardware made possible.

---

[![Symbolics "old style" keyboard](/assets/images/ayoayo/symbolics.jpg)](https://www.flickr.com/photos/mrbill/5336327890)

*[Symbolics, Inc.][Symbolics] was a computer manufacturer headquartered in Cambridge, Massachusetts, and later in Concord, Massachusetts, with manufacturing facilities in Chatsworth, California. Symbolics designed and manufactured a line of Lisp machines, single-user computers optimized to run the Lisp programming language.*

[Symbolics]: https://en.wikipedia.org/wiki/Symbolics

---

### operating on lists

As we can see, it was always fast to get the first element of a list and the rest of a list. Now, you could get every element of a list by traversing the list pointer by pointer. So if you wanted to do something with a list, like sum the elements of a list, you'd write a linearly recursive function like this:

```javascript
const cons = (a, d) => [a, d],
      car  = ([a, d]) => a,
      cdr  = ([a, d]) => d;

function sum (list, acc = 0) {
  if (list == null) {
    return acc;
  } else {
    const first = car(list);
    const rest = cdr(list);

    return sum(rest, acc + first);
  }
}

const oneToFive = cons(1, cons(2, cons(3, cons(4, cons(5, null)))));

sum(oneToFive)
  //=> 15
```

If we ignore the fact that the original cons cells were many many orders of magnitude faster than using arrays with two elements, we have the general idea:

> It was ridiculously fast to separate a list into the `first` and `rest`, and as a result, many linear algorithms written in Lisp were organized around repeatedly (by recursion or looping) getting the first and rest of a list.

---

![Garbage Day](/assets/images/garbage.jpg)

---

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

const oneToFive = [1, 2, 3, 4, 5];

sum(oneToFive)
  //=> 15
```

This is easier on the eyes, and just as mathematically elegant. But today, when we write something like `[first, ...rest] = list`, it's very fast to get `first`. But for `rest`, the system calls `.slice(1)`. That makes a new array that is a copy of the old array, omitting element `0`. That is much slower, and since these copies are temporary, hammers away at the garbage collector.

We're only working with five elements at a time, so we can afford to chuckle at the performance implications. But if we start operating on long lists, all that copying is going to bury us under a mound of garbage. Of course, we could switch to linked lists in JavaScript. But the cure would be worse than the disease.

Nobody wants to read code that lokks like `cons(1, cons(2, cons(3, cons(4, cons(5, null)))))`. And sometimes, we want to access arbitrary elements of an array. When we do, we have to traverse the list element by element to get it:

```javascript
function at (list, index) {
  if (list == null) {
    return undefined;
  } else if (index === 0) {
    return car(list);
  } else {
    return at(cdr(list), index - 1);
  }
}

const oneToFive = [1, 2, 3, 4, 5];

at(oneToFive, 4)
  //=> 5
```

Accessing arbitrary elements of a linked list is the "Shlemiel The Painter" of Computer Science:

> Shlemiel gets a job as a street painter, painting the dotted lines down the middle of the road. On the first day he takes a can of paint out to the road and finishes 300 yards of the road. "That's pretty good!" says his boss, "you're a fast worker!" and pays him a kopeck.
>
> The next day Shlemiel only gets 150 yards done. "Well, that's not nearly as good as yesterday, but you're still a fast worker. 150 yards is respectable," and pays him a kopeck.
>
> The next day Shlemiel paints 30 yards of the road. "Only 30!" shouts his boss. "That's unacceptable! On the first day you did ten times that much work! What's going on?" "I can't help it," says Shlemiel. "Every day I get farther and farther away from the paint can!"

_If only there was a way to have the elegance of Lisp, and the performance of Arrays when accessing arbitrary elements._

Let's work our way up to that. Where do we begin?

---

[![The Beginning](/assets/images/slice/begin.jpg)](https://www.flickr.com/photos/56218409@N03/15332717763)

---

### slicing and structural sharing

Let's start with a couple of very modest requirements. First, what we're building is for the case when we want to process lists in a `[first, ...rest]` style, usually recursively.

(Most of the time, we don't want to do process lists in a `[first, ...rest]` style. But when we do--perhaps we are playing with a recursive algorithm we read about in a book like [SICP], perhaps we want to refactor such an algorithm setp-by-step--we want the performance to be "not embarrassing.")

[SICP]: https://mitpress.mit.edu/sites/default/files/sicp/index.html "Structure and Interpretation of Computer Programs"

Second, we are going to presume that the array or list we're dealing with will not be mutated, at least not while we're working with it. That's certainly the case when writing functions that fold a list, like `sum`.

Given those two constraints, what problem are we trying to solve? As we noted, `const [first, ...rest] = someArray;` is expensive because it is implemented roughly as:

```javascript
const first = someArray[0];
const rest = someArray.slice(1);
```

And `.slice(1)` is expensive. Imagine an array with 10,000 elements!!! The first slice creates another array with 9,999 elements, the next with 9,998 elements, and so on.

So: *Our beginning step will be to make `.slice` less expensive.*

The technique we are going to use is called *structural sharing*. Let's review our two-element array implementation of lionked lists from above:

```javascript
const cons = (a, d) => [a, d],
      car  = ([a, d]) => a,
      cdr  = ([a, d]) => d;

const oneToFive = cons(1, cons(2, cons(3, cons(4, cons(5, null)))));
const twoToFive = cdr(oneToFive);
```

The variable `twoToFive` points to the second element in `oneToFive`'s list, and both of these lists _share the same four elements_:

<div class="mermaid">
graph LR
    R1(oneToFive)-->one(("[...]"))
    R2(twoToFive)-->two(("[...]"))
    one-- 0 -->a["1"]
    one-- 1 -->two
    two-- 0 -->b["2"]
    two-- 1 -->three(("[...]"))
    three-- 0 -->c["3"]
    three-- 1 -->four(("[...]"))
    four-- 0 -->d["4"]
    four-- 1 -->five(("[...]"))
    five-- 0 -->e["5"]
    five-- 1 -->null["fa:fa-ban null"];
</div>

---

# Note(s)