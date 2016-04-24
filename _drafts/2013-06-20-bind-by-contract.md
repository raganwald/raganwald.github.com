---
layout: default
title: "Unfinished Work #1: Bind-by-Contract"
---

*This is an unfinished work. I am still trying to think through all of the implications of binding names to entities using test suites. It seems fairly obvious how it would work with Ruby Gems. But does it scale downwards? Can I specify a function to be called by contract? How about a class? A constructor? Does this integrate with pattern-matching for function signatures? I still don't know!*

### abstract

In this essay, I argue that programming languages tend to solve less-and-less important problems as they mature, and that it's important for Ruby to break with this behaviour if it is to survive.

I suggest "coupling" is a problem that needs to be solved, and offer patching zero-day exploits as a motivation. I finish by presenting "bind-by-contract" as one potential disruptive fix.

### introduction

There's an oft-quoted aphorism that goes like this: *The definition of "Insanity" is doing the same thing over and over, but expecting different results*. In the field of programming language design, we are extremely good at doing the same thing over and over again. Popular languages mix and remix elements of other popular languages, and we seem to have become trapped in the vicinity of local maxima, where small variations just move is to a different part of the same neighbourhood.

Meanwhile, our problems are multiplying, especially as our code bases grow. I just read someone's claim that they had a Rails app in production with more than five thousand model classes. This is to be expected: Software grows over time, and statistically we can expect that the likelihood of finding a Juggernaut-sized application grows over time.

But does our tooling grow with our applications? Does the underlying language platform grow with our applications? Generally, no.

### why languages cluster around local maxima

Languages survive in two ways: By attracting new developers, and by preventing the defection of existing developers. Languages emphasize attracting new developers early in their lifecycle, and emphasize preventing defection once they become mature. This model is very well aligned with the "Technology Adoption Lifecycle" espoused in the book [Crossing the Chasm][ctc].

[ctc]: http://www.amazon.com/gp/product/0060517123/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0060517123&linkCode=as2&tag=raganwald001-20

Programming languages have historically been subordinate to hardware and/or operating systems. People generally adopt a programming language because it's the dominant way of working with a platform that is itself popular. So people adopted JavaScript because Netscape Navigator was popular and other browsers embedded JavaScript. People adopted Objective C because iPhones are popular. And so on.

But what about preventing defection to other programming languages when a language becomes mature? There's very little a language can do if its underlying platform crashes in popularity. If iOS were to fail as an ecosystem, Objective C will almost certainly crumble, given that it hasn't made any non-trivial inroads to another platform.

But languages can prevent defection within their "natural" platform. Within a single platform, languages struggle for mindshare. As I write this, CoffeeScript is struggling with JavaScript. Node and JavaScript are struggling with Rails and Ruby. As described in Reis and Trout's classic [Marketing Warfare][mw], the leader in any market has an ideal strategy, playing *defence*.

[mw]: http://www.amazon.com/gp/product/0071460829/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=0071460829&linkCode=as2&tag=raganwald001-20

There are three principles of defence:

1. Defensive strategies should only be pursued by the actual leader.
2. Attacking yourself is the best defensive strategy.
3. Always cover strong offensive moves by competitors.

Programming languages tend to defend themselves using the third strategy, "covering strong offensive moves by competitors." For example, introducing lambdas to Java. Or introducing fat arrows to JavaScript. Or skinny arrows to Ruby. In other words, *copying the selling features of other languages that seem to be gaining traction*.

If languages spend a lot of effort copying each other, it cannot be surprising that we see very little substantial change. For that to happen, languages would also have to embrace the second, more powerful strategy: Attacking themselves. In other words, having the courage to incorporate disruptive change.

And notice, please, that to attack itself, a language cannot simply shore up or correct a weakness. For example, adding WebWorkers to JavaScript corrects a weakness with respect to multi-threading. This is not attacking itself.

Now if JavaScript were to embrace multi-threading by changing its semantics and enforcing immutability of variables, *that* would be attacking itself.

Programming languages rarely change so drastically that they undermine their own strengths. People say this is because of the importance of maintaining legacy code compatibility, &c. &c. blah blah. Let's see why languages can and should disrupt themselves.

