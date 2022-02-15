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

Each move they make changes one square's colour. The reason it takes seven moves and not three is that it isn't as simple as changing the first square to greem then the second, and then the third. The squares the player is allowed to change, and the colours they're allowed to change them to, change with every move. And it's the player's job to try to deduce the underlying rules governing the "topology" of the game.

For example, on the first move, only one square can be changed, from light-grey to either gray or spring-green:

![First Move](/assets/images/game/first-move.png)

Having chosen to change the colour to spring-green, on the second move there are a new set of available chocies. The first square can be changed to light-grey or gray, and the second square can now be changed to gray (but not spring-green):

![Second Move](/assets/images/game/second-move.png)

### the rules