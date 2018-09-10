---
title: "Functions All The Way Down"
tags: [allonge,recursion,noindex]
---

[Functions all the way down] is a book about **recursion**, a book about **recreational programming**, and a book about **JavaScript**, in that order.

[Functions all the way down]: https://leanpub.com/js-del-vuoto

**Recursion** has an unusual place in the programming world. From a Computer Science perspective, it is one of the most important topics we study. Recursion makes it possible for simple systems like the Lambda Calculus and Combinatorial Logic to perform arbitrarily complex computations. Some problem domains include data that is inherently self similar, and recursive functions are the most natural way to work with these kinds of problems. Self-documenting or declarative programs are highly esteemed in programming, and recursive functions often mirror the definition of the problem in an elegant way.

Given all of that, why do so many people admit that they don't "grok" recursion? Why would most programmers reach for iteration first, and only fall back on recursion if there's no alternative? If it's such a foundational idea, why isn't it more popular?

On the flip side of that, why do some people grasp recursion, and then fall head-over-heels in love with it? What is so seductive about it that blog post after blog post is written about the mysteries of the Y Combinator? Why does anybody care whether JavaScript does or does not include Tail-Call Optimization as part of the standard?

Recursion seems to be a subject that inspires strong feelings, whether of attraction or revulsion. Why is that?

### dopamine and recursion

[Dopamine] is an organic chemical that functions as a neurotransmitter—a chemical released by neurons (nerve cells) to send signals to other nerve cells. The brain includes several distinct dopamine pathways, one of which plays a major role in the motivational component of reward-motivated behaviour. The anticipation of most types of rewards increases the level of dopamine in the brain.

[Dopamine]: https://en.wikipedia.org/wiki/Dopamine

Dopamine plays a major role in the feeling we get when we figure something out. There is some research to suggest that how surprised we are by a good thing influences the dopamine "hit" we experience. This isn't a universal thing, and not everybody experiences the same degree of surprise, or the same feeling of "Oh, I really get it!"

So naturally, some people might read about Recursion, "click," and get an immediate rush from figuring it out. The fact that they had to figure it out is what drives the dopamine rush. If it was "obvious," there would be no reward for figuring it out. And furthermore, not all things that we figure out turn out to be surprising.

But certain topics seem to require figuring it out, and they have just the right degree of "I didn't expect that!" to provide a powerful dopamine rush to certain people.

I believe the above speculative and wholly uninformed conjecture explains the way people react to recursion.

* Some people have trouble figuring it out. Maybe they learn enough to use it when absolutely necessary, but that's it. They get no dopamine reward.
* Some people figure it out, but it does not seem surprising to them. Maybe they haven't grasped all the implications, maybe they are incurious, or maybe they were able to anticipate all of its implications. They get no dopamine reward.
* But there's a third group of people. These people figure recursion out, but more importantly, when they figure it out, they are being constantly surprised. and the more they learn about recursion, the more they are surprised.

This third group explains the enduring popularity of [Gödel, Escher, Bach]. Having been exposed to a series of surprising revelations through the book, they spend the rest of their lives associating recursion and functions with the euphoria of figuring something out.

[Gödel, Escher, Bach]: https://en.wikipedia.org/wiki/Gödel,_Escher,_Bach

And recursion is one of those gifts that keep on giving. You can get into Combinatory Logic, sage birds, and [To Mock a Mockingbird]. You can dive deeply into implementing recursion with trampolines, or Continuation-Passing Style, or automatic rewriting in imperative form.

And with every new discovery, every new conjuring trick you pull with recursion, you get another hit. You start studying recursion for its own sake. You try refactoring recursion to use recursive combinators. You get into corecursive generators. You...

But I digress.

The point is, for some people, recursion in *fun*. It's rewarding in its own right. And the best way to feast on that reward is to start simple, grasp things as you go at your own pace, and more discover progressively more interesting and surprising implications the deeper your study takes you.

### functions all the way down

And this this book. [Functions all the way down] is a book about recursion. And it is unabashedly about recreational programming, programming for _fun_. It is written for fun, it is meant to be read for fun. The title comes from the expression "rocks all the way down," or alternately, "[turtles all the way down]." In both cases, referring to infinite regress.

[turtles all the way down]: https://en.wikipedia.org/wiki/Turtles_all_the_way_down

Functions all the way down begins with simple examples of recursion, and problems that recursion solves. It progresses with every step
