---
layout: default
title: "Structural Sharing and Copy-on-Write Semantics, Part II: Reduce-Reuse-Recycle"
tags: [allonge, recursion, mermaid, noindex]
---

This is Part II of an essay that takes a highly informal look at two related techniques for achieving high performance when using large data structures: _Structural Sharing_, and _Copy-on-Write Semantics_.

In [Part I], we used recursive functions that operate on lists to explore how we could use _Structural Sharing_ to write code that avoids making copies of objects while still retaining the semantics of code that makes copies.

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
      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new Slice(object.array, object.from + from, to - from);
    }
    if (object instanceof Array) {
      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.of([...object], from, to);
    }
  }

  constructor(array, from, length) {
    this.array = array;
    this.from = normalizedFrom(array, from);
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

  slice (from, to = Infinity) {
    from = normalizedFrom(this, from);
    to = normalizedTo(this, from, to);

    return Slice.of(this.array, this.from + from, this.from + to);
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
      const rest = Slice.of(remaining, 1);

      return sumOfSlice(rest, runningTotal + first);
    }
  }
}

const oneToSeven = [1, 2, 3, 4, 5, 6, 7];

sum(oneToSeven)
  //=> 28
```
This covers the basics, but let's step back for a moment. In pure functional programming, data is [immutable]. This makes it much easier for humans and machines to reason about programs. We never have a pesky problem like passing an array to a `sum` function and having `sum` modify the array out from under us.

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

  set(slice, property, value) {
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

  atPut (i, value) {
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
const arraySymbol = Symbol('array');

class Slice {

  // ...

  constructor(array, from, length) {
    this[arraySymbol] = array;
    this.from = normalizedFrom(array, from);
    this.length = normalizedLength(array, from, length);
    this.makeUnsafe();

    return new Proxy(this, SliceHandler);
  }

  get array() {
    this.makeUnsafe();

    return this[arraySymbol];
  }

  makeUnsafe () {
    this.safe = false;
  }

  makeSafe () {
    const { [arraySymbol]: array, from, length, [safeSymbol]: safe } = this;

    if (!safe) {
      this[arraySymbol] = array.slice(from, length);
      this.from = 0;
      this.length = this[arraySymbol].length;
      this.safe = true;
    }
  }

  atPut (i, value) {
    this.makeSafe();

    const { [arraySymbol]: array, from, length } = this;

    this[arraySymbol] = array.slice(from, length);
    this.from = 0;
    this.length = this[arraySymbol].length;

    return this[arraySymbol][i] = value;
  }

  slice (from, to = Infinity) {
    this.makeUnsafe();

    from = normalizedFrom(this, from);
    to = normalizedTo(this, from, to);

    return Slice.of(this.array, this.from + from, this.from + to);
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

Our implementation of copy-on-write semantics is written as if the primary issue is whether it is safe for an instance of `Slice` to mutate its underlying array. Which is the case. But how do we decide?

- The slice's underlying array is safe to mutate if _The current slice is the only piece of code that could possibly own a reference to that array_.
- The slice's underlying array is not safe to mutate if _Other pieces of code that could share references to that array with the current slice_.

Another way to look at this is to ask whether the current slice *owns* the underlying array:

- If the slice doesn't share references to the underlying array, the slice owns the underlying array.
- If the slice might share references to the underlying array, the slice does not own the underlying array.

We don't have to rename all of our methods, but let's keep this concept in mind. In a structural sharing environment:

> A piece of code is safe to mutate a data structure if that piece of code owns the data structure.

Our code follows this thinking with respect to modifying the slice's underlying array after the slice has been constructed. But hang on! Recall that when we construct a new slice, we always begin with it being unsafe, meaning that we may share a reference to the array being passed in.

But what if we knew that we were the only ones with a reference to the array? This is extremely difficult to guarantee mechanically, but if we rely on the code that creates an instance of `Slice` to tell us whether the array being passed is ours to own, we take that into account when creating a new instance.

So our new version of the constructor will take a parameter, `safe`, indicating whether the slice is safe. Our first pass at our existing `of` static method will always indicate that the array being passed is unsafe, just as we do now.

```javascript
class Slice {
  static of(object, from = 0, to = Infinity) {
    if (object instanceof this) {
      const safe = false;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new Slice(object.array, object.from + from, to - from, safe);
    }
    if (object instanceof Array) {
      const safe = false;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from, safe);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.of([...object], from, to);
    }
  }

  constructor(array, from, length, safe = false) {
    this[arraySymbol] = array;
    this.from = normalizedFrom(array, from);
    this.length = normalizedLength(array, from, length);
    this.safe = safe;

    return new Proxy(this, SliceHandler);
  }
}
```

Wait, what happens when we call `Slice.of` with an object that is not an array and not another instance of slice? If it's iterable, we make a new array using `[...object]`, and then pass that to the constructor to make a new slice.

Well, if we're making an array with ]`[...object]`, and we don't do anything else with the array, the new array we're passing to `Slice.of` is one that won't be used anywhere else, so it is safe:

```javascript
class Slice {
  static of(object, from = 0, to = Infinity) {
    if (object instanceof this) {
      const safe = false;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new Slice(object.array, object.from + from, to - from, safe);
    }
    if (object instanceof Array) {
      const safe = false;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from, safe);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      const safe = true;
      const array = [...object];

      from = normalizedFrom(array, from);
      to = normalizedTo(array, from, to);

      return new Slice(array, from, to, safe);
    }
  }

  // ...

}

