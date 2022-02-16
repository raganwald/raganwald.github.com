---
title: "Help Wanted, Explained"
tags: [allonge, noindex]
---

This looks like a "Wordle:"

![Wordle](/assets/images/game/wordle.png)

The player starts with an initial condition that looks like this:

![Initial](/assets/images/game/initial.png)

And is trying to make the "winning" condition, which looks like this:

![Winning](/assets/images/game/winning.png)

Each move they make changes one square's colour. The sequence of moves above is the optimal solution.

The reason it takes seven moves and not three is that it isn't as simple as changing the first square to green then the second, and then the third. The squares the player is allowed to change, and the colours they're allowed to change them to, change with every move. And it's the player's job to try to deduce the underlying rules governing the "topology" of the game.

### the options

On the first move, only one square can be changed, from light-grey to either gray or spring-green:

![First Move](/assets/images/game/first-move.png)

Having chosen to change the colour to spring-green, on the second move there are a new set of available choices. The first square can be changed to light-grey or gray, and the second square can now be changed to gray (but not spring-green):

![Second Move](/assets/images/game/second-move.png)

As we can tell from looking at the history of moves above, the best choice is to change the second square to gray. The options for the remaining moves are... Third move:

![Third Move](/assets/images/game/third-move.png)

Fourth move:

![Fourth Move](/assets/images/game/fourth-move.png)

Fifth move:

![Fifth Move](/assets/images/game/fifth-move.png)

Penultimate move:

![Sixth Move](/assets/images/game/sixth-move.png)

Final move:

![Final Move](/assets/images/game/final-move.png)

### the rules

For the above simple game, each square can be one of three colours, and there are three squares. If we accept that the ordering of the squares from left-to-right is significant, the rules for which changes are allowed are:

1. A square can change colour to another colour if it is the first square of the colour it is changing *from*, and;
2. A square can change colour to another colour if it will become the first square of the colour it is changing *to*.

This game has a name, it is called **Hanoing**. Its name is taken from the classic Lucas' Tower problem, which is often called [The Towers of Hanoi][towers]. It's named after the Towers of Hanoi because mathematically, it's the exact same problem, just with a different visual representation that disguises the problem for those who've seen it before.[^FernandoRodriguezVillegas]

[towers]: https://en.wikipedia.org/wiki/Tower_of_Hanoi

[^FernandoRodriguezVillegas] The Hanoing representation is attributed to [Fernando Rodriguez Villegas](https://users.ictp.it/~villegas/)

To see the similarity, here's a three-disc tower, with the pegs coloured. We'll pretend the discs are made of some transparent material that takes on the colour of the peg it is on.

The initial position looks like this:

![Hanoi Initial](/assets/images/game/hanoi-initial.png)

And after the first move, the game looks like this:

![Hanoi Second](/assets/images/game/hanoi-second.png)

And after the second move, it looks like this:

![Hanoi Third](/assets/images/game/hanoi-third.png)

If we think of our row of squares representing the discs from smallest to largest, the color shows which peg the disc is on, and the two Hanoing rules describe that you can only move a disc from the top of a peg, and only onto a peg that doesn't have a smaller disc on top.