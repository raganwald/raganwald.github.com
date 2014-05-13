---
title: How to Trick the Gullible into Learning a New Programming Language
layout: default
tags: javascript
---

Yesterday, I read a middling article, [How to Trick the Guilty and Gullible into Revealing Themselves][1]. I wasn't entirely fascinated by the stories about plunging arms into boiling water, or of brown M&Ms and concert venues. But then the author revealed why Nigerian 419 scammers use such blatantly ridiculous letters to troll for victims:

[1]: http://online.wsj.com/articles/how-to-trick-the-guilty-and-gullible-into-revealing-themselves-1399680248

> If the Nigerian scam is so famous, why would a Nigerian scammer ever admit he is from Nigeria?

This is a fascinating question. Why do their letters have obvious spelling mistakes and impossibly florid prose? The answer is economic. While sending the letters is essentially free, talking to prospects is expensive, and the scammer's time is limited.

So the scammer is not concerned with the response rate, but instead is concerned with the conversion rate for those prospects who respond. In other words, **false positives suck.**

The ridiculously obvious letters help: Only the must trusting, greedy, and gullible people will respond to such insanely obvious letters, and there is a good chance of extracting money from such people. If the scammer used a more plausible pitch, people like you and I might respond and then back out of the scam later, after the scammer had spent valuable time wooing us.

This reminds me of programming languages and frameworks. The most important factor for success in a language is that it be the scripting language for a new platform that disrupts the old. C for Unix, Objective C for iOS, Java, JavaScript, and Ruby for HTML. This insight, unfortunately, is like saying that the most important criterium for personal wealth is to belong to the lucky zygote club.

But if all other things are equal, is there any similarity between a new programming language and a 419 scam? Sure there is.

[![The Central Bank of Nigeria](/assets/images/central_bank_nigeria.jpg)](http://www.cenbank.org "Central Bank of Nigeria")

### why a new language is like ten million dollars in a nigerian bank

When you're promoting a new idea, early adopters are gold. But early doubters are poison. When you're launching, you're vulnerable. A single "I tried Raganwald-C, and Here's Why It Sucks Sweaty Goat Testes" blog post on the front page of Hacker News can sink you. *False positves suck for new programming ideas just as much as for 419 scams.*

You want to avoid people actively hostile to your idea, and you also want to avoid shallow dilettantes. An apathetic user won't write such vituperative blog posts, but they also won't take the trouble to really understand your language's "big idea," and they will complain that your new language isn't very good at doing the thing they've always done, the way they've always done it.

Think about people complaining that JavaScript promises are more "complicated" than callbacks, or that immutable data structures in ClojureScript are harder to understand than programming with mutable state. They aren't wrong from their point of view, but the whole point of a new idea is to have a new point of view!

The very best thing is that the first few folks to try your idea have a very high willingness to adopt a new point of view. You're looking for people who are a little like the Nigerian 419 victims. They should be trusting, be open-minded, and be greedy. You don't want people trying to save themselves from extinction, you don't want people trying to be 1% better, you want people greedy enough to hope your idea makes them an order of magnitude better.

You know... programmers too lazy to keep struggling with the old tech and with the hubris to believe they can adopt entirely new tech.

> Be anything you like, be madmen, drunks, and bastards of every shape and form, but at all costs avoid one thing: **success**.
>
> --Thomas Merton

### seeking hubris

So how do you find these lazy programmers with insanely optimistic hubris? Act like the 419 scammer. Be florid. Make impossibly bold claims! Use linkbait blog posts. And especially, *design your new idea or language around something so insanely different that it weeds out the dilettantes at a glance*.

For example, CoffeeScript gets this right. It's "JavaScript, the Good Parts," but it's also significant whitespace. I don't think CoffeeScript would have gotten anywhere without significant whitespace. Not that indentation matters a damn to anyone's productivity... But it matters a damn to making sure that the only people who would bother to try it were people willing to throw themselves into something very different.

Those people would go ahead and [write books][2] about it, and explore wild things like using `do` to create block scoping. Had it been JavaScript plus-plus, it would have been swamped with ordinary folks who would have done ordinary things and decided it wasn't worth the transpilation headaches.

[2]: https://leanpub.com/coffeescript-ristretto "CoffeeScript Ristretto, of course!"

Likewise, I love that Clojure and ClojureScript are still Lisp, s-exprs and all. Algolizing Clojure would have killed it. Never mind macros and homoiconicity, we can solve those problems for Algol. What we can't do is solve the problem of people trying it and telling everyone they know how they're more productive using JavaScript to write JavaScript than using ClojureScript to write JavaScript. Well, duh.

What the language needs is people using ClojureScript to write Clojure in the browser, and having a "funny" syntax selects for people willing to invest in a new idea.

### in closing

My thesis is that in early days, you need to select for people willing to invest in a new point of view, and having a glaringly self-indulgent features--like funny syntax or a completely new model for managing asynchronicity--is helpful to keeping the concentration of early "wows" to early "meh's" high.

Which leaves me offering some free advice: There's plenty of room for new programming editors. If you're going to do it, don't be afraid to ignore "vi" and "emacs" compatibility modes.
