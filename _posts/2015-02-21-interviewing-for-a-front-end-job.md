---
layout: default
title: "Interviewing for a JavaScript Job"
tags: [allonge]
---

"The Carpenter" is a JavaScript programmer, well-known for a meticulous attention to detail and love for hand-crafted, exquisitly joined code. The Carpenter often preferred to work on contract, with clear deliverables and little or no need to sit through reshuffles and reorganizations as the tides of investment and management fashion came in and out in the ocean of tech.

The Carpenter normally worked through personal referrals, but from time to time a recruiter would slip through his screen. One such recruiter was Bob Plissken. Plissken lined The Carpenter up with a technical interview with a well-funded startup that made mobile chat software for delivery and logistics companies.

The Carpenter arrived early for the "Thing Software" interview, and was shown to a small conference room, where he was joined by Christine, one of the company's developers.

### the problem

After some small talk, Christine explained that they liked to ask candidates to whiteboard some code. Despite his experience and industry longevity, the Carpenter did not mind being asked to demonstrate that he was, in fact, the person described on the resumé. Many companies use whiteboarding code as an excuse to have a technical conversation with a candidate, and The Carpeneter felt that being asked to whiteboard code was an excuse to have a techncial conversation with a future colleague. "Win, win" he thoght to himself.

[![Chessboard](/assets/images/chessboard.jpg)](https://www.flickr.com/photos/stigrudeholm/6710684795)

Christine intoned the question, as if by rote. Which it was, by the time they'd reached The Carpenter:

> Consider a finite checkerboard. On each square we randomly place an arrow pointing to one of its four sides. A chequer is placed randomly on the checkerboard. Each move consists of moving the chequer one square in the direction of the arrow in the square it occupies. If the arrow should cause the chequer to move off the edge of the board, the game halts.

> The problem is this: The game board is hidden from us. A player moves the chequer, following the rules. As the player moves the chequer, they calls out the direction of movement, e.g. "↑, E, ↑, S, ↑, E..." Write an algorithm that will determine whether the game halts, strictly from the called out directions, in finite time and space.

"So," The Carpenter asked, "I am to write an algorithm that takes a possibly infinite stream of..."

Christine interrupted. "To save time, we have written a template of the solution for you. Fill in the blank." Christine quickly scribbled on the whiteboard:

{% highlight javascript %}
const Game = (size =  Math.floor(Math.random() * 8) + 8) => {
  
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
  
  // ???
  let [x, y] = initialPosition;
  
  const MOVE = {
    "←": ([x, y]) => [x - 1, y],
    "→": ([x, y]) => [x + 1, y],
    "↓": ([x, y]) => [x, y - 1],
    "↑": ([x, y]) => [x, y + 1] 
  };
  while (x >= 0 && y >=0 && x < size && y < size) {
    const arrow = board[x][y];
    
    // ???
    
    [x, y] = MOVE[arrow]([x, y]);
  }
  // ???
};
{% endhighlight %}

"What," Christine asked, "Do you write in place of the three `// ???` placeholders to determine whether the game halts?"

### the carpenter's solution

The Carpenter was not suprised at the problem. Bob Plissken was a crafty, almost reptilian recruiter that traded in information and secrets. Whenever Bob sent a candidate to a job interview, he debriefed them afterwards and got them to disclose what questions were asked in the interview. He then coached subsequent candidadtes to give polished answers to the company's pet technical questions.

Bob had, in fact, warned The Carpenter that "Thing" liked to ask either or both of two questions: Determine how to detect a loop in a linked list, and determine whether the chequerboard game would halt. To save time, The Carpenter had preapred the same answer for both questions.

"Using [babeljs.io](http://babeljs.io), I'll write this in ECMASCript 2015 notation. To begin with, I'll transform a game into an iterable that generates arrows:"

{% highlight javascript %}
const Game = (size =  Math.floor(Math.random() * 8) + 8) => {
  
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
{% endhighlight %}

"Now that we have an iterable, we can transform the iterable of arrows into an iterable of positions." The Carpeneter sketched quickly. "We'll need some common untilities. You'll find equivalents in a number of JavaScript libraries, but I'll quote those given in [JavaScript Allongé](https://leanpub.com/javascriptallongesix):"

"For starters, `takeIterable` transforms an iterable into one that yields at most a fixed number of elements. It's handy for debugging. We'll use it to check that our `Game` is working as an iterable:"

{% highlight javascript %}
const takeIterable = (numberToTake, iterable) =>
  ({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      let remainingElements = numberToTake;
    
      return {
        next: () => {
          let {done, value} = iterator.next();
        
          done = done || remainingElements-- <= 0;
  
          return ({done, value: done ? undefined : value});
        }
      }
    }
  });

Array.from(takeIterable(10, Game(8)))
  //=> ["↑","←","→","←","→","←","→","←","→","←"]
{% endhighlight %}

But now to the business. We want to take the arrows and convert them to positions. For that, we'll map the Game iterable statefull to positions. a `statefulMap` is a lazy map that preserves state from iteration to iteration:

{% highlight javascript %}
const statefulMapIterableWith = (fn, seed, iterable) =>
  ({
    [Symbol.iterator]: () => {
      const iterator = iterable[Symbol.iterator]();
      let state = seed;
      
      return {
        next: () => {
          let {done, value} = iterator.next();
          
          if (done) {
            return {done}
          }
          else {
            [state, value] = fn(state, value);
            return {value}
          }
        }
      }
    }
  });
  
const indexed = statefulMapIterableWith(
  (index, value) => {
    return [index + 1, [index, value]]
  },
  0,
  ["correct", "horse", "battery", "staple"])

Array.from(indexed)
  //=> [[0,"correct"],[1,"horse"],[2,"battery"],[3,"staple"]]
{% endhighlight %}

Armed with this, it's straightforward to map an iterable of directions to an iterable of strings representing positions:

{% highlight javascript %}
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

Array.from(takeIterable(10, positionsOf(Game(4))))
  //=> ["x: -1, y: 0","x: 0, y: 1","x: -1, y: 0",
        "x: 0, y: -1","x: 0, y: 1","x: 0, y: -1",
        "x: 0, y: 1","x: 0, y: -1","x: 0, y: 1",
        "x: 0, y: -1"]
{% endhighlight %}

