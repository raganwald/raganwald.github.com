---
title: "Engineering for Lean Product Development"
layout: default
tags: [allonge]
---

## Introduction: Let's Make Software "Like this."

In "[Making sense of MVP (Minimum Viable Product)—and why I prefer Earliest Testable/Usable/Lovable][mvp]," [Henrik Kniberg] explains the salient distinction between fake-agile and real-agile development by contrasting two ways of developing a product, "Not like this…" and "Like this."

[mvp]: http://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp
[Henrik Kniberg]: https://www.crisp.se/konsulter/henrik-kniberg

### not like this…

![Not like this…](/assets/images/not-like-this.png)

The "Not like this…" way to develop software is to work in increments, each of which represents a portion of what we plan to build. In this way, nothing is expected to be "wasted," since everything we build is a necessary part of the finished work.

However, at each step along the way, we have *potential* value, but not realized value: Until the very end, the unfinished work does not actually represent value to the customer. It is not potentially shippable, potentially lovable, or even criticizable.

### like this

![Like this…](/assets/images/like-this.png)

Whereas, the "Like this" way to develop software consists of building an approximation of what we plan to build, then successively refining and adding value to it with each iteration. Much is intentionally "disposable" along the way.

Unlike the "Not like this…" way, at each step the "Like this" way delivers *realized* value. Each "iteration" is potentially shippable, potentially lovable, and can be usefully critiqued.

The "Like this" way is derived form the principles of [Lean Product Development].

[Lean Product Development]: https://en.wikipedia.org/wiki/Lean_product_development

### engineering like this

All "engineers" building products should appreciate the "Like this" way from a product perspective, because everyone who builds a product is in the product management business, not just those with the words "product" or "manager" on their business card.

But what about building software from an *engineering* perspective? How can we design software to facilitate building things the "Like this" way?

## Lean Software Development

Let's begin by reviewing the seven principles of [Lean Software Development]. Lean Software Development (or "LSD")[^lsd] is a translation of lean manufacturing and lean IT principles and practices to the software development domain. LSD can be summarized by seven principles, four of which have direct impacts on technical decisions:

[Lean Software Development]: https://en.wikipedia.org/wiki/Lean_software_development
[^lsd]: No relationship whatsoever to [Lysergic acid diethylamide][lsd]
[lsd]: https://en.wikipedia.org/wiki/Lysergic_acid_diethylamide

[![Lysergic acid diethylamide](/assets/images/lsd.png)][lsd]

1. Eliminate waste
2. Amplify learning
3. Decide as late as possible
4. Deliver as fast as possible

### eliminating waste

The key principle of LSD is to *eliminate waste*. But we have to be more specific, otherwise it becomes an empty cliché. For example, waste includes "Partially done coding eventually abandoned during the development process." In our "Not like this…" example, we build a skateboard, then attached handlebars to make it a scooter. Then we abandoned the deck and built a bicycle. Did we waste work by building a skateboard and a scooter before starting from scratch to build a bicycle?

From an engineering perspective, the construction of the skateboard and scooter are not wasted if they are not *abandoned*. By "abandoned," we mean discarded without producing value. In product development, if we ship the skateboard to customers today, we gain money (if we can charge for it), goodwill, and/or feedback about customer needs now, knowledge. Thus, the skateboard does not represent "waste."

How about the "Not like this…" practise of building wheels, then a transmission, then a chassis? In this case, every artefact of production makes it to the finished work, so we can assure ourselves that nothing is wasted. A product manager would say that the skateboard provides more value than the chassis of an unfinished car, but from an *engineering* perspective, neither are wasteful.

What *is* wasteful from an engineering perspective is when we *overbuild* the car. The illustrations provided show us building wheels, a transmission, and then a chassis. We build just enough to construct the finished car, and no more.

![Flying car](/assets/images/flying-car.jpg)

However, sometimes we are faced with the option to build the car from a framework. The framework promises us unparalleled flexibility, we can build cars, trains, or aeroplanes. Plug-ins are provided for cruise ships and hovercrafts. Or we can build a car that flies! Maybe we will want to build wings later? Our car is designed to take wings if we need them. "For free," just use the framework. But many of the parts in the car are no longer designed just for our application. And when we work with our framework, we are always working with one or more indirections between our code and the car.

The framework eases our work in many areas, but also encumbers us with additional abstractions. Those abstractions are a win for framework authors, because they make the framework applicable to more use cases. But we are only building a car. For us, all the extra knowledge we need about the framework are a waste with respect to building this one car.

When we use or construct abstractions that are designed to do more than just what we need for this one car, we are creating waste. So while the lean software developer can be agnostic about whether to build the car in a lean product style or not, even when building wheels, then a transmission, then a chassis, the lean software developer eschews the waste of unnecessary abstraction and indirections.

---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-11-12-engineering-for-lean-product-development.md) yourself!

---

### notes
