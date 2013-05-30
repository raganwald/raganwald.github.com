---
layout: default
tags: allonge, funjs
title: Functional JavaScript's Greatest Accomplishment
---

### functional

Michael Fogus has just published [Functional JavaScript: Introducing Functional Programming with Underscore.js][fju]. He is also writing a series of essays introducing people to existing resources for writing JavaScript in a functional style (or with a dollop of functional on top).

[fju]: http://www.amazon.com/gp/product/1449360726/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=1449360726&linkCode=as2&tag=raganwald001-20

I was pleased to see his [Fun.js – Functional JavaScript](http://blog.fogus.me/2013/05/29/fun-js-pt-1-functional-javascript/) post kick it off. This introduces on Oliver Steele's library [Functional Javascript][osfj] (a/k/a `Functional`). `Functional` was one of the very first libraries to approach JavaScript from a strongly functional perspective, and it goes well beyond the usual mapping and reducing to include currying and partial application, combinators, sequencing, and the controversial string lambdas.

[osfj]: http://osteele.com/sources/javascript/functional/

Today, many people rightly point to things like Underscore or CoffeeScript and ask if we need `Functional`. To be precise, they don't ask, they criticize, often expressing strong disapproval as is common in our community.

Perhaps if someone wrote this library today we might ask if it solves a new problem or introduces a new way of thinking. Mostly, the answer might be "no." We might say that the point-free programming offered by string lambdas are a matter of taste, and that libraries like [Underscore](http://underscorejs.org), [Lemonad](https://github.com/fogus/lemonad), or [allong.es](http://allong.es) cover everything else and more besides.

But of course, `Functional` wasn't written today. It was written well before any of these other libraries. In fact, it inspired all three of the libraries just mentioned in whole or in part. When it was introduced, it seemed exotic and weird to the JavaScript community, but its ideas won a few hardy adventurers over, and they won some more people over, and gradually its seeds grew and spread and intermingled with other ideas.

Today, people look at it and say "Pooh," but this is because *Oliver Steele did such a good job of opening our minds to functional programming in JavaScript, that we turned around and made his library obsolete*!

`Functional` is full of hacks and clever implementations of things that really ought to be part of a language itself. Things like currying really ought to be baked into everything as it is done in languages like Haskell. When you use a library like `Functional`, you quickly become sensitive to how JavaScript can get in your way. You agitate for change.

And indeed, the JavaScript language is changing. Lambda expressions are coming. Other features are already here, added to the language in part because `Functional` taught is to ask for them.

`Functional` seems obsolete today precisely because it did such a good job of teaching us how to think functionally.

### looking forward

This is a very nice tribute, you might be saying, but is there anything "actionable" in this essay? Yes. Having looked backwards, let's look forwards.

`Functional` was a library that introduced a new idea, an idea that seemed at the time to be going "against the grain" of the JavaScript community. But it wasn't entirely artificial, it introduced ideas that were proven useful in other environments. And although the library did hack around a few things, on the whole the ideas did fit somewhat well with the JavaScript language.

Besides thinking nice thoughts about Oliver Steele, besides picking up Michael's book and doing more functional programming, we can also ask ourselves, *What library today introduces a new idea that may one day become commonplace?*

That library will seem hackish. It will seem to cut against the grain of the community, but will fit fairly well with JavaScript the language. The idea will be proven in another context, even if that context isn't as rabidly popular as the JavaScript context.

Perhaps when we see that library, we might think of `Functional`. We might say to ourselves, "Let's try this out, let's see what it teaches us."

`Functional`'s accomplishment of teaching us to want even better functional tooling for JavaScript was great. But if it teaches us to open our minds to new and even better ideas, that will be an even **greater** accomplishment.