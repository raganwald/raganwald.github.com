---
layout: default
---

Why yes, it **is** my birthday today. Wondering what to get me? Just a second, some people are [singing](https://www.youtube.com/watch?v=hgmcJCMHl7w)...

Okay. It's simple, really. I'd like yet another programming language. It doesn't have to have entirely new ideas, but if it is going to recycle some old ideas, I'd really like it if it recycled some old ideas that every other damn language isn't recycling.

HNow it's easy to design an esoteric language and say "Here, Reg, knock yourself out." But I have a special caveat. I want a language that is designed according to the **principle of maximum surprise**.

### the principle of maximum surprise

Weird languages are just weird. They aren't surprising, in the sense that if you walk into an insane asylum, you aren't going to be surprised to discover weird things happening inside.

What's really surprising is when you walk into a University, you see students and teachers bustling about, observe lectures in lecture halls, and figure it's like any other University. Then someone explains that there are no formal courses and everything is self-organizing according to a set of rules and what looks like a normal univeristy "emerges" from the special rules.

Surprise!

So a maximally surprising language looks a lot like a language you're already familiar with, and for most trivial cases acts just like it, but it can do wildly non-trivial things because the semantics underneath are from Mars, but you're from Venus.

For example.

### pattern matching

[SNOBOL](https://dl.dropboxusercontent.com/u/5038808/bookshelf/gb.pdf) (and yes, Icon) introduced pattern matching as a first-class concept. To the max, you might say.

You had primitives like `SUCCEED`, `FAIL`, and `FENCE` you could stick inside patterns to control backtracking.

Patterns composed. So you could write `'Hello' | 'Hi'` To get a pattern that matched either of two strings. Hey, when you put it like that you get something interesting. `'Hello'` is a string, sure, *but it's also a pattern*. That's very damn interesting, the idea that everything in a language is a pattern.

For one thing, I absolutely despise writing `if a is 'foo' or a is 'bar'` in today's languages. It's this English-likeness monster concept of a language that kinda looks like English, but really isn't. Because if you try to write `if a is 'foo' or 'bar'` it doesn't do what you think.

But a language with SNOBOL semantics would do exactly what you think and match `a` against a pattern made of `'foo' or 'bar'`. Solid.

Speaking of pattern matching, the FP people have taken over this term and now use it to mean generic functions or what-have-you, meaning you can write this fictional JavaScript:

    function length ([]) { return 0; }
    
    function length ([first, butFirst...]) { return 1 + length(butFirst); }
    
Through the magic of [destructuring](http://blog.carbonfive.com/2011/09/28/destructuring-assignment-in-coffeescript/), the language matches calls to `length` against the various definitions and evaluates the body of the first one that "matches" the parameters. It's a fabulous way to write clear code.

But why argue whether "pattern matching" means SNOBOL or Haskell? I'd applaud a language that "swings both ways." Let's start with something subtle. Let's say that this pseudo-CoffeeScript:

    length = ([]) -> 0
    length = ([first, butFirst...]) -> 1 + length(butFirst)
    
Is syntactic sugar for:

    length = ([]) -> 0 or ([first, butFirst...]) -> 1 + length(butFirst)
    
Now we can think of `length([yabba, dabba, doo])` as pattern matching, and what we call functions are also patterns that apply their bodies to anything they match.

Hang on while I sip some birthday Scotch. Mmmm.

So if that's the case, what does this mean?

    x = 1
    # ...
    # lotsa code
    # ...
    x = 2
    
Well, by the above, it means that `x = 1 or 2`, not that `x = 1` for a while and later `x = 2`. That's incredibly interesting as well. Why shouldn't that work? Why shouldn't `x` have multiple values?

You can see how a language like this might look just like CoffeeScript, or Ruby, or whatever, but things that might be errors in another language would be wonderful expressions in this language.

I'm going to move onto the next topic. It's easy to write provocative things like this, but designing a solid language around these ideas would involve a deep dive into the List Monad.

Speaking of which...

### monads, monads everywhere but no more drops of ink

I'm tired of Greenspunning monads and even more tired of [reading explanations that force us to parse the semantics and the implementation in the same essay](https://en.wikibooks.org/wiki/Haskell/Understanding_monads). It's sweet that Haskell gives us syntactic sugar for Monads (like `>>=` and `do`), but what if we went "all the way?"

So this is simple. I want a language with Algol-ish syntax, meaning some form for delimiting sequences of expressions, like `{ ... }`, or `begin ... end`, or if you're old school, `(BEGIN ...)`. And by default, it should do exactly what you expect.

But I also want a way of decorating those blocks with my own semantics. If I want Maybe semantics, I can do that. Or if I want List semantics. Or Reader, Writer, or State semantics. Or anything I feel like rolling myself.

And I don't want that being something on top of the default, I want this baked into both the syntax and the semantics so that it's an entirely first-class concept. And when I say a first-class concept, I'm implying--well now I'm stating, I *was* implying--that it's reflectable and mutable.

So I can take a function with "normal" semantics and produce a version of the function with different semantics. This implies that *all* expressions are first-class something-or-others that you can take apart and put back together.

For example, I can now impose error handling on something without some kind of black box "If it throws an exception I want to catch it" system. What I like about this delusional world is that we have a powerful argument for homoiconicity without demanding macros.

Did I say macros? I guess that's as good a third example as any...

### tired of macros

I always say JavaScript is "a" Lisp and in return I get shelled with mortar rounds, each lovingly engraved "Without Macros?" Well, there's something to that argument. But there's something else, and I recall ranting about this [five years ago](http://weblog.raganwald.com/2008/06/macros-hygiene-and-call-by-name-in-ruby.html).

The upshot is, if you have [call by name](https://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_name) or by need semantics, you can actually get a huge amount of what you want from macros. It seems like a little thing at first, but as you get comfortable with it, you find yourself composing evaluation abstractions that have no analogue in functions or methods.

For example, this is ridiculously obvious:

    try(
      postToServer(foo),
      displayFailure(bar),
      logError(blitz),
      giveUp()
    );

`try` uses call-by-name semantics. It evaluates `postToServer(foo)`, and if that fails, it evaluates `displayFailure(bar)`, and if that fails, it evaluates `logError(blitz)`, and if that fails it gives up.

Of course you could write it like this in CoffeeScript:

    try(
      -> postToServer(foo),
      -> displayFailure(bar),
      -> logError(blitz),
      -> giveUp()
    );

But there's a lot of win in making the syntax go away visually, and even more win in that you can optimize this business of thunks if you know that they aren't intended to be first-class functions but rather lightweight delayed evaluations closer to Ruby blocks.

For one thing, `return` semantics are all pizzled if we are manually writing functions in most languages. a `return` ought to return from the enclosing function, not return from inside the thunk to outside the thunk.

I'd like to see someone bring call-by-name back. Haskell does something incredibly interesting with pervasive call-by-need, it's amazing, and it really speaks to the importance of not just removing harmful semantics but also of adding new ones that work in harmony with what remains.

But call-by-name and/or call-by-need could be added to existing mutation-friendly languages, I'd like to see someone try.

### time to go

I'm off for a birthday ride, so I'll stop mid-rant. It's easy to suggest things, much harder to ship them when you have to consider the costs of each feature and the way they interact. But nevertheless, this is the one day of teh year when I ought to be able to say, "Here's what I'd like to unwrap."

Each of these ideas adheres to my "principle of maximum surprise." Namely, it looks and behaves exactly like you expect. Until it doesn't, and then you are pleasantly but maximally surprised!

So...

If I can't have these by Midnight June 14th, feel free to give them to me on December 31st. Or if you *really* want to surprise me, don't do any of these, but figure out another way to engineer maximal nasal-coffee-over-keyboard spray.

You have six months!