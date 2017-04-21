---
title: "Incremental Evaluation"
layout: default
tags: [allonge, noindex]
---

Consider this problem: We have a hypothetical startup that, like so many other unimaginative clones of each other, provides some marginal benefit in exchange for tracking user locations. We want to mine that location data.

For the purposes of this brief blog post, we might have a file that looks like this:

```
1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
3abe124ecc82bf2c2e22e6058f38c50c, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
1a2ddc2db4693cfd16d534cde5572cc1, bd11537f1bc31e334497ec5463fc575e
1a2ddc2db4693cfd16d534cde5572cc1, 5890595e16cbebb8866e1842e4bd6ec7
3abe124ecc82bf2c2e22e6058f38c50c, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
1a2ddc2db4693cfd16d534cde5572cc1, bd11537f1bc31e334497ec5463fc575e
1a2ddc2db4693cfd16d534cde5572cc1, 5890595e16cbebb8866e1842e4bd6ec7

...
```

The first column is a pseudoanonymous hash identifying a user. The second is a pseudoanonymous hash representing a location. If we eyeball the first 14 lines, we can see that user `1a2ddc2db4693cfd16d534cde5572cc1` visited `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, then `5890595e16cbebb8866e1842e4bd6ec7`. Meanwhile, user `f1a543f5a2c5d49bc5dde298fcf716e4` visited `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, and then `5890595e16cbebb8866e1842e4bd6ec7`. And so forth.

Let's say we're interested in learning where people tend to go. We are looking for the most popular transitions. So given that user `1a2ddc2db4693cfd16d534cde5572cc1` visited `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, then `5890595e16cbebb8866e1842e4bd6ec7`, we count the transitions as:

- `5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e`
- `bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7`
- `5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3`
- `5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e`
- `bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7`

Notice that we have to track the locations by user in order to get the correct transitions. Next, we're interested in the most popular transitions, so we'll count them:

- `5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e` appears twice
- `bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7` also appears twice
- `5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3` only appears once

Now all we have to do is count all the transitions across all users, and report the most popular transition.

### the first crack

The most obvious thing to do is to write this as a series of transformations on the data. We've already seen one: Given the initial data, let's get a list of locations for each user.

We can read the data from a file line-by-line, but to make it easy to follow along in a browser, let's pretend our file is actually a multiline string. So the first thing is to convert it to a an array:

```javascript
const log = `1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
3abe124ecc82bf2c2e22e6058f38c50c, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
1a2ddc2db4693cfd16d534cde5572cc1, bd11537f1bc31e334497ec5463fc575e
1a2ddc2db4693cfd16d534cde5572cc1, 5890595e16cbebb8866e1842e4bd6ec7
3abe124ecc82bf2c2e22e6058f38c50c, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, 5f2b9323c39ee3c861a7b382d205c3d3
f1a543f5a2c5d49bc5dde298fcf716e4, bd11537f1bc31e334497ec5463fc575e
f1a543f5a2c5d49bc5dde298fcf716e4, 5890595e16cbebb8866e1842e4bd6ec7
1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
1a2ddc2db4693cfd16d534cde5572cc1, bd11537f1bc31e334497ec5463fc575e
1a2ddc2db4693cfd16d534cde5572cc1, 5890595e16cbebb8866e1842e4bd6ec7`;

const lines = str => str.split('\n');
const logLines = lines(log);

const datums = str => str.split(', ');
const datumize = arr => arr.map(datums);

