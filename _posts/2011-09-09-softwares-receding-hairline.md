---
title: Software's Receding Hairline
layout: dark
---

The news is out that the Java Programming Language is going to have a clean, simple syntax for lambdas [Real Soon Now](http://www.urbandictionary.com/define.php?term=real%20soon%20now). It seems that after two or three or maybe even five years of wrangling, the various committees have decided on a syntax, [mostly](http://mail.openjdk.java.net/pipermail/lambda-dev/2011-September/003936.html).

Obviously, I'm less than impressed. But let's cut the designers a little slack. There are factors I don't understand that go into a feature like this. It must be carefully considered not just for its functionality, but for the subtle ways a revised compiler would interact with billions of lines of existing code. The new feature would interact with thousands of existing features in weird ways. Each and every one of those interactions needs to be carefully considered before adding a new feature. Under the circumstances, it's kind of amazing the feature was added at all.

But then again, consider the following scenario: I build an application for a client. The application is a little long in the tooth, and the UX is so ancient, it is demonstrably less effective than competing applications. The client asks for a modern feature, something like changing from constantly refreshing pages to having a Single Page Application that fetches data using AJAX, or perhaps the client wants entities in the system  to have "walls" with stories and posts the way Facebook pages have walls with stories.

"Well,", I say, rubbing my beard. "That's going to take two or three years. There are many subtle interactions in the code, many features that interact and are coupled. While this change may look simple to you, it actually requires a massive rewrite to make sure it doesn't break anything."

What is my client to think? That I have given them a marvellous, well-architected application? Or that years of [bolting a feature on here](http://developeraspirations.wordpress.com/2010/02/23/javas-flaws-why-primitives-are-bad/) and [hacking a workaround there](http://cakoose.com/wiki/type_erasure_is_not_evil) have created a nightmarish miss-mash where the velocity of progress is asymptotically approaching zero?

### receding hairlines

I am balding. Fortunately for me, my hair is too nappy to form the dreaded "comb-over." How does this happen? How do men wind up with such an obviously unattractive appearance. Don't they know it looks ridiculous?

The answer, of course, is that it doesn't happen overnight. Nobody walks into the barber's office and asks for a comb-over. Nobody carefully grows the hair on one side of their head until it can reach right across their bald pate to the other side. Instead, a comb-over is the accumulation of years of small decisions, until one day there is an unmistakable comb-over. Mercifully, nobody of character is paying attention. Nobody who matters judges a man by his hair, and nobody who judges a man by his hair matters.[^pg]

This is interesting, because _the mechanism of growing a comb-over applies to software development_. A comb-over is the accumulation of years of deciding that today is not the day to change things. A comb-over is the result of years of procrastination, years of decisions that seem right when you're in a hurry to get ready for work but in retrospect one of those days should have included a trip to the barber and a bold decision to accept your baldness or take some other action as you saw fit.

Software is like this. Bad software doesn't really start with bad developers. It starts with good, decent people who make decisions that seem right on the day but in aggregate, considered over longer timeframes, are indefensible. This is a great paradox. It is difficult to pull out a calendar and tell Smithers that on February 12, 2003 he should have restyled his hair. Why the 12th? Why not the 15th? Why not June 2003? Why not some time in 2004?

Likewise with software, it is sometimes difficult to pull out a calendar and say that on May 5th, 2010, we should have deferred adding new features and refactored this particular piece of code. On that day, adding new features might have been the optimum choice. And the next day. And the next. But over time, it's clear that _some time_ should had been devoted to something else.

### the tyranny of the urgent

This is as true of life as it is of software and hairlines. You cannot make all decisions based on short timeframes. Sometimes you have to do things that are _important but not urgent._ It is never urgent to read a new book, or learn an unpopular programming language, or refactor code that isn't blocking you from implementing a new feature. If you are programming in Java, it is never urgent to switch to Scala. If you are implementing Java, it is certainly never urgent to release a feature that would force your legacy users to rewrite some of their code.

But if you make all your decisions according to their urgency, one day you wake up with a receding hairline and a million lines of Java code running on a compiler that simply can't accommodate new language features without three years of finagling. It's entirely up to you how to proceed.

For my part, I am going to do the following: The next time I am prioritizing features with a client and tasks with my team, I am going to explicitly ask the group to name three things to do that are _important but not urgent_. And with any luck, we'll do some of them, and I won't wake up one day explaining that what looks like a straightforward change will take years to implement.

[^pg]: Paul Graham used the comb-over analogy in an optimistic, positive way in "[The Age of the Essay](http://paulgraham.com/essay.html)." Wonderful read.