function * countTo (n) {
  let i = 1;
  while (i <= n) {
    yield i++;
  }
}

const arrayToTen = Slice.of([...countTo(10)]);
const oneToTen = Slice.of(countTo(10));

arrayToTen.safe
  //=> false

oneToTen.safe
  //=> true
```

There will be other times that a piece of code will want to create a slice of an object, but know that the object is no longer owned. In effect, and object is being given to the `Slice` glass. To represent this, we'll create a new static method. `.given`:

```javascript
class Slice {
  static given(object, from = 0, to = Infinity) {
    if (object instanceof this) {
      const safe = object.safe;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new Slice(object[arraySymbol], object.from + from, to - from, safe);
    }
    if (object instanceof Array) {
      const safe = true;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from, safe);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.given([...object], from, to);
    }
  }

  // ...

}

const unsafeTen = Slice.of([...countTo(10)]);
const safeTen = Slice.given([...countTo(10)]);

unsafeTen.safe
  //=> false

safeTen.safe
  //=> true

const givenUnsafeTen = Slice.of(unsafeTen);
const givenSafeTen = Slice.given(safeTen]);

givenUnsafeTen.safe
  //=> false

givenSafeTen.safe
  //=> true

givenUnsafeTen === unsafeTen
  //=> false

givenSafeTen === safeTen
  //=> false
```

When `Slice.given` is passed another slice, the slice it returns is safe if the object passed was safe. If that object owned its array, and that object will not be accessed again, then the array is safe for the newly created slice. In effect, we are given the slice, but necessarily the array backing it.

Hmmmm... If that slice is no longer needed, why are we creating another instance of `Slice`? We can reuse the one that already exists:

```javascript
class Slice {
  static given(object, from = 0, to = Infinity) {
    if (object instanceof this) {
      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      object.from = object.from + from;
      object.length = to - from;

      return object;
    }
    if (object instanceof Array) {
      const safe = true;

      from = normalizedFrom(object, from);
      to = normalizedTo(object, from, to);

      return new this(object, from, to - from, safe);
    }
    if (typeof object[Symbol.iterator] === 'function') {
      return this.given([...object], from, to);
    }
  }

  // ...

}

const unsafeTen = Slice.of([...countTo(10)]);
const safeTen = Slice.given([...countTo(10)]);

unsafeTen.safe
  //=> false

safeTen.safe
  //=> true

const givenUnsafeTen = Slice.of(unsafeTen);
const givenSafeTen = Slice.given(safeTen]);

givenUnsafeTen.safe
  //=> false

givenSafeTen.safe
  //=> true

givenUnsafeTen === unsafeTen
  //=> true

givenSafeTen === safeTen
  //=> true
```

---

### given in action

The recursive function `sum` was given above. It looks like this:

```javascript
function sum (array) {
  return sumOfSlice(Slice.of(array), 0);

  function sumOfSlice (remaining, runningTotal) {
    if (remaining.length === 0) {
      return runningTotal;
    } else {
      const first = remaining[0];
      const rest = Slice.given(remaining, 1);

      return sumOfSlice(rest, runningTotal + first);
    }
  }
}
```

When we invoke `sum([1, 2, 3, 4, 5, 6, 7])`, the outer function creates a new slice out of the original array, and then it calls `someOfSlice`, which calls itself 7 times, each time invoking `Slice.of` and creating a new instance of `Slice`. The net result is that eight slices are created. This may be much less memory than copying slices out of a long array, but it's unnecessary.

In this formulation, `sumOfSlice` invokes `Slice.given` instead of `Slice.of`. The only objects passed to `sumOfSlice` are slices created for this function. And having created a slice, it is not used again after being passed to `sumOfSlice`. Therefore, we can use `.given`, and the code recycles the same slice over and over again.

```javascript
function sum (array) {
  return sumOfSlice(Slice.of(array), 0);

  function sumOfSlice (remaining, runningTotal) {
    if (remaining.length === 0) {
      return runningTotal;
    } else {
      const first = remaining[0];
      const rest = Slice.given(remaining, 1);

      return sumOfSlice(rest, runningTotal + first);
    }
  }
}
```

Now when we invoke `sum([1, 2, 3, 4, 5, 6, 7])`, the outer function creates a new slice out of the original array as before, and then it calls `someOfSlice`, which calls itself 7 times as before. But now, each time it is called, it invokes `Slice.given`. That reuses the existing slice. The net result is that only one slice is created.

---

# The Complete Code

<script src="https://gist.github.com/raganwald/373af7dfbcc43862b088094af2cbbc7f.js"></script>

---

# End Notes
