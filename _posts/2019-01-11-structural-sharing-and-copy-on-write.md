---
layout: default
title: "Structural Sharing and Copy-on-Write Semantics"
tags: [allonge, recursion, mermaid]
---

In this essay, we're going to take a look at two related techniques for achieving high performance when using large data structures: _Structural Sharing_, and _Copy-on-Write Semantics_. To give us some context for exploring these techniques, we're going to solve a very simple problem: Programming in a Lisp-like recursive style, while using JavaScript arrays.

We'll start at the beginning. The beginning of functional programming, in fact.

---

![The IBM 704](/assets/images/IBM704.jpg)

---

###  wherein we travel back in time to the dawn of functional programming

Once upon a time, there was a programming language called [Lisp], an acronym for LISt Processing.[^lisp] Lisp was one of the very first high-level languages, the very first implementation was written for the [IBM 704] computer. (The very first FORTRAN implementation was also written for the 704).

[Lisp]: https://en.wikipedia.org/wiki/Lisp_(programming_language)
[IBM 704]: https://en.wikipedia.org/wiki/IBM_704

[^lisp]: [Lisp] is still very much alive, and one of the most interesting and exciting programming languages in use today is [Clojure], a Lisp dialect that runs on the JVM, along with its sibling [ClojureScript], Clojure that transpiles to JavaScript. Clojure and ClojureScript both make extensive use of structural sharing and copy-on-write semantics to achieve high performance. By default.

[Clojure]: http://clojure.org/
[ClojureScript]: https://github.com/clojure/clojurescript

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
  //=> [1,[2,[3,[4,[5, null]]]]]
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
  //=> [2,[3,[4,[5, null]]]]
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

