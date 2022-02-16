---
title: "Help Wanted, Explained"
tags: [allonge, noindex]
---

This looks like a "Wordle:"

<div width=290><img alt="Wordle" src="/assets/images/game/wordle.png"/></div>

The plyer starts with an initial condition that looks like this:

<div width=290><img alt="Initial" src="/assets/images/game/initial.png"/></div>

And is trying to make the "winning" condition, which looks like this:

<div width=290><img alt="Winning" src="/assets/images/game/winning.png"/></div>

Each move they make changes one square's colour. The sequence of moves above is the optimal solution.

The reason it takes seven moves and not three is that it isn't as simple as changing the first square to greem then the second, and then the third. The squares the player is allowed to change, and the colours they're allowed to change them to, change with every move. And it's the player's job to try to deduce the underlying rules governing the "topology" of the game.

### the options

On the first move, only one square can be changed, from light-grey to either gray or spring-green:

<div width=290><img alt="First Move" src="/assets/images/game/first-move.png"/></div>

Having chosen to change the colour to spring-green, on the second move there are a new set of available choices. The first square can be changed to light-grey or gray, and the second square can now be changed to gray (but not spring-green):

<div width=290><img alt="Second Move" src="/assets/images/game/second-move.png"/></div>

As we can tell from looking at the history of moves above, the best choice is to change the second square to gray. The options for the remaining moves are:

<div width=290><img alt="Third Move" src="/assets/images/game/third-move.png"/></div>

<div width=290><img alt="Fourth Move" src="/assets/images/game/fourth-move.png"/></div>


### the rules

For the above simple game, each square can be one of three colours, and there are three squares.