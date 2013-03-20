---
tags: [funjs, allonge, effectivejs]
layout: default
---

Today, Michael Fogus announced that O'Reilly will be publishing his new book, [Functional JavaScript][fj] (It's available for preorder at a discount [now][fj]). Fogus is no wide-eyed newcomer just discovering functional programming, he's the author of the [Lemonad] library for advanced functional programming in JavaScript and is a co-author of the well-regarded  "[The Joy of Clojure][joy]."

[fj]: http://www.amazon.com/Functional-JavaScript-Introducing-Programming-Underscore-js/dp/1449360726/?tag=raganwald-20
[joy]: http://www.amazon.com/gp/product/1935182641/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=1935182641&linkCode=as2&tag=raganwald001-20
[Lemonad]: https://github.com/fogus/lemonad

On Hacker News, contributor "GhotiFish" asked a very reasonable question:

> I find these topics to be fun, and I want to use them. However, I can't help but feel that if I use these design patterns, they might unintentionally obfuscate my intentions to my peers.

> I have a code base, and I think my priority should be to remains as consistent with that code base as possible.

> Am I wrong? Is this book just for entertainment?

This is a great question to ponder. It comes up in many different forms and strikes at the very heart of the craft and profession of software development (as distinct from "programming" or "computer science"). Software Development is a team activity conducted over a medium to long time frame where success is measured by return on investment.

**We must always ask whether a new tool, a new language, a new technique, or even a new way to talk about an existing idea is a net positive return over the lifetime of the project.** The answer can and will change from project to project and especially from time to time within the same project.

Here's the time-honoured recipe for analyzing the situation: Ask yourself *who*, *what*, *where*, *when*, and *why*. Once you are satisfied with the answers to the first six questions, investigate **how**.

### who

I have a theory about Old Dogs. As is usual for blog posts, it is extrapolated from an extensive statistical study where `n=1`. My theory is that the reason young adults find it easier to learn things than old adults has to do with their emotional attachments to their sense of self-definition.

When you're nineteen, you are still looking for your place in the world. If you're currently programming in Python, you think it's a cool language, but if I ask you what you'll be doing in five years, you have no idea. To you, the world is changing at a breakneck pace and everything changes, therefore learning the new new thing is a part of life.

Whereas, at fifty, I am often tempted to think that few things change. Once upon a time, old white men with radio stations and newspapers tried to control the outcome of elections. Technology disrupted those businesses so thoroughly that now, old white men with television stations and satellites try to control the outcome of elections.

To a cynic, some things don't change very much. I still shave by scraping hair off my chin with a razor. Maybe there are three or four blades instead of the one that was common when my voice first broke, but whoop-de-fucking-do.

Old Dogs tend to see how much things are the same, and the perpetuate (or perpetrate!) this state of affairs by resisting change. They have a sense of identity ("I'm a Rails Programmer!"), and they fiercely defend it ("We don't need no stinking node.js 'round here"). That leads them to obstruct new ideas.

So by "Old Dog," don't necessarily mean in Earth years. Just in attitude. Consider the age and conservatism of your team. If it's overrun with frisky pups, go for it, they may need help figuring things out, but they'll wag their tails and fight over the chance to play, learn, and grow.

### what

There is a difference between techniques that are novel and those that are merely unfamiliar.

If I read the word "compose" in a codebase and don't know what it means, I can google `function compose` and find out just as if I was looking at a SQL query and needed to be reminded of the semantics of `RIGHT OUTER JOIN`. The same goes for things like partial application,[^pa] or trampolining.[^trampoline]

