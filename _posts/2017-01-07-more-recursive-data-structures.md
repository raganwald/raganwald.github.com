---
title: "More Recursive Data Structures"
layout: default
tags: [allonge, noindex]
---

In [Why recursive data structures?](http://raganwald.com/2016/12/27/recursive-data-structures.html), we met `multirec`, a *recursive combinator*.

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

We used `multirec` to implement _coloured quadtrees_:

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

const isEntirelyColoured = (something) =>
  colour(something) !== '❓' ;

const arrayToQuadTree = multirec({
  indivisible: isOneByOneArray,
  value: contentsOfOneByOneArray,
  divide: divideSquareIntoRegions,
  combine: regionsToQuadTree
});

const superimposeColouredQuadTrees = multirec({
  indivisible: eitherAreEntirelyColoured,
  value: superimposeColoured,
  divide: divideTwoQuadTrees,
  combine: combineColouredRegions
});

const rotateColouredQuadTree = multirec({
  indivisible : isEntirelyColoured,
  value : itself,
  divide: quadTreeToRegions,
  combine: regionsToRotatedQuadTree
});
```

Performance-wise, naïve array algorithms are O _n_, and naïve quadtree algorithms are O _n_ log _n_. Coloured quadtrees are worst-case O _n_ log _n_, but are faster than naïve quadtrees whenever there are regions that are entirely white or entirely black, because the entire region can be handled in one 'operation.'

They can even be faster than naïve array algorithms if the image contains enough blank regions. But can they be _even faster_?

---

[![Index Cards](/assets/images/banner/index-cards.jpg)](https://www.flickr.com/photos/paulk/3080211705)

*Index cards in the public library of Trinidad, Cuba, © 2008 Paul Keller, [some rights reserved][cc-by-2.0]*

---

### memoization

The general idea behind coloured quadtrees is that if we know a way to compute the result of an operation (whether rotation or superimposition) on an entire region, we don't need to recursively drill down and do the operation on every cell in the region. We save O _n_ log _n_ operations where _n_ is the size of the region.

We happen to know that all-white or all-black regions are a special case for rotation an superimposition, so coloured quadtrees optimize that case. But if we could find an even more common case, we could go even faster.

One interesting special case is this: If we've done the operation on an identical quadrant before, we could remember the result instead of recomputing it.

For example, if we want to rotate:

```
⚪️⚪️⚪️⚫️⚫️⚪️⚪️⚪️
⚪️⚪️⚫️⚪️⚪️⚫️⚪️⚪️
⚪️⚫️⚫️⚪️⚪️⚫️⚫️⚪️
⚫️⚪️⚪️⚫️⚫️⚪️⚪️⚫️
⚫️⚪️⚪️⚫️⚫️⚪️⚪️⚫️
⚪️⚫️⚫️⚪️⚪️⚫️⚫️⚪️
⚪️⚪️⚫️⚪️⚪️⚫️⚪️⚪️
⚪️⚪️⚪️⚫️⚫️⚪️⚪️⚪️
```

We would divide it into:

```
⚪️⚪️⚪️⚫️ ⚫️⚪️⚪️⚪️
⚪️⚪️⚫️⚪️ ⚪️⚫️⚪️⚪️
⚪️⚫️⚫️⚪️ ⚪️⚫️⚫️⚪️
⚫️⚪️⚪️⚫️ ⚫️⚪️⚪️⚫️

⚫️⚪️⚪️⚫️ ⚫️⚪️⚪️⚫️
⚪️⚫️⚫️⚪️ ⚪️⚫️⚫️⚪️
⚪️⚪️⚫️⚪️ ⚪️⚫️⚪️⚪️
⚪️⚪️⚪️⚫️ ⚫️⚪️⚪️⚪️
```

We would complete the first and second quadrants, but the third and fourth are identical to the second and first, so we could complete them in one step, saving 50% of the work.

But it's even better than that. When we compute the result of rotating the first quadrant, we divide it into:

```
⚪️⚪️ ⚪️⚫️
⚪️⚪️ ⚫️⚪️

⚪️⚫️ ⚫️⚪️
⚫️⚪️ ⚪️⚫️
```

It's first and third sub-quadrants are unique, but the second and fourth are identical, so we can save 25%.

And it gets better. The second quadrant subdivides into:

```
⚫️⚪️ ⚪️⚪️
⚪️⚫️ ⚪️⚪️

⚪️⚫️ ⚫️⚪️
⚫️⚪️ ⚪️⚫️
```

Now the first and third sub-quadrants of the second quadrant are identical to the third sub-quadrant of the first quadrant, so we don't have to rotate them. The second sub-quadrant is identical to the first sub-quadrant of the first quadrant, so we don't need to rotate it, either. And the fourth sub-quadrant of the second quadrant is identical to the second and fourth sub-quadrants of the first quadrant, so we don't need to rotate it, either.

Once we have rotated three sub-quadrants, we have done all the computation needed. Everything else is saving and looking up the results.

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

There is more to read about `multirec` in the previous essay, [From Higher-Order Functions to Libraries And Frameworks](http://raganwald.com/2016/12/15/what-higher-order-functions-can-teach-us-about-libraries-and-frameworks.html).

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