The Carpenter reflected. "Having turned our game loop into an iterable, we can now see that our problem of whether the game terminates is isomorphic to the problem of detecting whether the positions given ever repeat themselves: If the chequer ever returns to a position it has previously visited, it will cycle endlessly."

"We could draw positions as nodes in a graph, connected by arcs representing the arrows. Detecting whether the game terminates is equivalent to detecting whether the graph contains a cycle."

![Cycle Dection](/assets/images/cycle.png)

"There's an old joke that a mathematician is someone who will take a five-minute problem, then spend an hour proving it is equivalent to another problem they have already solved. I approached this question in that spirit. Now that we have created an iterable of values that can be compared with `===`, I can show you this function:"

{% highlight javascript %}
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
{% endhighlight %}

"A long time ago," The Carpenter explained, "Someone asked me a question in an interview. I have never forgotten the question, or the general form of the solution. The question was, *Given a linked list, detect whether it contains a cycle. Use constant space.*"

"This is, of course, the most common solution, it is [Floyd's cycle-finding algorithm](https://en.wikipedia.org/wiki/Cycle_detection#Tortoise_and_hare), although there is some academic dispute as to whether Robert Floyd actually discovered it or was misattributed by Knuth."

"Thus, the solution to the game problem is:"

{% highlight javascript %}
  const terminates = (game) =>
    tortoiseAndHare(positionsOf(game))
{% endhighlight %}

### the aftermath

The Carpenter sat down and waited. This type of solution provided an excellent opportunity to explore lazy versus eager evaluation, the performance of iterators versus native iteration, single responsibility design, and many other rich topics. The Carpenter was sure that although nobdy would write this exact code in production, prospective employers would also recognize that nobody would try to detect whether a chequer game terminates in production, either. It's all just a game designed to start an interesting conversation, right?

Chritine looked at the solution on the board, frowned, and glanced at their watch.

"Well," Christine said politely, "We at Thing are very grateful you made some time to visit with us, but alas, that is all the time we have today. If we wish to talk to you further, we'll be in touch."

The Carpenter never did hear back from them, but the next day there was an email containing a generous contract from Friends of Ghosts ("FOG"), a codename for a stealth startup doing interesting work, and the Thing interview was forgotten.

Some time later, The Carpenter ran into Bob Plissken at a local technology meetup. "What happened at Thing?" Bob wanted to know, "I asked them what they thought of you, and all they would say was, *writes unreadble code*."

The Carpenter smiled. "I forgot about them. So... They live?"