---
title: "Having our cake and eating it too: \"Using iterators to write highly composeable code\""
layout: default
tags: [allonge]
---

[![Network](/assets/images/Social_Network_Analysis_Visualization.png)](https://commons.wikimedia.org/wiki/File:Social_Network_Analysis_Visualization.png)

Consider this problem: We have a hypothetical startup that, like so many other unimaginative clones of each other, provides some marginal benefit in exchange for tracking user locations. We want to mine that location data.

For the purposes of this brief blog post, we might have a file that looks like this:

```
1a2ddc2, 5f2b932
f1a543f, 5890595
3abe124, bd11537
f1a543f, 5f2b932
f1a543f, bd11537
f1a543f, 5890595
1a2ddc2, bd11537
1a2ddc2, 5890595
3abe124, 5f2b932
f1a543f, 5f2b932
f1a543f, bd11537
f1a543f, 5890595
1a2ddc2, 5f2b932
1a2ddc2, bd11537
1a2ddc2, 5890595

...
```

The first column is a pseudo-anonymous hash identifying a user. The second is a pseudo-anonymous hash representing a location. If we eyeball the first 14 lines, we can see that user `1a2ddc2` visited `5f2b932`, `bd11537`, `5890595`, `5f2b932`, `bd11537`, then `5890595`. Meanwhile, user `f1a543f` visited `5890595`, `5f2b932`, `bd11537`, `5890595`, `5f2b932`, `bd11537`, and then `5890595`. And so forth.

Let's say we're interested in learning where people tend to go. We are looking for the most popular transitions. So given that user `1a2ddc2` visited `5f2b932`, `bd11537`, `5890595`, `5f2b932`, `bd11537`, then `5890595`, we count the transitions as:

- `5f2b932 -> bd11537`
- `bd11537 -> 5890595`
- `5890595 -> 5f2b932`
- `5f2b932 -> bd11537`
- `bd11537 -> 5890595`

Notice that we have to track the locations by user in order to get the correct transitions. Next, we're interested in the most popular transitions, so we'll count them:

- `5f2b932 -> bd11537` appears twice
- `bd11537 -> 5890595` also appears twice
- `5890595 -> 5f2b932` only appears once

Now all we have to do is count all the transitions across all users, and report the most popular transition. We'll look at three different approaches:

1. [**The staged approach**](#I)
2. [**The single pass approach**](#II)
3. [**The stream approach**](#III)

---

[![Highway 401 and the DVP](/assets/images/Highway_401_by_401-DVP.jpg)](https://commons.wikimedia.org/wiki/File:Highway_401_by_401-DVP.jpg)

# <a name="I"></a>The staged approach

The most obvious thing to do is to write this as a series of transformations on the data. We've already seen one: Given the initial data, let's get a list of locations for each user.

We can read the data from a file line-by-line, but to make it easy to follow along in a browser, let's pretend our file is actually a multiline string. So the first thing is to convert it to an array:

```javascript
const logContents = `1a2ddc2, 5f2b932
f1a543f, 5890595
3abe124, bd11537
f1a543f, 5f2b932
f1a543f, bd11537
f1a543f, 5890595
1a2ddc2, bd11537
1a2ddc2, 5890595
3abe124, 5f2b932
f1a543f, 5f2b932
f1a543f, bd11537
f1a543f, 5890595
1a2ddc2, 5f2b932
1a2ddc2, bd11537
1a2ddc2, 5890595`;

const lines = str => str.split('\n');
const logLines = lines(logContents);

const datums = str => str.split(', ');
const datumize = arr => arr.map(datums);

const data = datumize(logLines);
  //=>
    [["1a2ddc2", "5f2b932"]
     ["f1a543f", "5890595"]
     ["3abe124", "bd11537"]
     ["f1a543f", "5f2b932"]
     ["f1a543f", "bd11537"]
     ["f1a543f", "5890595"]
     ["1a2ddc2", "bd11537"]
     ["1a2ddc2", "5890595"]
     ["3abe124", "5f2b932"]
     ["f1a543f", "5f2b932"]
     ["f1a543f", "bd11537"]
     ["f1a543f", "5890595"]
     ["1a2ddc2", "5f2b932"]
     ["1a2ddc2", "bd11537"]
     ["1a2ddc2", "5890595"]]
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
      "1a2ddc2": [
        "5f2b932",
        "bd11537",
        "5890595",
        "5f2b932",
        "bd11537",
        "5890595"
      ],
      "3abe124": [
        "bd11537",
        "5f2b932"
      ],
      "f1a543f": [
        "5890595",
        "5f2b932",
        "bd11537",
        "5890595",
        "5f2b932",
        "bd11537",
        "5890595"
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
      "1a2ddc2": [
          ["5f2b932", "bd11537"],
          ["bd11537", "5890595"],
          ["5890595", "5f2b932"],
          ["5f2b932", "bd11537"],
          ["bd11537", "5890595"]
        ],
      "f1a543f": [
          ["5890595", "5f2b932"],
          ["5f2b932", "bd11537"],
          ["bd11537", "5890595"],
          ["5890595", "5f2b932"],
          ["5f2b932", "bd11537"],
          ["bd11537", "5890595"]
        ],
      "3abe124": [
          ["bd11537", "5f2b932"]
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
const reduceValues = (mergeFn, inMap) =>
  Array.from(inMap.entries())
    .map(([key, value]) => value)
      .reduce(mergeFn);

const concatValues = reduceValues.bind(null, (a, b) => a.concat(b));

const allTransitions = concatValues(transitionsByUser);
  //=>
    [
      ["5f2b932", "bd11537"],
      ["bd11537", "5890595"],
      ["5890595", "5f2b932"],
      ["5f2b932", "bd11537"],
      ["bd11537", "5890595"],
      ["5890595", "5f2b932"],
      ["5f2b932", "bd11537"],
      ["bd11537", "5890595"],
      ["5890595", "5f2b932"],
      ["5f2b932", "bd11537"],
      ["bd11537", "5890595"],
      ["bd11537", "5f2b932"]
    ]
```

Now we want to count the occurrences of each transition. We'll reduce our new list to a pairing between the highest count and a list of transitions that match. To facilitate this, we'll turn the arrays for each transition into a string:[^canonical]

[^canonical]: It would be nice if JavaScript gave us a Deep JSON Equality function, but it doesn't. We could go down a rabbit-hole of writing our own comparison functions and maps and what-not, but it's simpler to convert the transitions to strings before counting them. That's because JavaScript acts as if strings are canonicalized, so they make great keys for objects and maps.

```javascript
const stringifyTransition = transition => transition.join(' -> ');
const stringifyAllTransitions = arr => arr.map(stringifyTransition);

const stringTransitions = stringifyAllTransitions(allTransitions);
  //=>
    [
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595",
      "5890595 -> 5f2b932",
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595",
      "5890595 -> 5f2b932",
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595",
      "5890595 -> 5f2b932",
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595",
      "bd11537 -> 5f2b932"
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
      "5f2b932 -> bd11537": 4,
      "bd11537 -> 5890595": 4,
      "5890595 -> 5f2b932": 3,
      "bd11537 -> 5f2b932": 1
    }
```

And which is/are the most common?

```javascript
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
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595"
    ],
    4
```

### pipelining this solution

One of the nice thing about this solution is that it forms a pipeline. A chunk of data moves through the pipleline, being transformed at each stage. Leaving the definitions out, the pipeline is:

```javascript
const theStagedSolution = logContents =>
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

theStagedSolution(logContents)
  //=>
    [
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595"
    ],
    4
```

We can write this using `pipeline`:

```javascript
const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const theStagedSolution = pipeline(
  lines,
  datumize,
  listize,
  transitionize,
  concatValues,
  stringifyAllTransitions,
  countTransitions,
  greatestValue
);
```

And here is the complete staged solution:

```javascript
const lines = str => str.split('\n');
const logLines = lines(logContents);

const datums = str => str.split(', ');
const datumize = arr => arr.map(datums);

const listize = arr => arr.reduce(
  (map, [user, location]) => {
    if (map.has(user)) {
      map.get(user).push(location);
    } else {
      map.set(user, [location]);
    }
    return map;
  }, new Map());

const slicesOf = (sliceSize, array) =>
  Array(array.length - sliceSize + 1).fill().map((_,i) => array.slice(i, i+sliceSize));
const transitions = list => slicesOf(2, list);

const mapValues = (fn, inMap) => Array.from(inMap.entries()).reduce(
  (outMap, [key, value]) => {
    outMap.set(key, fn(value));
    return outMap;
  }, new Map());

const transitionize = mapValues.bind(null, transitions);

const reduceValues = (mergeFn, inMap) =>
  Array.from(inMap.entries())
    .map(([key, value]) => value)
      .reduce(mergeFn);

const concatValues = reduceValues.bind(null, (a, b) => a.concat(b));

const stringifyTransition = transition => transition.join(' -> ');
const stringifyAllTransitions = arr => arr.map(stringifyTransition);

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

const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const theStagedSolution = pipeline(
  lines,
  datumize,
  listize,
  transitionize,
  concatValues,
  stringifyAllTransitions,
  countTransitions,
  greatestValue
);

theStagedSolution(logContents)
  //=>
    [
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595"
    ],
    4
```

The very nice thing is that we have decomposed our solution into a simple pipe that takes some data in at one end, and performs a succession of transformations on it, until what emerges at the other end is the result we want.

Each step can be easily checked and tested, and each step as a well-understood and explicit input, followed by an explicit and well-understood output. There are no side-effects to confuse our reasoning.

But there is a dark side, of course. If we care very deeply about memory, at each step but the last, we construct a data structure of roughly equal size to the input data.

We would use much less data if we wrote a single fold that had a lot of internal moving parts, but only iterated over the data in one pass. Let's try it.

![Speed](/assets/images/speed.jpg)

# <a name="II"></a>The single pass approach

In production systems, memory and performance can matter greatly, especially for an algorithm that may be analyzing data at scale. We can transform our "staged" solution into a single pass with a bit of care.

Let's start with a `for of` loop. We'll fill in the obvious bit first:[^split]

[^split]: Note that if we are reading the file from disc, we can actually iterate over the lines directly, instead of calling `.split('\n')` on the contents.

```javascript
const theSinglePassSolution = (logContents) => {
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
const theSinglePassSolution = (logContents) => {
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

[^tidy]: We could also tidy up some extra variable references, but we're trying to make this code map somewhat reasonably to our staged approach, and the extra names make it more obvious. Compared to the overhead of making multiple copies of the data, the extra work for these is negligible.

```javascript
const theSinglePassSolution = (logContents) => {
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
const theSinglePassSolution = (logContents) => {
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
const theSinglePassSolution = (logContents) => {
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
const theSinglePassSolution = (logContents) => {
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

theSinglePassSolution(logContents)
  //=>
    [
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595"
    ],
    4
```

We get the same solution, but with a single pass through the data and requiring space proportional to the number of users, not a multiple of the size of the data. But note that although the code now looks somewhat different, it actually does the exact same steps as the staged approach, in the same order.

That's because we wrote (and debugged!) the pipeline, and then refactored it to a single pass. We did all of the hard reasoning while working with the easier-to-reason-about and factor code, before we wrote the everything-entangled code.

Obviously, there's a trade-off involved. Maximum readability and easiest to reason about? Or performance? Or is it obvious?

What if we could have it both ways?

[![Beetle Asembly Line at Volkswagon](/assets/images/assembly.jpg)](https://www.flickr.com/photos/autohistorian/32637661426)

# <a name="III"></a>The stream approach

Our staged approach sets up a pipeline of functions, each of which has a well-defined input and a well-defined output:

```javascript
const theStagedSolution = pipeline(
  lines,
  datumize,
  listize,
  transitionize,
  concatValues,
  stringifyAllTransitions,
  countTransitions,
  greatestValue
);
```

This is an excellent model of computation, it's decomposed nicely, it's easy to test, it's easy to reuse the components, and we get names for things that matter. The drawback is that the inputs and outputs of each function are bundles of data the size of the entire input data.

If this were a car factory, we would have an assembly line, but instead of making one frame at a time in the first stage, then adding one engine at a time in the second stage, and so on, this pipeline makes frames for **all** the cars at the first stage before passing the frames to have **all** the engines added at the second, and so forth.

**Terrible!**

Ideally, an automobile factory passes the cars along one at a time, so that at each station, inputs are arriving continuously and outputs are being passed to the next station continuously. We can do the same thing in JavaScript, but instead of working with lists, we work with [iterables].

[iterables]: http://raganwald.com/2015/02/17/lazy-iteratables-in-javascript.html "Lazy Iterables in JavaScript"

So instead of starting with a massive string that we split into lines, we would start with an iterator over the lines in the log. This could be a library function that reads a physical file a line at a time, or it could be a series of log lines arriving asynchronously from a service that monitors our servers. For testing purposes, we'll take our string and wrap it in a little function that returns an iterable over its lines, but won't let us treat it like a list:

```javascript
function * asStream (iterable) { yield * iterable; };

const lines = str => str.split('\n');
const streamOfLines = asStream(lines(logContents));
```

`asStream` has no functional purpose, it exists merely to constrain us to work with a stream of values rather than with lists.

With this in hand, we can follow the same general path that we did with writing a one pass algorithm: We go through our existing staged approach and rewrite each step. Only instead of combining them all into one function, we'll turn them from ordinary functions into [generators], functions that generate streams of values. Let's get cracking!

[generators]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator

Our original staged approach mapped its inputs several times. We can't call `.map` on an iterable, so let's write a convenience function to do it for us:

```javascript
function * mapIterableWith (mapFn, iterable) {
  for (const value of iterable) {
    yield mapFn(value);
  }
}

const datums = str => str.split(', ');
const datumizeStream = iterable => mapIterableWith(datums, iterable);
```

Or the equivalent:

```javascript
const datumizeStream = mapIterableWith.bind(null, datums);
```

Are you tired of repeating this pattern? Let's (finally) write a left partial application function:

```javascript
const leftPartialApply = (fn, ...values) => fn.bind(null, ...values);

const datumizeStream = leftPartialApply(mapIterableWith, datums);
```

Now we're ready for something interesting. Our original code performed a `reduce`, folding a list into a map from users to locations. We are working with a stream, of course, and we absolutely do not want to reduce all the elements of the stream to a single object.

[![IBM Card Sorter](/assets/images/card-sorter.jpg)](https://www.flickr.com/photos/pargon/2444932424)

### collating our locations

Consider the metaphor of the assembly line. Log lines enter at the beginning, and are converted into arrays by `datumizeStream`. Instead of bundling everything up into a box, we want to process the lines, but we need to collate the items so we can process them in order for each user.

One way to do this while processing one line at a time is to create a series of parallel streams, one per user. We direct each line into the appropriate stream and do some processing on it. We then merge the outputs back into a single stream for more processing.

If we stop and think about it, this is what we actually wanted to do when we created a map to begin with. We just need to code that intention directly. So we will write a function that takes a stream and divides it (metaphorically) into multiple streams according to a function that takes each value and returns a string key.

The key function is simplicity itself:

```javascript
const userKey = ([user, _]) => user;
```

We plan to will apply this to each value as it comes in, and streams will be created for each distinct key. Then, a *transforming function* will be applied to each stream. Our mapping functions so far were stateless, and mapped one value to another. But we're going to do both of these things differently. Our transforming functions will have state, and they will map each value into a list of zero or one value, which will then be merged to form our resulting stream.

Our function looks a lot like the code we wrote for extracting transitions from our single pass solution, only we don't keep the locations per user in a map, and we either return a transition in a list, or an empty list:

```javascript
let locations = [];

([_, location]) => {
  locations.push(location);

  if (locations.length === 2) {
    const transition = locations;
    locations = locations.slice(1);
    return [transition];
  } else {
    return [];
  }
}
```

This function take a location at a time, and returns either an empty list or a transition in a list. We can use it to iterate over locations one by one, and get transitions. Which is exactly what we're going to do. Mind you, it isn't quite ready, because while it does maintain state (in the `locations` variable), we will need a different state for each user. In order to have as many of these as we like, we'll wrap the whole thing in a function:

```javascript
const transitionsMaker = () => {
  let locations = [];

  return ([_, location]) => {
    locations.push(location);

    if (locations.length === 2) {
      const transition = locations;
      locations = locations.slice(1);
      return [transition];
    } else {
      return [];
    }
  }
}
```

Now we can call `transitionsMaker` for each user, and get a function that can map the locations for that user into transitions.

Armed with a function for turning a user and location into a key, and `transitionsMaker`, we can write our collating function. It takes a function that makes a stateful mapping function and a function that extracts keys from values as arguments, and returns a function that transforms a stream of values:

```javascript
const sortedFlatMap = (mapFnMaker, keyFn) =>
  function * (values) {
    const mappersByKey = new Map();

    for (const value of values) {
      const key = keyFn(value);
      let mapperFn;

      if (mappersByKey.has(key)) {
        mapperFn = mappersByKey.get(key);
      } else {
        mapperFn = mapFnMaker();
        mappersByKey.set(key, mapperFn);
      }

      yield * mapperFn(value);
    }
  };

const transitionsStream = sortedFlatMap(transitionsMaker, userKey);
```

> Why is `sortedFlatMap` called a "flat map?" A function that maps a value to zero or more values is called a [flat map]. There's actually more to this idea if we dive into functional programming a little more deeply, we can think of putting values in lists as "wrapping" them, and if we have an operation that takes a value and then returns a wrapped value, "flat map" is a function that performs the operation on a value and unwraps the result.

[flat map]: https://martinfowler.com/articles/collection-pipeline/flat-map.html

> In our case, we take values and map them to zero or one transition, which we represent with an empty list or a list with a transition. `sortedFlatMap` "flattens" or "unwraps" these lists using `yield *`, which yields the contents of an iterable, in our case, a list with zero or one element.

Continuing our practise of writing our "stream" solution with the same steps as our "pipeline" solution, we transform the transitions into strings we can use as keys:

```javascript
const stringifyTransition = transition => transition.join(' -> ');

const stringifyStream = leftPartialApply(mapIterableWith, stringifyTransition);
```

If we stop and debug our work, we'll see that we now have a stream of transitions represented as strings, and we have the same memory footprint as our single pass solution:

```javascript
stringifyStream(transitionsStream(datumizeStream(streamOfLines)))
  //=>
    "5890595 -> 5f2b932"
    "5f2b932 -> bd11537"
    "bd11537 -> 5890595"
    "5f2b932 -> bd11537"
    "bd11537 -> 5890595"
    "bd11537 -> 5f2b932"
    "5890595 -> 5f2b932"
    "5f2b932 -> bd11537"
    "bd11537 -> 5890595"
    "5890595 -> 5f2b932"
    "5f2b932 -> bd11537"
    "bd11537 -> 5890595"
```

### counting transitions

Our original function for counting transitions performed a `.reduce` on a list of transitions:

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
```

It's straightforward to transform this into an iteration over the transitions we receive:

```javascript
const countTransitionStream = transitionKeys => {
  const transitionsToCounts = new Map();

  for (const transitionKey of transitionKeys) {
    if (transitionsToCounts.has(transitionKey)) {
      transitionsToCounts.set(transitionKey, 1 + transitionsToCounts.get(transitionKey));
    } else {
      transitionsToCounts.set(transitionKey, 1);
    }
  }
  return transitionsToCounts;
}
```

And then we can reüse:

```javascript
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
```

And now we can get our result "the old fashioned way:"

```javascript
greatestValue(
  countTransitionStream(
    stringifyStream(
      transitionsStream(
        datumizeStream(
          streamOfLines
        )
      )
    )
  )
)
```

Or use a pipeline again:

```javascript
const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const theStreamSolution = pipeline(
  datumizeStream,
  transitionsStream,
  stringifyStream,
  countTransitionStream,
  greatestValue
);

theStreamSolution(streamOfLines)
  //=>
    [
      "5f2b932 -> bd11537",
      "bd11537 -> 5890595"
    ],
    4
```

Voila!

To recap what we have accomplished: We are processing the data step by step, just like our original staged approach, but we are also handling the locations one by one without processing the entire data set in each step, just like our single pass approach.

We have harvested the best parts of each approach.

Now, it's true that we have does a bunch of things that people call "functional programming," but that wasn't the goal. The goal, the benefit we can inspect, is that we have decomposed the algorithm into a series of steps, each of which has well-defined inputs and outputs. *And*, we have arranged our code such that we are not making copies of the entire data set with each of our steps.

The end goal, as always, is to decompose the algorithm into smaller parts that can be named, tested, and perhaps reused elsewhere. Using iterables and generators to implement a stream approach can help us achieve our goals without compromising practical considerations like memory footprint.

---

### further reading

- [Understanding Transducers in JavaScript](https://medium.com/@roman01la/understanding-transducers-in-javascript-3500d3bd9624)

### appendix: the full code

```javascript
const logContents =`1a2ddc2db4693cfd16d534cde5572cc1, 5f2b9323c39ee3c861a7b382d205c3d3
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

const asStream = function * (iterable) { yield * iterable; };

const lines = str => str.split('\n');
const streamOfLines = asStream(lines(logContents));

function * mapIterableWith (mapFn, iterable) {
  for (const value of iterable) {
    yield mapFn(value);
  }
}

const leftPartialApply = (fn, ...values) => fn.bind(null, ...values);

const datums = str => str.split(', ');
const datumizeStream = leftPartialApply(mapIterableWith, datums);

const userKey = ([user, _]) => user;

const transitionsMaker = () => {
  let locations = [];

  return ([_, location]) => {
    locations.push(location);

    if (locations.length === 2) {
      const transition = locations;
      locations = locations.slice(1);
      return [transition];
    } else {
      return [];
    }
  }
}

const sortedFlatMap = (mapFnMaker, keyFn) =>
  function * (values) {
    const mappersByKey = new Map();

    for (const value of values) {
      const key = keyFn(value);
      let mapperFn;

      if (mappersByKey.has(key)) {
        mapperFn = mappersByKey.get(key);
      } else {
        mapperFn = mapFnMaker();
        mappersByKey.set(key, mapperFn);
      }

      yield * mapperFn(value);
    }
  };

const transitionsStream = sortedFlatMap(transitionsMaker, userKey);

const stringifyTransition = transition => transition.join(' -> ');
const stringifyStream = leftPartialApply(mapIterableWith, stringifyTransition);

const countTransitionStream = transitionKeys => {
  const transitionsToCounts = new Map();

  for (const transitionKey of transitionKeys) {
    if (transitionsToCounts.has(transitionKey)) {
      transitionsToCounts.set(transitionKey, 1 + transitionsToCounts.get(transitionKey));
    } else {
      transitionsToCounts.set(transitionKey, 1);
    }
  }
  return transitionsToCounts;
}

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
const pipeline = (...fns) => fns.reduceRight((a, b) => c => a(b(c)));

const theStreamSolution = pipeline(
  datumizeStream,
  transitionsStream,
  stringifyStream,
  countTransitionStream,
  greatestValue
);
```

### notes


