---
title: "Incremental Evaluation"
layout: default
tags: [allonge]
---

[![Network](/assets/images/Social_Network_Analysis_Visualization.png)](https://commons.wikimedia.org/wiki/File:Social_Network_Analysis_Visualization.png)

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

The first column is a pseudo-anonymous hash identifying a user. The second is a pseudo-anonymous hash representing a location. If we eyeball the first 14 lines, we can see that user `1a2ddc2db4693cfd16d534cde5572cc1` visited `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, then `5890595e16cbebb8866e1842e4bd6ec7`. Meanwhile, user `f1a543f5a2c5d49bc5dde298fcf716e4` visited `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, `5890595e16cbebb8866e1842e4bd6ec7`, `5f2b9323c39ee3c861a7b382d205c3d3`, `bd11537f1bc31e334497ec5463fc575e`, and then `5890595e16cbebb8866e1842e4bd6ec7`. And so forth.

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

# Part I: The first crack

The most obvious thing to do is to write this as a series of transformations on the data. We've already seen one: Given the initial data, let's get a list of locations for each user.

We can read the data from a file line-by-line, but to make it easy to follow along in a browser, let's pretend our file is actually a multiline string. So the first thing is to convert it to a an array:

```javascript
const logContents = `1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
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
const logLines = lines(logContents);

const datums = str => str.split(', ');
const datumize = arr => arr.map(datums);

const data = datumize(logLines);
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
  Array(array.length - sliceSize + 1).fill().map((_,i) => array.slice(i, i+sliceSize));

const transitions = list => slicesOf(2, list);

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
const reduceValues = (-, inMap) =>
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

Now we want to count the occurrences of each transition. We'll reduce our new list to a pairing between the highest count and a list of transitions that match. To facilitate this, we'll turn the arrays for each transition into a string:[^canonical]

[^canonical]: It would be nice if JavaScript gave us a Deep JSON Equality function, but it doesn't. We could go down a rabbit-hole of writing our own comparison functions and maps and what-not, but it's simpler to convert the transitions to strings before counting them. That's because JavaScript acts as if strings are canonicalized, so they make great keys for objects and maps.

```javascript
const stringifyTransition = ([from, to]) => `${from} -> ${to}`;
const stringifyAllTransitions = arr => arr.map(stringifyTransition);

const stringTransitions = stringifyAllTransitions(allTransitions);
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

Now we can count them with ease:

```javascript
const countTransitions = arr => arr.reduce(
  (transitionsToCounts, transitionKey) => {
    if (transitionsToCounts.has(transitionKey)) {
      transitionsToCounts.set(transitionKey, 1 + transitionsToCounts.get(transitionKey));
    } else {
      transitionsToCounts.set(transitionKey, 1);
    }
    return transitionsToCounts;
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
    ([wasKeys, wasCount], [transitionKey, count]) => {
      if (count < wasCount) {
        return [wasKeys, wasCount];
      } else if (count > wasCount) {
        return [new Set([transitionKey]), count];
      } else {
        wasKeys.add(transitionKey);
        return [wasKeys, wasCount];
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
const thePipelinedSolution = logContents =>
  greatestValue(
    countTransitions(
      stringifyAllTransitions(
        concatValues(
          transitionize(
            listize(
              datumize(
                lines(
                  logContents
                )
              )
            )
          )
        )
      )
    )
  );

thePipelinedSolution(logContents)
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7"
    ],
    4
```

We can write this using `pipeline`:

```javascript
const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const thePipelinedSolution = pipeline(
  lines,
  datumize,
  listize,
  transitionize,
  concatValues,
  stringifyTransitions,
  countTransitions,
  greatestValue
);

thePipelinedSolution(data)
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

We would use much less data if we wrote a single fold that had a lot of internal moving parts, but only iterated over the data in one pass. Let's try it.

![Speed](/assets/images/speed.jpg)

# Part II: The single pass

In production systems, memory and performance can matter greatly, especially for an algorithm that may be analyzing data at scale. We can transform our "pipelined" solution into a single pass with a bit of care.

Let's start with a `for of` loop. We'll fill in the obvious bit first:[^split]

[^split]: Note that if we are reading the file from disc, we can actually iterate over the lines directly, instead of calling `.splt('\n)` on the contents.

```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(log);

  for (const line of logLines) {
    const row = datums(line);
     // ...
  }
  // ...
}
```

Now we'll hand-code a reduction to get locations by users:

```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(logContents);
  const locationsByUser = new Map();

  for (const line of logLines) {
    const [user, location] = datums(line);

    if (locationsByUser.has(user)) {
      const locations = locationsByUser.get(user);
      locations.push(location);
    } else {
      locationsByUser.set(user, [location]);
    }
  }

  // ...
}
```

What about obtaining transitions from the locations for each user? Strictly speaking, we don't have to worry about slicing the list if we know that the current set of locations has at least two elements. So we'll just take a transition for granted, then we'll discard the oldest location we've seen for this user, as it can no longer figure in any future transitions:[^tidy]

[^tidy]: We could also tidy up some extra variable references, but we're trying to make this code map somewhat reasonably to our pipeline solution, and the extra names make it more obvious. Compared to the overhead of making multiple copies of the data, the extra work for these is negligible.

```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(logContents);
  const locationsByUser = new Map();

  for (const line of logLines) {
    const [user, location] = datums(line);

    if (locationsByUser.has(user)) {
      const locations = locationsByUser.get(user);
      locations.push(location);

      const transition = locations;
      locationsByUser.set(user, locations.slice(1));
    } else {
      locationsByUser.set(user, [location]);
    }
  }

  // ...
}
```

Folding the transitions per user back into one stream would be sheer simplicity, but we can actually skip it since we have the transition we care about. What's the next step that matters? Getting a string from the transition:

```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(logContents);
  const locationsByUser = new Map();

  for (const line of logLines) {
    const [user, location] = datums(line);

    if (locationsByUser.has(user)) {
      const locations = locationsByUser.get(user);
      locations.push(location);

      const transition = locations;
      locationsByUser.set(user, locations.slice(1));

      const transitionKey = stringifyTransition(transition);
    } else {
      locationsByUser.set(user, [location]);
    }
  }

  // ...
}
```

Now we count them, again performing a reduce by hand:

```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(logContents);
  const locationsByUser = new Map();
  const transitionsToCounts = new Map();

  for (const line of logLines) {
    const [user, location] = datums(line);

    if (locationsByUser.has(user)) {
      const locations = locationsByUser.get(user);
      locations.push(location);

      const transition = locations;
      locationsByUser.set(user, locations.slice(1));

      const transitionKey = stringifyTransition(transition);
      let count;
      if (transitionsToCounts.has(transitionKey)) {
        count = 1 + transitionsToCounts.get(transitionKey);
      } else {
        count = 1;
      }
      transitionsToCounts.set(transitionKey, count);
    } else {
      locationsByUser.set(user, [location]);
    }
  }

  // ...
}
```

No need to iterate over `transitionsToCounts` in a separate pass to obtain the highest count, we'll do that in this pass as well, and wind up with the greatest count and entries:


```javascript
const theSingePassSolution = (logContents) => {
  const lines = str => str.split('\n');
  const logLines = lines(logContents);
  const locationsByUser = new Map();
  const transitionsToCounts = new Map();
  let wasKeys = new Set();
  let wasCount = 0;

  for (const line of logLines) {
    const [user, location] = datums(line);

    if (locationsByUser.has(user)) {
      const locations = locationsByUser.get(user);
      locations.push(location);

      const transition = locations;
      locationsByUser.set(user, locations.slice(1));

      const transitionKey = stringifyTransition(transition);
      let count;
      if (transitionsToCounts.has(transitionKey)) {
        count = 1 + transitionsToCounts.get(transitionKey);
      } else {
        count = 1;
      }
      transitionsToCounts.set(transitionKey, count);

      if (count > wasCount) {
        wasKeys = new Set([transitionKey])
        wasCount = count;
      } else if (count === wasCount) {
        wasKeys.add(transitionKey);
      }
    } else {
      locationsByUser.set(user, [location]);
    }
  }

  return [wasKeys, wasCount];
}

console.log(
  theSingePassSolution(logContents)
)
  //=>
    [
      "5f2b9323c39ee3c861a7b382d205c3d3 -> bd11537f1bc31e334497ec5463fc575e",
      "bd11537f1bc31e334497ec5463fc575e -> 5890595e16cbebb8866e1842e4bd6ec7"
    ],
    4
```

We get the same solution, but with a single pass through the data and requiring space proportional to the number of users, not a multiple of the size of the data.

And now for the question that is the entire point of the essay:

[![question book](/assets/images/Question_book-new.svg.png)](https://en.wikipedia.org/wiki/File:Question_book-new.svg)

### the question that is the entire point of the essay

Did writing it as a pipeline, and then refactoring it to a single pass make it easier to write than if we had tried to write it as a single pass in the first place? You be the judge.

---

### notes


