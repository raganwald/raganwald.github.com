---
title: "Punch Cards and BASIC flings, Back-Tracking, and Eight Queens: Raganwald's Unexpected Nostalgia"
tags: [allonge]
---

A few weeks ago, I ordered a 150th anniversary edition of [The Annotated Alice][aa].

As is their wont, Amazon's collaborative filters showed me other books that might be of interest to me, and I spotted a copy of [Knots and Borromean Rings, Rep-Tiles, and Eight Queens: Martin Gardner's Unexpected Hanging][knots].

[aa]: https://www.amazon.com/Annotated-Alice-150th-Anniversary-Deluxe/dp/0393245438/ref=as_li_ss_tl?ie=UTF8&qid=1533264922&sr=8-1&keywords=annotated+alice&linkCode=ll1&tag=raganwald001-20&linkId=b9022021a0c13d975c6ca45d156a50e4&language=en_US
[knots]: https://www.amazon.com/Knots-Borromean-Rings-Rep-Tiles-Queens/dp/0521758718/ref=as_li_ss_tl?ie=UTF8&qid=1533264620&sr=8-1&keywords=knots+and+borromean+rings&linkCode=ll1&tag=raganwald001-20&linkId=2e72dbc983e93f06f07fd758d8fc6480&language=en_US

I nearly gasped out loud, savouring the memory of one of the earliest computer programs that I ever wrote from scratch, a program that searched for solutions to the eight queens puzzle.

---

<center><A HREF="https://www.amazon.com/Knots-Borromean-Rings-Rep-Tiles-Queens/dp/0521758718/ref=as_li_ss_tl?ie=UTF8&qid=1533264620&sr=8-1&keywords=knots+and+borromean+rings&linkCode=ll1&tag=raganwald001-20&linkId=2e72dbc983e93f06f07fd758d8fc6480&language=en_US"><img src="/assets/images/knots.png" alt="Knots and Borromean Rings, Rep-Tiles, and Eight Queens: Martin Gardner's Unexpected Hanging" longdesc="https://www.amazon.com/Knots-Borromean-Rings-Rep-Tiles-Queens/dp/0521758718/ref=as_li_ss_tl?ie=UTF8&qid=1533264620&sr=8-1&keywords=knots+and+borromean+rings&linkCode=ll1&tag=raganwald001-20&linkId=2e72dbc983e93f06f07fd758d8fc6480&language=en_US"/></A></center>

---

## Prelude: 1972 – 1977

---

In the nineteen-seventies, I spent a lot of time in Toronto's libraries. My favourite hangouts were the Sanderson Branch (which was near my home in Little Italy), and the "Spaced Out Library," a non-circulating collection of science fiction and fantasy that had been donated by [Judith Merril] and was housed within St. George and College Street branch.

[Judith Merril]: https://www.thestar.com/yourtoronto/once-upon-a-city-archives/2018/01/04/little-mother-of-science-fiction-birthed-new-chapter-for-genre-in-canada.html

