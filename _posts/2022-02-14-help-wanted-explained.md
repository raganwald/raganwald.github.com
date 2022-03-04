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

---

## Twins

**Twins** is a variation where there are two discs of each size.[^triplets] The rules of Lucas' Tower state that a disc cannot be moved onto a smaller disc, which allows a disc to be placed on a larger disc or also on a disc of the same size.

[^triplets]: The same ideas generalize to triplets, quadruplets, &c. But to keep the exposition compact, we will speak only of twins.

Here's a six-disc example tower:

![Siblings Initial](/assets/images/wordloid/twins/siblings-initial.png)

The rules of moving the discs between pegs in twins are the same as the rules of [The Towers of Hanoi][towers]: You can only move the topmost disc from any peg, and you cannot place that disc on a larger disc.

### troublesome twins

If we attempt to represent twins as a row of six squares, we run into two problems. Consider this position, where we have moved the first disc to the third peg.

![Siblings Second](/assets/images/wordloid/twins/siblings-second.png)

There are four available moves:

1. The top disc from the light-grey peg can be moved onto the empty gray peg.
1. The top disc from the light-grey peg can be moved on top of its "twin" on the spring-green peg.
1. The top disc from the spring-green peg can be moved onto the empty gray peg.
1. The top disc from the spring-green peg can be moved on top of its "twin" on the light-grey peg.

The position can be represented with one square per peg, but it presents two problems. First, the affordances violate the expectations set by hanoing:

![Siblings Second Choice](/assets/images/wordloid/twins/siblings-second-choice.png)

All four choices are represented, but changing the second square to green violates the hanoing rule that a square's colour can only be changed if it would become the leftmost square of the colour it is changing to. 

Another problem concerns positions where each twin is on a different peg. The arrangement of discs on pegs shown above can be represented in two different ways:

![Siblings Second Position 1](/assets/images/wordloid/twins/siblings-second-position-1.png)

And also:

![Siblings Second Position 2](/assets/images/wordloid/twins/siblings-second-position-2.png)

There should be a 1-to-1 relationship between the positions we see in the disc-and-peg form and our wordloid representations.

We can fix this by representing twins in a different way.

### identical twins

In the "identical twins" interface, instead of showing six squares, we show three squares, one for each pair of twins that share the same size.

We represent the two discs of each size as follows. If both discs are of the same colour (i.e. representing both discs on the same peg), we show a square of a solid colour. If each pair of discs is placed together on its own peg, the naïve representation would be://

![Siblings Two Of Each](/assets/images/wordloid/twins/siblings-two-of-each.png)

That is represented in the identical twins interface as three solid squares, each of which represents two discs:

![Identical Twins two of each](/assets/images/wordloid/twins/twins-5.png)

If both discs of the same size are different colours, we represent them as a coloured square superimposed on a differently coloured square. The three possibilities are:

When one disc is light grey, and one is gray:

<img title="Light Grey Gray" height="210" width="210" src="/assets/images/wordloid/twins/light-grey-gray.png"/>

When one disc is light grey, and one is spring green:

<img title="Light Grey Spring Green" height="210" width="210" src="/assets/images/wordloid/twins/light-grey-spring-green.png"/>

When one disc is gray, and one is spring green:

<img title="Gray Spring Green" height="210" width="210" src="/assets/images/wordloid/twins/gray-spring-green.png"/>

### affordances for identical twins

In the original interface, each square represents one disc, and only those discs that can move have affordances. In the initial position, for example, only the top disc can move, and therefore the affordances in the siblings interface looks like this:

![Siblings Initial Choice](/assets/images/wordloid/siblings-initial-choice.png)

In the identical twins interface, there are the exact same two affordances, and they are represented like this:

![Twins 1](/assets/images/wordloid/twins/twins-1-affordances.png)

When both discs of the same size have different colours, sometimes both can be changed. After moving the first disc to the third peg, the siblings interface and its affordances looks like this:

![Siblings Second Choice](/assets/images/wordloid/twins/siblings-second-choice.png)

In the identical twins interface, all four affordances are represented as changes to the first of the three squares:

![Twins 2](/assets/images/wordloid/twins/twins-2-affordances.png)

The identical twins interface solves both of the problems with using one square per disc:

1. Since both twins are represented as a single (possibly two-colour) square, there is no situation where a disc is changed to be the same colour as a disc to its left.
1. When the two twins are of different colours, we always use the same two-colour representation, preserving a 1-to-1 relationship between representations with discs and pegs and our representation as a row of squares.

### fraternal twins

**Fraternal twins** is a variant of identical twins where one or both of the twin discs are marked so that they can be distinguished from each other. In the original puzzle with discs and pegs, the discs were of two different colours:[^bicolour]

[^bicolour]: This variation has been called **Bicolour** after the name of a puzzle that was offered to grade 3-6 students at *2ème Championnat de France des Jeux Mathématiques et Logiques* held in July 1988.

![Bicolour Pegs Initial](/assets/images/wordloid/twins/bicolour-pegs-initial.png)

And when the winning position requires putting specific discs on specific pegs, like this:

![Bicolour Pegs Final](/assets/images/wordloid/twins/bicolour-pegs-final.png)

Wordloid uses colours as a proxy for the peg the disc is on, so instead of using colours to establish a distinction, we can use textures such as solid versus polka-dots to represent the two different discs of each size:[^polka-dots]

[^polka-dots]: The specific textures are to-be-determined, they may be polka-dots, they could just as easily be patterns like stripes, or checks. Likewise, we may use some other means to distinguish the twins such as a badge or maybe even a shape.

![Bicolour Pegs Initial Decorated](/assets/images/wordloid/twins/bicolour-pegs-initial-decorated.png)

In the twins interface, a square with "one colour" now has two textures, so we always show both outer and inner square, e.g.

<img title="Light Grey Light Grey" height="210" width="210" src="/assets/images/wordloid/twins/light-grey-light-grey.png"/>

Squares with two colours can also show textures, e.g.

<img title="Gray Spring Green Textured" height="210" width="210" src="/assets/images/wordloid/twins/gray-spring-green-textured.png"/>

The initial fraternal twins position equivalent to the "bicolour" problem is represented as:

![Bicolour Initial](/assets/images/wordloid/twins/bicolour-initial.png)

And the desired end state is represented as:

![Bicolour Final](/assets/images/wordloid/twins/bicolour-final.png)

### fraternal twins and affordances

When first presented with the bicolour puzzle, there are only two possible "moves:" The topmost disc can be moved to the second or third peg. In the textures interface, the affordances are:

![Bicolour Initial Affordances](/assets/images/wordloid/twins/bicolour-initial-affordances.png)

After making the first move, the affordances become:

![Bicolour Second Affordances](/assets/images/wordloid/twins/bicolour-second-affordances.png)

Although things look very different from identical twins, they are the same four options for moving discs, we're just showing the distinction between textures.

Also, one of the affordances leads to this position:

![Bicolour 3](/assets/images/wordloid/twins/bicolour-3.png)

As we can see, not only has the first square changed from entirely light-grey to entirely gray, but the textures have been exchanged. The challenge in the textures puzzle is managing the two discs of each size so that the final position has both the correct arrangement of colours and the correct arrangement of textures.

---

## Electricity and Magnetism

**Magnetic** Lucas' Towers is a puzzle where each disc has an "up" and a "down", and when moving a disc from one peg to another, the disc is flipped as it moves.

_...to be continued..._


---

# Notes