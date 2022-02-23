---
title: "Wordloid"
tags: [allonge, noindex]
---

This page documents one design for a "game" that consists of a set of related puzzles, ideally offered to players to solve in order of increasing difficulty. We begin with the simplest version of the puzzles.

## The First Puzzle

This looks a little like a wordle:[^wordle]

[^wordle]: The original [wordle](https://www.nytimes.com/games/wordle/index.html)  was created by Brooklyn-based software developer Josh Wardle for his girlfriend, who loves word games. In October 2021, Mr. Wardle released it to the world, and in 2022 it was purchased by The New York Times.

![Wordle](/assets/images/wordloid/wordle.png)

Each row is one position of a "game," the first row is the initial position:

![Initial](/assets/images/wordloid/initial.png)

Each row thereafter represents the position after the player has changed one square's colour. The final position is the "winning" position:

![Winning](/assets/images/wordloid/winning.png)

The player's first objective is to solve the problem. A secondary objective is to solve the problem in the minimum number of moves. Another problem is to solve the problem in the *maximum* number of moves without repeating any position.

The reason it takes seven moves and not three is that it isn't as simple as changing the first square to green then the second, and then the third. The squares the player is allowed to change, and the colours they're allowed to change them to, change with every move. And it's the player's job to try to deduce the underlying rules governing the "topology" of the game.

### the first puzzle's rules

On the first move, only one square can be changed, from light-grey to either gray or spring-green:

![First Move](/assets/images/wordloid/first-move.png)

Having chosen to change the colour to spring-green, on the second move there are a new set of available choices. The first square can be changed to light-grey or gray, and the second square can now be changed to gray (but not spring-green):

![Second Move](/assets/images/wordloid/second-move.png)

As we can tell from looking at the history of moves above, the best choice is to change the second square to gray. The options for the remaining moves are... Third move:

![Third Move](/assets/images/wordloid/third-move.png)

Fourth move:

![Fourth Move](/assets/images/wordloid/fourth-move.png)

Fifth move:

![Fifth Move](/assets/images/wordloid/fifth-move.png)

Penultimate move:

![Sixth Move](/assets/images/wordloid/sixth-move.png)

Final move:

![Final Move](/assets/images/wordloid/final-move.png)

Which brings us to the winning condition for this puzzle:

![Winning](/assets/images/wordloid/winning.png)

### the first puzzle, explained

For the above simple game, each square can be one of three colours, and there are three squares. If we accept that the ordering of the squares from left-to-right is significant, the rules for which changes are allowed are:

1. A square can only change colour to another colour if it is the first square of the colour it is changing *from*, and;
2. A square can only change colour to another colour if it will become the first square of the colour it is changing *to*.

This game has a name, it is called **[Hanoing]**. Its name is taken from the classic Lucas' Tower problem, which is often called [The Towers of Hanoi][towers]. It's named after the Towers of Hanoi because mathematically, it's the exact same problem, just with a different visual representation that disguises the problem for those who've seen it before.[^FernandoRodriguezVillegas]

[Hanoing]: https://www.cut-the-knot.org/Curriculum/Combinatorics/Hanoing.shtml

[towers]: https://en.wikipedia.org/wiki/Tower_of_Hanoi

[^FernandoRodriguezVillegas]: The Hanoing representation is attributed to [Fernando Rodriguez Villegas](https://users.ictp.it/~villegas/)

To see the similarity, here's a three-disc tower, with the pegs coloured. We'll pretend the discs are made of some transparent material that takes on the colour of the peg it is on.

The initial position looks like this:

![Hanoi Initial](/assets/images/wordloid/hanoi-initial.png)

And after the first move, the game looks like this:

![Hanoi Second](/assets/images/wordloid/hanoi-second.png)

And after the second move, it looks like this:

![Hanoi Third](/assets/images/wordloid/hanoi-third.png)

If we think of our row of squares representing the discs from smallest to largest, the color shows which peg the disc is on, and the two Hanoing rules describe that you can only move a disc from the top of a peg, and only onto a peg that doesn't have a smaller disc on top.

---

## More Complex Puzzles

"Hanoing" is just the first of several puzzles, intended of be of increasing difficulty to solve, especially without being told the rules in advance. Other puzzles will use roughly the same interface, but emulate variations on Lucas' Tower.

In all of the variations, you cannot place a disc on top of a smaller disc, and both the number of discs and the number of pegs remain constant.

**Random** is a variation where the initial position and winning position are chosen randomly, rather than starting with all the discs on one peg and the winning position being all the discs on another peg. In the wordloid interface, this corresponds to beginning with a random assortment of colours and trying to achieve a different assortment of colours.

A much harder variation of Random that **only** applies to the wordloid interface begins with all the discs being the light grey, and attempting to turn them all green. But instead of the colours mapping to the same pegs, each square would have its own mapping. This can be very disorienting to figure out. 

**Adjacent** is a variation where discs can be moved either one peg to the left or one peg to the right, but cannot skip a peg. In the wordloid interface, this limits every possible colour change to be either changing another colour to gray, or changing gray to another colour.

**Ring** is a variation that works just like regular Hanoing, but discs can only move one peg to the right. Discs on the last peg can be moved back to the first peg, because the pegs form a ring. In the wordloid interface, if a square can change colour, there is only one possible colour it can change to.

### more than three colours

Several variations of the original Lucas' Towers involve four or more pegs, which we represent as having four colours, instead of three.[^four]

[^four]: [Variations on the Four-Post Tower of Hanoi Puzzle](https://www.cs.wm.edu/~pkstoc/boca.pdf)

The **Reeve's Puzzle** has four pegs, and no restriction on the movement of discs. In the wordoid interface, we have four colours instead of three. This is easier to solve than the normal game, but finding the optimal solution is interesting:

**Four-in-a-Row** has four pegs, and the restriction that discs can only be moved to adjacent pegs.

**Star** has four (or more, in theory) pegs, one of which is considered the "center peg." Moves are only allowed between pegs if one of the two pegs is the center peg.

### siblings

**Siblings** is a variation where there is more than one disc of the same size. The rules of Lucas' Tower state that a disc cannot be moved onto a smaller disc, which allows a disc to be placed on a larger disc or also on a disc of the same size.

Here's a six-disc example tower:

![Siblings Initial](/assets/images/wordloid/siblings-initial.png)

In the wordloid interface, the initial position looks like a Hanoing initial position:

![Siblings Initial wordloid](/assets/images/wordloid/siblings-initial-wordloid.png)

However, when it comes to permissible changes, Siblings breaks both of the Hanoing rules. Consider this position after changing the first square to spring-green:

![Siblings Second Choice](/assets/images/wordloid/siblings-second-choice.png)

As we expect, the first square can be changed to either light-grey or gray, but something is unexpected with the second square's options: We expect to be able to change the second square to gray, but changing it to spring-green would break the second hanoing rule: *A square can only change colour to another colour if it will become the first square of the colour it is changing to*.

This makes sense when we "peek behind the curtain" and recognize that we are modelling the first two squares representing two discs of the same size, but when presented without explaining the rules, this appears to break the rule.

Let's make that change and see what our options become:

![Siblings Third Choice](/assets/images/wordloid/siblings-third-choice.png)

Now the first square cannot be changed at all, violating the first hanoing rule: *A square can only change colour to another colour if it is the first square of the colour it is changing from*. The reason for this is that if the squares represent discs being moved onto pegs, moving the first disc to the third peg and then moving the second disc to the third peg reverses their order, so what was originally the first disc is now underneath what was originally the second disc.

We don't show it in the wordloid interface, but essentially, the two squares have swapped positions.

In the tower form, Siblings is especially interesting when the discs are marked in a special way, like this:

![Bicolour Tower Initial](/assets/images/wordloid/bicolour-initial.png)

And when the winning position requires putting specific discs on specific pegs, like this:

![Bicolour Tower Final](/assets/images/wordloid/bicolour-final.png)

This variation has been called **Bicolour** after the name of a puzzle that was offered to grade 3-6 students at *2ème Championnat de France des Jeux Mathématiques et Logiques* held in July 1988.

In the wordloid interface, marking the discs is not required, setting initial and winning conditions where specific discs end up with specific colours creates the same puzzle. The above tower puzzle can be posed in the wordloid interface with this starting position:

![Bicolour Wordloid Initial](/assets/images/wordloid/bicolour-wordloid-initial.png)

And this final position:

![Final Position Advanced Siblings](/assets/images/wordloid/bicolour-wordloid-final.png)

---

## Twins

Another way to represent the siblings interfaces is by combining the representation for two or more discs of identical size into a single square. When the discs are on different pegs, the square displays more than one colour.

We begin with the simplest representation, "identical twins."

### identical twins

The identical twins interface is a different view/controller paradigm for the "siblings" puzzle. In this example, there are three sizes of disc, and there are two discs of each size that are indistinguishable from each other. But instead of showing six squares, we show three squares, one for each size.

We represent the two discs of each size as follows. If both discs are of the same colour (i.e. representing both discs on the same peg), we show a square of a solid colour. For example, in this sibling position, each pair of discs is the same colour:

![Siblings Two Of Each](/assets/images/wordloid/twins/siblings-two-of-each.png)

That is represented in the identical twins interface as three solid squares, each of which represents two discs:

![Identical Twins two of each](/assets/images/wordloid/twins/twins-5.png)

If both discs of the same size are different colours, we represent them as a coloured square superimposed on a differently coloured square. The three possibilities are:

One disc is light grey, one is gray:

![Light Grey Gray](/assets/images/wordloid/twins/light-grey-gray.png)

One disc is light grey, one is spring green:

![Light Grey Spring Green](/assets/images/wordloid/twins/light-grey-spring-green.png)

One disc is gray, one is spring green:

![Gray Spring Green](/assets/images/wordloid/twins/gray-spring-green.png)

### affordances for twins

In the siblings interface, each square represents one disc, and only those discs that can move have affordances. In the initial position, for example, only the top disc can move, and therefore the affordances in the siblings interface looks like this:

![Siblings Initial Choice](/assets/images/wordloid/siblings-initial-choice.png)

In the identical twins interface, there are the exact same two affordances, and they are represented like this:

![Twins 1](/assets/images/wordloid/twins/twins-1-affordances.png)

When both discs of the same size have different colours, sometimes both can be changed. After moving the first disc to the third peg, the siblings interface and its affordances looks like this:

![Siblings Second Choice](/assets/images/wordloid/twins/siblings-second-choice.png)

In the identical twins interface, all four affordances are represented as changes to the first of the three squares:

![Twins 2](/assets/images/wordloid/twins/twins-2-affordances.png)

### what problem does the twins interface solve?

The siblings interface is inconsistent with the Hanoing interface in two ways:

1. As shown above, when siblings are different colours, it is sometimes possible to change the right sibling to be the same colour as the left sibling, which violates the hanoing expectation that a square can only change colour if it will become the left-most square of that colour.
2. When siblings are different colours, the hanoing interface can represent them in two different ways, e.g. light-grey followed by spring-green, or spring-green followed by light-grey. But with the siblings puzzle, both are the same position. To fix this, the siblings interface reorders the squares to be in "canonical" order. Reordering squares also violates the expectations set by the hanoing interface, where squares never move.

The identical twins interface solves both of these problems:

1. By unifying all of the affordances for both siblings into one affordance for the square representing both twins, changing the rightmost twin to the colour of the leftmost twin does not violate the expectation that a square cannot change colour unless it will become the rightmost square of that colour.
2. By unifying the appearance of two twins in one square, we can present a canonical appearance without reordering squares.


---

# Notes