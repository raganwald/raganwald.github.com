---
layout: default
tags: [allonge]
---

In [From Higher-Order Functions to Libraries And Frameworks](http://raganwald.com/2016/12/15/what-higher-order-functions-can-teach-us-about-libraries-and-frameworks.html), we had a look at `linrec` and `multirec`, two *recursive combinators*. Here's the example we gave of using `linrec` to merge two sorted lists, and `multirec` to implement the classic [merge sort]:

[merge sort]: https://en.wikipedia.org/wiki/Merge_sort

```javascript
function linrec({ indivisible, seed, value = (atom) => atom, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      const { atom, remainder } = divide(input);
      const left = value(atom);
      const right = myself(remainder);

      return combine({ left, right });
    }
  }
}

const merge = linrec({
  indivisible: ({ list1, list2 }) => list1.length === 0 || list2.length === 0,
  seed: ({ list1, list2 }) => list1.concat(list2),
  divide: ({ list1, list2 }) => {
    if (list1[0] < list2[0]) {
      return {
        atom: list1[0],
        remainder: {
          list1: list1.slice(1),
          list2
        }
      };
    } else {
      return {
        atom: list2[0],
        remainder: {
          list1,
          list2: list2.slice(1)
        }
      };
    }
  },
  combine: ({ left, right }) => [left, ...right]
});

function mapWith (fn) {
  return function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  };
}

function multirec({ indivisible, seed, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      const parts = divide(input);
      const solutions = mapWith(myself)(parts);

      return combine(solutions);
    }
  }
}

const mergeSort = multirec({
  indivisible: (list) => list.length <= 1,
  seed: (list) => list,
  divide: (list) => [
    list.slice(0, list.length / 2),
    list.slice(list.length / 2)
  ],
  combine: ([list1, list2]) => merge({ list1, list2 })
});
```

There are lots of other interesting applications of `multirec`.

### rotating a square

Consider a square composed of elements, perhaps pixels or cells that are on or off. We could write them out like this:

```
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚫️⚪️⚪️⚪️
⚪️⚪️⚫️⚫️⚫️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
```

Consider the problem of *rotating* our square. There us a very elegant way to do this. First, we cut the squre into four smaller squares:

```
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚫️⚪️⚪️⚪️

⚪️⚪️⚫️⚫️ ⚫️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
```

Now, we rotate each of the four smaller squares 90 degrees clockwise:

```
⚪️⚪️⚪️⚪️ ⚫️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚫️⚪️⚪️ ⚪️⚪️⚪️⚪️

⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚫️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚪️⚪️⚪️⚪️
```

Finally, we move the squares as a whole, 90 degrees clockwise:

```
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚪️⚫️⚪️⚪️

⚪️⚪️⚪️⚫️ ⚫️⚪️⚪️⚪️ 
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️ ⚪️⚪️⚪️⚪️
```

Then reassemble:

```
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️⚪️⚫️⚪️⚪️
⚪️⚪️⚪️⚫️⚫️⚪️⚪️⚪️ 
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️⚪️⚪️⚪️⚪️
```

How do we roate each of the four smaller squares? Exactly the same way. For example,

```
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️
⚪️⚪️⚪️⚫️
```

Becomes:

```
⚪️⚪️ ⚪️⚪️
⚪️⚪️ ⚪️⚪️

⚪️⚪️ ⚪️⚫️
⚪️⚪️ ⚪️⚫️
```

By rotating each smaller square, it becomes:

```
⚪️⚪️ ⚪️⚪️
⚪️⚪️ ⚪️⚪️

⚪️⚪️ ⚪️⚪️
⚪️⚪️ ⚫️⚫️
```

And we rotate all for squares to finish with:

```
⚪️⚪️ ⚪️⚪️
⚪️⚪️ ⚪️⚪️

⚪️⚪️ ⚪️⚪️
⚫️⚫️ ⚪️⚪️
```

How would we rotate the next size down?

```
⚪️⚪️
⚫️⚫️
```

Becomes:

```
⚪️ ⚪️

⚫️ ⚫️
```

Rotating an individual dot is a NOOP, so all we have to do is rotate the four dots around, just like we do above.

### recursion, see recursion

Rotating a square in this recursive manner seems very elegant, but if we represented the dots as an array, the elegance would be encumbered by needing to write functions that extract a quadrant of an aarray of arrays, or build an array of arrays out of four quadrants.

If rotating quadrants was all we cared about, we could use a completely different representation, a [QuadTree]. Squares are represented as four quadrants, each of which is a smaller square or a cell:

[QuadTree]: https://en.wikipedia.org/wiki/Quadtree

```javascript
class Cell {
  constructor(character) {
    this.character = character;
  }
}

class Square {
  constructor([upperLeft, upperRight, lowerRight, lowerLeft]) {
    Object.assign(this, { upperLeft, lowerLeft, upperRight, lowerRight });
  };
}
```

For convenience when trying things, we can write a function that converts a string to a square, presuming there is one character per cell, and lines are delimited by `\r`. Thus, the square:

```
0123
4567
89AB
CDEF
```

Is represented by the JavaScript string `'0123\r4567\r89AB\rCDEF'`. Conversion is recursive: If the string is a single character, return a new cell. If not, extract the strings for each of the four quadrants and convert them, then recombine them by returning a square with the four converted quadrants.

This is tailor-made for `multirec`:

```javascript
function mapWith (fn) {
  return function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  };
}

function multirec({ indivisible, seed, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return seed(input);
    } else {
      const parts = divide(input);
      const solutions = mapWith(myself)(parts);

      return combine(solutions);
    }
  }
}

const squareFromString = multirec({
  indivisible: (str) => str.length === 1,
  seed: (char) => new Cell(char),
  divide: (str) => {
    const lines = str.split('\r');
    const halfSize = lines.length / 2;

    const upperHalfArray = lines.slice(0, halfSize);
    const lowerHalfArray = lines.slice(halfSize);

    const upperLeftArray = upperHalfArray.map((line) => line.substr(0, halfSize));
    const upperRightArray = upperHalfArray.map((line) => line.substr(halfSize));
    const lowerRightArray = lowerHalfArray.map((line) => line.substr(halfSize));
    const lowerLeftArray = lowerHalfArray.map((line) => line.substr(0, halfSize));

    const upperLeftString = upperLeftArray.join('\r');
    const upperRightString = upperRightArray.join('\r');
    const lowerRightString = lowerRightArray.join('\r');
    const lowerLeftString = lowerLeftArray.join('\r');

    return [upperLeftString, upperRightString, lowerRightString, lowerLeftString];
  },
  combine: ([upperLeft, upperRight, lowerRight, lowerLeft]) => new Square([upperLeft, upperRight, lowerRight, lowerLeft])
});

squareFromString('0123\r4567\r89AB\rCDEF')
  //=>
    Square {
      "lowerLeft": Square {
        "lowerLeft": Cell { "character": "C" },
        "lowerRight": Cell { "character": "D" },
        "upperLeft": Cell { "character": "8" },
        "upperRight": Cell { "character": "9" }
      },
      "lowerRight": Square {
        "lowerLeft": Cell { "character": "E" },
        "lowerRight": Cell { "character": "F" },
        "upperLeft": Cell { "character": "A" },
        "upperRight": Cell { "character": "B" }
      },
      "upperLeft": Square {
        "lowerLeft": Cell { "character": "4" },
        "lowerRight": Cell { "character": "5" },
        "upperLeft": Cell { "character": "0" },
        "upperRight": Cell { "character": "1" }
      },
      "upperRight": Square {
        "lowerLeft": Cell { "character": "6" },
        "lowerRight": Cell { "character": "7" },
        "upperLeft": Cell { "character": "2" },
        "upperRight": Cell { "character": "3" }
      }
    }
```

Converting our squares to strings coul dbe done with `binrec`, but the very first thing we'd write would be something like `indivisible: (quadrant) => quadrant instanceof Cell`, and that's a sign that perhaps we should be using polymorphism. We like functions, but we like methods too.

So we start with the easy case:

```javascript
class Cell {
  constructor(character) {
    this.character = character;
  }

  toString() {
    return this.character;
  }
}
```

Then, with a little help from some functions we saw in [an essay about generators][jsg]:

[jsg]: http://raganwald.com/2016/05/07/javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.html "JavaScript Generators for People Who Don't Give a Shit About GettingStuffDone™"

```javascript
function split (iterable) {
  const iterator = iterable[Symbol.iterator]();
  const { done, value: first } = iterator.next();

  if (done) {
    return { rest: [] };
  } else {
    return { first, rest: iterator };
  }
};

function * join (first, rest) {
  yield first;
  yield * rest;
};

function * zipWith (fn, ...iterables) {
  const asSplits = iterables.map(split);

  if (asSplits.every((asSplit) => asSplit.hasOwnProperty('first'))) {
    const firsts = asSplits.map((asSplit) => asSplit.first);
    const rests = asSplits.map((asSplit) => asSplit.rest);

    yield * join(fn(...firsts), zipWith(fn, ...rests));
  }
}

class Square {
  constructor([upperLeft, upperRight, lowerRight, lowerLeft]) {
    Object.assign(this, { upperLeft, lowerLeft, upperRight, lowerRight });
  };

  toString() {
    const upperLeftString = this.upperLeft.toString();
    const upperRightString = this.upperRight.toString();
    const lowerRightString = this.lowerRight.toString();
    const lowerLeftString = this.lowerLeft.toString();

    const upperLeftArray = upperLeftString.split('\r');
    const upperRightArray = upperRightString.split('\r');
    const lowerRightArray = lowerRightString.split('\r');
    const lowerLeftArray = lowerLeftString.split('\r');

    const upperArray = [...zipWith((l, r) => l + r, upperLeftArray, upperRightArray)];
    const lowerArray = [...zipWith((l, r) => l + r, lowerLeftArray, lowerRightArray)];
    const array = upperArray.concat(lowerArray);

    return array.join('\r');
  }
}
```

### so, what about rotating again?

### notes

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[reddit]: https://www.reddit.com/r/javascript/comments/5jdjo6/from_higherorder_functions_to_libraries_and/
[Ember]: http://emberjs.com/