[^pa]: [Practical Applications of Partial APplication](http://raganwald.com/2013/01/05/practical-applications-of-partial-application.html)
[^trampoline]: [Trampoline (Computing) on Wikipedia](https://en.wikipedia.org/wiki/Trampoline_(computing)#High_Level_Programming)

People can learn an unfamiliar technique. And once it is learned, they benefit from it forever. It is straightforward to learn something using Google and/or StackOverflow and/or an excellent programming blog.[^blog] Hundreds of books are written about things like functional programming, including the subject of the comment.

[^blog]: Or a hit and miss blog like [this](http://raganwald.com)

Familiarity can easily be acquired, provided the technique is unfamiliar to the team, but has been used extensively enough that there is an "information infrastructure" of books, blog posts, StackOverflow questions, sample codebases on Github, libraries, and so on.

This may or may not be the case for some bone-headed attempt to write a client-side JavaScript application using Operational Transforms to mediate concurrent editing. [^guilty] But it is obviously the case for writing programs in a functional style.

[^guilty]: As the author if this post knows all too well.

### where

I don't mean what kind of company or team you have. When I ask, "where," I mean, *where in the code would you use this?* In any non-trivial code base, some pieces work fine, are rarely updated, and nobody looks that them. Others a re a big ball of mud but are so mission critical that nobody wants to touch them for fear of breaking everything.

New techniques do not necessarily "obfuscate" such code. If you replace a loop with a map, well, that's not much of an improvement or an obfuscation. But if you can introduce some method decorators and dry up a ton of code while making the central responsibility of each method clearer, that might be a small investment in unfamiliarity that will pay a big dividend in understanding the underlying domain logic being expressed.

An easy way to sort this out for yourself is to pretend that you're in a meeting with an external analyst hired by the board of directors. "Go ahead and use that technique," she says, "I'll review it in a year. If it's a net loss, you're fired."

Obviously you want to pick the one place in the code where it is a clear net win, and avoid at all costs places where it has uncertain benefit. Where is that? Where isn't that?

> Software Development is a team activity conducted over a medium to long time frame where success is measured by return on investment. We must always ask whether a new tool, a new language, a new technique, or even a new way to talk about an existing idea is a net positive return over the lifetime of the project.

### when

Early in a project's life, I think you have greater freedom to invest in "new" techniques. Over time, new techniques become familiar to a team, even if only because you keep ramming them down everybody's throats until every new hire is given a tour of the codebase and told "You might as well figure this folding shit out, because it works and we're tired of trying to rewrite it with for loops."

But early in a project, you have a longer time frame to collect the dividends. There will be more changes and upgrades. More new team members coming aboard that will find the code easier to read if you have correctly chosen techniques that clarify the intent once you get the hang of what a partial application does.

And if your technique is anything better than mediocre, you have a fighting chance of everyone adopting it as they write new code, which means it becomes the standard and will one day become the legacy technique itself. You plant a flower and the bees pollinate it and the seeds spread and one day you will have a meadow full of flowers.

Whereas, a legacy project may not be long for this world. Or at least, the rate of change is slower, therefore you get fewer dividends from your "enhancement." Meanwhile, the costs of your enhancement are higher than on a new project, because you have to go in and rewrite everything with this new idea to avoid the codebase becoming a chaotic mess of whatever technique was in vogue when that particular line of code was written.

There are exceptions, such as refactorings that make legacy code more testable, but again if we squint and scribble on the back of the envelope, we see that young projects can afford to take a few more chances.

### why

Entertainment is no reason to try a new technique. Neither is learning on someone else's dime. Everyone can be entertained ad infinitum reading about enchanted forests[^ef] or schools teaching JavaScript programming.[^hilbert] In this day and age, you have plenty of opportunity to learn on your own. Everyone reading this blog has access to personal development environments. There's zero need to fool around on a project that has a mission to deliver change in the world outside of your head.

[^ef]: [A long time ago, in a village far, far away](http://raganwald.com/enchanted-forest/a-long-time-ago-in-a-village-far-far-away.html)
[^hilbert]: [Hilbert's Grand JavaScript School](http://raganwald.com/2013/02/21/hilberts-school.html)

You can and should look for practical reasons that a new technique will untangle conflated concerns, or collect scattered responsibilities into a single concern, or clarify the underlying domain logic and intent of code.

When such reasons exist, you have excellent motive to ask whether the technique also passes the *who*, *what*, *where*, and *when* questions. And if the answer to all of these is affirmative, Then press ahead with your new technique or idea or tool or even language.

And if that new idea happens to be the proven-over-time and widely adopted techniques of functional programming as expressed in the JavaScript language, books like [Functional JavaScript][fj] will answer the sixth question:

**How**.

---

(discuss on [hacker news](https://news.ycombinator.com/item?id=5409626) and [reddit](http://www.reddit.com/r/programming/comments/1aom0q/six_questions/))

---

notes: