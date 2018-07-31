---
title: "The Eight Queens"
tags: [allonge, noindex]
---

### preamble

In the nineteen-seventies, I spent a lot of time in Toronto's libraries[^sw]. My favourite hangouts were the Sanderson Branch (which was near my home in Little Italy), and the "Spaced Out Library," a non-circulating collection of science fiction and fantasy that had been donated by [Judith Merril] and was housed within St. George and College Street branch.

[^sw]: In my first draft of this memoir, I had a reference to seeing *Star Wars* fourteen times in actual theatres when it first came out. Which is a nice memory, to be sure, but it's hardly some kind of Nerd Merit Achievement, and even seeing it fourteen times is only a very small fraction of the amount of time I spent reading, playing D&D, or skateboarding. The fact that it looms so large in reminisces like this speaks more to the power of its cultural significance than it does to its actual place in my life at the time.

[Judith Merril]: https://www.thestar.com/yourtoronto/once-upon-a-city-archives/2018/01/04/little-mother-of-science-fiction-birthed-new-chapter-for-genre-in-canada.html

---

<center><img src="/assets/images/sci-am-1958-11.gif" alt="Scientific American" longdesc="http://www.celebrationofmind.org/archive/miller-squares.html"/></center>

---

I especially enjoyed reading back issues of Scientific American, and like many, I was captivated by [Martin Gardner's][mg] "Mathematical Games" columns. My mother had sent me to a day camp for gifted kids once, and it was organized like a university. The "students" self-selected electives, and I picked one called "Whodunnit." It turned out to be a half-day exercise in puzzles and games, and I was hooked.

Where else would I learn about playing tic-tac-toe in a hypercube? Or about liars and truth-tellers? Or, as it happened, about Martin Gardner? I suspect the entire material was lifted from his collections of columns, and that suited me down to the ground.

[mg]: https://en.wikipedia.org/wiki/Martin_Gardner

One day we had a field trip to the University of Toronto's High-Speed Job Stream, located in the [Sanford Fleming Building][^sfb]. This was a big room that had a line printer on one side of it, a punch card reader on the other, and lots and lots of stations for punching your own cards.

[^sfb]: There's a nice history of the Sanford Fleming Building on [Skulepedia](http://skulepedia.ca/wiki/Sandford_Fleming_Building), including an account of an infamous fire that engulfed the building in the Spring of 1977.

---

<center><img src="/assets/images/keypunch-2.jpg" alt="IMB Keypunch Machine"/></center>

---

To run a job, you typed out your program, one line per card, and then stuck a header on the front that told the batch job what kind of interpreter or compiler to use. Those cards were brightly coloured, and had words like "WATFIV" or "SNOBOL" printed on them in huge letters.

You put header plus program into the hopper at the back, waited, and when it emerged from the reader, collected your punch cards and headed over to the large and noisy line printer. When the IBM 360 got around to actually running your job, it would print the results for you, and you would head over to a table to review the output and--nearly all of the time for me--find the typo or bug, update your program, and start all over again.

You can see equipment like this in any computer museum, so I won't go into much more detail. Besides, the mechanics of running programs as batch jobs was not the interesting thing about the High Speed Job Stream. *The interesting thing about the High Speed Job Stream was that there was no restriction on running jobs*. You didn't need an account or a password. Nobody stood at the door asking for proof that you were an Undergrad working on an assignment.

So I'd go over there on a summer day and write software, and sometimes, I'd try to write programs to solve puzzles.

---

![Raganwald at S.A.C.](/assets/images/raganwald-at-sac.jpg)

---

### school

In the autumn of 1976, I packed my bags and went to [St. Andrew's College][sac], a boarding school. One of the amazing things about "SAC" was that they had an actual minicomputer on the campus. For the time, this was unprecedented. In Ontario's public school system, it was possible to take courses in programming, but they nearly all involved writing programs by filling in "bubble cards" with a pencil and submitting jobs overnight.

[sac]: https://sac.on.ca

At SAC, there was a [Nova 1220 minicomputer][1220] in a room with--oh glorious day--four ancient teletype machines hooked up to it with what I now presume were serial ports. It had various operating modes that were set by loading a 5MB removable hard disk (It was a 12" or 16" platter encased in a big protective plastic shell), and rebooting the machine by toggling bootstrap instructions into the front panel.

[1220]: https://en.wikipedia.org/wiki/Data_General_Nova

The mode set up for student use was a four-user BASIC interpreter. It had 16KB of RAM (yes, you read that right), and its simple model partitioned the memory so that each user got 4KB to themselves. You could type your program into the teletype, and its output would print on a roll of paper.

Saving programs on disc was not allowed. The teletypes had paper tape interfaces on the side, so to save a program we would `LIST` the source with the paper tape on, and it would punch ASCII or EBDIC codes onto the tape. We'd tear it off and take it with us. Later, to reload a program, we'd feed the tape into the teletype and it would act as if we were typing the program anew.

---

[![Maharajah and the Sepoys](/assets/images/maharajah-and-the-sepoys.jpg)][ms]

---

4KB was enough for assignments like writing a simple bubble sort, but I had discovered [David Ahl] by this time, and programs like "Super Star Trek" did not fit in 4KB. There was a 16KB single-user disc locked in a cabinet alongside programs for tabulating student results.

[David Ahl]: https://en.wikipedia.org/wiki/David_H._Ahl

I was a morally vacant vessel at that point in my life, so I would go in late, pick the lock, and boot up single-user mode, in defiance of all regulation. I could then work on customizing Super Star Trek or write programs to solve puzzles. Curiously, I never tampered with the student records. I'm not going to tell you that I had a moral code about these things. I think the truth is that I just didn't care about marks.

Now about puzzles. One of the things I worked on was writing new games. I made a [Maharajah and the Sepoys][ms] program that would play the Maharajah while I played the standard chess pieces. It could beat me, which was enough AI for my purposes. This got me thinking about something I'd read in a Martin Gardner book, the Eight Queens Problem.

[ms]: https://en.wikipedia.org/wiki/Maharajah_and_the_Sepoys

I decided to write a program to search for the solutions by brute force.

---

[![Eight Queens Puzzle](/assets/images/eight-queens.jpg)][8q]

[8q]: https://en.wikipedia.org/wiki/Eight_queens_puzzle

---

### The Eight Queens Puzzle

> The **eight queens puzzle** is the problem of placing eight chess queens on an 8×8 chessboard so that no two queens threaten each other. Thus, a solution requires that no two queens share the same row, column, or diagonal. The eight queens puzzle is an example of the more general ***n*** **queens problem** of placing n non-attacking queens on an n×n chessboard, for which solutions exist for all natural numbers n with the exception of n=2 and n=3.

## notes