### why ruby ought to make the jump to hyperspace

It's all nonsense. If Ruby on Rails can evolve from 2.3 to 4.0, breaking old applications and requiring migration, Ruby itself can evolve in such a way that old programs will break. This is already the case for some minor misfeatures generally considered to be bugs such as the rules for scoping of block parameters that changed between 1.8.x and 1.9.x.

This is true for all popular programming languages, but I will focus on Ruby because first, I am familiar with the language, its history, and its community. And because second, it is transitioning to the "mature" stage of its life-cycle, and presents a unique opportunity to consider how it might engage the second defensive tactic, "attacking itself."

Great disruptive changes generally take one of two forms: Taking some hitherto minor characteristic and elevating it, or taking some previously essential characteristic and throwing it away.

We could play "what if" games along these lines, and doing so would be a useful exercise for a creativity retreat. Post-its could be made up with various features ("Blocks," "Gems," "Eigenclasses," "Everything's an Object" and so forth), and after much back and forth and moving them around on the walls, we could come up with many fine proposals. I'm sure that some or even most of them would be superior to anything one person might come up with.

But for the sake of giving an example of such a disruptive change, here is a process I have used for generating ideas like this.

### one source of opportunities to attack yourself

One fertile source of opportunities for disruption in programming languages is the tooling system surrounding each language.

Good things happen when you consider each tool the manifestation of an opinion about a language's faults. When a particular tool becomes *pervasive*, when it has critical mass within a community, you have a very powerful sign that there is an opportunity to make a productive change.

For example, Java IDEs have magnificent support for making certain kind sod automatic refactoring. Even if you'd never seen another programming language, you could look at Eclipse and ask yourself, "what could we do to Java such that this kind of refactoring either wouldn't be necessary or could be done within the language rather than with a tool?"

Perhaps you would independently invent metaprogramming or macros or something else, who knows?

Likewise, people write an awful lot of Markdown with CoffeeScript embedded in it. [Someone might look at this and ask whether CoffeeScript ought to directly embrace Markdown][lc].

[lc]: http://ashkenas.com/literate-coffeescript/

So what tools are pervasive in Ruby? Rails, obviously. But the one that interests me is the Gem ecosystem. People are constantly working on ways to distribute reusable chums of code and handling the dependencies between the various chunks, but these efforts are always built on top of the language, rather than being intrinsic to Ruby itself.

Another that interests me is testing. The community has fallen hard for developing comprehensive automated test suites for applications as well as for libraries/gems. And again, these efforts exist outside of the language itself.

Finally, there is a metric fuckload[^mf] of Ruby code in Github. Today code is considered a moving, malleable thing that changes over time, not a static thing that is built and thereafter is subject to only minor tinkering.

[^mf]: Not to be confused with the "Imperial Fuckload," defined as the cumulative mass of stormtroopers carried aboard a Star Destroyer.

When I step back and look at the situation, it seems reasonable that a language designed in the 1990s wouldn't have much to say about gems, tests, or version control. But it's surprising that as we are moving briskly towards its 20th year, we seem more interested in coroutines and generators than in the things we deal with every day.

### what do gems, tests, and github tell us?

Obviously, the pervasive use of gems and tests tells us that code often has a complex set of dependencies. Github and the versions we find in things like gemfiles tells us that these dependencies change as code changes asynchronously.

Anybody dealing with a non-trivial codebase knows that *coupling* is a serious problem. The Java people have invested greatly in their various XML-driven IOC and DI schemes.

Coupling is more than an annoyance. It's a critical problem today, because when a codebase evolves such that it is difficult or time-consuming to upgrade, or it is fragile and breaks when changes are made to its dependencies, that codebase is very vulnerable to attack if it powers an application on an Intranet or the Internet itself.

Ruby applications need to be easily patched to close zero-day exploits. This is not always the case, and if we do not solve this problem, there will be a sudden exodus towards a language that does.

But the kinds of changes that Ruby--and other mature languages--are making do little to address this critical problem. Everyone's excited about arrows connecting things on a single line of code. We debate promises vs. callbacks and ask whether they ought to be Monads.

This makes sense because these are the things that other languages do well, so mature programming languages are "covering" strong offensive moves.

