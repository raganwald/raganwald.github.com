---
title: "Engineering for Lean Product Development"
layout: default
tags: [allonge]
---

## Introduction: Let's Make Software "Like this."

In "[Making sense of MVP (Minimum Viable Product)—and why I prefer Earliest Testable/Usable/Lovable][mvp]," [Henrik Kniberg] explains the salient distinction between fake-agile and real-agile development by contrasting two ways of developing a product, *Not Like This* and "Like this."

[mvp]: http://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp
[Henrik Kniberg]: https://www.crisp.se/konsulter/henrik-kniberg

### not like this…

![Not like this…](/assets/images/not-like-this.png)

The *Not Like This* way to develop software is to work in increments, each of which represents a portion of what we plan to build. In this way, nothing is expected to be "wasted," since everything we build is a necessary part of the finished work.

However, at each step along the way, we have *potential* value, but not realized value: Until the very end, the unfinished work does not actually represent value to the customer. It is not potentially shippable, potentially lovable, or even criticizable.

### like this

![Like this…](/assets/images/like-this.png)

Whereas, the *Like This* way to develop software consists of building an approximation of what we plan to build, then successively refining and adding value to it with each iteration. Much is intentionally "disposable" along the way.

Unlike the *Not Like This* way, at each step the *Like This* way delivers *realized* value. Each "iteration" is potentially shippable, potentially lovable, and can be usefully critiqued.

The *Like This* way is derived form the principles of [Lean Product Development].

[Lean Product Development]: https://en.wikipedia.org/wiki/Lean_product_development

### engineering like this

All "engineers" building products should appreciate the *Like This* way from a product perspective, because everyone who builds a product is in the product management business, not just those with the words "product" or "manager" on their business card.

But what about building software from an *engineering* perspective? How can we design software to facilitate building things the *Like This* way?

## Lean Software Development

Let's begin by reviewing the seven principles of [Lean Software Development]. Lean Software Development (or "LSD")[^lsd] is a translation of lean manufacturing and lean IT principles and practices to the software development domain. LSD can be summarized by seven principles, four of which have direct impacts on technical decisions:

[Lean Software Development]: https://en.wikipedia.org/wiki/Lean_software_development
[^lsd]: No relationship whatsoever to [Lysergic acid diethylamide][lsd]
[lsd]: https://en.wikipedia.org/wiki/Lysergic_acid_diethylamide

1. Eliminate waste
2. Amplify learning
3. Decide as late as possible
4. Deliver as fast as possible

### eliminating waste

The key principle of LSD is to *eliminate waste*. Waste includes "Partially done coding eventually abandoned during the development process." In our *Like This* example, we build a skateboard, then attach handlebars to make it a scooter, then we abandon the deck and build a bicycle. Are we wasting work by building a skateboard and a scooter before starting again from scratch to build a bicycle?

From an engineering perspective, the construction of the skateboard and scooter are not wasted if they are not *abandoned*. By "abandoned," we mean discarded without producing value. In product development, if we ship the skateboard to customers today, we gain money (if we can charge for it), goodwill, and/or feedback about customer needs now, knowledge. Thus, the skateboard does not represent "product waste." Writing software that realizes value is not wasteful.

Many developers fetishize the idea that somehow, code should never be deleted, that things should be written in such a way that they can be extended without rewriting anything. This is a misguided practice based on a misunderstanding of waste. And in their pursuit of code that will never be rewritten, they actually *create* waste. Imagine, for a moment, that we set out to build a car.

But we know from experience that customers are never satisfied with cars. They often come back and say they want a car that can fly. But if we build a car that cannot fly, we cannot bolt wings on after the fact, we would need to reëngineer our car. We need to design the car from the start to allow wings, that will eliminate the pesky waste of building a car, then rebuilding it to fly.

So we deliver this, a car that flies:

![Flying car](/assets/images/flying-car.jpg)

*Definitely not like this*

Now there is zero doubt that all the features for making the car fly—its shape, its lightweight construction, its wings—are waste. They may or may not be wanted in the future, but they are *unnecessary* for satisfying the requirement of delivering a car. In the absence of a stated need for flying, we are building functionality that when shipped, has zero value. That is engineering waste.

Now this seems very funny, we would never deliver a flying car. But consider that we can easily overbuild a car without bolting wings onto it. We can build it with a framework, one that promises us unparalleled flexibility, we can build cars, trains, or aeroplanes. Plug-ins are provided for cruise ships and hovercrafts. We don't have to actually build wings right now, but it will be so easy to add them later.

The price of such flexibility is that we build our car out of layers of abstraction. You can't just write a speedometer directly, you must implement `IVelocityGauge` and configure it to deal with kilometers per hour instead of knots. Abstractions are a win for framework and library authors, because they allow the framework to serve a wider audience. But each framework user is now paying an abstraction tax.

When we use or construct abstractions that are designed to do more than just what we need for this one car, we are creating waste. So while the lean software developer can be agnostic about whether to build the car in a lean product style or not, even when building wheels, then a transmission, then a chassis, the lean software developer eschews the waste of unnecessary abstraction and indirections.

Thus, the lean software developer can build software in a lean product style (skateboard, scooter, bicycle, motorcycle, car), or in a big design up front style (wheels, transmission, chassis, car). But when building in either style, the lean software developer eschews hidden or visible waste, building only what is necessary for the most immediate release.

---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-11-12-engineering-for-lean-product-development.md) yourself!

---

### notes
