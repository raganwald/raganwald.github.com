---
title: "Why Recursive Data Structures?"
layout: default
tags: [allonge]
---

In this essay, we are going to look at recursive algorithms, and how sometimes, we can organize an algorithm so that it resembles the data structure it manipulates, and organize a data structure so that it resembles the algorithms that manipulate it.

When algorithms and the data structures they manipulate are *isomorphic*,[^isomorphic] the code we write is easier to understand for exactly the same reason that code like template strings and regular expressions are easy to understand: The code resembles the data it consumes or produces.

[^isomorphic]: In biology, two things are isomorphic if they resemble each other. In mathematics, two things are isomorphic if there is a structure-preserving map between them in both directions. In computer science, two things are isomorphic if the person explaining a concept wishes to seem educated.

We'll finish up by observing that we also can employ optimizations that are only possible when algorithms and the data structures they manipulate are isomorphic.

Here we go.

---

[![GEB recursive](/assets/images/banner/geb-recursive.jpg)](https://www.flickr.com/photos/gadl/279433682)

*GEB Recursive, © 2006 Alexandre Duret-Lutz, [some rights reserved][cc-by-sa-2.0]*

---

### an exercise: rotating a square

Here is a square[^square] composed of elements, perhaps pixels or cells that are on or off. We could write them out like this:

[^square]: To maintain a laser-focus on the principles being discussed, we will make a huge number of simplifying assumptions in this essay, starting with the constraint that all squares will have sides that are a "power of two" in length, e.g. 2x2, 4x4, 8x8, 16x16, an so forth. Every single function discussed can be adjusted to deal with other cases, but we will omit those adjustments as our goal is understanding principles, not writing production code.

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

Consider the problem of *rotating* our square. There is an uncommon, but particularly delightful way to do this. First, we cut the square into four smaller squares:

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

How do we rotate each of the four smaller squares? Exactly the same way. For example,

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

Reassembled, it becomes this:

```
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️
⚫️⚫️⚪️⚪️
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

Rotating an individual dot is a NOOP, so all we have to do is rotate the four dots around, just like we do above:

```
⚫️ ⚪️

⚫️ ⚪️
```

Reassembled, it becomes this:

```
⚫️⚪️
⚫️⚪️
```

Voila! Rotating a square consists of dividing it into four "region" squares, rotating each one clockwise, then moving the regions one position clockwise. It brings whirling dervishes to mind.[^delightful]

[^delightful]: There are other interesting, and elegant ways to rotate a square 90 degrees clockwise, the simplest being `zip(square)`. They each have their own set of trade-offs to consider. For example, the 'whirling regions' approach can also be generalized to handle rotating squares in 180- and 270- degree increments, not to mention reflections on either axis. But for the purpose of this essay, 'whirling regions' is the one we will consider most interesting.

---

### recursion, see recursion

In [From Higher-Order Functions to Libraries And Frameworks](http://raganwald.com/2016/12/15/what-higher-order-functions-can-teach-us-about-libraries-and-frameworks.html), we had a look at `multirec`, a *recursive combinator*.

```javascript
function mapWith (fn) {
  return function * (iterable) {
    for (const element of iterable) {
      yield fn(element);
    }
  };
}

function multirec({ indivisible, value, divide, combine }) {
  return function myself (input) {
    if (indivisible(input)) {
      return value(input);
    } else {
      const parts = divide(input);
      const solutions = mapWith(myself)(parts);

      return combine(solutions);
    }
  }
}
```

With `multirec`, we can write functions that perform computation using divide-and-conquer algorithms. `multirec` handles the structure of divide-and-conquer, we just have to write four smaller functions that implement the parts specific to the problem we are solving.

> In computer science, divide and conquer (D&C) is an algorithm design paradigm based on multi-branched recursion. A divide and conquer algorithm works by recursively breaking down a problem into two or more sub-problems of the same or related type, until these become simple enough to be solved directly. The solutions to the sub-problems are then combined to give a solution to the original problem.—[Wikipedia](https://en.wikipedia.org/wiki/Divide_and_conquer_algorithm)

We'll implement rotating a square using `multirec`. Let's begin with a naïve representation for squares, a two-dimensional array. For example, we would represent the square:

```
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚪️
⚪️⚪️⚪️⚫️
⚪️⚪️⚪️⚫️
```

With this array:

```javascript
[['⚪️', '⚪️', '⚪️', '⚪️'],
 ['⚪️', '⚪️', '⚪️', '⚪️'],
 ['⚪️', '⚪️', '⚪️', '⚫️'],
 ['⚪️', '⚪️', '⚪️', '⚫️']]
```

To use `multirec`, we need four pieces:

1. An `indivisible` predicate function. It should report whether an array is too small to be divided up. It's simplicity itself: `(square) => square.length === 1`.
2. A `value` function that determines what to do with a value that is indivisible. For rotation, we simply return what we are given: `(something) => something`
3. A `divide` function that breaks a divisible problem into smaller pieces. Our function will break a square into four regions. We'll see how that works below.
4. A `combine` function that puts the result of rotating the smaller pieces back together. Our function will take four region squares and put them back together into a big square.

As noted, `indivisible` and `value` are trivial. We'll call our functions `hasLengthOne`, and, `itself`:[^I]

[^I]: `itself` is known formally is the [I Combinator](https://en.wikipedia.org/wiki/Combinatory_logic), and also fondly nicknamed "The Idiot Bird" using Raymond Smullyan's ornithological taxonomy.

```javascript
const hasLengthOne = (square) => square.length === 1;
const itself = (something) => something;
```

`divide` involves no more than breaking arrays into halves, and then those halves again. We'll write a `divideSquareIntoRegions` function for this:

```javascript
const firstHalf = (array) => array.slice(0, array.length / 2);
const secondHalf = (array) => array.slice(array.length / 2);

const divideSquareIntoRegions = (square) => {
  const upperHalf = firstHalf(square);
  const lowerHalf = secondHalf(square);

  const upperLeft = upperHalf.map(firstHalf);
  const upperRight = upperHalf.map(secondHalf);
  const lowerRight = lowerHalf.map(secondHalf);
  const lowerLeft= lowerHalf.map(firstHalf);

  return [upperLeft, upperRight, lowerRight, lowerLeft];
};
```
Our `combine` function, `rotateAndCombineArrays`, makes use of a little help from some functions we saw in [an essay about generators][jsg]:

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

const concat = (...arrays) => arrays.reduce((acc, a) => acc.concat(a));

const rotateAndCombineArrays = ([upperLeft, upperRight, lowerRight, lowerLeft]) => {
  // rotate
  [upperLeft, upperRight, lowerRight, lowerLeft] =
    [lowerLeft, upperLeft, upperRight, lowerRight];

  // recombine
  const upperHalf = [...zipWith(concat, upperLeft, upperRight)];
  const lowerHalf = [...zipWith(concat, lowerLeft, lowerRight)];

  return concat(upperHalf, lowerHalf);
};
```

Armed with `hasLengthOne`, `itself`, `divideSquareIntoRegions`, and `rotateAndCombineArrays`, we can use `multirec` to write `rotate`:

```javascript
const rotate = multirec({
  indivisible : hasLengthOne,
  value : itself,
  divide: divideSquareIntoRegions,
  combine: rotateAndCombineArrays
});

rotate(
   [['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚪️', '⚪️', '⚫️'],
    ['⚪️', '⚪️', '⚪️', '⚫️']]
  )
  //=>
    ([
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚫️', '⚫️', '⚪️', '⚪️']
    ])
```

Voila!

---

### accidental complexity

Rotating a square in this recursive manner is very elegant, but our code is encumbered with some accidental complexity. Here's a flashing strobe-and-neon hint of what it is:

```javascript
const firstHalf = (array) => array.slice(0, array.length / 2);
const secondHalf = (array) => array.slice(array.length / 2);

const divideSquareIntoRegions = (square) => {
  const upperHalf = firstHalf(square);
  const lowerHalf = secondHalf(square);

  const upperLeft = upperHalf.map(firstHalf);
  const upperRight = upperHalf.map(secondHalf);
  const lowerRight = lowerHalf.map(secondHalf);
  const lowerLeft= lowerHalf.map(firstHalf);

  return [upperLeft, upperRight, lowerRight, lowerLeft];
};
```

`divideSquareIntoRegions` is all about extracting region squares from a bigger square, and while we've done our best to make it readable, it is rather busy. Likewise, here's the same thing in `rotateAndCombineArrays`:

```javascript
const rotateAndCombineArrays = ([upperLeft, upperRight, lowerRight, lowerLeft]) => {
  // rotate
  [upperLeft, upperRight, lowerRight, lowerLeft] =
    [lowerLeft, upperLeft, upperRight, lowerRight];

  // recombine
  const upperHalf = [...zipWith(concat, upperLeft, upperRight)];
  const lowerHalf = [...zipWith(concat, lowerLeft, lowerRight)];

  return concat(upperHalf, lowerHalf);
};
```

`rotateAndCombineArrays` is a very busy function. The core thing we want to talk about is actually the rotation: Having divided things up into four regions, we want to rotate the regions. The zipping and concatenating is all about the implementation of regions as arrays.

We can argue that this is _necessary_ complexity, because squares are arrays, and that's just what we programmers do for a living, write code that manipulates basic data structures to do our bidding.

But what if our implementation wasn't an array of arrays? Maybe `divide` and `combine` could be simpler? Maybe that complexity would turn out to be unnecessary after all?

---

[![Recursive Chessboard](/assets/images/recursive-chessboard.jpg)](https://www.flickr.com/photos/fdecomite/746945551)

*Recursive Chessboard, © 2007 fdecomite, [some rights reserved][cc-by-2.0]*

---

### isomorphic data structures

When we have what ought to be an elegant algorithm, but the interface between the algorithm and the data structure ends up being as complicated as the rest of the algorithm put together, we can always ask ourselves, "What data structure would make this algorithm stupidly simple?"

The answer can often be found by imagining a data structure that looks like the algorithm's basic form. If we follow that heuristic, our data structure would be recursive, rather than 'flat.' Since we do all kinds of work sorting out which squares form the four regions of a bigger square, our data structure would describe a square as being composed of four region squares.

Such a data structure already exists, it's called a [quadtree].[^regionquadtree] Squares are represented as four regions, each of which is a smaller square or a cell. A simple implementation is a "Plain Old JavaScript Object" (or "POJO") with properties for each of the regions. If the property contains a string, it's cell. If it contains another POJO, it's a quadtree.

[quadtree]: https://en.wikipedia.org/wiki/Quadtree
[^regionquadtree]: More specifically, the data structure we are going to use is called a [region quadtree](https://en.wikipedia.org/wiki/Quadtree#Region_quadtree). But we'll just call it a quadtree.

A square that looks like this:

```
⚪️⚫️⚪️⚪️
⚪️⚪️⚫️⚪️
⚫️⚫️⚫️⚪️
⚪️⚪️⚪️⚪️
```

Is composed of four regions, the `ul` ("upper left"), `ur` ("upper right"), `lr` ("lower right"), and `ll` ("lower left"), something like this:

```
ul | ur
---+---
ll | lr
```

Thus, for example, the `ul` is:

```
⚪️⚫️
⚪️⚪️
```

And the `ur` is:

```
⚪️⚪️
⚫️⚪️
```

And so forth. Each of those regions is itself composed of four regions. Thus, the `ul` of the `ul` is `⚪️`, and the `ur` of the `ul` is `⚫️`.

The quadtree could be expressed in JavaScript like this:

```javascript
const quadTree = {
  ul: { ul: '⚪️', ur: '⚫️', lr: '⚪️', ll: '⚪️' },
  ur: { ul: '⚪️', ur: '⚪️', lr: '⚪️', ll: '⚫️' },
  lr: { ul: '⚫️', ur: '⚪️', lr: '⚪️', ll: '⚪️' },
  ll: { ul: '⚫️', ur: '⚫️', lr: '⚪️', ll: '⚪️' }
};
```

Now to our algorithm. Rotating a quadtree is simpler than rotating an array of arrays. First, our test for indivisibility is now whether something is a `string` or not:

```javascript
const isString = (something) => typeof something === 'string';
```

The value of an indivisible cell remain the same, `itself`.

Our `divide` function is simple: quadtrees are already divided in the manner we require, we just have to turn them into an array of regions:

```javascript
const quadTreeToRegions = (qt) =>
  [qt.ul, qt.ur, qt.lr, qt.ll];
```

And finally, our combine function reassembles the rotated regions into a POJO, rotating them in the process:

```javascript
const regionsToRotatedQuadTree = ([ur, lr, ll, ul]) =>
  ({ ul, ur, lr, ll });
```

And here's our function for rotating a quadtree:

```javascript
const rotateQuadTree = multirec({
  indivisible : isString,
  value : itself,
  divide: quadTreeToRegions,
  combine: regionsToRotatedQuadTree
});
```

Let's put it to the test:

```javascript
rotateQuadTree(quadTree)
  //=>
    ({
       ul: { ll: "⚪️", lr: "⚫️", ul: "⚪️", ur: "⚫️" },
       ur: { ll: "⚪️", lr: "⚫️", ul: "⚪️", ur: "⚪️" },
       lr: { ll: "⚪️", lr: "⚪️", ul: "⚫️", ur: "⚪️" },
       ll: { ll: "⚪️", lr: "⚪️", ul: "⚪️", ur: "⚫️" }
     })
```

If we reassemble the square by hand, it's what we expect:

```
⚪️⚫️⚪️⚪️
⚪️⚫️⚪️⚫️
⚪️⚫️⚫️⚪️
⚪️⚪️⚪️⚪️
```

---

### separation of concerns

Of course, all we've done so far is moved the "faffing about" out of our code and we're doing it by hand. That's bad: we don't want to retrain our eyes to read quadtrees instead of flat arrays, and we don't want to sit at a computer all day manually translating quadtrees to flat arrays and back.

If only we could write some code to do it for us... Some recursive code...

Here's a function that recursively turns a two-dimensional array into a quadtree:

```javascript
const isOneByOneArray = (something) =>
  Array.isArray(something) && something.length === 1 &&
  Array.isArray(something[0]) && something[0].length === 1;

const contentsOfOneByOneArray = (array) => array[0][0];

const regionsToQuadTree = ([ul, ur, lr, ll]) =>
  ({ ul, ur, lr, ll });

const arrayToQuadTree = multirec({
  indivisible: isOneByOneArray,
  value: contentsOfOneByOneArray,
  divide: divideSquareIntoRegions,
  combine: regionsToQuadTree
});

arrayToQuadTree([
  ['⚪️', '⚪️', '⚪️', '⚪️'],
  ['⚪️', '⚫️', '⚪️', '⚪️'],
  ['⚫️', '⚪️', '⚪️', '⚪️'],
  ['⚫️', '⚫️', '⚫️', '⚪️']
])
  //=>
    ({
      ul:  { ul: "⚪️", ur: "⚪️", lr: "⚫️", ll: "⚪️" },
      ur:  { ul: "⚪️", ur: "⚪️", lr: "⚪️", ll: "⚪️" },
      lr:  { ul: "⚪️", ur: "⚪️", lr: "⚪️", ll: "⚫️" },
      ll:  { ul: "⚫️", ur: "⚪️", lr: "⚫️", ll: "⚫️" }
    })
```

Naturally, we can also write a function to convert quadtrees back into two-dimensional arrays again:

```javascript
const isSmallestActualSquare = (square) => isString(square.ul);

const asTwoDimensionalArray = ({ ul, ur, lr, ll }) =>
  [[ul, ur], [ll, lr]];

const regions = ({ ul, ur, lr, ll }) =>
  [ul, ur, lr, ll];

const combineFlatArrays = ([upperLeft, upperRight, lowerRight, lowerLeft]) => {
  const upperHalf = [...zipWith(concat, upperLeft, upperRight)];
  const lowerHalf = [...zipWith(concat, lowerLeft, lowerRight)];

  return concat(upperHalf, lowerHalf);
}

const quadTreeToArray = multirec({
  indivisible: isSmallestActualSquare,
  value: asTwoDimensionalArray,
  divide: regions,
  combine: combineFlatArrays
});

quadTreeToArray(
  arrayToQuadTree([
    ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚫️', '⚪️', '⚪️'],
    ['⚫️', '⚪️', '⚪️', '⚪️'],
    ['⚫️', '⚫️', '⚫️', '⚪️']
  ])
)
  //=>
    ([
      ["⚪️", "⚪️", "⚪️", "⚪️"],
      ["⚪️", "⚫️", "⚪️", "⚪️"],
      ["⚫️", "⚪️", "⚪️", "⚪️"],
      ["⚫️", "⚫️", "⚫️", "⚪️"]
    ])
```

And thus, we can take a two-dimensional array, turn it into a quadtree, rotate the quadtree, and convert it back to a two-dimensional array again:

```javascript
quadTreeToArray(
  rotateQuadTree(
    arrayToQuadTree([
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚪️', '⚫️', '⚪️', '⚪️'],
      ['⚫️', '⚪️', '⚪️', '⚪️'],
      ['⚫️', '⚫️', '⚫️', '⚪️']
    ])
  )
)
  //=>
    ([
      ["⚫️", "⚫️", "⚪️", "⚪️"],
      ["⚫️", "⚪️", "⚫️", "⚪️"],
      ["⚫️", "⚪️", "⚪️", "⚪️"],
      ["⚪️", "⚪️", "⚪️", "⚪️"]
    ])
```

---

### but why?

Now, we argued above that we've neatly separated the concerns by making three separate functions, instead of interleaving dividing two-dimensional squares into regions, rotating regions, and then reassembling two-dimensional squares.

But the converse side of this is that what we're doing is now a lot less efficient: We're recursing through our data structures three separate times, instead of once. And Frankly, `multirec` was designed such that the `divide` function breaks things up, and the `combine` function puts them back together, so these concerns are already mostly separate once we use `multirec` instead of a bespoke[^bespoke] recursive function.

[^bespoke]: In American English, [bespoke](https://en.wikipedia.org/wiki/Bespoke) typically refers to a garment that is hand-crafted for its wearer. "Bespoke" has, in the last decade, been associated with various hipster endeavours, to the point where its use has become ironic. The turning point was likely when a popped-collar founder of a pre-revenue startup boasted of having two iPhones running a bespoke time management application.<br/><br/>Today, "bespoke" often refers to an item where the owner obtains more value from the status conferred by having a bespoke item, than from the item's fitness for their personalized purpose. Calling a function "bespoke" implies that it was written to display the author's trendy use of functional programming, rather than to efficiently rotate a square.

One reason to break the logic up into three separate functions would be if we want to do lots of different kinds of things with quadtrees. Besides rotating quadtrees, what else might we do?

Well, we might want to superimpose one image on top of another. This could be part of an image editing application, where we have layers of images and want to superimpose all the layers to derive the finished image for the screen. Or we might be implementing [Conway's Game of Life][gol], and might want to 'paste' a pattern like a glider onto a larger universe.

[gol]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

Let's go with a very simple implementation: We're only editing black-and-white images, and each 'pixel' is either a `⚪️` or `⚫️`. If we use two-dimensional arrays to represent our images, we need to iterate over every 'pixel' to perform the superimposition:

```javascript
const superimposeCell = (left, right) =>
  (left === '⚫️' || right === '⚫️') ? '⚫️' : '⚪️';

const superimposeRow = (left, right) =>
  [...zipWith(superimposeCell, left, right)];

const superimposeArray = (left, right) =>
  [...zipWith(superimposeRow, left, right)];

const canvas =
  [ ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚪️', '⚪️', '⚫️'],
    ['⚪️', '⚪️', '⚪️', '⚫️']];

const glider =
  [ ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚫️', '⚪️', '⚪️'],
    ['⚫️', '⚪️', '⚪️', '⚪️'],
    ['⚫️', '⚫️', '⚫️', '⚪️']];

superimposeArray(canvas, glider)
  //=>
    ([
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚪️', '⚫️', '⚪️', '⚪️'],
      ['⚫️', '⚪️', '⚪️', '⚫️'],
      ['⚫️', '⚫️', '⚫️', '⚫️']
    ])
```

Seems simple enough. How about superimposing a quadtree on a quadtree?

---

[![two trees](/assets/images/two-trees.jpg)](https://www.flickr.com/photos/84744710@N06/11313121123)

*Two trees, © 2013 Jon Bunting, [some rights reserved][cc-by-2.0]*

---

### recursive operations on pairs of quadtrees

We can use `multirec` to superimpose one quadtree on top of another: Our function will take a pair of quadtrees, using destructuring to extract one called `left` and the other called `right`:

```javascript
const superimposeQuadTrees = multirec({
  indivisible: ({ left, right }) => isString(left),
  value: ({ left, right }) => right ==='⚫️'
                              ? right
                              : left,
  divide: ({ left, right }) => [
      { left: left.ul, right: right.ul },
      { left: left.ur, right: right.ur },
      { left: left.lr, right: right.lr },
      { left: left.ll, right: right.ll }
    ],
  combine: ([ul, ur, lr, ll]) => ({  ul, ur, lr, ll })
});

quadTreeToArray(
  superimposeQuadTrees({
    left: arrayToQuadTree(canvas),
    right: arrayToQuadTree(glider)
  })
)
  //=>
    ([
      ['⚪️', '⚪️', '⚪️', '⚪️'],
      ['⚪️', '⚫️', '⚪️', '⚪️'],
      ['⚫️', '⚪️', '⚪️', '⚫️'],
      ['⚫️', '⚫️', '⚫️', '⚫️']
    ])
```

Again, this feels like faffing about just so we can be recursive. But we are in position to do something interesting!

---

### optimizing recursive algorithms with isomorphic data structures

Many images have large regions that are entirely white or black. When superimposing one region on another, if either region is entirely white, we know the result must be the same as the other region. When superimposing one region on another, if either region is entirely black, the result must be entirely black.

We can use the quadtree's hierarchal representation to exploit this. We'll store some extra information in each quadtree, its colour: If it is entirely white, its colour will be white. If it is entirely black, its colour will be black. And if it contains a mix of white and black cells, its colour will be a question mark.

```javascript
const isOneByOneArray = (something) =>
  Array.isArray(something) && something.length === 1 &&
  Array.isArray(something[0]) && something[0].length === 1;

const contentsOfOneByOneArray = (array) => array[0][0];

const divideSquareIntoRegions = (square) => {
  const upperHalf = firstHalf(square);
  const lowerHalf = secondHalf(square);

  const upperLeft = upperHalf.map(firstHalf);
  const upperRight = upperHalf.map(secondHalf);
  const lowerRight = lowerHalf.map(secondHalf);
  const lowerLeft= lowerHalf.map(firstHalf);

  return [upperLeft, upperRight, lowerRight, lowerLeft];
};

const colour = (something) => {
  if (something.colour != null) {
    return something.colour;
  } else if (something === '⚪️') {
    return '⚪️';
  } else if (something === '⚫️') {
    return '⚫️';
  } else {
    throw "Can't get the colour of this thing";
  }
};

const combinedColour = (...elements) =>
  elements.reduce((acc, element => acc === element ? element : '❓'))

const regionsToQuadTree = ([ul, ur, lr, ll]) => ({
    ul, ur, lr, ll, colour: combinedColour(ul, ur, lr, ll)
  });

const arrayToQuadTree = multirec({
  indivisible: isOneByOneArray,
  value: contentsOfOneByOneArray,
  divide: divideSquareIntoRegions,
  combine: regionsToQuadTree
});

arrayToQuadTree(
  [ ['⚪️', '⚪️'],
    ['⚪️', '⚪️'] ]
).colour
  //=> "⚪️"

arrayToQuadTree(
  [ ['⚪️', '⚪️'],
    ['⚪️', '⚫️'] ]
).colour
  //=> "❓"

arrayToQuadTree(
  [ ['⚫️', '⚫️'],
    ['⚫️', '⚫️'] ]
).colour
  //=> "⚫️"

arrayToQuadTree(
  [ ['⚪️', '⚪️', '⚪️', '⚪️'],
    ['⚪️', '⚫️', '⚪️', '⚪️'],
    ['⚫️', '⚪️', '⚪️', '⚪️'],
    ['⚫️', '⚫️', '⚫️', '⚪️']]
).colour
  //=> "❓"
```

Now, we can take advantage of every region's computed colour when we superimpose "coloured" quadtrees:

```javascript
const eitherAreEntirelyColoured = ({ left, right }) =>
  colour(left) !== '❓' || colour(right) !== '❓' ;

const superimposeColoured = ({ left, right }) => {
    if (colour(left) === '⚪️' || colour(right) === '⚫️') {
      return right;
    } else if (colour(left) === '⚫️' || colour(right) === '⚪️') {
      return left;
    } else {
      throw "Can't superimpose these things";
    }
  };

const divideTwoQuadTrees = ({ left, right }) => [
    { left: left.ul, right: right.ul },
    { left: left.ur, right: right.ur },
    { left: left.lr, right: right.lr },
    { left: left.ll, right: right.ll }
  ];

const combineColouredRegions = ([ul, ur, lr, ll]) => ({
    ul, ur, lr, ll, colour: combinedColour(ul, ur, lr, ll)
  });

const superimposeColouredQuadTrees = multirec({
  indivisible: eitherAreEntirelyColoured,
  value: superimposeColoured,
  divide: divideTwoQuadTrees,
  combine: combineColouredRegions
});
```

We get the same output, but now instead of comparing every cell whenever we superimpose quadtrees, we compare entire regions at a time. If either is "entirely coloured," we can return the other one without recursively drilling down to the level of individual pixels.

There is no savings if both quadtrees are composed of a fairly evenly spread mix of black and white pixels (e.g. a checkerboard pattern), but in cases where there are large expanses of white or black, the difference is substantial.

In the case of comparing the 4x4 `canvas` and `glider` images above, the `superimposeArray` function requires sixteen comparisons. The `superimposeQuadTrees` function requires twenty comparisons. But the `superimposeColouredQuadTrees` function requires just seven comparisons.

If we were writing an image manipulation application, we'd provide much snappier behaviour using coloured quadtrees to represent images on screen.

The interesting thing about this optimization is that it is tuned to the characteristics of both the data structure and the algorithm: It is not something that is easy to perform in the algorithm without the data structure, or in the data structure without the algorithm.

And it's not the only optimization. Remember our 'whirling regions' implementation of `rotateQuadTree`? Here's `rotateColouredQuadTree`:

```javascript
const isEntirelyColoured = (something) =>
  colour(something) !== '❓' ;

const rotateColouredQuadTree = multirec({
  indivisible : isEntirelyColoured,
  value : itself,
  divide: quadTreeToRegions,
  combine: regionsToRotatedQuadTree
});
```

Any region that is entirely white or entirely black is its own rotation, so no further dividing and conquering need be done. For images that have large areas of blank space, the "whirling regions" algorithm is not just aesthetically delightful, it's faster than a brute-force transposition of array elements.

Optimizations like this can only be implemented when the algorithm and the data structure are isomorphic to each other.

---

[![Game of Life 6](/assets/images/glider.jpg)](https://www.flickr.com/photos/oskay/6838125520)

*Detail from "Game of Life 6," © Windell Oskay, [some rights reserved][cc-by-2.0]*

---

### why!

So back to, "Why convert data into a structure that is isomorphic to our algorithm."

The first reason to do so, is that the code is clearer and easier to read if we convert, then perform operations on the data structure, and then convert it back (if need be).

The second reason do do so, is that if we want to do lots of different operations on the data structure, it is much more efficient to keep it in the form that is isomorphic to the operations we are going to perform on it.

The example we saw was that if we were building a hypothetical image processing application, we could convert an image into quad trees, then rotate or superimpose images at will. We would only need to convert our quadtrees when we need to save or display the image in a rasterized (i.e. array-like) format.

And third, we saw that once we embraced a data structure that was isomorphic to the form of the algorithm, we could employ elegant optimizations that are impossible (or ridiculously inconvenient) when the algorithm and data structure do not match.

Separating conversion from operation allows us to benefit from all three reasons for ensuring that our algorithms and data structures are isomorphic to each other.

---

### afterward

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [hacker news](https://news.ycombinator.com/item?id=13304487) or [reddit](https://www.reddit.com/r/javascript/comments/5lm0ya/why_recursive_data_structures/), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-12-27-recursive-data-structures.md) yourself.

p.s. Thank you for reading this far. Here is your reward, [An Algorithm for Compressing Space and Time](http://www.drdobbs.com/jvm/an-algorithm-for-compressing-space-and-t/184406478). And hey! If you like this kind of thing, [JavaScript Allongé](https://leanpub.com/javascriptallongesix/) is exactly the kind of thing you'll like.

---

### notes

[anamorphism]: https://en.wikipedia.org/wiki/Anamorphism
[catamorphism]: https://en.wikipedia.org/wiki/Catamorphism
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[cc-by-sa-2.0]: https://creativecommons.org/licenses/by-sa/2.0/
[reddit]: https://www.reddit.com/r/javascript/comments/5jdjo6/from_higherorder_functions_to_libraries_and/
[Ember]: http://emberjs.com/
