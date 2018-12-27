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

The Yoruba people of Nigeria call their version of the game [**Ayoayo**]. Ayoayo is played on the most common layout, a board with two rows of six pits. Many boards also provide with a pit on each side of the board for "captured" seeds, but this is optional.

[Ayoayo]: https://en.wikipedia.org/wiki/Ayoayo

The players face each other with the board between them, such that each player has a row of six pits in front of them. These pits "belong" to that player. If an extra pit is provided for captured seeds, each player takes one for themselves. If nbot, captured seeds are placed in front of the player who captured them.

We've mentioned capturing seeds several times, and for good reason: The game play consists of caturing seeds, and when the game is completed, the player who has captured the most seeds, wins.

The rules are simple:

1. The game begins with four seeds in each of the twelve pits. Thus, the game requires 48 seeds. Pebbles, marbles, or even lego pieces can be used to represent the seeds. A wooden board is nice, but pits can be scooped out of earth or sand to make a board. This extreme simplicity is part of the game's charm, much as tic-tac-toe's popularity stems in prt from the fact that you can play a game with little more than a stick and a piece of flat earth.
2. The players alternate turns, as in may games.
3. On a player's turn, they select one of their pits to "sow." There are some exceptions listed below, but in general if the player has more than one pit with seeds, they may select which one to sow. There are many variations on rules for how to sow the seeds amongst the Mancala family of games, but in Ayoayo, sowing works like this:
  - The player scoops all of the seeds from the starting pit into their hand.
  - Moving counter-clockwise, the player drops one seed into each pit.
  - On their row, they move from left to right.
  - If they reach the end of their row, they move from right to left on their opponent's row (thus "counter-clockwise").
  - They always skip the starting pit on their row.
  - The sowing pauses when they have sowed the last seed in their hand.
4. If the last seed lands in a pit on either sde of the board that contains one or more seeds, they scoop the seeds up (including that last seed), and continue sowing. They continue to skip their original starting pit only, but can sow into any pits that get scooped up in this manner.
5. If the last seed lands in an empty pit, the player "captures" any seeds that are in the pit on the opposite side of the board from their last pit.
6. If a player has no move on their turn, the game ends, and their opponent captures any remaining seeds (which will--of course--be on their side).
7. If a player is able to make a move that leaves their opponent with one or more moves to make, they must make a move that leaves their opponent with one or more moves to make. If a player has several such moves (as is usually the case), the player may choose which move to make.

If we were going to make an Ayoayo program, what sort of functions would we need?

---

### functional ayoayo

[ja]: https://leanpub.com/javascriptallongesix