const data = datumize(logLines;
  //=>
    [["1a2ddc2db4693cfd16d534cde5572cc1", "5f2b9323c39ee3c861a7b382d205c3d3"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "5890595e16cbebb8866e1842e4bd6ec7"]
     ["3abe124ecc82bf2c2e22e6058f38c50c", "bd11537f1bc31e334497ec5463fc575e"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "5f2b9323c39ee3c861a7b382d205c3d3"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "bd11537f1bc31e334497ec5463fc575e"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "5890595e16cbebb8866e1842e4bd6ec7"]
     ["1a2ddc2db4693cfd16d534cde5572cc1", "bd11537f1bc31e334497ec5463fc575e"]
     ["1a2ddc2db4693cfd16d534cde5572cc1", "5890595e16cbebb8866e1842e4bd6ec7"]
     ["3abe124ecc82bf2c2e22e6058f38c50c", "5f2b9323c39ee3c861a7b382d205c3d3"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "5f2b9323c39ee3c861a7b382d205c3d3"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "bd11537f1bc31e334497ec5463fc575e"]
     ["f1a543f5a2c5d49bc5dde298fcf716e4", "5890595e16cbebb8866e1842e4bd6ec7"]
     ["1a2ddc2db4693cfd16d534cde5572cc1", "5f2b9323c39ee3c861a7b382d205c3d3"]
     ["1a2ddc2db4693cfd16d534cde5572cc1", "bd11537f1bc31e334497ec5463fc575e"]
     ["1a2ddc2db4693cfd16d534cde5572cc1", "5890595e16cbebb8866e1842e4bd6ec7"]]
```

Next we convert these to lists of locations grouped by user. We'll create a map:

```javascript
const listize = arr => arr.reduce(
  (map, [user, location]) => {
    if (map.has(user)) {
      map.get(user).push(location);
    } else {
      map.set(user, [location]);
    }
    return map;
  }, new Map());

const locationsByUser = listize(data);
  //=>
    Map{
      "1a2ddc2db4693cfd16d534cde5572cc1": [
        "5f2b9323c39ee3c861a7b382d205c3d3",
        "bd11537f1bc31e334497ec5463fc575e",
        "5890595e16cbebb8866e1842e4bd6ec7",
        "5f2b9323c39ee3c861a7b382d205c3d3",
        "bd11537f1bc31e334497ec5463fc575e",
        "5890595e16cbebb8866e1842e4bd6ec7"
      ],
      "3abe124ecc82bf2c2e22e6058f38c50c": [
        "bd11537f1bc31e334497ec5463fc575e",
        "5f2b9323c39ee3c861a7b382d205c3d3"
      ],
      "f1a543f5a2c5d49bc5dde298fcf716e4": [
        "5890595e16cbebb8866e1842e4bd6ec7",
        "5f2b9323c39ee3c861a7b382d205c3d3",
        "bd11537f1bc31e334497ec5463fc575e",
        "5890595e16cbebb8866e1842e4bd6ec7",
        "5f2b9323c39ee3c861a7b382d205c3d3",
        "bd11537f1bc31e334497ec5463fc575e",
        "5890595e16cbebb8866e1842e4bd6ec7"
      ]
    }
```

We'll convert these to transitions. `slicesOf` is a handy function for that:

```javascript
const slicesOf = (sliceSize, array) =>
  Array(array.length - sliceSize + 1).fill().map((_,i) => array.slice(i,i+sliceSize));

const transitions = list => chunksOf(2, list);

const transitionsByUser = Array.from(locationsByUser.entries()).reduce(
  (map, [user, listOfLocations]) => {
    map.set(user, transitions(listOfLocations));
    return map;
  }, new Map());
  //=>
    Map{
      "1a2ddc2db4693cfd16d534cde5572cc1": [
          [
            "5f2b9323c39ee3c861a7b382d205c3d3",
            "bd11537f1bc31e334497ec5463fc575e"
          ],
          [
            "bd11537f1bc31e334497ec5463fc575e",
            "5890595e16cbebb8866e1842e4bd6ec7"
          ],
          [
            "5890595e16cbebb8866e1842e4bd6ec7",
            "5f2b9323c39ee3c861a7b382d205c3d3"
          ],
          [
            "5f2b9323c39ee3c861a7b382d205c3d3",
            "bd11537f1bc31e334497ec5463fc575e"
          ],
          [
            "bd11537f1bc31e334497ec5463fc575e",
            "5890595e16cbebb8866e1842e4bd6ec7"
          ]
        ],
      "f1a543f5a2c5d49bc5dde298fcf716e4": [
          [
            "5890595e16cbebb8866e1842e4bd6ec7",
            "5f2b9323c39ee3c861a7b382d205c3d3"
          ],
          [
            "5f2b9323c39ee3c861a7b382d205c3d3",
            "bd11537f1bc31e334497ec5463fc575e"
          ],
          [
            "bd11537f1bc31e334497ec5463fc575e",
            "5890595e16cbebb8866e1842e4bd6ec7"
          ],
          [
            "5890595e16cbebb8866e1842e4bd6ec7",
            "5f2b9323c39ee3c861a7b382d205c3d3"
          ],
          [
            "5f2b9323c39ee3c861a7b382d205c3d3",
            "bd11537f1bc31e334497ec5463fc575e"
          ],
          [
            "bd11537f1bc31e334497ec5463fc575e",
            "5890595e16cbebb8866e1842e4bd6ec7"
          ]
        ],
      "3abe124ecc82bf2c2e22e6058f38c50c": [
          [
            "bd11537f1bc31e334497ec5463fc575e",
            "5f2b9323c39ee3c861a7b382d205c3d3"
          ]
        ]
    }
```

Before we move on, let's extract something from `transitionsByUser`. One thing is `transitions`, the other is applying `transitions` to each of the values in a map:

```javascript
const mapValues = (fn, inMap) => Array.from(inMap.entries()).reduce(
  (outMap, [key, value]) => {
    outMap.set(key, fn(value));
    return outMap;
  }, new Map());

const transitionsByUser = mapValues(transitions, locationsByUser);
```

This is very interesting. We can take it a step further, and use [partial application]. We could write or borrow a `leftPartialApply` function, but just to show our hardcore JS creds, let's use `.bind`:

[partial application]: http://raganwald.com/2015/04/01/partial-application.html

```javascript
const mapValues = (fn, inMap) => Array.from(inMap.entries()).reduce(
  (outMap, [key, value]) => {
    outMap.set(key, fn(value));
    return outMap;
  }, new Map());

const transitionize = mapValues.bind(null, transitions);

const transitionsByUser = transitionize(locationsByUser);
```

Now we have each step in our process consisting of applying a single function to the return value of the previous function application. But let's take the next step. We have a mapping from users to their transitions, but we don't care about the users, just the transitions, so let's fold them back together:

```javascript
const reduceValues = (mergFn, inMap) =>
  Array.from(inMap.entries())
    .map(([key, value]) => value)
      .reduce(mergeFn);

const concatValues = reduceValues.bind(null, (a, b) => a.concat(b));

const allTransitions = concatValues(transitionsByUser);
  //=>
    [
      ["5f2b9323c39ee3c861a7b382d205c3d3", "bd11537f1bc31e334497ec5463fc575e"],
      ["bd11537f1bc31e334497ec5463fc575e", "5890595e16cbebb8866e1842e4bd6ec7"],
      ["5890595e16cbebb8866e1842e4bd6ec7", "5f2b9323c39ee3c861a7b382d205c3d3"],
      ["5f2b9323c39ee3c861a7b382d205c3d3", "bd11537f1bc31e334497ec5463fc575e"],
      ["bd11537f1bc31e334497ec5463fc575e", "5890595e16cbebb8866e1842e4bd6ec7"],
      ["5890595e16cbebb8866e1842e4bd6ec7", "5f2b9323c39ee3c861a7b382d205c3d3"],
      ["5f2b9323c39ee3c861a7b382d205c3d3", "bd11537f1bc31e334497ec5463fc575e"],
      ["bd11537f1bc31e334497ec5463fc575e", "5890595e16cbebb8866e1842e4bd6ec7"],
      ["5890595e16cbebb8866e1842e4bd6ec7", "5f2b9323c39ee3c861a7b382d205c3d3"],
      ["5f2b9323c39ee3c861a7b382d205c3d3", "bd11537f1bc31e334497ec5463fc575e"],
      ["bd11537f1bc31e334497ec5463fc575e", "5890595e16cbebb8866e1842e4bd6ec7"],
      ["bd11537f1bc31e334497ec5463fc575e", "5f2b9323c39ee3c861a7b382d205c3d3"]
    ]
```

Now we want to count the occurrences of each transition. We'll reduce our new list to a pairing between the highest count and a list of transitions that match. It would be nice if JavaScript gave us a Deep JSON Equality function, bit it doesn't. We could go down a rabbit-hole of writing our own comparisoln functions and maps and what-not, but it's simpler to convert the transitions to strings before counting them. That's because JavaScript acts as if strings are canonicalized, so they make great keys for objects and maps.

```javascript
const stringifyTransitions = (arr) => arr.map(([from, to]) => `${from} -> ${to}`);

const stringTransitions = stringifyTransitions(allTransitions);
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7",
      "5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3",
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7",
      "5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3",
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7",
      "5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3",
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7",
      "bd11537f1bc31e334497ec5463fc575e -> 5f2b9323c39ee3c861a7b382d205c3d3"
    ]
