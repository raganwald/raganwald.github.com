---
title: "Eliminating Waste with Lean Software Development"
layout: default
tags: [allonge, noindex]
---

## Introduction: Developing Products Like This

In "[Making sense of MVP (Minimum Viable Product)][mvp]," [Henrik Kniberg] explains the salient distinction between fake-agile and real-agile development by contrasting two ways of developing a product iteratively, *Not Like This* and *Like this*.

[mvp]: http://blog.crisp.se/2016/01/25/henrikkniberg/making-sense-of-mvp
[Henrik Kniberg]: https://www.crisp.se/konsulter/henrik-kniberg

The **Not Like This** way to develop software is to work in increments, each of which represents a portion of what we plan to build. In this way, nothing is expected to be "wasted," since everything we build is a necessary part of the finished work.

---

![Not like this…](/assets/images/not-like-this.png)

*Not Like This…*

---

However, at each step along the way, we have *potential* value, but not realized value: Until the very end, the unfinished work does not actually represent value to the customer. It is not potentially shippable, potentially lovable, or even criticizable.

The *Not Like This* way is often called "fixed scope" development, since its axiomatic assumption is that we know exactly what we want to build, and that there is no value to be had building anything less, or anything else.

### developing products like this

Whereas, the **Like This** way to develop software consists of building an approximation of what we plan to build, then successively refining and adding value to it with each iteration. Much is intentionally "disposable" along the way.

---

![Like This](/assets/images/like-this.png)

*Like This*

---

Unlike the *Not Like This* way, at each step the *Like This* way delivers *realized* value. Each "iteration" is potentially shippable, potentially lovable, and can be usefully critiqued.

The *Like This* way is derived from the principles of [Lean Product Development]. It is often called "variable scope" development, since its axiomatic assumption is that through the process of building and shipping successive increments of value, we will learn more about what we can build to deliver more value.

### engineering like this

All "engineers" building products should appreciate developing products *Like This*, because everyone who builds a product is in the product management business, not just those with the words "product" or "manager" on their business card.

But what about building software from an *engineering* perspective? Can "Lean Product Development" teach us something about engineering?

The answer is that yes, engineering has much to learn from Lean Product Development, although not always in a literal, direct translation. The core of Lean Product Development was derived from the principles of Lean Manufacturing, then practitioners refined and evolved its practices and values from experience.

Software developers have also mined Lean Manufacturing for principles, and the result is a set of principles and values known as [Lean Software Development], or "LSD." LSD can be summarized by seven principles, four of which have direct impacts on engineering decisions:

[Lean Software Development]: https://en.wikipedia.org/wiki/Lean_software_development

1. Eliminate waste
2. Amplify learning
3. Decide as late as possible
4. Deliver as fast as possible

Today, we are going to look at how the principle of eliminating waste can guide our engineering choices. We will focus on engineering to support Lean Product Development, but we will see how we can apply LSD to more traditional fixed scope projects.

---

[![car breaker's yard](/assets/images/banner/car-breakers-yard.jpg)](https://www.flickr.com/photos/picksfromoutthere/14249719506)

*Car breaker's yard, © 2014 Picturepest, [some rights reserved][cc-by-2.0]*

---

## Eliminating Waste

The key principle of LSD is to eliminate waste. **Waste in software development is any work we do that does not contribute to realized value**. It is not limited to coding: Other activities--such as meetings--that do not help the team deliver value are also considered waste.

### wasteful code

Many developers feel that things should be written in such a way that they can be extended without rewriting anything. This is a misguided belief based on a misunderstanding of waste. In fact, a careless pursuit of code that will never be rewritten can actually *create* waste.

Consider our project to build a car: We know from bitter experience that customers are never satisfied with just cars. They often come back and say they want a car that can fly. But if we build a car that cannot fly, we cannot later easily just bolt wings and an engine onto our car-that-was-not-designed-to-fly. We would need to reëngineer our car.

For example, cars contain speedometers that report a single measurement, ground speed in kilometres per hour. The typical mechanism for computing speed uses the rotation of the tires. But aircraft report two measurements, air speed and ground speed. Air speed is typically computed using a pilot tube, while groundspeed is typically computed using triangulation.

Thus, putting an automotive speedometer into our car works when we ship the car, but we must "throw it away" should we decide to build a flying car. So we might decide to get clever, and make a speedometer that uses GPS instead of tire rotation.

But a GPS unit is more expensive and complicated than a tire rotation unit. So from the perspective of shipping a car, a GPS-based speedometer represents wasteful engineering. Deciding to ship a GPS speedometer began by trying to avoid waste in the future, but it ended with creating waste *now*.

Taken to a ridiculous extreme, such thinking will result with us delivering a car that flies:

---

[![The Terrafugia Flying Car](/assets/images/banner/terrafugia.jpg)](https://www.flickr.com/photos/lotprocars/7048759525)

*The Terrafugia Flying Car, © 2012 Steve Cypher, [some rights reserved][cc-by-sa-2.0]*

---

Now this seems like hyperbole, would we *really* deliver a flying car when asked to build a car? But consider that we can easily overbuild a car without bolting wings onto it. Our example was a GPS-based speedometer. But let us consider another way to create engineering waste: We can build our car with excess architecture.

### wasteful architecture

Many engineers, when faced with a car to build, begin by selecting a framework, one that promises us unparalleled flexibility. With a framework in hand we can build cars, trains, or aeroplanes. Plug-ins are provided for cruise ships and hovercrafts. We don't have to actually build wings right now, but it will be so easy to add them later.

Even if we don't add wings now, or use a GPS-based speedometer, the price of such flexibility is that we build our car out of layers of abstraction. We don't write speedometer code directly, we implement `IVelocityGauge` and configure it with an `IDataSource` that is a wheel today but can be a GPS tomorrow.

Everything we do must be done via an abstraction, through a layer of indirection. Such abstractions are a win for framework and library authors, because they allow the framework to serve a wider audience. But each framework user is now paying an abstraction tax.

That abstraction tax is waste, albeit a more hidden waste than using GPS for a speedometer, or bolting wings onto a car. From an engineering perspective, eschewing that waste is lean software development, whether building software in variable scope style (skateboard, scooter, bicycle, motorcycle, car), or in a fixed scope style (wheels, transmission, chassis, car). But when building in either style, the lean software developer eschews hidden or visible waste, building only what is necessary for the most immediate release.

---

[![debt](/assets/images/banner/debt.jpg)](https://www.flickr.com/photos/dreamsjung/4013593640)

*Debt, © 2009 Jason Taellious, [some rights reserved][cc-by-sa-2.0]*

---

### technical debt

Developers easily grasp the notion that developing features we do not need, is wasteful, and that developing with abstractions and layers of indirection we do not need, is also wasteful. But there is another kind of waste that engineers struggle with every day, [technical debt].

Technical debt arises when we optimize for a short term result, making choices that sacrifice the long-term effectiveness of the team. For example, code that is poorly factored may have been quickest to develop in the first place, but subsequent modification and extension is slowed by the presence of anti-patterns such as tightly coupled code, or "God Objects."[^well-actually]

Work we perform to overcome the friction and obstruction of technical debt, is waste.

What makes technical debt a special case is that eliminating the waste of technical debt is often in tension with eliminating architectural waste. If we write code such that it is easy to read by ourselves or others in the future, if we optimize for making it easy to modify and extend, we need more time to write it than if we optimize for making it work now, for the specific use case in front of us.

When faced with a new task, we are tempted to weigh the architectural waste in the present, against the expected future value of the technical debt waste, then "make the calculation" and decide how much architecture will result in the least waste over the lifetime of the code.

This is sensible in theory, but not in practice.

---

[![Junkyard](/assets/images/banner/junkyard.jpg)](https://www.flickr.com/photos/16460291@N06/4732461933)

*Junkyard, © 2010 barz51, [some rights reserved][cc-by-2.0]*

---

### local, global, short-term, long-term

The practical problem with balancing architectural waste on a task against technical debt, is that architectural waste is a *local* and *immediate* concern, while technical debt is a *global* and *long-term* concern.

To illustrate this, let's consider what a feature we are going to implement in JavaScript. We might decide that it is fastest and simplest to write "Vanilla JS" to implement a feature. However, every developer has their own particular idea of what constitutes "Vanilla JS." Thus an application or service written by several different developers, each of whom writes in their personal dialect of "Vanilla JS," can wind up being a hodgepodge of barely compatible piles of code, with much overlap and duplication of functionality, precariously glued together.

That would lead to waste, even though each developer was working to avoid waste.

Given this reality, we might decide that to prevent the outcome being wasteful, we should invest our time learning and implementing an application framework. The framework will impose a standard way to solve many problems, and while we will lose some time on our individual feature, but if everyone programs to the same framework, we'll all eliminate the waste of working with a badly integrated set of idiosyncratic features. Many teams consider this an excellent choice.

Choosing a Framework is a *global* chocie. Obviously, each developer cannot pick their own framework. is a choice that affects every programmer on every team that works with the code base. Frameworks are *global* choices.

Second, let's consider the question of whether to write a particular feature using [bog standard] imperative JavaScript, or to write it in a more functional, immutable data style.

We might reason that the team we have today is familiar with functional programming style, and that an immutable data style will allow the team today to have more confidence in getting a feature written quickly without sacrificing reliability. (Other teams might have a different perspective, but let's go with this one for the sake of argument.)

But we might also fear that in the future, we may have individually moved on to other projects. Will our replacements be as comfortable working with ideas like copy-on-write semantics? If not, we might be shipping faster topday, but creating waste in the future as our new colleagues have to get up to speed on our programming style.

Decisions about programming style, patterns, and paradigms are *long-term* concerns.

As a rule, the tension between eliminating waste in a lean programming fashion and managing technical debt is the tension between optimizing for local, short-term results against optimizing for global, long-term results.

---

[![Recycle](/assets/images/banner/recyle.jpg)](https://www.flickr.com/photos/librariesrock/14937790854)


*Recycle, © 2014 Carol VanHook, [Some rights reserved][cc-by-2.0]

---

### Managing the impedence mismatch between scopes


---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-11-12-eliminating-waste-with-lean-software-development.md) yourself!

---

### notes


[^well-actually]: "Technical debt" isn't an exact metaphor, in that financial debt must nearly always be repaid, and the amount to be repaid is known with certainty. Whereas technical debt might or might not need to be repaid, and the amount of friction caused by technical debt is not know with certainty.

[Lean Product Development]: https://en.wikipedia.org/wiki/Lean_product_development
[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/
[cc-by-sa-2.0]: https://creativecommons.org/licenses/by-sa/2.0/
[technical debt]: https://en.wikipedia.org/wiki/Technical_debt
[bog standard]: http://www.phrases.org.uk/meanings/bog-standard.html