I especially enjoyed reading back issues of Scientific American, and like many, I was captivated by [Martin Gardner's][mg] "Mathematical Games" columns. My mother had sent me to a day camp for gifted kids once, and it was organized like a university. The "students" self-selected electives, and I picked one called "Whodunnit." It turned out to be a half-day exercise in puzzles and games, and I was hooked.

Where else would I learn about playing tic-tac-toe in a hypercube? Or about liars and truth-tellers? Or, as it happened, about Martin Gardner? I suspect the entire material was lifted from his collections of columns, and that suited me down to the ground.

[mg]: https://en.wikipedia.org/wiki/Martin_Gardner

---

<center><img src="/assets/images/sci-am-1958-11.gif" alt="Scientific American" longdesc="http://www.celebrationofmind.org/archive/miller-squares.html"/></center>

---

One day we had a field trip to the University of Toronto's High-Speed Job Stream, located in the Sanford Fleming Building[^sfb]. This was a big room that had a line printer on one side of it, a punch card reader on the other, and lots and lots of stations for punching your own cards.

[^sfb]: There's a nice history of the Sanford Fleming Building on [Skulepedia](http://skulepedia.ca/wiki/Sandford_Fleming_Building), including an account of the infamous fire that engulfed the building in the Spring of 1977.

To run a job, you typed out your program, one line per card, and then stuck a header on the front that told the batch job what kind of interpreter or compiler to use. Those cards were brightly coloured, and had words like [WATFIV] or [SNOBOL] printed on them in huge letters.

[WATFIV]: https://en.wikipedia.org/wiki/WATFIV
[SNOBOL]: /assets/snobol-green-book.pdf

You put header plus program into the hopper at the back, waited, and when it emerged from the reader, collected your punch cards and headed over to the large and noisy line printer. When the IBM 360 got around to actually running your job, it would print the results for you, and you would head over to a table to review the output and--nearly all of the time for me--find the typo or bug, update your program, and start all over again.

---

<center><img src="/assets/images/keypunch-2.jpg" alt="IMB Keypunch Machine"/></center>

---

You can see equipment like this in any computer museum, so I won't go into much more detail. Besides, the mechanics of running programs as batch jobs was not the interesting thing about the High Speed Job Stream. *The interesting thing about the High Speed Job Stream was that there was no restriction on running jobs*. You didn't need an account or a password. Nobody stood at the door asking for proof that you were an undergrad working on an assignment.

So I'd go over there on a summer day and write software, and sometimes, I'd try to write programs to solve puzzles.

---

![Raganwald at S.A.C.](/assets/images/raganwald-at-sac.jpg)

---

### school

In the autumn of 1976, I packed my bags and went to [St. Andrew's College][sac], a boarding school. One of the amazing things about "SAC" was that they had an actual minicomputer on the campus. For the time, this was unprecedented. In Ontario's public school system, it was possible to take courses in programming, but they nearly all involved writing programs by filling in "bubble cards" with a pencil and submitting jobs overnight.

[sac]: https://sac.on.ca

At SAC, there was a [Nova 1220 minicomputer][1220] in a room with--oh glorious day--four ancient teletype machines hooked up to it with what I now presume were serial ports. It had various operating modes that were set by loading a 5MB removable hard disk (It was a 12" platter encased in a big protective plastic shell), and rebooting the machine by toggling bootstrap instructions into the front panel.

[1220]: https://en.wikipedia.org/wiki/Data_General_Nova

The mode set up for student use was a four-user BASIC interpreter. It had 16KB of RAM (yes, you read that right), and its simple model partitioned the memory so that each user got 4KB to themselves. You could type your program into the teletype, and its output would print on a roll of paper.

Saving programs on disc was not allowed. The teletypes had paper tape interfaces on the side, so to save a program we would `LIST` the source with the paper tape on, and it would punch ASCII or EBDIC codes onto the tape. We'd tear it off and take it with us. Later, to reload a program, we'd feed the tape into the teletype and it would act as if we were typing the program anew.

4KB was enough for assignments like writing a simple bubble sort, but I had discovered [David Ahl] by this time, and programs like "Super Star Trek" did not fit in 4KB. There was a 16KB single-user disc locked in a cabinet alongside programs for tabulating student results.

[David Ahl]: https://en.wikipedia.org/wiki/David_H._Ahl

In defiance of all regulation, I would go in late, pick the cupboard's lock, remove the disc I wanted, and boot up single-user mode. I could then work on customizing Super Star Trek or write programs to solve puzzles. Curiously, I never tampered with the student records. I was a morally vacant vessel at that pointy in my life: I'm not going to tell you that I had a moral code about these things. I think the truth is that I just didn't care about marks.

Now about puzzles. One of the things I worked on was writing new games. I made a [Maharajah and the Sepoys][ms] program that would play the Maharajah while I played the standard chess pieces. It could beat me, which was enough AI for my purposes. This got me thinking about something I'd read in a Martin Gardner book, the [Eight Queens Puzzle][8q].

[ms]: https://en.wikipedia.org/wiki/Maharajah_and_the_Sepoys
[8q]: https://en.wikipedia.org/wiki/Eight_queens_puzzle

I decided to write a program to search for the solutions by brute force.

---

<a name="eight-queens"/>[![Eight Queens Puzzle](/assets/images/eight-queens.png)][8q]

[8q]: https://en.wikipedia.org/wiki/Eight_queens_puzzle

---

## The Eight Queens Puzzle

---

As Wikipedia explains, "The [**eight queens puzzle**][8q] is the problem of placing eight chess queens on an 8×8 chessboard so that no two queens threaten each other. Thus, a solution requires that no two queens share the same row, column, or diagonal."

By this time I knew a little about writing "generate and test" algorithms, as well as a little about depth-first search from writing games (like "Maharajah and the Sepoys") that performed basic [minimax] searches for moves to make. So I set about writing a BASIC program to search for solutions. I had no real understanding of computational complexity and running time, but what if I wrote a program and left it running all night?

[minimax]: https://en.wikipedia.org/wiki/Minimax

The truly brute force solution looks something like this (BASIC has a `for... next` construct, but close enough):

```javascript
outer: for (let i0 = 0; i0 <= 7; ++i0) {
 for (let j0 = 0; j0 <= 7; ++j0) {
   for (let i1 = 0; i1 <= 7; ++i1) {
     for (let j1 = 0; j1 <= 7; ++j1) {
       for (let i2 = 0; i2 <= 7; ++i2) {
         for (let j2 = 0; j2 <= 7; ++j2) {
           for (let i3 = 0; i3 <= 7; ++i3) {
             for (let j3 = 0; j3 <= 7; ++j3) {
               for (let i4 = 0; i4 <= 7; ++i4) {
                 for (let j4 = 0; j4 <= 7; ++j4) {
                   for (let i5 = 0; i5 <= 7; ++i5) {
                     for (let j5 = 0; j5 <= 7; ++j5) {
                       for (let i6 = 0; i6 <= 7; ++i6) {
                         for (let j6 = 0; j6 <= 7; ++j6) {
                           for (let i7 = 0; i7 <= 7; ++i7) {
                             inner: for (let j7 = 0; j7 <= 7; ++j7) {
                               const board = [
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."]
                               ];

                               const queens = [
                                 [i0, j0],
                                 [i1, j1],
                                 [i2, j2],
                                 [i3, j3],
                                 [i4, j4],
                                 [i5, j5],
                                 [i6, j6],
                                 [i7, j7]
                               ];

                               for (const [i, j] of queens) {
                                 if (board[i][j] != '.') {
                                   // square is occupied or threatened
                                   continue inner;
                                 }

                                 for (let k = 0; k <= 7; ++k) {
                                   // fill row and column
                                   board[i][k] = board[k][j] = "x";

                                   const vOffset = k-i;
                                   const hDiagonal1 = j - vOffset;
                                   const hDiagonal2 = j + vOffset;

                                   // fill diagonals
                                   if (hDiagonal1 >= 0 && hDiagonal1 <= 7) {
                                     board[k][hDiagonal1] = "x";
                                   }

                                   if (hDiagonal2 >= 0 && hDiagonal2 <= 7) {
                                     board[k][hDiagonal2] = "x";
                                   }
                                 }
                               }

                               const out = [
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."],
                                 [".", ".", ".", ".", ".", ".", ".", "."]
                               ];

                               for (const [i, j] of queens) {
                                 out[i][j] = "Q";
                               }

                               console.log(out.map(row => row.join('')).join("\n"));
                               break outer;
                             }
                           }
                         }
                       }
                     }
                   }
                 }
               }
             }
           }
         }
       }
     }
   }
 }
}
```

I believe I tried that, left the program running overnight, and when I came in the next morning before school it was still running. It was searching `8^16` (or more accurately, `64^8`) candidates for a solution, that's 281,474,976,710,656 loops. Given the speed of that minicomputer, I suspect the program would still be running today.

Then I had an insight of sorts: If I could arrange an _ordering_ of queens, then if I set about generating all the possible arrangements for the first queen, by definition the subsequent queens would have to come _after_ each queen's position.

Before writing out the code for this small improvement, I'll share what happened when I tested my conjecture.

---

![Boiler explosion throws one steam locomotive onto another](/assets/images/boiler-explosion.jpg)

---

### disaster strikes

First, I had neglected to insert code to halt the program when it found a solution. Perhaps I wanted to print all of the solutions. Second, I tried to optimize my test subroutine at the same time, and inserted a bug. Or perhaps, the bug was already there, but it didn't manifest itself until the program was deeper into its search, and my "optimization" took it to the failure case more quickly.

In any event, I left the updated program running overnight, and once again returned before breakfast to see if it had found any solutions. When I entered the room, there was a horrible smell and a deafening clacking sound. The test function had failed at some point, and it was passing thousands of positions in rapid order.

The paper roll had jammed at some point in the night and was no longer advancing, but the teletype had hammered through the paper and was hammering on the roller behind. Rolls of paper had emerged from the machine and lay in a heap around it. I consider it a very lucky escape that a spark hadn't ignited the paper or its dust that hung in the air.

I shut everything down, cleaned up as best I could, and then set about finding the bug.

---

[![The Royal Ontario Museum, ©2009 Steve Harris](/assets/images/rom-crystal.jpg)](https://www.flickr.com/photos/stevenharris/3673718875)

---

### separating concerns

The crux of my "insight" is realizing that the number of unique choices of eight distint squares is much smaller than `64^8`. For starters, if we eliminate the cases where two queens are on the same square, we're already down from `64^8` to `64!/56!` (`64*63*62*61*60*59*58*57`). That reduces the search space to 178,462,987,637,760 candidates, about half as many as the original pure brute force.

But we also don't care about the ordering, so what we want are [combinations], not permutations. That reduces our search space again, down to `64!/(8!*56!)`, or 4,426,165,368 ways to choose 8 squares from 64.

[combinations]: https://en.wikipedia.org/wiki/Combination

One of our go-to techniques for modifying programs is to begin my making sure that the thing we wish to change is refactored into its own responsibility, then we can make a change to just one thing. The JavaScript analog of my old BASIC code has the generating loops, function testing code, and output code all higgledy-piggledy.

We might begin be refactoring into a generator and consumer. We can then modify the generator as we see fit:

```javascript
function * bruteForceCombinations () {
  for (let i0 = 0; i0 <= 7; ++i0) {
    for (let j0 = 0; j0 <= 7; ++j0) {
      for (let i1 = 0; i1 <= 7; ++i1) {
        for (let j1 = 0; j1 <= 7; ++j1) {
          for (let i2 = 0; i2 <= 7; ++i2) {
            for (let j2 = 0; j2 <= 7; ++j2) {
              for (let i3 = 0; i3 <= 7; ++i3) {
                for (let j3 = 0; j3 <= 7; ++j3) {
                  for (let i4 = 0; i4 <= 7; ++i4) {
                    for (let j4 = 0; j4 <= 7; ++j4) {
                      for (let i5 = 0; i5 <= 7; ++i5) {
                        for (let j5 = 0; j5 <= 7; ++j5) {
                          for (let i6 = 0; i6 <= 7; ++i6) {
                            for (let j6 = 0; j6 <= 7; ++j6) {
                              for (let i7 = 0; i7 <= 7; ++i7) {
                                for (let j7 = 0; j7 <= 7; ++j7) {
                                  const queens = [
                                    [i0, j0],
                                    [i1, j1],
                                    [i2, j2],
                                    [i3, j3],
                                    [i4, j4],
                                    [i5, j5],
                                    [i6, j6],
                                    [i7, j7]
                                  ];

                                  yield queens;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function test (queens) {
  const board = [
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."]
  ];

  for (const [i, j] of queens) {
    if (board[i][j] != '.') {
      // square is occupied or threatened
      return false;
    }

    for (let k = 0; k <= 7; ++k) {
      // fill row and column
      board[i][k] = board[k][j] = "x";

      const vOffset = k-i;
      const hDiagonal1 = j - vOffset;
      const hDiagonal2 = j + vOffset;

      // fill diagonals
      if (hDiagonal1 >= 0 && hDiagonal1 <= 7) {
        board[k][hDiagonal1] = "x";
      }

      if (hDiagonal2 >= 0 && hDiagonal2 <= 7) {
        board[k][hDiagonal2] = "x";
      }

      board[i][j] = "Q";
    }
  }

  return true;
}

function stringify (queens) {
  const board = [
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "."]
  ];

  for (const [i, j] of queens) {
    board[i][j] = "Q";
  }

  return board.map(row => row.join('')).join("\n");
}

function * filter (predicateFunction, iterable) {
  for (const element of iterable) {
    if (predicateFunction(element)) {
      yield element;
    }
  }
}

function first (iterable) {
  const [value] = iterable;

  return value;
}

const allSolutions = filter(test, bruteForceCombinations());
const firstSolution = first(allSolutions);

stringify(firstSolution)
```

With this in hand, we can make a faster "combinations" generator, and we won't have to work around any of the other code.

---

[![Choose your colour ©2014 jaros](/assets/images/canoes.jpg)](https://www.flickr.com/photos/rjswa/15249100536)

---

### the "combinations" algorithm

An easy way to implement choosing combinations of squares is to work with numbers from `0` to `63` instead of pairs of indices. Here's a generator that does the exact thing we want:

```javascript
function * map (mapFunction, iterable) {
  for (const element of iterable) {
    yield mapFunction(element);
  }
}

function * choose (n, k, offset = 0) {
  if (k === 1) {
    for (let i = 0; i <= (n - k); ++i) {
      yield [i + offset];
    }
  } else if (k > 1) {
    for (let i = 0; i <= (n - k); ++i) {
      const remaining = n - i - 1;
      const otherChoices = choose(remaining, k - 1, i + offset + 1);

      yield * map(x => [i + offset].concat(x), otherChoices);
    }
  }
}

choose(5, 3)
  //=>
    [0, 1, 2]
    [0, 1, 3]
    [0, 1, 4]
    [0, 2, 3]
    [0, 2, 4]
    [0, 3, 4]
    [1, 2, 3]
    [1, 2, 4]
    [1, 3, 4]
    [2, 3, 4]
```

We can now write `choose(64, 8)` to get all the ways to choose eight squares, and `[Math.floor(q/8), q % 8]` to convert a number from `0` to `63` into a pair of indices between `0` and `7`:

```javascript
const chooseCombinations = map(x => x.map(q => [Math.floor(q/8), q % 8]), choose(64, 8));

const allSolutions = filter(test, chooseCombinations);
const firstSolution = first(allSolutions);

stringify(firstSolution)

```

It's still a tremendous number of candidates to search. If we list them out we can see some of the problems right away. For example, the very first combination it wants to test is `[[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7]]`. The queens are all on the same row!

There is an easy fix for this and as a bonus, it gets us solutions really fast.

---

[![Castle](/assets/images/rook-castles.jpg)](https://www.flickr.com/photos/nh53/41841008735)

---

### the "rooks" algorithm

We _know_ that eight queens on the same row are not going to work. No two queens can be on the same column or row. So what we really want are all the combinations of eight queens that don't share a column or row. In other words, every queen will have a unique column and a unique row.

Let's start with the unique rows. Every time we generate a set of queens, one will be on row `0`, one on row `1`, one on row `2`, and so forth. So the candidate solutions can always be arranged to look like this:

```javascript
[
  [0, ?], [1, ?], [2, ?], [3, ?], [4, ?], [5, ?], [6, ?], [7, ?]
]
```

Now what about the columns? Since no two queens can share the same column, the candidate solutions must all have a unique permutation of the numbers `0` through `7`, something like this:

```javascript
[
  [?, 3], [?, 1], [?, 5], [?, 6], [?, 4], [?, 2], [?, 0], [?, 7]
]
```

We'll need to be able to generate the [permutations] of the column numbers from `0` to `7`, and assign them to the rows `0` through `7` in order. That way, each candidate will look something like this:

```javascript
[
  [0, 3], [1, 1], [2, 5], [3, 6], [4, 4], [5, 2], [6, 0], [7, 7]
]
```

[permutations]: https://en.wikipedia.org/wiki/Permutation

It's fairly easy to generate arbitrary permutations if we don't mind splicing and reassembling arrays:

```javascript
function * permutations (arr, prefix = []) {
  if (arr.length === 1) {
    yield prefix.concat(arr);
  } else if (arr.length > 1) {
    for (let i = 0; i < arr.length; ++i) {
      const chosen = arr[i];
      const remainder = arr.slice(0, i).concat(arr.slice(i+1, arr.length))

      yield * permutations(remainder, prefix.concat([chosen]));
    }
  }
}

permutations([1, 2, 3])
//=> [1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]
```

And now we can apply our `permutations` generator to generating candidate solutions:

```javascript
const rookSolutions = map(
  ii => ii.map((i, j) => [i, j]),
  permutations([0, 1, 2, 3, 4, 5, 6, 7])
);

const allSolutions = filter(test, rookSolutions);
const firstSolution = first(allSolutions);

stringify(firstSolution)

//=>
  Q.......
  ......Q.
  ....Q...
  .......Q
  .Q......
  ...Q....
  .....Q..
  ..Q.....

```

This is great! We've made a huge performance improvement simply by narrowing the "search space." We're down to `8!` permutations of queens on unique rows and columns, just 40,320 different permutations to try.

(This approach is known as the "rooks" algorithm, because generating the candidate positions for the queens based on permutations of rows and columns is the solution for enumerating all of the ways eight rooks can be placed on a chessboard.)

---

[![Spatial Cardioidal Variations ©2013](/assets/images/cardioidal.jpg)](https://www.flickr.com/photos/fdecomite/10299684525)

---

### speeding up the testing

We've certainly sped things up by being smarter about the candidates we submit for testing. But what about the testing itself? The algorithm of filling in squares on a chess board very neatly matches how we might do this mentally, but it is quite slow. How can we make it faster?

For starters, if we know that we are only submitting solutions to the "eight rooks" problem, we need never test whether queens threaten each other on rows and columns. That cuts our testing workload roughly in half!

But what about diagonal attacks? Observe:

|&nbsp;0|&nbsp;1|&nbsp;2|&nbsp;3|&nbsp;4|&nbsp;5|&nbsp;6|&nbsp;7|
|&nbsp;1|&nbsp;2|&nbsp;3|&nbsp;4|&nbsp;5|&nbsp;6|&nbsp;7|&nbsp;8|
|&nbsp;2|&nbsp;3|&nbsp;4|&nbsp;5|&nbsp;6|&nbsp;7|&nbsp;8|&nbsp;9|
|&nbsp;3|&nbsp;4|&nbsp;5|&nbsp;6|&nbsp;7|&nbsp;8|&nbsp;9|10|
|&nbsp;4|&nbsp;5|&nbsp;6|&nbsp;7|&nbsp;8|&nbsp;9|10|11|
|&nbsp;5|&nbsp;6|&nbsp;7|&nbsp;8|&nbsp;9|10|11|12|
|&nbsp;6|&nbsp;7|&nbsp;8|&nbsp;9|10|11|12|13|
|&nbsp;7|&nbsp;8|&nbsp;9|10|11|12|13|14|

If we sum the row and column number (`row + col`), we get a number representing the position of one of a queen's diagonals. We can thus use:

|&nbsp;0|&nbsp;1|&nbsp;2|&nbsp;3|&nbsp;4|&nbsp;5|&nbsp;7|&nbsp;7|&nbsp;8|&nbsp;9|10|11|12|13|14|

Instead of the entire chessboard! Simply compute the diagonal number for each queen and put an 'x' in this one-dimensional array. That's much faster than putting an 'x' in every square of a diagonal.

What about the other diagonal?

|&nbsp;7|&nbsp;6|&nbsp;5|&nbsp;4|&nbsp;3|&nbsp;2|&nbsp;1|&nbsp;0|
|&nbsp;8|&nbsp;7|&nbsp;6|&nbsp;5|&nbsp;4|&nbsp;3|&nbsp;2|&nbsp;1|
|&nbsp;9|&nbsp;8|&nbsp;7|&nbsp;6|&nbsp;5|&nbsp;4|&nbsp;3|&nbsp;2|
|10|&nbsp;9|&nbsp;8|&nbsp;7|&nbsp;6|&nbsp;5|&nbsp;4|&nbsp;3|
|11|10|&nbsp;9|&nbsp;8|&nbsp;7|&nbsp;6|&nbsp;5|&nbsp;4|
|12|11|10|&nbsp;9|&nbsp;8|&nbsp;7|&nbsp;6|&nbsp;5|
|13|12|11|10|&nbsp;9|&nbsp;8|&nbsp;7|&nbsp;6|
|14|13|12|11|10|&nbsp;9|&nbsp;8|&nbsp;7|

Ah! We can sum the row with the inverse of the column number (`row + 7 - col`). If we use two of these one-dimensional arrays, we can check both diagonal attacks much more quickly than tediously marking chessboard squares. Like this:

```javascript
function testDiagonals (queens) {
  const nesw = [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."];
  const nwse = [".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", ".", "."];

  if (queens.length < 2) return true;

  for (const [i, j] of queens) {
    if (nwse[i + j] !== '.' || nesw[i + 7 - j] !== '.') return false;

    nwse[i + j] = 'x';
    nesw[i + 7 - j] = 'x';
  }

  return true;
}

const allSolutions = filter(testDiagonals, rookSolutions);
const firstSolution = first(allSolutions);

stringify(firstSolution)

//=>
  Q.......
  ......Q.
  ....Q...
  .......Q
  .Q......
  ...Q....
  .....Q..
  ..Q.....

```

Checking diagonals without filling in squares is a specialized optimization, of course. Now we have coupled the test with the generation algorithm. In a larger software project, we might decouple things so that we can use them in different places in different ways. But when we come along to optimize something like this, the coupling makes it harder to reuse components, and it makes the program harder to change. Luckily for us, this isn't an essay about writing large software projects.

---

[![Huge Tree ©2009 Mitch Bennett](/assets/images/huge-tree.jpg)](https://www.flickr.com/photos/mitchell3417/3451297468)

---

### tree searching

As noted, separating generator from test allows us to optimize and improve each of the two parts independently. If we were mindful of such, we could write test for the two independent pieces. This is all very good.

But that being said, not all improvements can be made independently like this. Any organization of code makes some things easier, but others harder. In my original BASIC program way back in 1977, I built the board as I went, and marked the "threatened" squares. But instead of iterating over all the possible queen positions, as I added queens to the board I iterated over all the open positions.

So after placing the first queen in the first open space, my board looked conceptually like this:

```
Qxxxxxxx
xx......
x.x.....
x..x....
x...x...
x....x..
x.....x.
x......x
```

The next queen I would try would be in the first "open" square, like this:

```
Qxxxxxxx
xxQxxxxx
xxxx....
x.xxx...
x.x.xx..
x.x..xx.
x.x...xx
x.x....x
```

I'd continue like this until there were eight queens, or I ran out of empty spaces. If I failed, I'd backtrack and try a different position for the last queen. If I ran out of different positions for the last queen, I'd try a different position for the second-to-last queen, and so on.

I did not know the words for it, but I was performing a depth-first search of a "tree" of positions. I was trying to find a path that was eight queens deep. And I was keeping the board updated to do so.

This method is better than the combinations approach, but not as good as the rooks approach. It's interesting nevertheless, because it is an "inductive" method that lends itself to recursive thinking. We begin with the solution for zero queens, and empty board. Then we successively search for ways to add one more queen to whatever we already have, backtracking if we run out of available spaces.

We can actually combine the inductive and rooks approach. This algorithm builds solutions one row at a time, iterating over the open columns, and checking for diagonal attacks. If there are none, it recursively calls itself to add another row. When it reaches eight rows, it yields the solution. It finds all 92 solutions searching just 5,508 positions (Of which eight are the degenerate case of having just one queen on the first row):

```javascript
function * inductive (queens = []) {
  if (queens.length === 8) {
    yield queens;
  } else {
    const candidateColumns = [0, 1, 2, 3, 4, 5, 6, 7];
    for (const [row, column] of queens) {
      candidateColumns[column] = undefined;
    }

    for (const candidateColumn of candidateColumns) {
      if (candidateColumn != null) {
        const candidateQueens = queens.concat([[queens.length, candidateColumn]]);

        if (testDiagonals(candidateQueens)) {
          yield * inductive(candidateQueens);
        }
      }
    }
  }
}
```

Unlike our true generate-and-test approach, it interleaves partial generation with testing, so it's not possible to break it into two separate pieces. But it's considerably smaller, so it's fine to extract the test and have `inductive` call `testDiagonals`, rather than have them both be independent peers.

I wish I'd thought of this approach in 1977!

---

[![OCAD at night ©2008 Nayuki](/assets/images/ocad.jpg)](https://www.flickr.com/photos/nayukim/3829212004)

---

## And so to Bed

---

It was a lot of fun to revisit Martin Gardner's column on the eight queen's problem, and especially to rewrite these algorithms forty years later. This post doesn't have a deep insight into program design, and thus there's not major point to summarize.

Just as there can be recreational mathematics, there can be recreational programming. And that's a very fine thing to enjoy.

**The End**

---

## Notes

