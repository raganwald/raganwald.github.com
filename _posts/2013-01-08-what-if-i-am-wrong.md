---
layout: default
title: What If I'm Wrong?
published: false
---

Let's conduct a little [gedankenexperiment](https://en.wikipedia.org/wiki/Thought_experiment):

### monkeys

Imagine we have a lot of primates. Or we have some massively parallel hardware. Or control of one of those world-wide botnets. Or maybe just a lot of monkeys. With a lot of typewriters.

Our monkeys bash away at the typewriters, more-or-less randomly writing stuff. They'll write [poems of great beauty][basho]:

    furu ike ya
    kawazu tobikomu
    mizu no oto

[basho]: http://thegreenleaf.co.uk/HP/basho/00Bashohaiku.htm

And they'll write code that is [not even wrong][wrong]:

    def andand (p = nil)
      if self
        if block_given?
          yield(self)
        elsif p
          p.to_proc.call(self)
        else
          self
        end
      else
        if block_given? or p
          self
        else
          MockReturningMe.new(self)
        end
      end
    end

[wrong]: https://onionesquereality.wordpress.com/2012/07/08/not-even-wrong/

We could use our monkeys to [recreate the works of Shakespeare][infinite]. Or of Philip K. Dick. Or to describe the architecture of Antoni Gaudi i Corent. All we have to do is wait.

[infinite]: https://en.wikipedia.org/wiki/Infinite_monkey_theorem

### why this won't work

Why won't this work?

Well quite obviously, we can talk of an infinite number of monkeys with typewriters, but in actual fact the world supply of monkeys is less than two million, and declining. Actual typewriters may be in scarcer supply. Sure, there are probably many more compromised Windows machines, but even if there's one for every person on Earth, six billion devices pumping out random pages isn't going to deliver the works of Shakespeare before the heat death of the Universe renders the outcome moot.

But that isn't the point.

It's a thought experiment, so let's assume we have lots of monkeys and lots of typewriters, maybe one for every atom in the observable universe (10<sup>78</sup> to 10<sup>82</sup>). And we can assume that the monkeys are getting smarter over time, while the typewriters are definitely getting faster.

So let's presume that we can generate enough pages of text that somewhere, some monkey is writing the works of Shakespeare, and another the works of Phil Dick, and another (possibly in Toronto) is recreating [raganwald.com].

[raganwald.com]: https://raganwald.com

Even if we have enough monkeys writing enough pages, this still won't work. Because the real problem isn't *writing* Shakespeare, it's *finding* Shakespeare amongst all the dreck.

That's the great lesson of the monkeys: **With enough monkeys, Shakespeare is a recognition problem, not a generation problem**.

> That sounds vaguely important!--George Carlin

### the choice

Is programming like bashing on a typewriter and hoping to create Linux by accident? It's impossible to tell, because we're prisoners of our own assumptions about how our brains "work." We are too arrogant to believe that we're no better than monkeys with typewriters.

But imagine a stranger offers us a choice. If we take the blue pill, we wake up back at our desk, writing our code. Everything is as we believe. Coding can't be done by monkeys, it requires serious talent, and everything we can do to support that talent is important.

If we take the blue pill, writing programs productively and correctly is important. Editors are important. IDEs are important. Expressive languages are important. Type-checking is important. We aren't trying to get monkeys to write Shakespeare, we believe only Shakespeare can write Shakespeare, so we invest our time and efforts into recognizing the rare writers who are truly great, and making them as productive as possible.

If we take the blue pill, we think that some programmers are 10x or 20x or 100x as productive as mediocre programmers, *and we think that this matters*. If we take the blue pill, we care about Clojure and Haskell and think that programming language design matters. If we take the blue pill, we care about books like [JavaScript Allongé][ja] and [POODR] and think that good program design matters.

[ja]: https://leanpub.com/javascriptallongesix
[POODR]: http://www.poodr.com "Practical Object-Oriented Design in Ruby"

If we take the blue pill, we believe that the world we inhabit today is the real world.

### the red pill

What if we take the red pill?

What if the world we live in today is an illusion, if the things we believe about how programming works are wrong.

Dear God, **What if everything I believe about what I am and how I work is wrong?**

If we take the red pill, we don't wake up back at our desk, doing what we've always done and getting the same results we've always gotten, albeit now with chrome and tail fins. Instead, we look around and see that everyone else is plugged into a dream, but we are awake.

We can see that writing programs productively and correctly is *not* important. It may feel important to the programmer, but there are millions or billions or 10<sup>78</sup>-10<sup>82</sup> of programmers, and one of them is going to produce this program, in fact one of them is finishing it up right now, regardless of what editor they're using. Autocomplete doesn't matter a damn, REPLs don't matter a damn, even StackOverflow doesn't matter a damn if you take the red pill and you have enough monkeys.

If we take the red pill, we see that arguments about indents, and coding patterns, metaprogramming, [programming blogs][raganwald.com], even [entire books][cr]... All just the chattering of monkeys, none of it matters because somewhere, one of the monkeys is banging out a working program using an absolutely crappy typewriter. Sure, individual monkeys may care, but it's no more significant to the fate of the universe than their choice of fashion sunglasses.

[cr]: https://leanpub.com/coffeescript-ristretto

If we take the red pill, we realize that **programming is a recognition problem**. The problem is recognizing good software, not generating it. We realize that walking amongst so many monkeys writing so many programs is like walking into the forest and being pelted with rotten fruit from the trees. It's nearly all crap.

### recognizing software

If programming is a recognition problem, maybe languages, tools, and patterns do matter, but not in the way I thought they mattered. Maybe it isn't about writing programs better, or maintaining programs better, but it's about reading and analyzing programs better.

Maybe it's about writing better tests. Maybe the real problem, the hard problem, is writing executable requirements. Maybe all the stuff we obsessed about for years with our object-oriented thingummies shouldn't have been about making widgets inherit from each other, but about [making tests inherit from each other][poo].

Maybe strong, static typing matters a great deal when we're writing tests, but dynamic languages are just fine for writing implementations? And maybe you can use tabs or spaces as you see fit in the implementation, but it's  crucial that teams synchronize on how to format the test suite?

[poo]: https://raganwald.com/2010/12/01/oop-practiced-backwards-is-poo.html "OOP practiced backwards is 'POO'"

Maybe editors don't matter, but explorers and browsers matter? Maybe when we turned Smalltalk into Eclipse, we threw the wrong thing away? Maybe it's far more important to read programs just the way they've been written than it is to try to write them to be read?

### search

*next idea*: talk about the architecture of scaling way out, about communities and libraries and social at scale. this is supposed to be the point of the post.