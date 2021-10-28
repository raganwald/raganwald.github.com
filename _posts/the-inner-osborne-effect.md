---
layout: default
published: true
---

In software development, we talk a lot about software anti-patterns, how to recognize them, and how to extricate yourself from them via refactoring.

> An **anti-pattern** is a common response to a recurring problem that is usually ineffective and risks being highly counterproductive. The term, coined in 1995 by computer programmer [Andrew Koening], was inspired by the book [Design Patterns], which highlights a number of design patterns in software development that its authors considered to be highly reliable and effective.

[Andrew Koening]: https://en.wikipedia.org/wiki/Andrew_Koenig_(programmer)
[Design Patterns]: https://en.wikipedia.org/wiki/Design_Patterns_(book)

> The term was popularized three years later by the book [AntiPatterns], which extended its use beyond the field of software design to refer informally to any commonly reinvented but bad solution to a problem.

[AntiPatterns]: https://en.wikipedia.org/wiki/AntiPatterns

One famous business anti-pattern is “To Osborne yourself,” which is to pre-announce something will obsolete the thing you’re selling today, thus killing your revenue and driving you out of business. But the [Osborne Effect] isn’t just a marketing and sales anti-pattern. It’s also a product management anti-pattern.

[Osborne Effect]: https://en.wikipedia.org/wiki/Osborne_effect

---

# The Story of Product 2.0

I have personally worked for two companies who “Osborned themselves” internally. Pull up a pew, and I’ll tell you all about what we did, and how it became a disaster. Both cases worked roughly along the following lines:

Our semi-fictitious company began its life as a scrappy startup selling into mid- to enterprise-sized customers. It found early success, and powered by its sales-led revenues, grew to dominate its niche. Driven by closing deals, its long-term development was constantly derailed by “fire drills” to ship new features that were alleged to be keys to closing big contracts, or by bug fixes driven by whichever customer complained the loudest at contract renewal time.

Tech debt piled on faster than pounds at an all-you-can-eat pancake breakfast. Development velocity slowed, which increased the urgency of shipping features at the expense of writing quality code or refactoring existing problem code.

But there was another threat looming:

Because of the company’s success, each sale was paradoxically getting harder to make. It had already plucked the low-hanging fruit in its niche, so the remaining customers were those who had less of a fit for the company’s product. And each new feature generated less net new revenue than the preceding features, because with fewer customers remaining in the niche, each new feature unlocked a proportionally smaller share of net new revenue.

If the company was to continue to grow, It needed to escape its niche with a bold new effort. It needed Product 2.0.

---

![The VP of Marketing](/assets/images/vp-marketing.jpg)

## Enter the VP of Marketing

By this time, trust between the C-Suite and Engineering was at an all-time low. The executives didn’t understand why bugs were climbing and velocity was dropping. The Director of Engineering was articulate in explaining exactly what was going on, but the VP of Marketing would always interject with “Poppycock! Back when I worked at FamousCo, we had none of these problems!”

The C-Suite were receptive when approached on the sly by the VP of Marketing. “I can start a skunkworks, remotely, under my direct command, to build Product 2.0. It will be [a floor wax _and_ a dessert topping][shimmer]!”

[shimmer]: https://www.youtube.com/watch?v=wPO8PqHGWFU

Engineering was strictly fire-walled off from Product 2.0, which would one day emerge from stealth to replace everything Engineering was working on.

How, do you imagine, did the engineers feel about this?

Engineering were already demoralized by the feature factory mindset. They had been complaining forever that if they weren’t given the time to build the product right, they’d never find the time to build it over, and now they felt punished for management’s choice to ignore their warnings.

Resignations followed, first a trickle, then a flow.

Meanwhile, product management was in chaos. Every time they wanted to build something, they’d be stopped with “Hold up, that will be half the cost and twice the value with Product 2.0!” The product was eventually put on life support, because it had neither the will, nor the resources, to do anything except fix bugs while waiting for Product 2.0.

---

![The man behind the curtain](/assets/images/wizard-of-oz.jpg)

## Whither Product 2.0?

In both cases, I was long gone by the time Product 2.0 was killed. Yes, in each case, Product 2.0 failed, and took Product 1.0 and the company with it. In each case, Product 2.0 turned out to be demo-ware, carefully crafted to look good in front of the CEO, but lacked essential features “under the hood.”

The central cause of Product 2.0 failing is another anti-pattern, one I call “CEO as Customer.” And it turns out that a company that can’t invest in the quality of its mainline product, won’t invest in the quality of its replacement, either.

That’s a management anti-pattern, and starting over with new people and a blank piece of paper doesn’t change management. Only management can change management.

---

![The Osborne 1](/assets/images/osborne-1.jpg)

## Osborne, again

But getting back to Product 1.0, the problem was the company not just betting on Product 2.0, and mismanaging Product 2.0, but **announcing that it was betting on Product 2.0**. The company Osborned itself.

Could Product 2.0 have succeeded? Maybe.

But if it would succeed as a “skunkworks,” the way to do that would have been to make it fully independent, and continue to build Product 1.0 as if 2.0 did not exist.

Call Product 2.0 “research.” Or an “experiment.” But don’t call it the future.

---

## post scriptum

The “Obsborne Effect” was not the sole cause of the failure of the Osborne Computer Company, and the internal “Osborne Effect” I experienced twice wasn’t the sole cause of failure either.

But I believe that in both cases I experienced, the company would have had a fighting chance to succeed had it not pre-announced that it was going all-in on an all-singing, all-dancing piece of vapourware built outside of its core product development group.
