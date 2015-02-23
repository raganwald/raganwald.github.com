---
layout: default
title: "(unlikely to be) The Last Word on Interviewing for a JavaScript Job"
tags: [allonge]
---

These are my comments on [Interviewing for a JavaScript Job](http://raganwald.com/2015/02/21/interviewing-for-a-front-end-job.html). The story concerns a job interview, where the interviewer ("Christine") asks the candidate (known as "The Carpenter") to whiteboard JavaScript code solving this problem:

> Consider a finite checkerboard of unknown size. On each square, we randomly place an arrow pointing to one of its four sides. A chequer is placed randomly on the checkerboard. Each move consists of moving the chequer one square in the direction of the arrow in the square it occupies. If the arrow should cause the chequer to move off the edge of the board, the game halts.

> The problem is this: The game board is hidden from us. A player moves the chequer, following the rules. As the player moves the chequer, they calls out the direction of movement, e.g. “↑, →, ↑, ↓, ↑, →…” Write an algorithm that will determine whether the game halts, strictly from the called out directions, in finite time and space.

Meanwhile, the Carpenter had been coached by a headhunter ("Bob Plissken") that the company likes to ask this question and about detecting cycles in a graph. The Carpenter tries to convert the problem into a graph problem, but Christine fails him out of the interview without even giving him a chance to test and polish his first draft.

Let's start with the technical bits, because that's what many commenters fixate upon.

### flaws in the solution given

Now, the Carpenter's solution is not correct, not even close. This is partly deliberate, partly accidental. When I wrote the problem, I deliberately inserted a rather obvious flaw. Here's his complete solution:

{% highlight javascript %}
const Game = (size = 8) => {
  
  // initialize the board
  const board = [];
  for (let i = 0; i < size; ++i) {
    board[i] = [];
    for (let j = 0; j < size; ++j) {
      board[i][j] = '←→↓↑'[Math.floor(Math.random() * 4)];
    }
  }
  
  // initialize the position
  let initialPosition = [
    2 + Math.floor(Math.random() * (size - 4)), 
    2 + Math.floor(Math.random() * (size - 4))
  ];
  
  return ({
    [Symbol.iterator]: function* () {
      let [x, y] = initialPosition;
  
      const MOVE = {
        "←": ([x, y]) => [x - 1, y],
        "→": ([x, y]) => [x + 1, y],
        "↓": ([x, y]) => [x, y - 1],
        "↑": ([x, y]) => [x, y + 1] 
      };
      
      while (x >= 0 && y >=0 && x < size && y < size) {
        const arrow = board[x][y];
        
        yield arrow;
        [x, y] = MOVE[arrow]([x, y]);
      }
    }
  });
};

const statefulMapIterableWith = (fn, seed, iterable) =>
  ({
    [Symbol.iterator]: function* () {
      let value,
          state = seed;
      
      for (let element of iterable) {
        [state, value] = fn(state, element);
        yield value;
      }
    }
  });

const positionsOf = (game) =>
  statefulMapIterableWith(
    (position, direction) => {
      const MOVE = {
        "←": ([x, y]) => [x - 1, y],
        "→": ([x, y]) => [x + 1, y],
        "↓": ([x, y]) => [x, y - 1],
        "↑": ([x, y]) => [x, y + 1] 
      };
      const [x, y] =  MOVE[direction](position);
      
      return [position, `x: ${x}, y: ${y}`];
    },
    [0, 0],
    game);

const tortoiseAndHare = (iterable) => {
  const hare = iterable[Symbol.iterator]();
  let hareResult = (hare.next(), hare.next());
  
  for (let tortoiseValue of iterable) {
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
  }
  return false;
};

const terminates = (game) =>
  tortoiseAndHare(positionsOf(game))
{% endhighlight %}

The obvious flaw is that `tortoiseAndHare` reports `true` when there is a cycle, while the function `terminates` implies that `true` would mean the game's moves have no cycle. IMO, this is an error best solved with naming. The correct function would be:

{% highlight javascript %}
const containsCycle = (iterable) => {
  const hare = iterable[Symbol.iterator]();
  let hareResult = (hare.next(), hare.next());
  
  for (let tortoiseValue of iterable) {
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
  }
  return false;
};

const terminates = (game) =>
  !containsCycle(positionsOf(game))
{% endhighlight %}

Now, there is another "flaw" that I deliberately inserted, namely that the Carpenter treats the game as an ordered collection, but the verbal description of the problem presents the directions as a *stream*. Meaning, you should not be able to create two independent iterators over the elements.

There is at least one more flaw in the code as presented in the post, but I can say outright that *all other flaws are my fault as an imperfect author*, not the fictitious Carpenter's fault. FWIW, here is how I could clean up the Carpenter's solution, with a little refactoring to make it easier to test:

{% highlight javascript %}
const MOVE = {
  "←": ([x, y]) => [x - 1, y],
  "→": ([x, y]) => [x + 1, y],
  "↓": ([x, y]) => [x, y + 1],
  "↑": ([x, y]) => [x, y - 1] 
};

const Board = (size = 8) => {
  
  // initialize the board
  const board = [];
  for (let i = 0; i < size; ++i) {
    board[i] = [];
    for (let j = 0; j < size; ++j) {
      board[i][j] = '←→↓↑'[Math.floor(Math.random() * 4)];
    }
  }
  
  // initialize the position
  const position = [
    Math.floor(Math.random() * size), 
    Math.floor(Math.random() * size)
  ];
  
  return {board, position};
};

const Game = ({board, position}) => {
  
  const size = board[0].length;
  
  return ({
    [Symbol.iterator]: function* () {
      let [x, y] = position;
      
      while (x >= 0 && y >=0 && x < size && y < size) {
        const direction = board[y][x];
        
        yield direction;
        [x, y] = MOVE[direction]([x, y]);
      }
    }
  });
};

const statefulMapIterableWith = (fn, seed, iterable) =>
  ({
    [Symbol.iterator]: function* () {
      let value,
          state = seed;
      
      for (let element of iterable) {
        [state, value] = fn(state, element);
        yield value;
      }
    }
  });

const positionsOf = (game) =>
  statefulMapIterableWith(
    (position, direction) => {
      const [x, y] =  MOVE[direction](position);
      position = [x, y];
      return [position, `x: ${x}, y: ${y}`];
    },
    [0, 0],
    game);

const hasCycle = (orderedCollection) => {
  const hare = orderedCollection[Symbol.iterator]();
  let hareResult = (hare.next(), hare.next());
  
  for (let tortoiseValue of orderedCollection) {
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
    
    hareResult = hare.next();
    
    if (hareResult.done) {
      return false;
    }
    if (tortoiseValue === hareResult.value) {
      return true;
    }
  }
  return false;
};

const terminates = (game) =>
  !hasCycle(positionsOf(game))
  
const test = [
  ["↓","←","↑","→"],
  ["↓","→","↓","↓"],
  ["↓","→","→","←"],
  ["↑","→","←","↑"]
];

terminates(Game({board: test, position: [0, 0]}))
  //=> false
terminates(Game({board: test, position: [3, 0]}))
  //=> true
terminates(Game({board: test, position: [0, 3]}))
  //=> false
terminates(Game({board: test, position: [3, 3]}))
  //=> false
{% endhighlight %}

Some people would say that there were errors precisely because it's a longer bit of code, and that is correct. But I wouldn't judge that in a vacuum. OOP code is often more convoluted than simple procedural code. Is it unnecessary `AbstractFacadefactoryArchitectureAstronatics`? Or is it separating concerns in a way that makes the code easier to understand and maintain? Sometimes you have to have a conversation to decide.

### ordered collections and streams

As given in the description, the list of moves are a stream, not an ordered collection. Therefore, this solution sort-of works given the template code, but does not work given the requirements. [Udik](https://news.ycombinator.com/user?id=Udik) on Hacker News was the first person to point this out.

To reiterate:

> The game board is hidden from us. A player moves the chequer, following the rules. As the player moves the chequer, they calls out the direction of movement, e.g. “↑, →, ↑, ↓, ↑, →…” Write an algorithm that will determine whether the game halts, **strictly from the called out directions**, in **finite** time and space.

I was trying to give the impression that the Carpenter was unnecessarily force-fitting the constant-space cycle detection algorithm to the chequerboard game. In the story, he tried to joke about that:

> There’s an old joke that a mathematician is someone who will take a five-minute problem, then spend an hour proving it is equivalent to another problem they have already solved. I approached this question in that spirit.

Many people commented that he was trying to be a show-off, but I'd like to point out that Plissken did tell him that the company liked to ask about cycle detection, so the Carpenter was simply trying to show Christine something he thought she wanted to see. And he was trying to imply that he could approach the problem in several different ways, but he chose to approach it in this way.

The simplest solution to the problem as given is to keep a set of positions that have already been visited. That takes finite space, and can be written either entirely within the original template, or can be bolted onto the iteratable answer:

{% highlight javascript %}
const repeatsItself = (orderedCollection) => {
  const visited = new Set();
  
  for (let element of orderedCollection) {
    if (visited.has(element)) {
      return true;
    }
    visited.add(element);
  }
  return false;
};

const terminates = (game) =>
  !repeatsItself(positionsOf(game))
{% endhighlight %}

This is the answer Christine was looking for. A brilliant answer that takes constant space was suggested by [alisey](https://news.ycombinator.com/user?id=alisey) on Hacker News: Track the rectangle representing the maximum distance travelled from the start. If the number of steps exceeds the height times width, you are cycling.

### thoughts on interviews

Now that we have gotten the technical aspects out of the way, here are my candid thoughts.

First, I intended for all three participants to be selfish actors, each trying to play the game by themselves.

- Bob is trying to jam the Carpenter into the job, and coaches him what to expect even though the Carpenter is an experienced programmer.
- Christine has a preconceived answer in mind and presents what I think is a very poor template for the solution to fill in. It even has information (like the size of the game board) that the solution is not supposed to take advantage of.
- And the Carpenter is sincerely trying to tell them what he thinks they want to hear, without asking Christine if that is indeed what she wants him to do.

Leaving the recruiter out, an interview is actually supposed to be a coöperative game. Both Christine and the Carpenter lose if Thing would have been a better fit than FOG, and if the Carpenter would have been a better colleague than whomever Thing eventually hired.

As I wrote the story, neither Christine nor the Carpenter really talked to each other. Christine had her pet problem, and in her head, a kind of script for what she would ask the Carpenter once he wrote some obvious bits of code. She was nonplussed when he went "off-script," and that's *really* why she failed him. Meanwhile, the Carpenter had arrived with a solution in his head that would make him (in his mind) stand out from other applicants.

Christine could have and should have made it clear up front whether she just wanted him to FizzBuzz, i.e. to prove he can code anything in JavaScript. And once she realized he was going off into architectural abstractions (what some call "achieving escape velocity"), she could have and should have interrupted him and been more explicit about what she wanted him to demonstrate.

It is also clearly the Carpenter's responsibility to ask Christine what she wants to see in a solution. He was trying to stand out from other applicants, and use what Plissken had told him to do better than expected. But he still could have and should have discussed this with Christine. It would have taken five seconds to say, "Well we could solve this with a Set, but it's isomorphic to a problem of finding cycles in a graph, would you like me to solve it that way?"

### the problem with programming problems

Quite frankly, whiteboard problems in interviews are minefields. When asked a programming question, an interviewer might want to see any of the following mutually exclusive things:

1. Demonstrate that you can put together any old basic thing ("FizBuzzing").
2. Demonstrate that you understand algorithm fundamentals like space and time requirements, mutability, state, and so forth.
3. Demonstrate the kind of code you'd write in production for colleagues to understand and maintain.
4. Demonstrate that you are current and familiar with the latest developments in your toolset, regardless of whether you are employing them in production.

You really can't answer all of these in one code snippet. If the interviewer is just trying to quickly weed out the bullshitters, they don't want you to factor the code and write tests for each piece. But if they want to see how you write code for production, they do. If they want to know that you're keeping up to date, they might want to see you demonstrate your knowledge of some new language features.

And, if they want to see how you solve a day-to-day problem, they don't want to see the solution use ES-6 transpilation or [Mori](http://swannodette.github.io/mori/) persistent data structures. Unless they use those, in which case they do want to see them.

How do you know what to write?

The answer is, they have to tell you, or you have to ask. It is 100% grade-A bullshit for a candidate to write some code and then "fail" them because they tried to address one of those four objectives but the interviewer was trying to satisfy a different objective.

You might as well come right out and say, "We're looking for people who think the way we do, without being told what we're thinking." That is a so-called "cultural fit" test, but what it's really testing is whether they have read the same blog posts and HN discussions about how to interpret the results.

### snap judgments

It's fairly easy to say, "No hire, because X," or, "I wouldn't want to work at Thing, because Y." But really, we have almost no information to go on. In a detective story, we start with very little information, and we decide who the suspect is, and then we gather further information to confirm or refute our hypothesis. Did I say "in a detective story?" I meant to say, *in science*.

In an actual interview, we do not need to get up and walk out if asked to find out whether some hypothetical "game" terminates, not do we need to sit and say nothing while a candidate writes out a long "solution." We can ask questions. We can form a hypothesis, sure, but then we can confirm or refute it by asking questions.

Likewise, if our hypothesis is that the Carpenter is unable to write clear code, we don't need to say "Fail," we can simply ask: "How would you write this if you knew that it would be maintained by interns we pick up from the local university's CS program?" Does he rewrite it? Or does he argue with us about how it's the intern's fault if they don't know how the semantics of an EXCMASCript 2015 iterable?

Likewise, we can be charitable about Christine. Unless she is a full-time professional technical interviewer, she probably spends twenty hours programming for every one hour interviewing. If for whatever reason she seems to be clumsy or ask poor questions, why should we make assumptions about what she would be like as a fellow programming colleague?

And she is only one person in a company. Why should we make assumptions about the entire company based on one interaction with one person? We can and should answer her question, and make sure to ask some questions of our own about the kind of programming Thing does, the culture it has, and so forth. It is not necessary to make sweeping generalizations based on almost no information.

### what are we testing?

As I noted, Christine is unlikely to be very good at the job of interviewing, because she doesn't interview people for a living. And for all his experience, the Carpenter doesn't interview for a living. This dynamic is the rule, not the exception. *Most technical interviews are conducted by people who are inexperienced with technical interviews*.

Therefore, I counsel being charitable: Assume that most people are good at their primary job, and happen to be less than amazing at this part-time necessity of interviewing or being interviewed.

The alternative is to hire people who have a lot of experience going on interviews. And that could be a sign they spend a lot of time being unemployed. Likewise, companies that are amazing at interviewing people might have to hire a lot of people because good people leave.

This last bit is obvious if you have spent any amount of time dating people you meet through a dating service or in nightclubs. The people who are "good at dating" are good at dating because they spend a lot of time dating instead of being in a relationship. Being good at dating doesn't say anything about whether someone is good at being in a relationship.

### the anti-patterns

The first anti-pattern in interviews is go go in with the objective of weeding out losers (whether we mean loser candidates or loser companies). As we all know, if you show me a metric, I'll show you a game. If the objective is to take ten interviews and "weed out" nine losers, the most efficient way to play that game is to look for *false negatives*.

For example, the Carpenter got the `terminates` function wrong. I deliberately put that in. Everyone I know gets things like this backwards from time to time. But we you fail him outright for that, rather than asking, "Do you want to write some test cases," we are playing a game on our own. If the metric was really, "Make sure no good person escapes without an offer," then we would want to make sure that this wasn't a simple transcription error, or the result of interview pressure.

That goes for rejecting a company because you don't like one question they ask as well.

The second anti-pattern is more insidious. This is when we form a subjective opinion about someone, then look for an objective way to validate our hunch. So, we decide that the Carpenter's solution is unnecessarily complicated. I happen to think that is the case for what Christine wanted, and I wrote the story. So you know we're right about this.

But, if we then get a hunch that the Carpenter will always write complicated code, we're now guessing. And if we think he'll be a terrible programmer because of this, well, that is unfounded. But whatever, we have a hunch, nothing wrong with trying to confirm it. But what we sometimes do is go in with a swinging axe. We look over this code we don't like... Hmmm... What about this... AHA!

- uses `arrow` in one place and `direction` in another: Sloppy naming.
- repeats `MOVE`: Doesn't understand DRY.
- excessive use of language features that interns may not know.
- solution is not perfectly in accordance with stated requirement: FAIL. FAIL. FAIL.
- gets `terminate` wrong: FAIL. FAIL. FAIL.

All of these observations are valid, but if we're just gathering evidence to support our hypothesis, we're not reasoning correctly. I am not making this kind of stuff up, industry spends a lot of money (and a lot of time in courtrooms) going over these things, and people can be insanely biased.

If we get a good immediate impression of someone, we hand-wave their faults. We say, "Well, it's a live whiteboard test, it demonstrates the basic competency, we can sit down and debug together, that will be an excellent exercise to understand how they think."

Whereas if we dislike them, we take one look and then look at the clock, thank them, and end the interview.  If we like them, and they seem to be going down the wrong track, we coach them. If we dislike them, we check our email on our phone while they write a solution to the wrong problem.

This is very, very bad behaviour. It's exactly what leads to certain cultural problems with respect to gender and race disparities. And it's easy to do subconsciously. I can't tell you what your company should do about it, but I know that on a personal level, it begins with noticing that we have this tendency to form a bias, and trying to be hyper-vigilant about it.

### summary

It's just a story, no big deal. But FWIW, I tried to make this about three reasonable humans, none of them awesome or particularly flawed. Each was trying, more-or-less, to do the right thing by themselves, but not trying very hard to really work with the other participants to ensure that the very best interview took place.

---

[reddit](http://www.reddit.com/r/javascript/comments/2wwdi7/unlikely_to_be_the_last_word_on_interviewing_for/) | [edit this page](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2015-02-23-the-last-word-on-interviewing.md)
