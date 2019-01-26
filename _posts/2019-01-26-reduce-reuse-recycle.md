---
layout: default
title: "Structural Sharing and Copy-on-Write Semantics, Part II: Reduce-Reuse-Recycle"
tags: [allonge, recursion, mermaid, noindex]
---

This is Part II of an essay that takes a highly informal look at two related techniques for achieving high performance when using large data structures: _Structural Sharing_, and _Copy-on-Write Semantics_. In [Part I], we used recursive functions that operate on lists to explore how we could use _Structural Sharing_ to write code that avoids making copies of objects while still retaining the semantics of code that makes copies.

[Part I]: /2019/01/14/structural-sharing-and-copy-on-write.html "Exploring Structural Sharing and Copy-on-Write Semantics, Part I"

Here in Part II, we'll consider **resource ownership**, starting with using copy-on-write semantics to implement safe mutation while still reserving structural sharing.

---

[![The Canonization of Blessed John XXIII and Blessed John Paul II](/assets/images/slice/canonicalization.jpg)](https://www.flickr.com/photos/113018453@N05/14002510232)

### a brief review of structural sharing

---

This is a brief review of what we convered in [Part I] for those who read it recently. If you haven't read it yet, consioder readinbg it in its entirety rather than trying to build on this incomplete explanation.

(*coming soon*)

Now that we've covered the basics, let's step back for a moment. In pure functional programming, data is [immutable]. This makes it much easier for humans and machines to reason about programs. We never have a pesky problem like passing an array to a `sum` function and having `sum` modify the array out from under us.

[immutable]: https://en.wikipedia.org/wiki/Immutable_object

But when programming in a multi-paradigm environment, we need to accomodate code that is written around mutable data structures. In JavaScript, we can write:

```javascript
const abasement = ['a', 'b', 'a', 's', 'e', 'm', 'e', 'n', 't'];

const bade = abasement.slice(1, 5);
bade[2] = 'd';

bade.join('')
  //=> "bade"

const bad = bade.slice(0, 3);

bad.join('')
  //=> "bad"
```

Modifying a slice of `abasement` does not modify the original array. But what happens with our `Slice` class? We haven't done anything to handle modifying elements, so as it turns out, we can set properties but they don't affect the underlying array that we use for things like further slices or joiining:

```javascript
let slice = Slice.of(abasement, 1, 5);
slice[2] = 'd';

slice.join('')
  //=> "base"
```

Just as we needed our proxy to mediate `[...]`, we also need our proxy to mediate `[...] =`. Let's make it so.

---

[![renovations](/assets/images/slice/renovations.jpg)](https://www.flickr.com/photos/rubygoes/28173260477)

---

### copy on write


In our structural sharing implementation, our slices depend upon the underlying array not mutating out from underneath them. Which _seems_ to imply that the Slices themselves have to be immutable. But not so: The slices do not depend upon each other, but upon the underlying array.

This makes it possible for us to modify a slice without modifying any other slices that depend upon the slice's original array... by making a copy of the slice's array before we write to it:

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
const oneToFive = Slice.of(a1to5);

oneToFive.atPut(2, 'three');
oneToFive[0] = 'uno';

a1to5
  //=> [1, 2, 3, 4, 5]
oneToFive
  //=> ['uno', 2, 'three', 4, 5]
```

When an element of the slice is modified, the slice invokes `.slice(...)` on the underlying array, and switches to using the value returned as its new underlying array. It then performs the modification of the new array.

<div class="mermaid">
  graph TD
    a["a1to5: [1, 2, 3, 4, 5]"]
    b["[1, 2, 'three', 4, 5]"]
    c["['uno', 2, 'three', 4, 5]"]

    b-. copy of .->a
    c-. copy of .->b

    d["oneToFive { from: 0, length: 5 }"]

    d-->|array:|c
</div>

This prevents the modification from affecting the original array, which may be shared by other slices, or by other code that expected it not to change.

This pattern is called [copy on write]. In effect, when we took a slice of the original array, we delayed making an actual copy until such time as we needed to make a copy to preserve the original array's values. When do we actually _need_ the copy? When we write to it, instead of reading from it.

[copy on write]: https://en.wikipedia.org/wiki/Copy-on-write

And if we never write to it, we win "bigly" by never making copies. Before we go on to implement other methods like `push`, `pop`, `unshift`, and `shift`, let's ask ourselves a question: *Must we always make a fresh copy on every write?*

Well, the first time we write something, we *have* to make a copy. The array that was passed to `Slice` in the constructor belonged to someone else. Absent a type system that understands mutable and immutable arrays, we must be conservative and assume that we should not modify the original.[^freeze]

[^freeze]: JavaScript has the notion of a frozen object, so if we're passed a frozen array, we certainly don't need to worry about anyone else modifying the array ot from under us. but likewise, we can't modify a frozen array ourselves, so it doesn't help us know whether the array that is used to construct the slice is safe to modify or not. So we'll be paranoid and assume that it is not safe to modify.

So the first time we write, we must copy.

What about after that? Well, after the first write, we have a new array that no other code shares (yet). So we can actually mutate it with abandon. Only when we share it with another piece of code must we revert to making a copy on writes. When do we share that array? When `.slice` is called, and if another object does a `get` on our `array` property.

We need to mediate other objects accessing our array with this scheme, so we'll store it in a symbol property. That's private enough to prevent accidental access. And if someone deliberately wants to break our encapsulation, there's nothing we can do about a determined programmer with a commit bit anyways.

So here is an updated version that only makes copies when necessary:

```javascript
const unsafeSymbol = Symbol('unsafe');
const arraySymbol = Symbol('array');

class Slice {
  static of(object, from = 0, length = Infinity) {
    if (object instanceof this) {
      const adjustedFrom = normalizedFrom(object, from);
      const adjustedLength = normalizedLength(object, from, length);

      return new this(object.array, object.from + adjustedFrom, adjustedLength);
    }
    if (object instanceof Array) {
      return new this(object, from, length);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.of([...object], from, length);
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
    this.makeUnsafe();

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

    return Slice.of(array.slice(from, length).concat(...args));
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
}

const oneToFive = Slice.of([1, 2, 3, 4, 5]);

oneToFive[0] = 'uno';
oneToFive[1] = "zwei";
oneToFive[2] = 'three';

const fourAndFive = oneToFive.slice(3);

oneToFive[3] = 'for';
oneToFive[4] = 'marun';

[...oneToFive]
  //=> ['uno', "zwei", 'three', 'for', 'marun']
[...fourAndFive]
  //=> [4, 5]
```

If we trace the code, we see that we made a copy when we invoked `oneToFive[0] = 'uno'`, because we can't make assumptions about the array provided to the constructor. We did not make a copy after `oneToFive[1] = "zwei"` or `oneToFive[2] = 'three'`, because we knew that we had our copy all to ourselves.

We then invoked `oneToFive.slice(3)`. We didn't make a copy, but we noted that we were no longer safe, so then when we called `oneToFive[3] = 'for'`, we made another copy. We then were safe again, so invoking `oneToFive[4] = 'marun'` did not make a third copy.

<div class="mermaid">
  graph TD
    a["[1, 2, 3, 4, 5]"]
    b["['uno', 'zwei', 'three', 4, 5]"]
    c["['uno', 'zwei', 'three', 'for', 'marun']"]

    b-. copy of .->a
    c-. copy of .->b

    d["oneToFive: { from: 0, length: 5 }"]
    e["fourAndFive: { from: 3, length: 2 }"]

    d-->|array:|c
    e-->|array:|b
</div>

The result is identical to the behaviour of making a copy every time we slice, or every time we write, but we're stingier about making copies when we don't need them.

And now, other destructive methods are literally a doddle:

```javascript
class Slice {

  // ...

  push(element) {
    this.makeSafe();

    const value = this[arraySymbol].push(element);
    this.length = this[arraySymbol].length;

    return value;
  }

  pop() {
    this.makeSafe();

    const value = this[arraySymbol].pop();
    this.length = this[arraySymbol].length;

    return value;
  }

  unshift(element) {
    this.makeSafe();

    const value = this[arraySymbol].unshift(element);
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

*(discuss on [hacker news](https://news.ycombinator.com/item?id=18903109) and [reddit](https://www.reddit.com/r/javascript/comments/afw0wu/structural_sharing_and_copyonwrite_semantics_in/); portions of this essay have previously appeared in the book [JavaScript Allongé][ja])*

[ja]: https://leanpub.com/javascriptallongesix

---

# Bonus Hack!

Lisp programmers used `car` and `cdr` in intricate ways. Although we've only looked at simple lists, cons cells could be used to make trees of arbitrary complexity, and the right sequence of `car` and `cdr` invocations could navigate a path to any element or sub-tree.

To facilitate this, Lisp had a system where any function name that started with `c`, ended with `r`, and had one or more `a` or `d` characters in between was automatically also a function, and it was implemented as if the functions `car` and `cdr` were composed in order.

For example, `(cadr list)` was equivalent to `(car (cdr list))`, which is the second element. If we wanted to really get Lisp-y, we would implement the same scheme...

This being JavaScript, we'll hack this idea with a proxy and synthetic properties. That way, we can destructure slices, like this:

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
        (value, accessor) => Slice.of(value)[accessor],
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

const oneToFive = Slice.of([1, 2, 3, 4, 5]);

const { car: first, cadr: second, cddr: rest } = oneToFive;

first
  //=> 1
second
  //=> 2
[...rest]
  //=> [3, 4, 5]
```

---

# The Complete Code

<script src="https://gist.github.com/raganwald/373af7dfbcc43862b088094af2cbbc7f.js"></script>

---

# End Notes
