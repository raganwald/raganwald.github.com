---
title: "Transducers"
layout: default
tags: [allonge, noindex]
---

In [Using iterators to write highly composeable code][part-i], we took a look at a data transformation and analysis algorithm, and saw that the obvious [staged approach] was highly decomposed, but presented a performance problem in that it created excess duplicates of the entire data set.

Whereas the [singe pass approach] was much more memory-efficient, but the code was entangled and monolithic. On a problem small enough to fit in a blog post this isn't a massive problem, but it's easy to see how such an approach in production leads to highly coupled, fragile code that cannot be easily factored or decomposed.

[part-i]: http://raganwald.com/2017/04/19/incremental.html
[staged approach]: http://raganwald.com/2017/04/19/incremental.html#I
[singe pass approach]: http://raganwald.com/2017/04/19/incremental.html#II

We concluded by looking at a [stream approach]. In the stream approach, we process the data in stages, but by using iterators and generators, we were able to process the data one datum at a time. This gave us the factorability of the staged approach, with the memory footprint of the single pass approach.

[stream approach]: http://raganwald.com/2017/04/19/incremental.html#III

Now we're going to look at another very promising approach for building composeable pipelines of transformations without incurring a memory penalty: **Transducers**,

### transducers

Transducers are a generalized and composeable form of _reducers_. So let's push "transducers" on the stack, and ask, "What is a reducer?"

A **reducer** is a function that takes an accumulation and a value, and folds the value into the accumulation. For example, if `[1, 2, 3]` is an accumulation and `4` is a value, `(acc, val) => acc.concat([val])` is a reducer that returns `[1, 2, 3, 4]`. `(acc, val) => acc.concat([val])` is a function that returns the *catenation* of a list and a value.

Likewise, `(acc, val) => acc.add(val)` is a reducer that `.add`s a value to an accumulation. It works for any object that has a `.add` method and returns itself from `.add`. Like [Set.prototype.add]. `(acc, val) => acc.add(val)` adds values to sets.

[Set.prototype.add]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/add

In JavaScript, arrays can use reducers directly: That's exactly what we pass to `.reduce`. Consider this: If a number is a sum, adding a value to that number is a reducer. Therefore, `(acc, val) => acc + val` is a reducer for sums, like this:

```javascript
const oneToFive = [1, 2, 3, 4, 5];

oneToFive.reduce((acc, val) => acc + val)
  //=> 15
```

We can also supply a seed value with `.reduce`, Let's do that with another of our reducers. This expression makes a copy of a list:

```javascript
const oneToFive = [1, 2, 3, 4, 5];

oneToFive.reduce((acc, val) => acc.concat([val]), [])
  //=> [1, 2, 3, 4, 5]
```

Let's make an independent function out of this:

```javascript
const f =
  arr =>
    arr.reduce((acc, val) => acc.concat([val]), []);

f(oneToFive)
  //=> [1, 2, 3, 4, 5]
```

We shouldn't assume that arrays are the only things it works with. Let's generalize `f` to work with any iterable:

```javascript
const f =
  iterable => {
    let acc = [];
    let reducer = (acc, val) => acc.concat([val]);

    for (const val of iterable) {
      acc = reducer(acc, val);
    }

    return acc;
  };

f(oneToFive)
  //=> [1, 2, 3, 4, 5]
```

We'll extract the seed in a weird way, but it will all work out in the end:

```javascript
const f =
  seed =>
    iterable => {
      let acc = seed;

      let reducer = (acc, val) => acc.concat([val]);

      for (const val of iterable) {
        acc = reducer(acc, val);
      }

      return acc;
    };

f([])(oneToFive)
  //=> [1, 2, 3, 4, 5]
```

What about our reducer? We can extract that too:

```javascript
const f =
  reducer =>
    seed =>
      iterable => {
        let acc = seed;

        for (const val of iterable) {
          acc = reducer(acc, val);
        }

        return acc;
      };

f((acc, val) => acc.concat([val]))([])(oneToFive)
  //=> [1, 2, 3, 4, 5]
```

This seems weird, but what have we got? We have a function that takes a reducer as an argument, and returns a function that takes a seed as an argument.
