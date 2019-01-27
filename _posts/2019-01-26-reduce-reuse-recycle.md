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

---

### a brief review of structural sharing

In [Part I], we created the `Slice` class, with its static method `Slice.of(...)`. Instances of `slice` implement slices of JS arrays, but use structural sharing to keep the cost of creating a slice constant, rather than order-n.:

```javascript
//
// http://raganwald.com/2019/01/14/structural-sharing-and-copy-on-write.html
//

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

function normalizedTo(arrayIsh, from, to) {
    from = normalizedFrom(arrayIsh, from);

    to = Math.max(to, 0);
    to = Math.min(arrayIsh.length, to);

    return to;
}

class Slice {
  static of(object, from = 0, to = Infinity) {
    if (object instanceof this) {
      from = normalizedFrom(this, from, length);
      to = normalizedTo(this, from, to);

      return new Slice(object.array, object.from + from, to - from);
    }
    if (object instanceof Array) {
      from = normalizedFrom(object, from, length);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.of([...object], from, to);
    }
  }

  constructor(array, from, length) {
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

  join(separator = ",") {
    const { array, from, length } = this;

    if (length === 0) {
      return '';
    } else {
      let joined = array[from];

      for (let i = 1; i < this.length; ++i) {
        joined = joined + separator + array[from + i];
      }

      return joined;
    }
  }

  toString() {
    return this.join();
  }

  slice(from, to = Infinity) {
    from = normalizedFrom(this, from, length);
    to = normalizedTo(this, from, to);

    return new Slice(this.array, this.from + from, to - from);
  }

  has(i) {
    const { array, from, length } = this;

    if (i >= 0 && i < length) {
      return (from + i) in array;
    } else {
      return false;
    }
  }

  at(i) {
    const { array, from, length } = this;

    if (i >= 0 && i < length) {
      return array[from + i];
    }
  }

  concat(...args) {
    const { array, from, length } = this;

    return Slice.of(array.slice(from, length).concat(...args));
  }

  get [Symbol.isConcatSpreadable]() {
    return true;
  }
}

function sum (array) {
  return sumOfSlice(Slice.of(array), 0);

  function sumOfSlice (remaining, runningTotal) {
    if (remaining.length === 0) {
      return runningTotal;
    } else {
      const first = remaining[0];
      const rest = remaining.slice(1);

      return sumOfSlice(rest, runningTotal + first);
    }
  }
}
```
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

Modifying a slice of `abasement` does not modify the original array. But what happens with our `Slice` class? We haven't done anything to handle modifying elements, so as it turns out, we can set properties but they don't affect the underlying array that we use for things like further slices or joining:

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
    const { array, from, length } = this;

    this.array = array.slice(from, length);
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
[...oneToFive]
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

  // ...

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

  makeUnsafe () {
    this[unsafeSymbol] = true;
  }

  makeSafe () {
    const { [arraySymbol]: array, from, length, [unsafeSymbol]: unsafe } = this;

    if (unsafe) {
      this[arraySymbol] = array.slice(from, length);
      this.from = 0;
      this.length = this[arraySymbol].length;

      this[unsafeSymbol] = false;
    }
  }

  atPut(i, value) {
    this.makeSafe();

    const { [arraySymbol]: array, from, length } = this;

    this[arraySymbol] = array.slice(from, length);
    this.from = 0;
    this.length = this[arraySymbol].length;

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

And now, emulating other `Array.prototype` methods that modify the underlying array is easy. For example:

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

We could go on implementing other array-ish methods for our `Slice` class, but let's reëxamine what we have been doing.

---

[![Arenberg Mine](/assets/images/slice/arenberg.jpg)](https://www.flickr.com/photos/torsten_frank/26481614736/)

---

### resource ownership

*blah, blah, blah.*

---

# The Complete Code

<script src="https://gist.github.com/raganwald/373af7dfbcc43862b088094af2cbbc7f.js"></script>

---

# End Notes