But new languages don't have large, mature code bases with a heinous mass of dependencies. So new languages don't introduce strong mechanisms to address these problems. And thus languages like Ruby will not gain these features simply by adopting features from the new new shiny thing.

Ruby needs to address such issues itself, by disrupting its own model.

### the prime disruptor: names

As described above, one mechanism for disruption is to drop an existing feature. So here's one we can drop: **The dependence on naming things.**

Naming things has been described as a hard problem. But what if we de-emphasize names? Names are coupling. Names of classes usually like in the global context. Most of the problems with metaprogramming comes because global names introduce global coupling.

Imagine for a moment that we have some kind of *component* in Ruby. What if it doesn't name anything in the global scope? This sounds hard until you remember that in Ruby, a lot of things can be anonymous. Classes and modules can be anonymous if we use constructs like `some_clazz = Class.new` instead of `class SomeClazz`.

If a component "exports" an anonymous class or set of classes, the code making use of the component can mange its namespace. Two different pieces of code can "import" two different components and give them the same name. Or give the same component different names.

You could have a regular `Array` and another that incorporates all the `ActiveSupport` enhancements. If an upgrade to a component breaks some of your old code, you could use the old version with the code that breaks, and use the new version with the code that doesn't break.

Some of this can be accomplished right now with more tooling, but the hardest problems in this area require changes to Ruby's semantics at a deeper level. At the very least, they involve parsing and transpiling Ruby source.

Discarding the dependance on names is one very possible way for Ruby to attack itself.

### bind-by-contract

What about tests and github? We have the idea that different pieces of code could "bind" names to different versions of the same component. What do tests tell us about versions?

Well today, we have the idea of [Semantic Versioning][semvar]. There are revisions that make no changes to the public interface of a component. There are revisions that expand the public interface, but do not change any existing behaviour. And there are versions that break full backwards compatibility by changing existing behaviour.

[semvar]: http://semver.org

This can all be expressed with tests as follows. Just as a component has a public API and a private implementation, we can build two test suites, one that tests the public API and another that tests the private implementation.

Now let's describe revisions in terms of changes to these test suites:

* Some revisions do not change any tests at all.
* Some revisions may be accompanied by changes to the private test suite, but no changes to the public test suite.
* Some revisions may be accompanied by additional public test suite tests, but no changes to any existing tests.
* Some revisions may be accompanied by changes or even the removal of existing public tests.

These descriptions are very similar to the semantic versions, but we are no describing revisions objectively, in terms of the revision's *contracted behaviour*.

Hmmm

### whither version numbers?

What if we throw away version numbers for components? Version numbers are like names, we don't need no stinking names. So how does a piece of code express its requirements on a component? With a test suite, of course. In whatever replaces a gemfile, we can specify test suites.

We can specify the tests the component must pass to work for us. We can specify the component's own tests, and of course we have tests for our own code.

So now when "linking" or "bundling" or whatever-ing our code, the language ought to be able to apply whatever version of a component matches all of the tests we specify for the component and simultaneously does not break our own tests.

Such matching is rote, tedious work. Our language and/or platform should do this for us automatically. Crowd-sourcing this matching in a database of components ought to be a given.

This is all attainable. This is all highly compatible with the way Rubyists are already writing code.

### bind-by-name-and-version -> bind-by-contract

Every idea needs a catch-phrase, so how about "bind-by-contract?" This captures the idea that when we write a piece of code, we used to say that we need `ActiveRecord 3.2`, binding to code by name and version.

But now we will say that we have this "contract," expressed as a set of tests and our tolerance around whether the code can satisfy more or less than these tests. And we wish to bind to something satisfying the contract.

This, in conjunction with the movement away from binding code to global names, will give us some of the tools to manage ever-larger codebases with ever-more-rapidly evolving gems and dependencies.

In an era where we build critical infrastructure that is under perpetual attack and we must handle critical zero-day exploit patches, I feel it's essential to tackle this problem head-on.

And I offer this one idea as an existence proof that there are things we can do. We should think of more things to do, of course. We should think very hard. But we absolutely, positively must not be afraid to reconsider any of the things about our languages that we consider "fundamental."

Thank you for taking the time to read my thoughts on this subject.
