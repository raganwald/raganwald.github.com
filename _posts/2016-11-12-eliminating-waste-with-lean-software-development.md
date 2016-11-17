---
title: "Eliminating Waste with Lean Software Development"
layout: default
tags: [allonge]
---

## Introduction: Developing Products Like This

In "[Making sense of MVP (Minimum Viable Product)][mvp]," [Henrik Kniberg] explains the salient distinction between fake-agile and real-agile development by contrasting two ways of developing a product, *Not Like This* and "Like this."

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

[Lean Product Development]: https://en.wikipedia.org/wiki/Lean_product_development

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

[![car breaker's yard](/assets/images/car-breakers-yard.jpg)](https://www.flickr.com/photos/picksfromoutthere/14249719506)

## Eliminating Waste

The key principle of LSD is to eliminate waste. **Waste in software development is any work we do that does not contribute to realized value**. It is not limited to coding: Other activities--such as meetings--that do not help the team deliver value are also considered waste.

### wasteful code

Many developers feel that things should be written in such a way that they can be extended without rewriting anything. This is a misguided belief based on a misunderstanding of waste. In fact, a careless pursuit of code that will never be rewritten can actually *create* waste.

Consider our project to build a car: We know from bitter experience that customers are never satisfied with just cars. They often come back and say they want a car that can fly. But if we build a car that cannot fly, we cannot later easily just bolt wings and an engine onto our car-that-was-not-designd-to-fly. We would need to reëngineer our car.

For example, cars contain speedometers that report a single measurement, ground speed in kilometres per hour. The typical mechanism for computing speed uses the rotation of the tires. But aircraft report two measurements, air speed and ground speed. Air speed is typically computed using a pilot tube, while groundspeed is typically computed using triangulation.

Thus, putting an automotive speedometer into our car works when we ship the car, but we must "throw it away" should we decide to build a flying car. So we might decide to get clever, and make a speedometer that uses GPS instead of tire rotation.

But a GPS unit is more expensive and complicated than a tire rotation unit. So from the perspective of shipping a car, a GPS-based speedometer represents wasteful engineering. Deciding to ship a GPS speedometer began by trying to avoid waste in the future, but it ended with creating waste *now*.

Taken to a ridiculous extreme, such thinking will result with us delivering a car that flies:

---

[![The Terrafugia Flying Car](/assets/images/terrafugia.jpg)](https://www.flickr.com/photos/lotprocars/7048759525)

*The Terrafugia Flying Car, © 2012 Steve Cypher, [some rights reserved][cc-by-sa-2.0]*

---

Now this seems like hyperbole, would we *really* deliver a flying car when asked to build a car? But consider that we can easily overbuild a car without bolting wings onto it. Our example was a GPS-based speedometer. But let us consider another way to create engineering waste: We can build our car with excess architecture.

### wasteful architecture

Many engineers, when faced with a car to build, begin by selecting a framework, one that promises us unparalleled flexibility. With a framework in hand we can build cars, trains, or aeroplanes. Plug-ins are provided for cruise ships and hovercrafts. We don't have to actually build wings right now, but it will be so easy to add them later.

Even if we don't add wings now, or use a GPS-based speedometer, the price of such flexibility is that we build our car out of layers of abstraction. We don't write speedometer code directly, we implement `IVelocityGauge` and configure it with an `IDataSource` that is a wheel today but can be a GPS tomorrow.

Everything we do must be done via an abstraction, through a layer of indirection. Such abstractions are a win for framework and library authors, because they allow the framework to serve a wider audience. But each framework user is now paying an abstraction tax.

That abstraction tax is waste, albeit a more hidden waste than using GPS for a speedometer, or bolting wings onto a car. From an engineering perspective, eschewing that waste is lean software development, whether building software in variable scope style (skateboard, scooter, bicycle, motorcycle, car), or in a fixed scope style (wheels, transmission, chassis, car). But when building in either style, the lean software developer eschews hidden or visible waste, building only what is necessary for the most immediate release.

---

[![debt](/assets/images/debt.jpg)](https://www.flickr.com/photos/dreamsjung/4013593640)

*Debt, © 2009 Jason Taellious, [some rights reserved][cc-by-sa-2.0]*

---

### waste and technical debt

---

[![Four in a row](/assets/images/four-in-a-row.jpg)](https://www.flickr.com/photos/seenbychris/5603331883)

*Four in a row, © 2011 Chris Parker, [some rights reserved][cc-by-sa-2.0]*

[cc-by-sa-2.0]: https://creativecommons.org/licenses/by-sa/2.0/

---

### placeholder: wasteful communications

Engineers often resist attending meetings, reasoning that they are a waste of time that could be spent more productively. They are usually correct about this: It is much faster and more accurate to read written communications, than to listen to a spoken presentation.

Some companies go well out of their way to avoid meetings, emphasizing asynchronous communications tools, and report very good results.

But there is another, more insidious type of wasteful aspect of communication. No matter how effectively Alice writes, and no matter how good Bob is at reading and reasoning about what is read, any communication from Alice to Bob about something Alice knows is going to "lose something in translation." Communication in all forms involves some loss of fidelity. We simply cannot achieve 100% knowledge transfer.

Is this tax on knowledge transfer engineering waste? It is when it affects the quality or quantity of value we can deliver within an iteration or project.

Consider the classic whipping-boy of project management, the "throw-it-over-the-wall" method of delivering requirements to engineering. In this model, one team, headed by Alan, researches requirements and may even specific the solution in the form of mockups and specifications, while another team, headed by Barbara, implements the specifications.

The "knowledge" is then "thrown over the wall" as a monolithic, one-time communication from Alan's team to Barbara's team.

---

### placeholder: amplify learning

In our *Like This* example, we build a skateboard, then attach handlebars to make it a scooter, then we abandon the deck and build a bicycle. Are we wasting work by throwing away our skateboard and scooter when we start again from scratch to build a bicycle?

From an engineering perspective, the construction of the skateboard and scooter are not wasted if they are not *abandoned*. By "abandoned," we mean discarded without producing value. In product development, if we ship the skateboard to customers today, we gain money (if we can charge for it), goodwill, and/or feedback about customer needs now, knowledge. Thus, the skateboard does not represent "product waste." Writing software that realizes value is not wasteful.

---

[![Wright Brothers Unpowered Prototype](/assets/images/wright-brothers.jpg)](https://www.flickr.com/photos/tjc/324416163)

*Wright Brothers Unpowered Prototype, © 2006 Timothy J, [some rights reserved][cc-by-2.0]*

[cc-by-2.0]: https://creativecommons.org/licenses/by/2.0/

---

What if we don't deliver the skateboard to customers?

The Wright Brothers famously built many models and prototypes, then tested them to gather knowledge that enabled them to leapfrog their competitors and become the first to achieve heavier-than-air flight. If a team builds a skateboard, and learns something from the skateboard that contributes to a subsequent release that realizes value, then the skateboard generated potential value.

From a variable scope perspective, the skateboard is valuable if it teaches the team something about the needs of customers. In other words, if the team can learn something about the scope. Thus, it needs to make contact with a customer (or customer surrogate such as a product manager).

From an engineering perspective, the skateboard is valuable if it teaches the team something about transportation engineering. In a variable scope, "Like This" project, it is sometimes possible to create an incremental release that helps the team learn about the product and about the engineering.

### lean iterative development

From the above, we infer that iterations are valuable to engineering if they teach the team something. We do not leave this to chance, of course. The best way to learn something from an iteration is to treat it as an *experiment*, rather than as a set of requirements to be fulfilled.

A simple way to accomplish this is to articulate a question the development of the iteration is intended to answer, and to articulate the value that answering the question will confer on the team.

When developing a skateboard, a hypothetical product question might be, "Will people pay for saving time on urban travel?" A hypothetical engineering question might be, "What are the minimum dimensions of the wheel layout to provide acceptable stability for vehicles in real-world conditions?"

Engineering should articulate what the team intends to learn from an iteration before designing and implementing the code, and circle back to the intended learning as part of the iteration retrospective.

With this practise, engineering can support both fixed and variable scope practises. A transmission with four wheels is a valuable *engineering* iteration, provided the team learns something. Even better, a scooter can be a valuable product *and* engineering iteration.

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-11-12-engineering-for-lean-product-development.md) yourself!

---

### notes
