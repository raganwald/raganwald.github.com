---
title: "Incremental Evaluation"
layout: default
tags: [allonge]
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
const datums = str => str.split(', ');
const datumize = arr => arr.map(datums);

const data = datumize(lines(log))
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

const locationsByUser = listize(data)
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

We'll convert these to transitions. `chunksOf` is a handy function for that:

```javascript
const chunksOf = (chunkSize, array) =>
  Array(Math.ceil(array.length/chunkSize)).fill().map((_,i) => array.slice(i*chunkSize,i*chunkSize+chunkSize));

const transitions = list => chunksOf(2, list);

const transitionsByUser = Array.for(locationsByUser.entries()).reduce(
  (map, [user, listOfLocations]) => {
    map.set(user, transitions(listOfLocations));
    return map;
  }, new Map());

---

### notes