function sum (linkedList, runningTotal = 0) {
  if (linkedList == null) {
    return runningTotal;
  } else {
    const first = car(linkedList);
    const rest = cdr(linkedList);

    return sum(rest, runningTotal + first);
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

But what about today's JavaScript? Today, we can write a list with an array. And we can get the `first` and `rest` with `[0]` and `.slice(1)`:

```javascript
function sum (array, runningTotal = 0) {
  if (array.length === 0) {
    return runningTotal;
  } else {
    const first = array[0];
    const rest = array.slice(1);

    return sum(rest, runningTotal + first);
  }
}

const oneToFive = [1, 2, 3, 4, 5];

sum(oneToFive)
  //=> 15
```

Like `car`, calling `array[0]` is fast. But when we invoke `array.slice(1)`, JavaScript makes a new array that is a copy of the old array, omitting element `0`. That is much slower, and since these copies are temporary, hammers away at the garbage collector.

We're only working with five elements at a time, so we can afford to chuckle at the performance implications. But if we start operating on long lists, all that copying is going to bury us under a mound of garbage. Of course, we could switch to linked lists in JavaScript. But the cure would be worse than the disease.

Nobody wants to read code that looks like `cons(1, cons(2, cons(3, cons(4, cons(5, null)))))`. And sometimes, we want to access arbitrary elements of a list. With a linked list, we have to traverse the list element by element to get it:

```javascript
function at (linkedList, index) {
  if (linkedList == null) {
    return undefined;
  } else if (index === 0) {
    return car(linkedList);
  } else {
    return at(cdr(linkedList), index - 1);
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

Let's start with a couple of very modest requirements. First, what we're building is for the case when we want to process arrays in a `[0]` and `.slice(1)`, style, usually recursively.

(Most of the time, we don't want to do process lists in this style. But when we do--perhaps we are playing with a recursive algorithm we read about in a book like [SICP], perhaps we want to refactor such an algorithm step-by-step--we want the performance to be "not embarrassing.")

[SICP]: https://mitpress.mit.edu/sites/default/files/sicp/index.html "Structure and Interpretation of Computer Programs"

Second, we are going to presume that the array we're dealing with will not be mutated, at least not while we're working with it. That's certainly the case when writing functions that fold a list, like `sum`.

Given those two constraints, what problem are we trying to solve? As we noted, `.slice(1)` is expensive because it is implemented by copying arrays. Imagine an array with 10,000 elements!!! The first slice creates another array with 9,999 elements, the next with 9,998 elements, and so on.

So: *Our beginning step will be to make `.slice` less expensive.*

The technique we are going to use is called *structural sharing*. Let's review our two-element array implementation of linked lists from above:

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

As long as we don't want to destructively modify any part of a list that is being shared, this scheme works beautifully.

We are not going to use cons cells or two-element arrays, but we are going to share structure, and as noted, we are going to have to avoid any kind of operation that modifies an existing list in such a way that it affects other variables that are sharing its structure.

So what will our technique be? Well, we are going to create a data structure that behaves enough like an array that we can write things like `const first = arrayLikeDataStructure[0];` and `const rest = arrayLikeDataStructure.slice(1)`, and they will work. But of course, our implementation won't copy arrays. Instead, it will share the array.

We'll begin with a class representing a slice of an array. Although we don't need them directly for our purposes, we'll implement an iterator and a `.toString()` method for debugging purpose:[^strict]

[^strict]: All of this code requires the engine to implement strict JavaScript semantics. Some engines can be configured in "loose" mode, where their implementation of things like destructuring may vary from the standard.

```javascript
class Slice {
  constructor(array, from = 0, length = array.length) {
    if (from < 0) {
      from = from + array.length;
    }
    from = Math.max(from, 0);
    from = Math.min(from, array.length);

    length = Math.max(length, 0);
    length = Math.min(length, array.length - from);

    this.array = array;
    this.from = normalizedFrom(array, from, length);
    this.length = normalizedLength(array, from, length);
  }

  * [Symbol.iterator]() {
    const { array, from, length } = this;

    for (let i = 0; i < length; i++) {
      yield array[i + from];
    }
  }

  toString() {
    return [...this].join(',');
  }
}

const a1to5 = [1, 2, 3, 4, 5];
const fromTwo = new Slice(a1to5, 2);

fromTwo.toString()
  //=> "3,4,5"

[...fromTwo]
  //=> [3, 4, 5]
```

We'll now want to add support for `[0]` and `.slice(1)`. Slice is straightforward, so we'll do it first. And e'll extract some duplication from the constructor while we're at it:

```javascript
function normalizedFrom(arrayIsh, from = 0) {
    if (from < 0) {
      from = from + arrayIsh.length;
    }
    from = Math.max(from, 0);
    from = Math.min(from, arrayIsh.length);

    return from;
}

function normalizedLength(arrayIsh, from, length = arrayIsh.length) {
    from = normalizedFrom(arrayIsh, from);

    length = Math.max(length, 0);
    length = Math.min(length, arrayIsh.length - from);

    return length;
}

class Slice {
  constructor(array, from, length) {
    this.array = array;
    this.from = normalizedFrom(array, from, length);
    this.length = normalizedLength(array, from, length);
  }

  // ...

  slice(from, length) {
    from = normalizedFrom(this, from, length);
    length = normalizedLength(this, from, length);

    return new Slice(this.array, this.from + from, length);
  }
}

const a1to5 = [1, 2, 3, 4, 5];
const fromZero = new Slice(a1to5, 0);
const fromOne = fromZero.slice(1);

[...fromOne]
  //=> [2, 3, 4, 5]
```

To make it work with `[0]`, we need to implement `[]`. Implementing `[]` just for `0` is easy, but if we implement just `[0]`, we're begging for a bug later when somebody thinks they can use `[1]`. What we want instead is a way to allow any indexed access, and properly access the correct element of the underlying array, and without allowing access beyond our slice's dimension.

To do that, we'll use a [Proxy] to handle indexed access.

[Proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy

---

[![remote-control-locomotives-sign](/assets/images/slice/remote-control.jpg)](https://www.flickr.com/photos/mobikefed/320810615)

---

### meta-programming with proxies

A [Proxy] is an object that "stands in" for another object, called the _target_ in JavaScript's documentation. The idea is that the proxy implements the desired behaviour of the object, so we can interact with the proxy as if it was the original.

Proxies have a number of interesting uses. One is to decorate functionality. If we wanted to log changes to a model object, one way to do that is to decorate the model's methods with logging code. That's the "aspect-oriented programming" approach: Add functionality to the target in a structured way.

A proxy approach would be to create a proxy for the target model, and the proxy object could implement the logging while forwarding the method invocations to the target. That separates concerns in a different way than decorating methods separates concerns. The decoration is aggregated in the proxy.

Proxies in JavaScript also provide the only way to perform dynamic method dispatch. Famously, the Ruby programming language provides a `method_missing` hook that allows any class to define code to handle methods that do not have concrete implementations. JavaScript does not bake that into every object. Instead, it makes this type of functionality available in proxies via specific hooks for getting and setting properties.

A proxy associates a target object with a _handler_ object that contains—surprise—handlers for various hooks. Each hook controls a specific type of behaviour.

Initially, we'll add a `has` hook and a `get` hook to our `Slice` objects. The net effect of the `has` hook is that every time another piece of code tries to determine whether our slice instances have a particular property, the handler intercepts the detection and can return `true` or `false` itself.

The `get` hook works similarly, only it is responsible for returning a value whenever another piece of code performs a property access. As a rule, it makes sense to implement these two methods in tandem.

In our case, our `Slice` instances do not have any properties for `0`, `1`, `2`, &c. So if we want to be able to access the elements of the underlying array with code like `someSlice[3]`, we need to handle the attempt to `get(slice, '3')` and forward it to a method we'll write on `Slice`, `at(...)`.

Of course, methods in JavaScript are functions bound to properties, so our `has` and `get` handlers always check to see if the target slice already has a property. If so, it delegates the access back to the target.

```javascript
const SliceHandler = {
  has (slice, property) {
    if (property in slice) {
      return true;
    }

    if (typeof property === 'symbol') {
      return false;
    }

    const matchInt = property.match(/^\d+$/);
    if (matchInt != null) {
      const i = parseInt(property);

      return slice.has(i);
    }
  },

  get (slice, property) {
    if (property in slice) {
      return slice[property];
    }

    if (typeof property === 'symbol') {
      return;
    }

    const matchInt = property.match(/^\d+$/);
    if (matchInt != null) {
      const i = parseInt(property);
      return slice.at(i);
    }
  }
};
```

We also modify the `Slice` class. We implement `has` and `at` methods that understand the way indexes work relative to the slice's boundaries, and we also modify the constructor to return a proxy that uses our handler to mediate access to the slice.

```javascript
class Slice {
  constructor(array, from = 0, length = array.length) {
    if (from < 0) {
      from = from + array.length;
    }
    from = Math.max(from, 0);
    from = Math.min(from, array.length);

    length = Math.max(length, 0);
    length = Math.min(length, array.length - from);

    this.array = array;
    this.from = normalizedFrom(array, from, length);
    this.length = normalizedLength(array, from, length);

    return new Proxy(this, SliceHandler);
  }

  * [Symbol.iterator]() {
    const { array, from, length } = this;

    for (let i = 0; i < length; i++) {
      yield array[i + from];
    }
  }

  toString() {
    return [...this].join(',');
  }

  has(i) {
    if (i >= 0 && i < this.length) {
      return (this.from + i) in this.array;
    } else {
      return false;
    }
  }

  at(i) {
    if (i >= 0 && i < this.length) {
      return this.array[this.from + i];
    }
  }

  slice(from, length) {
    from = normalizedFrom(this, from, length);
    length = normalizedLength(this, from, length);

    return new Slice(this.array, this.from + from, length);
  }
}

const a1to5 = [1, 2, 3, 4, 5];
const fromZero = new Slice(a1to5, 0);
const fromLast = new Slice(a1to5, -1);

fromZero[0]
  //=> 1
fromLast[0]
  //=> 5
```

In effect, our slice is a proxy (lower-case "p") for the underlying array, and we are now returning a `Proxy` (upper-case "P") for the slice. That's two layers of proxies, and doubtless we are all thinking of the famous aphorism "All problems in computer engineering can be solved by another level of indirection, except for the problem of too many layers of indirection."[^indirection]

[^indirection]: David Wheeler is credited with what is often called [The Fundamental Theorem of Software Engineering](https://en.wikipedia.org/wiki/Fundamental_theorem_of_software_engineering), "We can solve any problem by introducing an extra level of indirection." The wording has evolved over time, and the corollary "...except for the problem of too many layers of indirection" is almost always quoted at the same time.

And now we can implement one last thing, a static factory method for making `Slice` objects out of other things. Now we can use `Slice` to make our recursive functions "not embarrassing:"

```javascript
class Slice {
  static from(object) {
    if (object instanceof this) {
      return object;
    }
    if (object instanceof Array) {
      return new this(object);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return new this([...object]);
    }
  }

  /// remainder of the class
}

function sum (array, runningTotal = 0) {
  array = Slice.from(array);

  if (array.length === 0) {
    return runningTotal;
  } else {
    const first = array[0];
    const rest = array.slice(1);

    return sum(rest, runningTotal + first);
  }
}

const oneToFive = [1, 2, 3, 4, 5];

sum(oneToFive)
  //=> 15
```
No more copies!

---

[![List (2007)](/assets/images/slice/list.jpg)](https://www.flickr.com/photos/liste1/3030809956)

---

### more array-ish behaviour

We did't need to implement an iterator, but it should be noted that since it has an iterator, we get a lot of JavaScript array-ish behaviour. For example, in strict mode, the iterator is used when destructuring. So if we want to, we _can_ write:

```javascript
const a1to5 = [1, 2, 3, 4, 5];
const oneToFive = Slice.from(a1to5);
const [first, ...rest] = oneToFive;

first
  //=> 1
rest
  //=> [2, 3, 4, 5]
```

Unfortunately, destructuring an iterable with the spread operator always creates a new array in JavaScript, so our `Slice` class can't help us make `const [first, ...rest] = someSlice;` not embarrassing. Iterators work with the spread operator in expressions as well:

```javascript
const abc = ['a', 'b', 'c'];
const oneTwoThree = Slice.from([1, 2, 3]);

[...abc, ...oneTwoThree]
  //=> ["a", "b", "c", 1, 2, 3]
```

And they get us `for... of` loops:

```javascript
const abc = ['a', 'b', 'c'];

const alphabet = {};

for (const letter of Slice.from(abc)) {
  alphabet[letter] = letter;
}

alphabet
  /=> {a: "a", b: "b", c: "c"}
```

When we dive deeply into the spec, we uncover `Symbol.isConcatSpreadable`. Forcing it to be `true` gets us array spread concatenation behaviour. While we're at it, we can implement `.concat`:

```javascript
class Slice {

  /// ...

  concat(...args) {
    const { array, from, length } = this;

    return Slice.from(array.slice(from, length).concat(...args));
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
}

const abc = ['a', 'b', 'c'];
const oneTwoThree = Slice.from([1, 2, 3]);

abc.concat(oneTwoThree)
  //=> ["a", "b", "c", 1, 2, 3]
```

Of course, the biggest array-like behaviour our slices are missing is that we haven't implemented any of the methods for modifying our slices.

---

[![renovations](/assets/images/slice/renovations.jpg)](https://www.flickr.com/photos/rubygoes/28173260477)

---

### copy on write

As we noted, our slices depend upon the underlying array not mutating out from underneath them. Which implies that the Slices themselves have to be immutable. But not so: The slices do not depend upon each other, but upon the underlying array. Which makes the following possible:

```javascript
const SliceHandler = {

  // ...

  set (slice, property, value) {
    if (typeof property === 'string') {
      const matchInt = property.match(/^\d+$/);
      if (matchInt != null) {
        const i = parseInt(property);
        return slice.atPut(i, value);
      }
  	}

    return slice[property] = value;
  }
}

class Slice {

  // ...

  atPut(i, value) {
    this.array = this.array.slice(this.from, this.length);
    this.from = 0;
    this.length = this.array.length;

    return this.array[i] = value;
  }
}

const a1to5 = [1, 2, 3, 4, 5];
const oneToFive = Slice.from(a1to5);

oneToFive.atPut(2, "three");
oneToFive[0] = "uno";

a1to5
  //=> [1, 2, 3, 4, 5]
oneToFive
  //=> ["uno", 2, "three", 4, 5]
```

When an element of the slice is modified, the slice actually takes a slice of the underlying array and switches to using the slice as its new underlying array. It then performs the modification of the new array.

This prevents the modification from affecting the original array, which may be shared by other slices, or by other code that expected it not to change.

This pattern is called [copy on write]. In effect, when we took a slice of the original array, we delayed making an actual copy until such time as we needed to make a copy to preserve the original array's values. When do we actually _need_ the copy? When we write to it, instead of reading from it.

[copy on write]: https://en.wikipedia.org/wiki/Copy-on-write

And if we never write to it, we win "bigly" by never making copies. Before we go on to implement other methods like `push`, `pop`, `unshift`, and `shift`, let's make ask a question: Once we make a copy, must we keep making copies on every write?

Well, the first time we write something, we *have* to make a copy. The array that was passed to `Slice` in the constructor belonged to someone else. Absent a type system that understands mutable and immutable arrays, we must be conservative and assume that we should not modify the original.

So the first time we write, we must copy.

What about after that? Well, after the first write, we have a new array that no other code shares (yet). So we can actually mutate it with abandon. Only when we share it with another piece of code must we revert to making a copy on writes. When do we share that array? When `.slice` is called.

We need to mediate other objects accessing our array with this scheme, so we'll store it in a symbol property. That's private enough to prevent accidental access. And if someone deliberately wants to break our encapsulation, there's nothing we can do about a determined programmer with a commit bit anyways.

So here is an updated version that only makes copies when necessary:

```javascript
const unsafeSymbol = Symbol('unsafe');
const arraySymbol = Symbol('array');

class Slice {
  static from(object) {
    if (object instanceof this) {
      return object;
    }
    if (object instanceof Array) {
      return new this(object);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return new this([...object]);
    }
  }

  constructor(array, from, length) {
    this[arraySymbol] = array;
    this.from = normalizedFrom(array, from, length);
    this.length = normalizedLength(array, from, length);
    this.makeUnsafe();

    return new Proxy(this, SliceHandler);
  }

  * [Symbol.iterator]() {
    const { [arraySymbol]: array, from, length } = this;

    for (let i = 0; i < length; i++) {
      yield array[i + from];
    }
  }

  toString() {
    return [...this].join(',');
  }

  has(i) {
    if (i >= 0 && i < this.length) {
      return (this.from + i) in this[arraySymbol];
    } else {
      return false;
    }
  }

  get array() {
    this.unsafe = true;

    return this[arraySymbol];
  }

  at(i) {
    if (i >= 0 && i < this.length) {
      return this[arraySymbol][this.from + i];
    }
  }

  makeSafe () {
    if (this.unsafe) {
      this[arraySymbol] = this[arraySymbol].slice(this.from, this.length);
      this.from = 0;
      this.length = this[arraySymbol].length;
      this.unsafe = false;
    }
  }

  makeUnsafe () {
    this.unsafe = true;
  }

  atPut(i, value) {
    this.makeSafe();

    return this[arraySymbol][i] = value;
  }

  slice(from, length) {
    this.makeUnsafe();

    from = normalizedFrom(this, from, length);
    length = normalizedLength(this, from, length);

    return new Slice(this[arraySymbol], this.from + from, length);
  }

  concat(...args) {
    const { [arraySymbol]: array, from, length } = this;

    return Slice.from(array.slice(from, length).concat(...args));
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
}

const oneToFive = Slice.from([1, 2, 3, 4, 5]);

oneToFive[0] = "uno";
oneToFive[1] = "zwei";
oneToFive[2] = "three";

const subSlice = oneToFive.slice(3);

oneToFive[3] = "for";
oneToFive[4] = "marun";

[...oneToFive]
  //=> ["uno", "zwei", "three", "for", "marun"]
[...fourAndFive]
  //=> [4, 5]
```

If we trace the code, we see that we made a copy when we invoked `oneToFive[0] = "uno"`, because we can't make assumptions about the array provided to the constructor. We did not make a copy after `oneToFive[1] = "zwei"` or `oneToFive[2] = "three"`, because we knew that we had our copy all to ourselves.

We then invoked `oneToFive.slice(3)`. We didn't make a copy, but we noted that we were no longer safe, so then when we called `oneToFive[3] = "for"`, we made another copy. We then were safe again, so invoking `oneToFive[4] = "marun"` did not make a third copy.

The behaviour is identical to the behaviour of making a copy every time we slice, or every time we write, but we're stingier about making copies when we don't need them.

And now, other destructive methods are literally a doddle:

```javascript
class Slice {

  // ...

  push(element) {
    this.makeSafe();

    cont value = this[arraySymbol].push(element);
    this.length = this[arraySymbol].length;

    return value;
  }

  pop() {
    this.makeSafe();

    cont value = this[arraySymbol].pop();
    this.length = this[arraySymbol].length;

    return value;
  }

  unshift(element) {
    this.makeSafe();

    cont value = this[arraySymbol].unshift(element);
    this.length = this[arraySymbol].length;

    return value;
  }

  shift() {
    this.makeSafe();

    const value = this[arraySymbol].shift();
    this.length = this[arraySymbol].length;

    return value;
  }
}
```

We could go on implementing other array-ish methods for our `Slice` class, but we've implemented a few major concepts that are worth revisiting.

---

[![ideas](/assets/images/slice/ideas.jpg)](https://www.flickr.com/photos/lilivanili/6182926356)

---

### wrapping up

We set out with the purpose of writing some code that would allow us to use JavaScript arrays in a Lisp-like style, without the heavy penalty of making lots and lots of copies. To do that, we implemented **structural sharing**. We added a `Proxy` to give our new class indexed access to the elements of our `Slice` class, and then we then moved on the implement **[copy on write]** semantics, with an optimization of only performing the copy when our underlying array is "unsafe."

While these techniques are far too heavyweight for a simple task like writing a `sum` function in the style favoured by Lisp programmers of the 1960s and 1970s, that task was small enough and simple enough to allow us to focus on the implementation of these techniques, rather than on the problem of the domain.

These techniques may seem exotic at first, but they form the basis for high-performance implementation of large data structures. And many other languages, such as [Clojure], bake these semantics right in. If JavaScript worked like Clojure, there would be no need to implement a `Slice` class, because arrays would already have structural sharing and copy-on-write semantics. So calling `.slice` would be inexpensive, right out of the box.

Until the day that JavaScript gets such data structures in its standard library, we'll have to Greenspun the functionality ourselves, or use a library such as David Nolen's [Mori].

[Mori]: http://swannodette.github.io/mori/

*(portions of this essay have previously appeared in the book [JavaScript Allongé][ja])*

[ja]: https://leanpub.com/javascriptallongesix

---

# Bonus Hack!

Lisp programmers didn't just use `car` and `cdr` functions, Lisp had a system where any function name that started with `c`, ended with `r`, and had one or more `a`s or `d`s in between was a function, and it was implemented as if the functions `car` and `cdr` were composed in order.

So where `(car list)` provided the first element of the list, `(cadr list)` was equivalent to `(car (cdr list))`, which is the second element. If we wanted to really get Lisp-y, we would implement the same scheme... Perhaps with properties we could destructure rather than with functions, like this:

Something like this:

```javascript
const SliceHandler = {
  has (slice, property) {
    if (property in slice) {
      return true;
    }

    if (typeof property === 'symbol') {
      return false;
    }

    const matchInt = property.match(/^\d+$/);
    if (matchInt != null) {
      const i = parseInt(property);

      return slice.has(i);
    }

    const matchCarCdr = property.match(/^c([ad]+)r$/);
    if (matchCarCdr != null) {
      return true;
    }
  },

  get (slice, property) {
    if (property in slice) {
      return slice[property];
    }

    if (typeof property === 'symbol') {
      return;
    }

    const matchInt = property.match(/^\d+$/);
    if (matchInt != null) {
      const i = parseInt(property);
      return slice.at(i);
    }

    const matchCarCdr = property.match(/^c([ad]+)r$/);
    if (matchCarCdr != null) {
      const [, accessorString] = matchCarCdr;
      const accessors = accessorString.split('').map(ad => `c${ad}r`);
      return accessors.reduceRight(
        (value, accessor) => Slice.from(value)[accessor],
        slice);
    }
  }
};

class Slice {

  // ...

  get car() {
    return this.at(0);
  }

  get cdr() {
    return this.slice(1);
  }

}

const oneToFive = Slice.from([1, 2, 3, 4, 5]);

const { car: first, cadr: second, cddr: rest } = oneToFive;

first
  //=> 1
second
  //=> 2
[...rest]
  //=> [3, 4, 5]
```

---

# End Notes