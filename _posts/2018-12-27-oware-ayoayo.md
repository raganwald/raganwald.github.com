---
title: "Playing Ayoayo/Oware in JavaScript"
tags: [recursion,allonge,noindex]
---

[![Natural Mancala Game](/assets/images/ayoayo/1.jpg)](https://www.flickr.com/photos/candiedwomanire/104320826)

> [Oware] is an abstract strategy game among the [Mancala] family of board games (pit and pebble games) played worldwide with slight variations as to the layout of the game, number of players and strategy of play. Its origin is uncertain[2] but it is widely believed to be of Ashanti origin. Played in the Ashanti Region and throughout the Caribbean, Oware and its variants have many names.

[Oware]: https://en.wikipedia.org/wiki/Oware
[Mancala]: https://en.wikipedia.org/wiki/Mancala

---

[![Mancala / Awale](/assets/images/ayoayo/2.jpg)](https://www.flickr.com/photos/elpadawan/8479297425/)

### ayoayo

The Yoruba people of Nigeria call their version of the game **[Ayoayo]**. Ayoayo is played on the most common layout, a board with two rows of six pits. Many boards also provide with a pit on each side of the board for "captured" seeds, but this is optional.

[Ayoayo]: https://en.wikipedia.org/wiki/Ayoayo

The players face each other with the board between them, such that each player has a row of six pits in front of them. These pits "belong" to that player. If extra pits are provided for captured seeds, each player takes one for themselves, but the extra pits are not in play. (In some other games in the same family, pits for captured seeds are used in play.)

We've mentioned capturing seeds several times, and for good reason: The game play consists of capturing seeds, and when the game is completed, the player who has captured the most seeds, wins.

The rules are simple:

The game begins with four seeds in each of the twelve pits. Thus, the game requires 48 seeds. Pebbles, marbles, or even lego pieces can be used to represent the seeds. A wooden board is nice, but pits can be scooped out of earth or sand to make a board. This extreme simplicity is part of the game's charm, much as tic-tac-toe's popularity stems in part from the fact that you can play a game with little more than a stick and a piece of flat earth.

The players alternate turns, as in may games.

*On a player's turn, they select one of their pits to "sow." There are some exceptions listed below, but in general if the player has more than one pit with seeds, they may select which one to sow. There are many variations on rules for how to sow the seeds amongst the Mancala family of games, but in Ayoayo, sowing works like this:*

- The player scoops all of the seeds from the starting pit into their hand.
- Moving counter-clockwise, the player drops one seed into each pit.
- On their row, they move from left to right.
- If they reach the end of their row, they move from right to left on their opponent's row (thus "counter-clockwise").
- They always skip the starting pit on their row.
- The sowing pauses when they have sowed the last seed in their hand.

*If the last seed lands in a pit on either side of the board that contains one or more seeds, they scoop the seeds up (including that last seed), and continue sowing. They continue to skip their original starting pit only, but can sow into any pits that get scooped up in this manner. This is called **relay sowing**.*

*If the last seed lands in an empty pit **on that player's own side**, the player "captures" any seeds that are in the pit on the opponent's side of the board from their last pit.*

*If a player has no move on their turn, the game ends, and their opponent captures any remaining seeds (which will--of course--be on their side)*.

*If a player is able to make a move that leaves their opponent with one or more moves to make, they must make a move that leaves their opponent with one or more moves to make. If a player has several such moves (as is usually the case), the player may choose which move to make.*

If we were going to make an Ayoayo program, where would we start?

---

### the first attempt at ayoayo

Let's start with a simple idea: We'll have to represent the state of the game. We could use an array for the twelve pits of the game, with an integer representing the number of seeds in that put. We'll initialize it with four seeds in each pit:

```javascript
const pits = Array(12).fill(4);
```

We'll associate the elements of the array with the pits belonging to the players like this:

[![Associating array elements with pits](/assets/images/ayoayo/3.jpg)](https://www.flickr.com/photos/narasclicks/4654106883/)

There are lots of places to go from here, but for the sake of argument, let's begin with a function that scoops any pit and sows the seeds counter-clockwise. In Ayoayo, a full turn involves relay sowing as described above:

> When relay sowing, if the last seed during sowing lands in an occupied hole, all the contents of that hole, including the last sown seed, are immediately re-sown from the hole.

The other kind of sowing, as used in other games from the same family, is just called _sowing_. The sowing stops when the last seed is sown, regardless of whether the last seed lands in an occupied or unoccupied pit. It's fairly obvious that if we make a function for sowing, we can use that to make a function for relay sowing, so let's start with a sowing function:

```javascript
function sow(fromPit, skipPit = fromPit) {
  // empty the pit into the hand
  let seedsInHand = pits[fromPit];
  pits[fromPit] = 0;

  // an unexpected condition
  if (seedsInHand === 0) return;

  // let's go!
  let pitToSow = fromPit;

  while (seedsInHand > 0) {
    pitToSow = ++pitToSow % pits.length;
    if (pitToSow === skipPit) continue;

    ++pits[pitToSow];
    --seedsInHand;
  }

  return [pitToSow, pits[pitToSow]];
}

sow(0)
  //=> [4, 5]
pits
  //=> [0, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4]
```

We can test it by hand. We start with the board looking like this:

![initial position](/assets/images/ayoayo/4.jpg)

And after sowing once, it looks like this:

![position after sowing from position zero](/assets/images/ayoayo/5.jpg)

Now, there were five seeds in the last pit. If there are two or more seeds in the last pit, it wasn't empty before we sowed the last seed into it. So when relay sowing, we'd sow again, only this time we'll tell our function to keep ignoring pit `0`, like this:

```javascript
sow(4, 0)
  //=> [9, 5]
```

Five seeds in the last pit, Let's do it again:

```javascript
sow(9, 0)
  //=> [3, 6]
```

Six seeds! Again:

```javascript
sow(6, 0)
  //=> [9, 1]

pits
  //=> [0, 6, 6, 0, 1, 6, 6, 6, 6, 1, 5, 5]
```

Aha, we're done. Let's try it by hand,  remembering to skip pit `0`, and compare:

![position after relay sowing from position zero](/assets/images/ayoayo/6.jpg)


We're off to a reasonable start.

---

[![The boardgame they are playing is a game in the mancala family called Toghiz Qumalaq (Тоғыз құмалақ), which roughly translates as "nine pieces of sheep shit."](/assets/images/ayoayo/toghiz-qumalaq.jpg)](https://www.flickr.com/photos/upyernoz/5662602383)

### some practical considerations