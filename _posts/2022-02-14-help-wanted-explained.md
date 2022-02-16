---
title: "Help Wanted, Explained"
tags: [allonge, noindex]
---

This looks like a "Wordle:"

![Wordle](/assets/images/game/wordle.png)

The plyer starts with an initial condition that looks like this:

![Initial](/assets/images/game/initial.png)

And is trying to make the "winning" condition, which looks like this:

![Winning](/assets/images/game/winning.png)

Each move they make changes one square's colour. The sequence of moves above is the optimal solution.

The reason it takes seven moves and not three is that it isn't as simple as changing the first square to greem then the second, and then the third. The squares the player is allowed to change, and the colours they're allowed to change them to, change with every move. And it's the player's job to try to deduce the underlying rules governing the "topology" of the game.

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

### the rules

For the above simple game, each square can be one of three colours, and there are three squares.