```

*Now* we can count them with ease:

```javascript
const countTransitions = (arr) => arr.reduce(
  (transitionsToCount, transition) => {
    if (transitionsToCount.has(transition)) {
      transitionsToCount.set(transition, 1 + transitionsToCount.get(transition));
    } else {
      transitionsToCount.set(transition, 1);
    }
    return transitionsToCount;
  }
  , new Map());

const counts = countTransitions(stringTransitions);
  //=>
    Map{
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e": 4,
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7": 4,
      "5890595e16cbebb8866e1842e4bd6ec7 -> 5f2b9323c39ee3c861a7b382d205c3d3": 3,
      "bd11537f1bc31e334497ec5463fc575e -> 5f2b9323c39ee3c861a7b382d205c3d3": 1
    }
```

And which is/are the most common?

```
const greatestValue = inMap =>
  Array.from(inMap.entries()).reduce(
    ([wasEntries, wasCount], [entry, count]) => {
      if (count < wasCount) {
        return [wasEntries, wasCount];
      } else if (count > wasCount) {
        return [new Set([entry]), count];
      } else {
        wasEntries.add(entry);
        return [wasEntries, wasCount];
      }
    }
    , [new Set(), 0]
  );

greatestValue(counts);
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7"
    ],
    4
```

### pipelining this solution

One of the nice thing about this solution is that it forms a pipeline. Leaving the definitions out, the pipeline is:

```javascript
const theGrandSolution = data =>
  greatestValue(countTransitions(stringifyTransitions(concatValues(transitionize(listize(data))))));

theGrandSolution(data)
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7"
    ],
    4
```

We can write this using `compose` or `pipeline`. Let's look at the latter:

```javascript
const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const theGrandSolution = pipeline(
  listize,
  transitionize,
  concatValues,
  stringifyTransitions,
  countTransitions,
  greatestValue
);

theGrandSolution(data)
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7"
    ],
    4
```

The very nice thing is that we have decomposed our solution int a simple pipe that takes some data in at one end, and performs a succession of transformations on it, until what emerges at the other end is the result we want.

Each step can be easily checked and tested, and each step as a well-understood and explicit input, followed by an explicit and well-understood output. There are no side-effects to confuse our reasoning.

But there is a dark side, of course. If we care very deeply about memory, at each step but the last, we construct a data structure of roughly equal size to the input data.

We would use much less data wif we wroe a single fold that had a lot of internal moving parts, but only iterated over the data in one pass.

*to be continued*
---

### notes


