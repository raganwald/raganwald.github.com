---
title: "A Rational Visit to Hilbert's Grand Hotel"
tags: [allonge, noindex]
---

[Hilbert's paradox of the Grand Hotel][hh] is a thought experiment which illustrates a counterintuitive property of infinite sets. It is demonstrated that a fully occupied hotel with infinitely many rooms may still accommodate additional guests, even infinitely many of them, and this process may be repeated infinitely often.

[hh]: https://en.wikipedia.org/wiki/Hilbert%27s_paradox_of_the_Grand_Hotel

When we [last looked at Hilbert's Hotel][hhr], we demonstrated some properties of countably infinite sets by building JavaScript [generators][g] for them. The principle was that if you can write a generator for all of the elements of an infinite set, and if you can show that every element of the set must be generated within a finite number of calls to the generator, then you have found a way to put the infinite set into a 1-to-1 correspondance with the [natural numbers][natural] (0, 1, 2, ...∞), and thus proved that they have the same cardinality, i.e. they have the same size.

[hhr]: http://raganwald.com/2015/04/24/hilberts-school.html
[g]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
[natural]: https://en.wikipedia.org/wiki/Natural_number

Today we're going to look at other ways in which two infinite sets can be related, and in doing so, we'll review the properties of [bijective], [injective], and [surjective] functions.

[bijective]: https://en.wikipedia.org/wiki/Bijection
[injective]: https://en.wikipedia.org/wiki/Injective_function
[surjective]: https://en.wikipedia.org/wiki/Surjective_function

---

## The Night Clerk

---

<img src="/assets/images/fractran/john-conway-1993.jpg" alt="John Horton Conway in 1993"/>

*John Horton Conway in 1993*

---

Conway touched my own life from early days. As I described in [The Eight Queens Problem... and Raganwald's Unexpected Nostalgia](https://raganwald.com/2018/08/03/eight-queens.html):

> *My mother had sent me to a day camp for gifted kids once, and it was organized like a university. The "students" self-selected electives, and I picked one called Whodunnit. It turned out to be a half-day exercise in puzzles and games, and I was hooked.*

[mg]: https://en.wikipedia.org/wiki/Martin_Gardner

One of the things we talked about in "Whodunnit" was [Conway's Game of Life][GoL]. I don't recall playing with it much: There was a lot going on, and it's entirely possible that I was too busy falling in love with Raymond Smullyan to have curiosity left over for John Conway.[^HL][^TSL][^CoL]

[GoL]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
[^CoL]: [Cafe au Life](https://github.com/raganwald/cafeaulife), an implementation of HashLife in CoffeeScript
[^HL]: [HashLife in the Browser](https://github.com/raganwald/hashlife)
[^TSL]: [Time, Space, and Life As We Know It](https://raganwald.com/2017/01/12/time-space-life-as-we-know-it.html)

---

[![Hashlife](/assets/images/fractran/hashlife.png)][hl]

_[An infinitely scrolling implementation of Conway's Game of Life][hl]_

[hl]: http://raganwald.com/hashlife/

---

I went on to rediscover Conway's Game of Life several times in my life. Some years ago, I read William Poundstone's [The Recursive Universe: Cosmic Complexity and the Limits of Scientific Knowledge][ru], and it literally blew my mind.

[ru]: https://www.amazon.com/gp/product/0809252023/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=raganwald001-20&linkId=2676ba561595f3a279e159b2b0be475b&language=en_US

I learned a little about Game Theory. I spotted [Games of Strategy: Theory and Applications][GoS] in a library and picked it up, thinking it would help my Backgammon.

[GoS]: https://www.rand.org/pubs/commercial_books/CB149-1.html

That led me to Conway's [On Numbers and Games][onag], and via parallel paths, to [Surreal Numbers]. Like the Game of Life, Surreal Numbers keep popping up unexpectedly, reigniting my interest in how the way we represent data, affords or hinders working with that data.

The subject of numbers and representation leads us to [FRACTRAN].[^elegance][^horton]

[onag]: https://en.wikipedia.org/wiki/On_Numbers_and_Games
[Surreal Numbers]: https://en.wikipedia.org/wiki/Surreal_number
[^elegance]: [Elegance and the Surreals](https://raganwald.com/2009/03/07/elegance-and-the-surreals.html)
[^horton]: [A Surreal Encounter with a Winged Elephant](https://raganwald.com/enchanted-forest/horton.html)
[FRACTRAN]: https://en.wikipedia.org/wiki/FRACTRAN

---

## Table of Contents

---

[![Books © Stewart Butterfield, 2012, Some Rights Reserved](/assets/images/fractran/books.jpg)](https://flickr.com/photos/stewart/99129170)

*"Books" © Stewart Butterfield, 2012, Some Rights Reserved*

---

[Prelude](#prelude)

[FRACTRAN](#fractran)

- [our first fractran program](#our-first-fractran-program)
- [writing a fractran-based fibonacci function in javascript](#writing-a-fractran-based-fibonacci-function-in-javascript)

[Marvin Minsky's Magnificent Machines](#marvin-minsky's-magnificent-machines)

- [magnificent minsky machines](#magnificent-minsky-machines)
- [creating a magnificent minsky machine](#creating-a-magnificent-minsky-machine)
- [a notation for magnificent minsky machines](#a-notation-for-magnificent-minsky-machines)
- [the magnificent minsky multiplication machine](#the-magnificent-minsky-multiplication-machine)
- [implementing magnificent minsky machines](#implementing-magnificent-minsky-machines)

[Marvellous Minsky Machines](#marvellous-minsky-machines)

- [an algorithm to derive a marvellous minsky machine from any magnificent minsky machine](#an-algorithm-to-derive-a-marvellous-minsky-machine-from-any-magnificent-minsky-machine)

[Gödel Numbering and Masterful Minsky Machines](#gödel-numbering-and-masterful-minsky-machines)

- [register machines](#register-machines)
- [encoding state with prime factorization](#encoding-state-with-prime-factorization)
- [the masterful minsky machine](#the-masterful-minsky-machine)

[On Equivalence](#on-equivalence)

- [fractran and marvellous minsky machines](#fractran-and-marvellous-minsky-machines)
- [polygame](#polygame)

[The Collatz Conjecture](#the-collatz-conjecture)

- [why fractran really matters](#why-fractran-really-matters)

[Addenda](#addenda)

- [conway's "fractran: a ridiculous logical language" lecture](#conways-fractran-a-ridiculous-logical-language-lecture)
- [norman wildberger's lecture on the collatz conjecture](#norman-wildbergers-lecture-on-the-collatz-conjecture)
- [vikram ramanathan on fractran](#vikram-ramanathan-on-fractran)
- [notes](#notes)

---

## FRACTRAN

---

[![Only FRACTRAN has these star qualities](/assets/images/fractran/fractran-star-qualities.png)][FRACTRAN]

*A fragment of John Horton Conway's paper on FRACTRAN*

---

In 1987, Conway contributed _FRACTRAN: A SIMPLE UNIVERSAL PROGRAMMING LANGUAGE FOR ARITHMETIC_ to a special workshop on problems in communication and computation conducted in the summers of 1984 and 1985 in Morristown, New Jersey, and the summer of 1986 in Palo Alto. California.

FRACTRAN itself was not an important open problem in the field, but as the editors noted:

> _Perhaps the most entertaining of all the contributions is Conway's fascinating article on FRACTRAN, a strange collection of numbers, which when operated on in a simple way, yield all possible computations. We begin with his article._

--Thomas M. Cover & B. Gotinath, "Open Problems in Communication & Computation"[^scihub]

[^scihub]: [Open Problems in Communication & Computation](/assets/fractran/open-problems-in-communication-and-computation-1987.pdf) is available on SciHub, or by paying rent to Spinger-Verlag. I chose to use SciHub and to simultaneously purchase a used copy of the book online. I don't know how long we'll still be able to buy used books, but I'm taking full advantage of the privilege while we're still permitted to do so.

### our first fractran program

As Wikipedia notes, a FRACTRAN program is an ordered list of positive fractions together with an initial positive integer input *n*. The program is run by updating the integer *n* as follows:

1. for the first fraction *f* in the list for which *nf* is an integer, replace *n* by *nf*
2. repeat this rule until no fraction in the list produces an integer when multiplied by *n*, then halt.

For example, this is a FRACTRAN program for computing any Fibonacci number: `17/65`, `133/34`, `17/19`, `23/17`, `2233/69`, `23/29`, `31/23`, `74/341`, `31/37`, `41/31`, `129/287`, `41/43`, `13/41`, `1/13`, `1/3`.[^snark]

[^snark]: Feel free to use FRACTRAN to ace the programming interview when somene asks for a program to compute `fib(n)`.

All FRACTRAN programs also start with an initial value for *n*. That value is sometimes a constant, and sometimes provided by the user. When it's provided by the user, there is sometimes a need to prepare *n* to make it usable.

In this program's case, to compute `fib(x)` for some value of *x*, we compute `n = 78 * 5^(x - 1)`.

Let's use this program to compute `fib(7)`. We start with `n = 78 * 5^(7-1)`, which is **1,218,750**. We'll follow along for a while to get the feel for what happens:[^debug-fib]

[^debug-fib]: The complete debug output is in [this gist](https://gist.github.com/raganwald/57e9ebf26e3cd2d07aa014e79c1e9748#file-out-md).

- The first fraction in the program is 17/65. 1,218,750 multiplied by 17/65 is 318,750, so we replace 1,218,750 with 318,750 and begin again.
- The first fraction in the program is 17/65. 318,750 leaves a remainder when divided by 65, so we move on.
- The next fraction in the program is 133/34. 318,750 multiplied by 133/34 is 1,246,875, so we replace 318,750 with 1,246,875 and begin again.

We leave it to run for a very long time, and then we see:

- The next fraction in the program is 13/41. 24,576 leaves a remainder when divided by 41, so we move on.
- The next fraction in the program is 1/13. 24,576 leaves a remainder when divided by 13, so we move on.
- The next fraction in the program is 1/3. 24,576 multiplied by 1/3 is 8,192, so we replace 24,576 with 8,192 and begin again.

8,192 is an important number, because *none* of the divisors divide evenly into 8,192. So we see

- The first fraction in the program is 17/65. 8,192 leaves a remainder when divided by 65, so we move on.
- The next fraction in the program is 133/34. 8,192 leaves a remainder when divided by 34, so we move on.
- The next fraction in the program is 17/19. 8,192 leaves a remainder when divided by 19, so we move on.

...

- The next fraction in the program is 13/41. 8,192 leaves a remainder when divided by 41, so we move on.
- The next fraction in the program is 1/13. 8,192 leaves a remainder when divided by 13, so we move on.
- The next fraction in the program is 1/3. 8,192 leaves a remainder when divided by 3, so we move on. None of the demoninators in the program divide evenly into 8,192, so the program halts.

All FRACTRAN programs produce a series of values for *n*, and the result we want must be extracted from them. For our Fibonacci program, the values begin with `1,218,750`, `318,750`, `1,246,875`, and `1,115,625`, and then end with `221,184`, `73,728`, `24,576`, and `8,192`.[^n-fib]

[^n-fib]: The complete list of values of *n* is in [this gist](https://gist.github.com/raganwald/57e9ebf26e3cd2d07aa014e79c1e9748#file-values-of-n-txt).

In the case of Fibonacci, the result we want is the `log2` of the last value for *n*. The last value of *n* is 8,192, and `log2(8,192)` is **13**, the answer we want. The 7th Fibonacci number is 13.

We have now seen the three elements that every FRACTRAN program has:

1. The program itself, a finite list of fractions. This program's list is `17/65`, `133/34`, `17/19`, `23/17`, `2233/69`, `23/29`, `31/23`, `74/341`, `31/37`, `41/31`, `129/287`, `41/43`, `13/41`, `1/13`, and `1/3`.
2. An initial value of *n*. This may be a constant, it may be a user-supplied value, or it may be a transformation of a user-defined value. This program's transformation can be expressed in JavaScript as `n => 78 * Math.pow(5, n-1)`.
3. A transformation from the values of *n* into the result we want, encoded the way we want it. In our case, it is something like `values => Math.log2(last(values))` .

### writing a fractran-based fibonacci function in javascript

Writing a FRACTRAN interpreter is very easy. Let's begin by writing a JavaScript Fibonacci function that uses our FRACTRAN program for its implementation. The main thing we'll need to watch out for is that that values of *n* can grow very, very large, so we will want to use big integers, aka "BigInts."[^bigint]

[^bigint]: `BigInt` is slated to enter JavaScript formally in ES2020. Most of the code is deliberately “lowest common denominator,” however exceptions are justified when the feature greatly simplifies the code by removing accidental complexity, and doesn't affect the central idea of the code itself.

[^github]: If you wish to try out this code for yourself, feel free to peruse [the code repository][fractran-github] for all the code in this essay, plus some other experiments that didn’t make the cut. You will also find instructions on how to use [babeljs.io] to compile the code.

[fractran-github]: https://github.com/raganwald/FRACTRAN
[babeljs.io]: https://babeljs.io

One consequence of working with big integers is that many of the things we depend on for numbers no longer work. For example, `Math.log2(8192) => 13`, but `Math.log2(8192n) => TypeError: Cannot convert a BigInt value to a number`. We'll have to write our own `log2` function.

The same goes for `Math.pow`, we'll have to write our own. Feel free to use these implementations if you like:[^github]

```javascript
// Any sufficiently complicated function that loops, contains an ad hoc,
// informally-specified, bug-ridden, slow implementation of
// half of Linear Recursion
const log2 = (n) => {
  let result = 0n;

  while (true) {
    // degenerate condition
    if (n === 1n) break;

    // termination conditions
    if (n % 2n === 1n) return;
    if (n < 1n) return;

    //divide and conquer
    ++result;
    n = n / 2n;
  }

  return result;
}

const pow = (base, exponent) => {
  if (exponent < 0n) return;

  let result = 1n;

  while (exponent-- > 0n) result = result * base;

  return result;
}
```

Now go ahead and write your own implementation. Ignore the code below until you've written your own.

```javascript
// uses log2 and pow from above to formulate the seed and decipher the result

const fib = (x) => {
  const program = (
    '17/65, 133/34, 17/19, 23/17, 2233/69, 23/29, 31/23, 74/341,' +
    ' 31/37, 41/31, 129/287, 41/43, 13/41, 1/13, 1/3'
  ).split(/(?:\s*,|\s)\s*/).map(f => f.split('/').map(n => BigInt(n)));

  let n = 78n * pow(5n, BigInt(x) - 1n);

  program_start: while (true) {
    for (const [numerator, denominator] of program) {
      if (n % denominator === 0n) {
        n = (n * numerator) / denominator;
        continue program_start;
      }
    }
    break;
  }

  return log2(n);
};

fib(7)
  //=> 13
```

This is very cool. The FRACTRAN program is very small and ridiculously simple: It's just fractions. And the central FRACTRAN interpreter is also very small: It's literally a `for` loop inside a `while` loop, and the `while` loop (along with a `break` statement) could have been avoided if JavaScript supported `GOTO`.[^chch]

[^chch]: Before anybody [quotes Djikstra](/assets/media/Dijkstra68.pdf), remember that ["Considered Harmful" Essays Considered Harmful](https://meyerweb.com/eric/comment/chech.html)

For all its apparent elegance, FRACTRAN appears at first glance to be inscrutable. Is it one of those languages that is neither good for reading nor writing? Or is there a method to the madness of writing a program by composing a list of fractions?

To answer this question, we must first consider the work of another great mind no longer with us, [Marvin Minsky].

[Marvin Minsky]: http://web.media.mit.edu/~minsky/

---

## Marvin Minsky's Magnificent Machines

---

[![Marvin Minsky](/assets/images/fractran/marvin-minsky.jpg)][Marvin Minsky]

*Marvin Minsky posing with one of MIT's demonstrations of Robotics and AI*

---

In September of 1987, [Stewart Brand] published [The Media Lab: Inventing the Future at M.I.T.][The Media Lab]. To say that the book affected me does not do its impact justice. Like many business and technical hagiographies, it was breathless in its admiration for what M.I.T.--and director Nicholas Negroponte--were trying to do.

[Stewart Brand]: http://sb.longnow.org/
[The Media Lab]: https://www.amazon.com/Media-Lab-Inventing-Future-M-I-T/dp/0670814423/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=raganwald001-20&linkId=e5653e0666603d4426dc84ed2719d0a8&language=en_US

It was also highly revealing: Brand described in detail how the Media Lab was funded by its corporate sponsors, and how the funding model drove research. Their motto was, "Demo or Die," which meant that the money went to the people who could not only wow their peers, but also provide the stage-magic that would open the wallets of their corporate sponsors.

I was working in technology Enterprise Sales at the time, and keenly understood that while it's really difficult to sell sizzle without steak, it's equally improbable to secure the sale when you have perfectly good steak, but no sizzle.[^gatekeepers]

[^gatekeepers]: There is a persistant myth in software that Enterprise Technology Sales are conducted on the golf course, and that the sales team who spends the most on steak and bourbon wins the deal no matter how crap-tastic their proposal.<br/><br/>People promulgating this myth greatly underestimate the number of individuals in any non-trivial organization who lay in wait for proposals, ready to make their own reputations by pointing out the flaws in every proposed adoption project.

One of the figures mentioned in The Media Lab was [Marvin Minsky]. Minsky was considered a giant in Artificial Intelligence, and Artificial Intelligence was the [tulip mania] of the day. History would show that as the book was released, AI funding was starting another of its cyclical collapses, but as I read the book, the magazines and book shelves were groaning under the weight of breathless prose and utopian visions.

[tulip mania]: https://en.wikipedia.org/wiki/Tulip_mania

---

<iframe width="560" height="315" src="https://www.youtube.com/embed/-Hx8RixhoOM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

---

In 1985, Minsky had published [The Society of Mind], and I bought it on the strength of reading about Minsky in The Media Lab. In 1994, a company called Voyager published a [CD-ROM version of The Society of Mind][CDSoM] that I "played" using one of Apple's quirkier products, a CD-ROM reader and audio-CD player they borrowed from Phillips and branded as [PowerCD].

[The Society of Mind]: https://www.amazon.com/exec/obidos/ISBN=0671657135/marvinminskyA/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=raganwald001-20&linkId=cbacf6f35f9fee30f018335fa1518663&language=en_US
[CDSoM]: http://web.media.mit.edu/~minsky/Voyager.html
[PowerCD]: https://en.wikipedia.org/wiki/PowerCD

One of the features of the CD-ROM was an interactive tour of Minsky's office. I still vividly recall his discussion of a mirror he had hanging on the wall, and his mention that Feynman had written an [entire book][QED] devoted to explaining just one thing: How light **actually** reflects off a mirror, and that in this book, he explains why all of the things non-specialists believe about light and reflection are actually false.

[QED]: https://en.wikipedia.org/wiki/QED:_The_Strange_Theory_of_Light_and_Matter "QED: The Strange Theory of Light and Matter"

Like Feynman and Conway, Minsky had a talent for explaining challenging ideas. And also like Feynman and Conway, he had made enormous contributions to the progress of human knowledge. One of his areas of research was in computability, and specifically, the study of a certain class of idealized computing machines that are now named *Minsky Machines* in his honour.[^mm-esolang][^mm-wiki]

[^mm-esolang]: [Minsky Machines on esoloangs.org](https://esolangs.org/wiki/Minsky_machine)
[^mm-wiki]: [Minsky Machines on Wikipedia](https://en.wikipedia.org/wiki/Register_machine#Minsky,_Melzak-Lambek_and_Shepherdson–Sturgis_models_"cut_the_tape"_into_many)

### magnificent minsky machines

A *Minsky Machine* is an idealized machine that has been proven to be computationally universal. Minsky Machines are part of the family of idealized machines called [Register Machines].

[Register Machines]: https://en.wikipedia.org/wiki/Register_machine

Like Register Machines and Turing Machines, Minsky machines form a little family, with slight differences between them in the way they are imagined, but all are computationally equivalent. We shall discuss one particularly simple form of Minsky Machine that we shall call the "Magnificent" Minsky Machine.[^term-of-art]

[^term-of-art]: "Magnificent Minsky Machine" is not a term of art, if anything, it's a *fond* reference to [Raymond Smullyan]'s use of songbirds to describe combinators.
[Raymond Smullyan]: https://www.raymondsmullyan.org/

Like a [Turing Machine], a Magnificent Minsky Machine has a finite number of states. However, instead of having a single tape that stretches to infinity in one or both directions, Magnificent Minsky Machines have a finite number of tapes, each of which stretches to infinity in only one direction.

[Turing Machine]: https://www.cl.cam.ac.uk/projects/raspberrypi/tutorials/turing-machine/one.html "What is a Turing Machine?"

Like a Turing Machine, a Magnificent Minsky Machine has a tape-head for each tape, and based on its instructions, can move its tape-heads and change to a different state. Unlike a Turing Machine, a Magnificent Minsky Machine can move its tape-heads any finite amount in either direction. We call these directions forward ("away from the beginning"), and backwards ("towards the beginning").

When a Turing Machine matches a particular symbol under its tape-head, it can write a symbol, and it can also move the tape-head one square in either direction.

Unlike a Turing Machine, a Magnificent Minsky Machine cannot write anything on its tapes, and therefore, does not match anything under its tape-heads. What it can do is test whether it is possible to perform a move. Since it is always possible to move forward, the only test we care about is whether a move backwards is possible.

Also unlike a Turing Machine, a Magnificent Minsky Machine can move zero _or more_ of its tape-heads at the same time. Therefore, its test may check whether one or more tape-heads can be moved backwards.

To give a literal example, if the tape-head is at the beginning, no backwards move is possible. If the tape-head is _n_ squares forward, all moves backwards <= _n_ squares are possible, but all moves > _n_ squares are not possible.

The net effect of these design choices is that a Magnificent Minsky Machine can store an arbitrary amount of state, just like a Turing Machine, but it stores that state by having each tape-head be an arbitrary distance from the beginning of its tape.[^spiders]

[^spiders]: An equivalent metaphor for a Magnificent Minsky Machine is to have a single tape, but multiple tape-heads. We could imagine them as moving back and forth, and when one tape-head encounters another, it crawls over the other tape-head like crabs crawling over each other in a great heap.

---

![Multi Tape](/assets/images/fractran/multi-tape.jpeg)

*An illustration of a multi-tape machine.*

---

### creating a magnificent minsky machine

Let's write a program using a Magnificent Minsky Machine. Now that we have the general idea of how these machines operate, here is how we will specify each Magnificent Minsky Machine, i.e. How we shall write its "program:"

1. Our machine will have a finte number of states, denoted with consecutive positive integers, i.e. 1, 2, 3, ...
2. Each state will have an finite and ordered list of rules.
3. Each rule will be expressed as "Do this, provided that." Thus, they will have two clauses: An *action clause*, and a *guard clause*.
4. The action clause shall consist of a set of tape-heads to move forward, and a positive integer for each tape-head stating how many squares to move. We shall note these as tuples of `(tape-identifier^squares-to-move-forward)`. The action clause is an unordered set of such tuples, with no two tuples in the same rule sharing the same tape-head. The action clause will also include a positive integer indicating the next state to enter.
5. The guard clause shall consist of a set of tape-heads to move backwards, and a positive integer stating how many squares to move towards the beginning. As with the action clause, no two guard clauses in the same rule can share the same tape-head.
6. Because no two clauses in the same rule can share the same tape-head, it follows that no one rule can both test a tape-head in the guard clause and simultaneously move a tape-head in the action clause.

Our Magnificent Minsky Machine is initialized with the tape-heads being placed in a specific set of positions, so in addition to listing the states and rules therein, the description of a Magnificent Minsky Machine will also include instructions for setting up the initial position of the tape-heads.

When we wish to run a Magnificent Minsky Machine, we start it in state 1. We operate our machine by scanning the rules within the current state, in order.

For each rule, we check its guard clause. If it is possible to move all of the tape-heads in the guard clause towards the beginning, the rule "fires," and we move the tape-heads towards the beginning as specified by the guard clause. We then consult the action clause, and move all of the tape-heads listed away from the end by the amounts listed. Finally, when a rule fires, if it lists a next state, we change to that state and return to scanning the rules within the current state, in order.

If any rule's guard clause cannot perform **all** of the required movement of tape-heads towards the beginning, the rule fails, and the tape-heads are not disturbed. We then move on and try the next rule in that state's list, and the next, and so forth. If all of the rules in the current state fail, the machine halts. It follows, trivially, that if the machine enters a state without any rules, it must necessarily halt.

If the machine attempts to transition to an undefined state, it also halts. An explicit transition to state 0, therefore, is the well-formed way to explicitly halt the machine.

Now we're ready to discuss a simple notation for Magnificent Minsky Machines, and to try one out.

### a notation for magnificent minsky machines

Consider a Magnificent Minsky Machine that will add two numbers. We will only need one state, with two rules. Our notation will be simple. In each state, there is a comma-separated list of rules. Since we will only have one state in our first machine, we will only discuss how to write down the rules right now.

Our state will have a comma-sparated list of rules, i.e. `rule1, rule2`. Whitespace is not significant, so we could also write `rule1,rule2` or even:

```
rule1,
rule2
```

(As is usual with most programming languages, how we arrange our program with whitespace is a matter of organizing the layout for human readability.)

Each rule willl have an action clause and a guard clause, separated with `/`, e.g.:

```
actionClause1/guardClause1,
actionClause2/guardClause2
```

The `/` obviously resembles the notation for division, but in a Magnificent Minsky Machine, it doesn't actually mean "divide," it just separates the action clause from the guard clause in each rule.

The action clauses and guard clauses both have exactly the same notation: One or more tuples of the form `(t^s)`, where `t` identifies the tape-head, and `s` identifies the number of squares to move. The `^` character means exponentiation in some programming langauges, but in a Magnificent Minsky Machine, it's just a way of separating two numbers.

Thus, `(1^1)(4^1)/(3^1)` is a rule with two clauses:

- `(1^1)(4^1)` is the action clause, and it has two tuples: `(1^1)` says to move tape-head 1 by one squre, and `(4^1)` says to move tape-head 4 by one square.
- `(3^1)` is the guard clause, and it says to move tape-head 3 by one square.

In a Magnificent Minsky Machine, action clauses always move the tape-heads forward, and guard clauses always move the tapehead backwards, so we don't need to have our clauses use a `+` or `-`, or arrows pointing in different directions, it is enough to know that clauses to the left of the `/` are action clauses and move the tape-heads forward, while clauses to the right of the `/` are guard clauses, and move the tape-heads backwards.

Now to our first machine: Our machine only has one state, `1`, and it has two rules:

```
(1^1)/(2^1),
(1^1)/(3^1)
```

Our program adds two numbers positive numbers, which we shall call `a` and `b`. It has three tapes, 1, 2, and 3. To set the machine up, we place tape-head 1 at the beginning of its tape, tape-head 2 `a` squares forward, and we place tape-head 3 `b` squares forward. When the machine halts, tape-head 1 will be `a + b` squares forward, while tape-heads 2 and 3 will be at the beginning.

We can use it to add the numbers 2+2, and we'll see if it comes up with 4. Here's how we'll show the position of the tape-heads graphically:[^graphically]

[^graphically]: Using ASCII to draw things rather than say things has a very long tradition in programming, and ASCII graphics are just as "graphical" as an animated, interactive high-definition virtual-reality depiction of a process.<br/><br/>And besides, the Latin root of the word "graph" refers to graphite, the material used in pencils. So if we want to be literal about this, if you can write it with a pencil, it's a graphic.

```
1: *
2: ..*
3: ..*
```

This shows that tape-head 1 is at the beginning, while tape-heads 2 and 3 are two squares forward, the beginning conditions for adding 2 and 2.

Our machine begins in state 1 (it's the only state this machine has). The first rule is `(1^1)/(2^1)`. It checks to see if tape-head 2 can move one square towards the beginning. It can, therefore it also executes the action of moving tape-head 1 one square away from the beginning. It states in state 1, and now the tape-head positions are:

```
1: .*
2: .*
3: ..*
```

Once again, it consults its rules, and the first rule fires again, producing:

```
1: ..*
2: *
3: ..*
```

The third time through, rule 1 fails to fire because its guard clause `(2^1)` fails. It remains in its only state, and checks the second rule, `(1^1)/(3^1)`. Tape-head 3 can be moved one square towards the beginning, and it does so while moving tape-head 1 away from the beginning:

```
1: ...*
2: *
3: .*
```

Once again, it consults its rules, and the second rule fires again, producing:

```
1: ....*
2: *
3: *
```

The last time through, neither rule can fire, because neither tape-head 2 or tape-head 3 can move one square towards the beginning, so the machine halts. As we desired, tape-head 1 is now four squares forward of the beginning, so our machine has added 2 and 2 to produce 4.

### the magnificent minsky multiplication machine

Now we'll write a Magnificient Minsky Machine that multiplies two numbers using our notation. We will use more than one state, so we separate states with `;`, and show a transition to a different state with `→`.

Our states will be numbered from 1, in the order we list them. With this scheme, our multiplication machine can be written as:

```
(1^0)/(2^1)→2,    (1^0)/(3^1)   ;
(1^1)(4^1)/(3^1), (1^0)/(1^0)→3 ;
(3^1)/(4^1),      (1^0)/(1^0)→1
```

Or even:

```
(1^0)/(2^1)→2,
(1^0)/(3^1);

(1^1)(4^1)/(3^1),
(1^0)/(1^0)→3;

(3^1)/(4^1),
(1^0)/(1^0)→1
```

As with the addition machine, we give it three tapes: A result tape that must be empty, and two multiplicand tapes, with the tape-head advanced by the value of the multiplicand. We also supply a fourth tape to use as a temporary variable. Thus, to multiply 3 and 39, we set the machine's tapes to `0, 3, 39, 0`.

The operation of the machine is easy to describe at a high level. There's one idiom that we first introduce: `(1^0)` is a `NOOP` clause. If used as a guard clause, it always succeeds because every tape-head is always in a position where it can move zero squares backwards. And if used as an action clause, it does nothing because it moves the tape-head zero squares forward. And a clause like `(1^0)/(0^1)→1` is a Magnificient Minsky Machine's way of writing `GOTO`: It always succeeds, doesn't move any tape-heads, and changes to state `1`.

The initial state (`1`) has two rules:

1. `(1^0)/(2^1)→2`, which decrements tape 2 and then changes to state 2, followed by;
2. `(1^0)/(3^1)`, which decrements tape 3 and remains in state 1.

The net effect of these two rules is that whenever the machine is in state 1, it tries to decrement tape 2 and move to state 2. If that fails, it tries to decrement tape 3 and remain in state 1. When it decrements tape 3 and remains in state 1, it clearly will do it again, and again, and again until it can decrement state 3 no more, at which point it will fail both of its rules, and halt.

The second state's two rules are:

1. `(1^1)(4^1)/(3^1)`, which increments tapes 1 and 4, decrements tape 3, and stays in state 2, followed by;
2. `(1^0)/(1^0)→3` which is a simple `GOTO 3`.

The net effect of state 2's rules is simply to add the value of tape 3 to whatever is in tape 1, while simultaneously making a copy of tape 3 in tape 4 (because in our Magnificient Minsky Machines, successfully reading a value also consumes that value).

The third states two rules are:

1. `(3^1)/(4^1)`, which copies tape 3's original value back to tape 3 from tape 4, followed by;
2. `(1^0)/(1^0)→1` which is a simple `GOTO 1`.

The net effect of the third rule is to restore tape 3. Since this machine copies the value of tape 3 to tape 1 once for every square of tape 2, the net effect is to multiply tapes 2 and 3.

### implementing magnificent minsky machines

Manually simulating ideal computing machines loses its lustre once you've manually verified that `3 * 13 = 39`. Without peeking ahead, try writing an interpreter that can parse our notation and output the result.

For example, we'd like to write:

```javascript
const evaluate = (program, ...tapes) => {
  // ...
};

evaluate(
  '(1^1)/(2^1), (1^1)/(3^1)',
  0, 2, 3
)
  //=> [5, 0, 0]

evaluate(`
  (1^0)/(2^1)→2,    (1^0)/(3^1)   ;
  (1^1)(4^1)/(3^1), (1^0)/(1^0)→3 ;
  (3^1)/(4^1),      (1^0)/(1^0)→1
  `, 0, 3, 13, 0
)
  //=> [39, 0, 0, 0]
```

No peeking until you've tried it yourself!

```javascript
const parse = (program) => {
  const parseProgram = program => program.split(/\s*;\s*/).map(s => s.trim());
  const parseState = state => state.split(/(?:\s*,|\s)\s*/).map(s => s.trim());
  const parseRule = (rule, stateIndex) => {
    const [clauses, nextState] = rule.includes('→') ? rule.split(/\s*→\s*/).map(s => s.trim()) : [rule.trim(), stateIndex + 1]

    return [clauses, typeof nextState === 'string' ? parseInt(nextState, 10) : nextState];
  };
  const parseClauses = clauses => clauses.split('/').map(s => s.trim());
  const parseClause = clause => {
    if (clause === '') return [];

    const strippedClause = clause.substring(1, clause.length - 1); // strip opening and closing ()
    const pairs = strippedClause.split(/\)\s*\(/).map(s => s.trim());

    return pairs.map(p => p.split(/\s*\^\s*/).map(s => parseInt(s, 10)));
  };

  return [[]].concat(
    parseProgram(program).map(
      (state, stateIndex) => parseState(state).map(
        rule => {
          const [_clauses, nextState] = parseRule(rule, stateIndex);
          const clauses = parseClauses(_clauses).map(parseClause);

          return clauses.concat([nextState]);
        }
      )
    )
  );
}

const interpret = (parsed, input = []) => {
  const tapes = ['ANCHOR', ...input]; // fake 1-indexing

  let stateIndex = 1;

  run: while (stateIndex > 0 && stateIndex < parsed.length) {
    const rules = parsed[stateIndex];
    for (const [actionClauses, guardClauses, nextState] of rules) {
      if (guardClauses.some(
        ([tapeIndex, squares]) => tapes[tapeIndex] === undefined || tapes[tapeIndex] < squares
      )) continue;
      for (const [tapeIndex, squares] of guardClauses) {
        tapes[tapeIndex] = tapes[tapeIndex] - squares;
      }
      for (const [tapeIndex, squares] of actionClauses) {
        tapes[tapeIndex] = (tapes[tapeIndex] || 0) + squares;
      }
      stateIndex = nextState;
      continue run;
    }
    break;
  }

  const output = tapes.slice(1); // unfake 1-indexing

  return output;
}

const evaluate = (program, ...tapes) => interpret(parse(program), tapes);
```

Now that we have a machine to emulate our machines, we can explore an interesting idea.

---

## Marvellous Minsky Machines

---

![Marvellous Spatuletail Dubi Shapir/ABCbirds.Org ](/assets/images/fractran/Marvellous-Spatuletail-Dubi-Shapiro-ABCbirds.org_.jpg)

*Marvellous Spatuletails are endemic to Peru. (Dubi Shapiro/ABCbirds.org)*

---

Here is another Magnificent Minsky Machine that multiplies two numbers, we shall call it the **marvellous multiplier**:

```
(1^1)(4^1)(6^1)/(3^1)(5^1) ,
(7^1)/(5^1)                ,
(3^1)(8^1)/(4^1)(7^1)      ,
(1^0)/(7^1)                ,
(5^1)/(6^1)                ,
(7^1)/(8^1)                ,
(5^1)/(2^1)                ,
(1^0)/(3^1)
```

This is a one-state multiplier. Our previous multiplier needed three states:

```
(1^0)/(2^1)→2,    (1^0)/(3^1)   ;
(1^1)(4^1)/(3^1), (1^0)/(1^0)→3 ;
(3^1)/(4^1),      (1^0)/(1^0)→1
```

How does our marvellous multiplier work without the other states?

The not-very-secret secret is that in addition to the four tapes our multiplier needs to do its main business, we've added four more tapes: 5, 6, 7, and 8. We only ever set them to 1 or zero, so they act like flags that emulate four additional states.

Let's analyze this, state-by state. The first state of the original multiplier had two rules:

```
(1^0)/(2^1)→2,
(1^0)/(3^1)
````

These two rules are the _last_ rules of the marvellous multiplier:

```
(5^1)/(2^1),
(1^0)/(3^1)
```

Why are they the last rules? Since we are using tapes 5, 6, 7, and 8 to emulate other states, every rule that comes before these rules is guarded by `(5^1)`, `(6^1)`, `(7^1)`, or `(8^1)`. Thus, these rules only come into play if _none_ of these state-emulation tape-heads are one square forward.

But what about the rules themselves? The second rule, `(1^0)/(3^1)`, is the same thing we already have, it decrements tape 3 and remains in the only state, thus it will clear tape 3 and then the entire program will halt, just as with the original.

The first of our original rules is different. Instead of `(1^0)/(2^1)→2`, we have `(5^1)/(2^1)`. Instead of setting the next state to 2, we increment tape 5.

That leads us to the original state 2:

```
(1^1)(4^1)/(3^1),
(1^0)/(1^0)→3
```

And our marvellous machine's equivalent:

```
(1^1)(4^1)(6^1)/(3^1)(5^1),
(7^1)/(5^1)
```

Both of these rules are guarded by `(5^1)`, which matches what we saw from the rule in the original state 1: incrementing tape 5 makes this machine act like it's in the original state 2.

The first rule of the original machine incremented tapes 1 and 4, decremented tape 3, and remained in state 2. Our new rule also increments tapes 1 and 4, and decrements tape 3. And we know that we have to have it get back to the emulated state 2 by incrementing tape 5. But it is forbidden to both decrement and increment the same tape in our Minsky Machines, so it increments tape 6 instead.

How does that get us to incrementing tape 5? Look further down, and we find this rule:

```
(5^1)/(6^1)
```

If the marvellous multiplier finds itself with tape 6 incremented, it turns around and increments tape 5. Thus, incrementing tape 6 is an indirect way of incrementing tape 5, and that's what our machine does when it is already decrementing tape 5.

We already know why the second of our original rules for state 2, `(1^0)/(1^0)→3`, becomes `(7^1)/(5^1)` in the marvellous multiplier. Instead of always matching with a `(1^0)` guard, it only matches when tape 5 is incremented, because tape 5 emulates state 2. And instead of setting having a NOOP action with `(1^0)` and setting the next state to 3, it increments tape 7 because tape 7 emulates state 3.

We now know everything we need to know to interpret how the marvellous machine's `(3^1)(8^1)/(4^1)(7^1), (1^0)/(7^1)` emulates the original's `(3^1)/(4^1), (1^0)/(1^0)→1`, and why there's a `(7^1)/(8^1)` rule added to support it.

The marvellous multiplier illustrates a key property of these Minsky Machines: **For every Magnificent Minsky Machine with two or more states, there exists an equivalent Marvellous Minsky Machine with just one state, but more tapes.**

### an algorithm to derive a marvellous minsky machine from any magnificent minsky machine

From our exploration of the marvellous multiplier, we picked up a few tricks for emulating states with additional tapes:

1. Place the original state 1 last;
2. For each state beyond 1, set up two additional tapes, `stateTape` and `stateTapePrime`;
3. Guard the rules of the original state with `stateTape`;
4. For rules outside the state that transfer to the state, remove the nextState and add an action to increment `stateTape`.
5. For rules of the original state that remain in the state, add an action to increment `stateTapePrime`;
6. Add a rule to transfer from `stateTapePrime` to `stateTape`.

This can, of course, be automated. If you're keen, have a go at it before reading this example. If you're **really** keen, see if you can devise your own algorithm for deriving a Marvellous Minsky Machine from any Magnificent Minsky Machine.[^eminem]

[^eminem]: The suggested algorithm for automatically deriving a Marvellous Minsky Machine from any Magnificent Minsky Machine actually only works for the subset of Magnificent Minsky Machines that do not use a transfer to state 0 to explicitly halt.<br/><br/>A good exercise for the enthusiastic reader is to consider this question: _For every Magnificent Minsky Machine that explicitly halts, is there an equivalent Magnificent Minsky Machine that only halts implicitly? If so, how can we derive it?_

```javascript
const maxTapeIndexOf = (parsed) => {
  let max = undefined;

  for (const rules of parsed.slice(1)) {
    for (const [actionClause, guardClause] of rules) {
      for (const [tapeIndex] of actionClause.concat(guardClause)) {
        if (max === undefined || tapeIndex > max) max = tapeIndex;
      }
    }
  }

  return max;
};

const maxStateNumberOf = (parsed) => {
  return parsed.length - 1;
}

const NOOP = [1, 0];
const isNOOP = ([,squares]) => squares === 0;
const isActionable = ([,squares]) => squares !== 0;

const SUCCESS = [1, 0];
const isSuccess = ([,squares]) => squares === 0;
const canFail = ([,squares]) => squares !== 0;

const ruleCanFail = ([, guardClause]) => guardClause.every(canFail);

const withClause = (clauses, clause) => clauses.filter(canFail).concat([clause]);

const toMarvellous (parsed) => {
  const maxTapeIndex = maxTapeIndexOf(parsed);
  const maxStateNumber = maxStateNumberOf(parsed);

  const stateToTape = new Map();

  for (let stateNumber = 2; stateNumber <= maxStateNumber; ++stateNumber) {
    const offset = maxTapeIndex + (2 * stateNumber) - 3;

    stateToTape.set(stateNumber, { stateIndex: offset, statePrimeIndex: offset + 1 });
  }

  const state1 = parsed[1];

  // adjust all rules in state 1 to set an emulated state
  // rather than use an explicit nextState if they point to
  // another state
  for (const rule of state1) {
    const [actionClause, guardClause, nextState] = rule;
    if (nextState > 1) {
      rule[0] = withClause(actionClause, [stateToTape.get(nextState).stateIndex, 1]);
      rule[2] = 1;
    }
  }

  let stateIndex = 1;
  let aggregateRules = [];
  for (const rules of parsed.slice(2)) {
    ++stateIndex;

    if (rules.every(ruleCanFail)) {
      // if we cannot guarantee action,
      // add an explicit fall-through to halt
      // this will get guarded below
      rules.push([[NOOP], [SUCCESS], 0]);
    }

    const stateEmulationGuard = [stateToTape.get(stateIndex).stateIndex, 1];

    for (const rule of rules) {
      const [actionClause, guardClause, nextState] = rule;

      if (nextState === stateIndex) {
        // this rule remains in the same state. we cannot directly
        // emulate the sate, because we are already guarding for it,
        // so we set the state-prime
        rule[0] = withClause(actionClause, [stateToTape.get(nextState).statePrimeIndex, 1]);
      } else if (nextState > 1) {
        // set an emulated state rather than use an explicit nextState
        // if nextState
        rule[0] = withClause(actionClause, [stateToTape.get(nextState).stateIndex, 1]);
      }

      rule[1] = withClause(guardClause, stateEmulationGuard);
      rule[2] = 1;
    }

    aggregateRules = aggregateRules.concat(rules); // TODO: refactor to flatMap

  }

  for (const { stateIndex, statePrimeIndex } of stateToTape.values()) {
    const actionClauses = [[stateIndex, 1]];
    const guardClauses = [[statePrimeIndex, 1]];

    aggregateRules.push([actionClauses, guardClauses, 1]);
  }

  aggregateRules = aggregateRules.concat(state1);

  return [[]].concat([aggregateRules]);
}
```

That is truly marvellous, but is it _meaningful_?

Yes, it is meaningful, and we're about to find out why.

---

## Gödel Numbering and Masterful Minsky Machines

---

![Godeleinstein](/assets/images/fractran/godeleinstein.jpg)

*Kurt Gödel and Albert Einstein*

---

Formally, a [Gödel Numbering] is a scheme for assigning a unique natural number to every symbol and statement in a formal language. Kurt Gödel used such a scheme to show that formal systems capable of making statements about themselves were equivalent to systems that make statements about numbers, and from there he went on to show that in such systems, there were necessarily statements that were true but not provable.

[Gödel Numbering]: https://en.wikipedia.org/wiki/Gödel_numbering

Informally, a Gödel Numbering is a mapping between natural numbers and some other mathematical concept or entity. Let's keep that in mind.

### register machines

A Minsky Machine's tapes are easily represented as natural numbers. We have presented the machine as moving over a tape, which our actions and guards moving the head away from and back towards the beginning of the tape.

And while we could implement the tapes with arrays or some such, natural numbers are a better choice because they more neatly fit the affordances our tapes provide: Incrementing by a certain amount, testing whether they can be decremented by a certain amount, and decrementing them by a certain amount.

In fact, if we let go of the notion of tapes, we can think of our Minsky Machines as operating on a finite set of registers, each of which holds a natural number. And this is where things get interesting:

In a "Magnificent" Minsky Machine, the current state of the world is represented by the machine's current state and the current state of its registers. But a "Marvellous" Minsky Machine does away with the machine's current state. the "state of the world" is encoded entirely by the contents of its registers.

This brings up an interesting possibility: We were able to "flatten" a Magnificent Minsky Machine into a Marvellous Minsky Machine, getting rid of its states by encoding the machine states into register values.

Could we "flatten" the registers by encoding their value into a single natural number? Could we develop a Minsky Machine that only needs one number to encode its entire state?

### encoding state with prime factorization

When Gödel developed his numbering system, he needed a way to encode a finite number of finite numbers in a single finite natural number. In this way, he could encode any statement in any formal language as a single natural number.

There are various ways to encode a finite number of finite numbers in a single finite natural number. For example, we could just write the numbers out like text, separating the numbers with a comma like a CSV file. We wouldn't need 8 or 16 bits for each "character," 4 bits could handle this easily.

While that's certainly _possible_, the things that lists of characters makes easy--like searching for any arbitrary substring--are not useful to us, and the things that are useful to us are not easy with lists of characters.

We know our requirements: We need to quickly and easily decrement one or more "registers," preferably in a single step. And we need to quickly and easily increment several "registers" in a single step.

Gödel chose to use [prime factorization][factorization] to encode a finite number of finite numbers, and that method suits us perfectly.

[factorization]: https://en.wikipedia.org/wiki/Integer_factorization "Integer Factorization"

With prime factorization, we encode lists of numbers as exponents of consecutive primes. Thus, the list `[1, 9, 6, 2]` is encoded as 2¹3⁹5⁶7², or 30,139,593,750. While the numbers might become very large, they're workable for the kinds of toy exercises we're performing here.

Prime factorization can be used to encode a Minsky Machine's state, using the exponents of consecutive primes as virtual registers. But that's not its only use. Action clauses in our rules are tuples of a register and an amount to increment. So `(3^2)` means, "increment the register identified as `3`, by 2."

The two is definitely a natural number. But the register indicator could be anything. Our Minsky Machines don't allow indirect access or iteration over them, so there's nothing really binding them to consecutive integers.

So what if we labeled the registers with _consecutive primes_? In that case, an action clause like `(1^1)(4^1)(6^1)` would become `(2^1)(7^1)(13^1)`. And we can do the same thing with guard clauses: `(3^1)(5^1)` would become `(5^1)(11^1)`.

Now we see the obvious![^obvious]

[^obvious]: So obvious that I have no doubt that you saw it much more quickly than I did when I first read about these subjects.

We can represent action and guard clauses as natural numbers with prime factorization. So a rule like `(1^1)(4^1)(6^1)/(3^1)(5^1)` would become `(2^1)(7^1)(13^1)/(5^1)(11^1)` when we swap the consecutive tape numbers for consecutive primes. We then turn that notation into an arithmetic expression by converting the increments and decrements to exponents, which would be 2¹7¹13¹/5¹11¹.

And that can be written as a pair of natural numbers separated with a forward slash, i.e. `182/55`.

The final part of our single-number Minsky Machine will be its input and output. With a Magnificent or Marvellous Minsky Machine, we listed the initial values of the registers. So for adding having a value of `0` in register 1, `3` in register 2, and `13` in register 3, we would include the parameters `0, 3, 13`.

And for output, our machine would return the value of all the registers, and the value we want would be in one or more of them, depending on how we wrote our program. For example, the Marvellous Multiplication Machine returns `39, 0, 0, 0, 0, 0, 0, 0`.

We will encode these with prime factorization as well. So the input of `0, 3, 13` would become 3³5¹³, or 32,958,984,375. Likewise, the output of `39, 0, 0, 0, 0, 0, 0, 0` would become 2³⁹, or 549,755,813,888.

This transformation is extremely simple, and once again we can perform it mechanically:[^two-hundred]

[^two-hundred]: Our implementation can only handle Magnificent and Marvellous Minsky Machines with a maximum of 200 registers, but that's enough to demonstrate the principle, and it is not particularly difficult to write a version of `tapeToPrime` that can handle any number of registers.

```javascript
const PRIMES = [
  2n, 3n, 5n, 7n, 11n,
  13n, 17n, 19n, 23n, 29n,

  // ... 180 more primes ...

  1153n, 1163n, 1171n, 1181n,	1187n,
  1193n, 1201n,	1213n, 1217n,	1223n
];

const tapeToPrime = tape => PRIMES[tape - 1];
const exponentiate = ([tape, amount]) => pow(tapeToPrime(tape), BigInt(amount));
const multiply = (x, y) => x * y;
const godelizeClauses = clauses => clauses.map(exponentiate).reduce(multiply, 1n);

export const toMasterful = (magnificentProgram) => {
  const parsedMarvellous = parse(toMarvellous(magnificentProgram));
  const godelized = parsedMarvellous[1].map(
    ([actions, guards]) => [actions, guards].map(godelizeClauses)
  );

  return pp(godelized);
}
```

Now what about actually _evaluating_ a single-number Minsky Machine? If you are extremely keen, you can write your own implementation. We want to end up with something like:

```javascript
const evaluate = (program, initialState) => {
  // ...
};

// masterful adding machine
// 3²5³ => 1,125
// 2⁵ => 32
evaluate(
  '2/3, 2/5',
  1125
)
  //=> 32

// masterful multiplication machine
// 3³5¹³ => 32,958,984,375
// 2³⁹ => 549,755,813,888
evaluate(
  '182/55, 17/11, 95/119, 1/17, 11/13, 17/19, 11/3, 1/5',
  32958984375n
)
  //=> 549755813888n
```

We will need functions to convert BigInts to their factorization, and factorizations back to BigInts. If you wish, you may use these helpers for your implementation:

```javascript
// Converts BigInts to their prime factorizations,
// represented as a map from prime to exponent.
//
// Examples:
//   17 => Map { 17 => 1 }
//   39 => Map { 3 => 1, 13 => 1 }
//   44 => Map { 2 => 2, 11 => 1}
//
// Accepts BigInts or numbers, returns a factorization
// as ordinary numbers

// Relies on simple factoring code adapted from
// http://www.javascripter.net/math/primes/factorization.htm
export const toFactors = (n) => {
  n = BigInt(n);

  if (n <= 0n) return;

  const factorization = new Map();

  while (n > 1n) {
    const primeFactorBigInt = leastFactor(n)
    const primeFactor = unsafeToNumber(leastFactor(n));

    factorization.set(
      primeFactor,
      factorization.has(primeFactor) ? factorization.get(primeFactor) + 1 : 1
    );

    n = n / primeFactorBigInt;
  }

  return factorization;
}

const pow = (base, exponent) => {
  base = BigInt(base);
  exponent = BigInt(exponent);

  if (exponent < 0n) return;

  let result = 1n;

  while (exponent-- > 0n) result = result * base;

  return result;
}

// Converts prime factorization to BigInts
export const fromFactors = g => [...g.entries()].reduce((acc, [factor, exponent]) => acc * pow(factor, exponent), 1n);

// find the least factor in n by trial division
function leastFactor(composite) {

 // if (isNaN(n) || !isFinite(n)) return NaN;

 if (composite === 0n) return 0n;
 if (composite % 1n || composite*composite < 2n) return 1n;
 if (composite % 2n === 0n) return 2n;
 if (composite % 3n === 0n) return 3n;
 if (composite % 5n === 0n) return 5n;

 for (let i = 7n; (i * i) < composite; i += 30n) {
   if (composite % i         === 0n) return i;
   if (composite % (i +  4n) === 0n) return i + 4n;
   if (composite % (i +  6n) === 0n) return i + 6n;
   if (composite % (i + 10n) === 0n) return i + 10n;
   if (composite % (i + 12n) === 0n) return i + 12n;
   if (composite % (i + 16n) === 0n) return i + 16n;
   if (composite % (i + 22n) === 0n) return i + 22n;
   if (composite % (i + 24n) === 0n) return i + 24n;
 }

 // it is prime
 return composite;
}

function unsafeToNumber(big) {
  return parseInt(big.toString(), 10);
}
```

Have a go at it before peeking!

### the masterful minsky machine

This is the **Masterful** Minsky Machine. It has just one state, and it encodes its state and clauses with single natural numbers:

```javascript
const parse = (program) => program.trim().split(/,?\s+/).map(
  rule => rule.split('/').map(
    chars => parseInt(chars, 10)
  )
);

const interpret = (rules, state) => {
  run: while (true) {
    for (const [action, guard] of rules) {
      const factoredState = toFactors(state);

      // check guard clause
      const factoredGuard = toFactors(guard);
      if ([...factoredGuard.keys()].some(
        factor => factoredGuard.get(factor) > (factoredState.get(factor) || 0)
      )) continue;

      for (const [factor, guardValue] of factoredGuard.entries()) {
        const oldStateValue = factoredState.get(factor);

        factoredState.set(factor, oldStateValue - guardValue);
      }

      const actionGuard = toFactors(action);
      for (const [factor, actionValue] of actionGuard.entries()) {
        const oldStateValue = factoredState.get(factor) || 0;

        factoredState.set(factor, oldStateValue + actionValue);
      }

      state = fromFactors(factoredState);

      continue run;
    }
    break;
  }

  return state;
}

const evaluate = (program, initialState) => interpret(parse(program), initialState);
```

And of course, we can try it out:

```javascript
// the masterful adding machine
// 3²5³ => 1,125
// 2⁵ => 32
evaluate(
  '2/3, 2/5',
  1125
)
  //=> 32

// the masterful multiplication machine
// 3³5¹³ => 32,958,984,375
// 2³⁹ => 549,755,813,888
evaluate(
  '182/55, 17/11, 95/119, 1/17, 11/13, 17/19, 11/3, 1/5',
  32958984375n
)
  //=> 549755813888n
```

It works. And that's not all... Does this look familiar?

```javascript
// the masterful fibonacci machine
// 78 * 5⁽⁷⁻¹⁾ => 1,218,750
// 2¹³ => 8,192
evaluate(
  `17/65, 133/34, 17/19, 23/17, 2233/69, 23/29, 31/23,
   74/341, 31/37, 41/31, 129/287, 41/43, 13/41, 1/13, 1/3`,
  1218750
)
  //=> 8192n
```

Our Masterful Minsky Machine evaluates FRACTRAN programs, and it's not difficult to see why.

---

## On Equivalence

---

![Alan Turing](/assets/images/fractran/alan-turing.jpg)

*<a href="https://plato.stanford.edu/entries/turing/">Alan Matheson Turing</a>*

---

The word "equivalence" has a very specific meaning in computability. When we say that two computation machines are "computationally equivalent," we mean that they both share some set of properties we consider important with respect to computing, although they may differ wildly in other respects.

Computers that we program with programming languages are computation machines. If we one of them in the language Haskell, and program the other in the language Piet, we can say that they are both computationally equivalent, as there is nothing in principle that we can compute in Haskell that we can't compute with Piet.[^Piet]

[^Piet]: [Piet] is an esoteric programming language in which programs look like paintings in the  [neo-plasticism] style. Piet was invented by [David Morgan-Mar] and is named after geometric abstract art pioneer Piet Mondrian. There's an [excellent book](https://leanpub.com/piet) devoted to the practical use of the language.

[Piet]: https://esolangs.org/wiki/Piet
[neo-plasticism]: http://www.visual-arts-cork.com/history-of-art/neo-plasticism.htm
[David Morgan-Mar]: https://esolangs.org/wiki/David_Morgan-Mar

Even if "computational equivalence" doesn't care about how a computation is achieved, _how it does it_ matters in a different, deeper way. The languages [CoffeeScript] and JavaScript are equivalent in a deeper way than Haskell and Piet, because under the hood, "CoffeeScript is just JavaScript," as creator [Jeremy Ashkenas] says.

[CoffeeScript]: https://coffeescript.org/
[Jeremy Ashkenas]: http://ashkenas.com

With this in mind, let's ask ourselves: "Is a Marvellous Minsky Machine equivalent to a FRACTRAN machine in a superficial, computationally equivalent way? Or is there a deeper relationship? If we look under the hood, will we find that "FRACTRAN is just a Marvellous Minsky Machine"?"

### fractran and marvellous minsky machines

Examining the code superficially, FRACTRAN looks very different from the Marvellous Minsky Machine. The core of the FRACTRAN interpreter tests a remainder, then performs one multiplication and one division if the remainder is zero:

```javascript
for (const [numerator, denominator] of program) {
  if (n % denominator === 0n) {
    n = (n * numerator) / denominator;
    continue program_start;
  }
}
```

Whereas, the Marvellous Minsky Machine performs multiple comparisons of magnitude, then performs subtractions, and additions, wrapped in a lot of factorization faff:

```javascript
const factoredState = toFactors(state);

// check guard clause
const factoredGuard = toFactors(guard);
if ([...factoredGuard.keys()].some(
  factor => factoredGuard.get(factor) > (factoredState.get(factor) || 0)
)) continue;

for (const [factor, guardValue] of factoredGuard.entries()) {
  const oldStateValue = factoredState.get(factor);

  factoredState.set(factor, oldStateValue - guardValue);
}

const actionGuard = toFactors(action);
for (const [factor, actionValue] of actionGuard.entries()) {
  const oldStateValue = factoredState.get(factor) || 0;

  factoredState.set(factor, oldStateValue + actionValue);
}

state = fromFactors(factoredState);
```

Those of you familiar with number theory have already grasped that **these are both the same algorithm!**

If we divide 1,218,750 by 65 and have no remainder, it's because:

1. The prime factorization of 65 is 5¹13¹.
2. The prime factorization of 1,218,750 is 2¹3¹5⁶13¹.
3. Checking whether the remainder of 1,218,750 by 65 is zero is exactly the same thing as testing whether any of the prime factors of 65 have an exponent greater than the exponent of the same factor in 1,218,750.

Likewise, actually dividing 1,218,750 by 65 and getting a result of 18,750 is exactly the same thing as turning  2¹3¹5⁶13¹ into  2¹3¹5⁵13⁰, which is 18,750.That's just basic arithmetic.

If we look at how our code handles the action clauses, it's no different. Multiplying 18,750 by 17 is exactly the same thing as turning 2¹3¹5⁵ into 2¹3¹5⁵17¹, for the same reason: "Arithmetic."

Marvellous Minsky Machines are deeply related to FRACTRAN interpreters, because they **are** FRACTRAN interpreters. We're just doing a lot of things by hand that the `%`, `/`, and `*` operators do for us in JavaScript, or whatever language Conway used in 1972, had he bothered to write a computer implementation.

###  polygame

In 1979, Ludmila Gregušová and Ivan Korec published "Small Universal Minsky Machines" in The Proceedings of the 8th Symposium on Mathematical Foundations in Computer Science. In it, they describe *universal* Minsky Machines that can compute anything computable.[^summ]

[^summ]: Alas, [The Proceedings of the 8th Symposium on Mathematical Foundations in Computer Science](/assets/fractran/Mathematical-Foundations-of-Computer-Science-1979-Proceedings-8th-Symposium-Olomouc-Czechoslovakia-September-3-7-1979.pdf) is also behind the Spinger-Verlag rent-collecting gate.

In the paper, they present a universal machine, `U`, with 37 rules. It can simulate a Minsky Machine, just as a Universal Turing Machine can simulate any Turing Machine. A Universal Minsky Machine takes as its input a description of another Minsky Machine, plus input for that machine, and produces as its output what the described Minsky Machine would produce.

These machines are ingenious, and a lot of work goes into figuring out exactly how to encode the machine to be simulated so that it's amenable to being simulated. For example, Gregušová and Korec also give a 32-rule universal machine, but it requires an enormously larger encoding for the simulated machine than the 37-rule version.

Now, what do Universal Minsky Machines tell us about FRACTRAN?

Well, if:

1. A Magnificent Minsky Machine, U, can simulate any Magnificent Minsky Machine, and;
1. For every Magnificent Minsky Machine, there is an equivalent Marvellous Minsky Machine, and;
2. For every Marvellous Minsky Machine, there is an equivalent FRACTRAN program, therefore:
3. *For every Magnificent Minsky Machine, there is an equivalent FRACTRAN program*.

And thus:

1. Since there exists a Magnificent Minsky Machine, U, that can simulate any Magnificent Minsky Machine,
2. Therefore, there exists a FRACTRAN program, that can simulate any FRACTRAN program.

And here it is, John Horton Conway's POLYGAME:

---

![POLYGAME](/assets/images/fractran/polygame.png)

*An excerpt of Conway's paper on FRACTRAN, showing the POLYGAME program.*

---

There is a wonderful explanation of POLYGAME's workings in [Open Problems in Communication & Computation](/assets/fractran/open-problems-in-communication-and-computation-1987.pdf). Polygame can compute _any_ computable function, we just have to find the function's "catalogue number."  You'll want to read Conway's original description to grasp how that works.

But the thing to know about POLYGAME is that every recursively enumerable function _f_ has a catalogue number, _c_. And given `c * 2 ^ 2 ^ n`, POLYGAME will produce `2 ^ 2 ^ f(n)`.

POLYGAME is a Universal FRACTRAN Program.[^golf]

[^golf]: Others have written Universal FRACTRAN Programs. The “catalogue” approach has certain benefits from the perspective of proving things about FRACTRAN, but if we want to write a universal program that behaves more like an interpreter, we want a FRACTRAN program that interprets directly encoded FRACTRAN programs, rather than an index into a catalogue.<br/><br/>For example, Chris Lomont has written an 84-fraction [Universal FRACTRAN Interpreter in FRACTRAN]. Lomont’s solution doesn’t require a catalogue, we just directly encode a FRACTRAN program as input using a very approachable base-11 numbering scheme.<br/><br/>And as a final tribute to Conway, there’s a competition to find [the FRACTRAN interpreter with the fewest number of fractions][Code Golf].

[Universal FRACTRAN Interpreter in FRACTRAN]: http://lomont.org/posts/2017/fractran/
[Code Golf]: https://codegolf.stackexchange.com/questions/204779/final-tribute-to-john-conway-fractran-self-interpreter

## The Collatz Conjecture

---

[![Lothar Collatz](/assets/images/fractran/LotharCollatz.jpg)][Lothar Collatz]

*Lothar Collatz in mid-lecture.*

[Lothar Collatz]: https://en.wikipedia.org/wiki/Lothar_Collatz

---

[The Collatz conjecture] is a conjecture in mathematics that concerns a sequence defined as follows: Start with any positive integer *n*. Then each term is obtained from the previous term as follows: if the previous term is even, the next term is one half of the previous term. If the previous term is odd, the next term is 3 times the previous term plus 1. The conjecture is that no matter what value of n, the sequence will always reach 1.

The sequence of terms obtained in this manner is known as the Collatz sequence. The conjecture is named after [Lothar Collatz], who introduced the idea in 1937, two years after receiving his doctorate.

[The Collatz Conjecture]: https://en.wikipedia.org/wiki/Collatz_conjecture

Here's a FRACTRAN program to test the Collatz Conjecture for any _x_. We set _n_ to be 2ˣ, and then every subsequent value of _n_ of the form 2ʸ is the next term of the Collatz sequence.

```
165/14, 11/63, 38/21, 13/7, 34/325, 1/13,
184/95, 1/19, 7/11, 13/17, 19/23, 1575/4
```

It halts when it reaches 2¹, corresponding to the original Collatz sequence reaching 1. If you can find a number _Z_ that disproves the Collatz conjecture, this program will run forever when given 2ᶻ.

If you want to run it, the existing FRACTRAN interpreter given above will work, albeit it won't give any clue as to what is happening. As an exercise, you might want to try rewriting our FRACTRAN interpreter to output the machine's state after every pass over the program.

If you're really ambitious, you'll rewrite the interpreter as a [generator]. That will allow you to output the Collatz sequence. Here's a sample implementation:

[generator]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators

```javascript
function * interpret (program, n) {
  program_start: while (true) {
    yield n;
    for (const [numerator, denominator] of program) {
      if (n % denominator === 0n) {
        n = (n * numerator) / denominator;
        continue program_start;
      }
    }
    break;
  }
}

const parse = program => program
  .trim().split(/(?:\s*,|\s)\s*/)
  .map(f => f.split('/').map(n => BigInt(n)));

const collatz =
  '165/14, 11/63, 38/21, 13/7, 34/325, 1/13, ' +
  '184/95, 1/19, 7/11, 13/17, 19/23, 1575/4';

function test (x) {
  const n = pow(2n, x);

  for (const nn of interpret(parse(collatz), n)) {
    if (log2(nn) != undefined)  console.log(log2(nn).toString());
  }
}

test(3)
  //=>
    3
    10
    5
    16
    8
    4
    2
    1
```

Interesting. And?

### why fractran really matters

---

[![Collatz 5n+1 simulator](/assets/images/fractran/Collatz5nplus1simulator.png)][c5nplus1]

*The [Collatz 5n+1 simulator][c5nplus1] is an unknown fate pattern constructed by David Bell in December 2017 that simulates the Collatz 5n+1 algorithm using sliding block memory and p1 technology, while always having a population below 32000.*[^collatz-life]

[c5nplus1]: https://www.conwaylife.com/wiki/Collatz_5n%2B1_simulator

[^collatz-life]: Conway became very tired of all the attention his Game of Life garnered, but its appeal seem to be evergreen. For those still fascinated by the Game of Life, this 5n+1 simulator connects Conway’s Game of Life with his work on the Collatz conjecture.

---

In [On Unsettleable Arithmetical Problems], Conway described the specific Collatz function `n/2 | 3n + 1` as a _bipartite linear function_. He then generalized the idea to _k-partite linear functions_, with _k_ linear possibilities.

[On Unsettleable Arithmetical Problems]: /assets/fractran/Conway-On-Unsettleable-Arithmetical-Problems.pdf

A Collatz function is a k-partite linear function where each possibility is defined as `(a * n / b) + c`, and the value of the entire function is the first linear possibility with an integral result.

Next, Conway described the _Collatz Game_, which takes a Collatz function, a starting value of _n_, and a _target value_. For the Collatz conjecture, the Collatz function is `n/2 | 3n + 1` and the target value is 1.

The Collatz game consists of generating the Collatz sequence for _n_, and stopping when when its next term is the target value, when its next term is undefined, or when the sequence enters a loop.

We say that a Collatz game is _decidable_ if we can create an algorithm for determining whether that game reaches the target value for all starting values of _n_. Lots of Collatz games are decidable. For example, the game `n/2 | n + 1` is decidable.

Where does FRACTRAN come in?

Every FRACTRAN program is a k-partite Collatz function where the value of _c_ for every possibility is 0. Thus, every FRACTRAN program is both a Collatz function and the basis of a Collatz game. We will call the set of all Collatz games that are also FRACTRAN programs, _FRACTRAN games_.

[Rice’s Theorem] states that all non-trivial, semantic properties of programs are undecidable. That includes whether the program enters a particular state. For a FRACTRAN program, its state is encoded in _n_, so it is undecidable whether FRACTRAN programs ever generate a particular target value of _n_.

[Rice’s Theorem]: https://en.wikipedia.org/wiki/Rice%27s_theorem

And it follows that _FRACTRAN games_ are undecidable. This doesn’t speak directly to the Collatz conjecture, because `(1/2)n | 3n + 1` is not a FRACTRAN game. But it does follow that _arbitrary_ Collatz games are undecidable, since the set of all Collatz games includes the set of all FRACTRAN games.

Conway went on to do much more work on the subject of Collatz functions and Collatz games, including addressing Collatz functions like `(1/2)n | 3n + 1` through the medium of POLYGAME. Others have taken these ideas further. Stuart A. Kurtz and Janos Simon built upon Conways’ work with FRACTRAN in [The Undecidability of the Generalized Collatz Problem][undecidable].

[undecidable]: /assets/fractran/undecidability-generalized-collatz-problem.pdf “The Undecidability of the Generalized Collatz Problem”

FRACTRAN, then, is more than just a ridiculous way to represent register machines: Its correspondence to Collatz functions and its universality make a direct contribution to our understanding of Collatz functions, and may help us one day determine whether the Collatz Conjecture is provably true, or undecidable.

_THE END_


(discuss on [/r/math](https://www.reddit.com/r/math/comments/gi9x0k/remembering_john_conways_fractran_a_ridiculous/), [/r/programminglanguages](https://www.reddit.com/r/ProgrammingLanguages/comments/ghpek3/remembering_john_conways_fractran_a_ridiculous/), and [hacker hews](https://news.ycombinator.com/item?id=23142232))

---

## Addenda

---

[![John Horton Conway © 2005 Thane Plambeck](/assets/images/fractran/jhc.jpg)](https://www.flickr.com/photos/thane/20366806)

*John Horton Conway © 2005 Thane Plambeck*

---

### conway's "fractran: a ridiculous logical language" lecture

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/548BH-YFT1E" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<br/>

### norman wildberger's lecture on the collatz conjecture

<br/>

<iframe width="560" height="315" src="https://www.youtube.com/embed/K0yMyUn--0s" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<br/>

### vikram ramanathan on fractran

[Vikram Ramanathan] has written [a nice, compact essay][ramanathan-fractran] about their experience developing a FRACTRAN interpreter and how to approach FRACTRAN programming.

[Vikram Ramanathan]: https://vikramramanathan.com
[ramanathan-fractran]: /assets/fractran/ramanathan.pdf

---

### notes