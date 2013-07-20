---
title: Yes, JavaScript is a Lisp
layout: default
tags: [javascript]
---

Some people will tell you that [JavaScript isn't Scheme][jis]. Of course it isn't: Scheme is [Scheme], JavaScript is JavaScript. There are excellent reasons why JavaScript is nothing like Scheme. Pretty much everything that makes Scheme Scheme is nowhere to be found in JavaScript.

[jis]: http://journal.stuffwithstuff.com/2013/07/18/javascript-isnt-scheme/
[Scheme]: http://groups.csail.mit.edu/mac/projects/scheme/

One of the fundamental ideas in Scheme is to be minimal and elegant to the point of pain. In early Schemes, there was no real block scoping. You had to create block scopes using `let` as you do today, but `let` was implemented as a macro that acted a lot like JavaScript's Immediately Invoked Function Expression idiom.

Likewise, the Scheme standard mandates Tail Call Optimization because the philosophy of the language is that if you have recursion, you don't need loops. And there is no real exception system because if you have continuations, you can make pretty-much anything you want for yourself.

If Lisp is a "programmable programming language," then Scheme is an assemble-it-at-home kit for making yourself a programmable programming language. JavaScript does not have this quality AT ALL.

JavaScript also isn't Lisp as people who write Lisp use the word. Agree or disagree, the "Lisp Community" has coalesced around Common Lisp. Anything that doesn't harken back to MacLisp is considered not-Lisp by experts. You know, Scheme looks a lot like a Lisp-1 to everyone else, but hard-core Lispers will tell you that Scheme isn't Lisp and that the only thing it has in common with Lisp is `CONS`. Seriously.

### names and clans

![Macpherson Dress Tartan](http://upload.wikimedia.org/wikipedia/commons/0/09/MacPherson_tartan_%28Vestiarium_Scoticum%29.png)

Nevertheless, I often say that JavaScript is "a" Lisp, although not Lisp. I say it the same way that I might say that a Scottish Lee is "a" MacPherson even though obviously, the surname Lee is not spelled "MacPherson."

The trick (for me) is context. Saying that JavaScript is "a" Lisp when talking about Lisp is not helpful. It does not add any bits of information to understanding Lisp. If someone is learning Lisp, I do not suggest they learn JavaScript first.

But saying that JavaScript is "a" Lisp when talking about JavaScript... That's a different matter. It makes one pause. The obvious response is to ask "In what way?" This leads to conversations about recursion and trampolining and the use of IIFEs to create block scope.

It leads one to think that tools like [Esprima](http://esprima.org) might be a good fit with the language rather than this one weird trick for eliminating code wrinkles.

I think it's mostly false, but just true enough to be *interesting*. And that's good enough for me.

### pax, exeunt

So in summary, I do not think that JavaScript is Scheme or Lisp. I do not think it adds value to thinking about Scheme or Lisp to think that there is a meaningful relationship between Scheme or Lisp and JavaScript. but I do think it is interesting and productive to think about what JavaScript draws from Scheme and/or Lisp, and to that end I often say that JavaScript is "a" Lisp when talking about JavaScript.