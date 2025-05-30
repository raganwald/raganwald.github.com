---
layout: default
quote: "Thanks for posting this, great stuff..."
quoteauthor: Mark Watson
published: true
---

In software development, we talk a lot about software anti-patterns, how to recognize them, and how to extricate yourself from them via refactoring.

> An **anti-pattern** is a common response to a recurring problem that is usually ineffective and risks being highly counterproductive. The term, coined in 1995 by computer programmer [Andrew Koening], was inspired by the book [Design Patterns], which highlights a number of design patterns in software development that its authors considered to be highly reliable and effective.

[Andrew Koening]: https://en.wikipedia.org/wiki/Andrew_Koenig_(programmer)
[Design Patterns]: https://en.wikipedia.org/wiki/Design_Patterns_(book)

> The term was popularized three years later by the book [AntiPatterns], which extended its use beyond the field of software design to refer informally to any commonly reinvented but bad solution to a problem.

[AntiPatterns]: https://en.wikipedia.org/wiki/AntiPatterns

Anti-patterns occur throughout businesses, not just in software code and architecture. One famous business anti-pattern is the [Osborne Effect], which is when a company pre-announces a future product that will obsolete the product line it’s selling today.

Customers take notice and cancel their orders for the current product, waiting for the wonderful future in the company's marketing brochure. This stalls the company's momentum, kills the company's revenue, and in extreme cases, drives it right out of business.

But the Osborne Effect isn’t just a marketing and sales anti-pattern. It’s also a product management anti-pattern, the **Inner Osborne Effect**.

[Osborne Effect]: https://en.wikipedia.org/wiki/Osborne_effect

---

<center><img src="/assets/images/retro-futurism-city.jpg"></center>

---

# The Product of Tomorrow

I worked for two different companies who inflicted the Inner Osborne Effect on themselves, and both did so in theatrically dramatic ways. Pull up a pew, I’ll describe what happened, and how it became a disaster. The following story is a mashup inspired by both sets of circumstances, with some artistic license taken.

Our semi-fictitious company began its life as a scrappy startup selling into mid- to enterprise-sized customers. It found early success, and powered by its sales-led revenues, grew to dominate its niche. Driven by closing deals, its long-term development was constantly derailed by “fire drills” to ship new features that were alleged to be keys to closing big contracts, or by bug fixes driven by whichever customer complained the loudest at contract renewal time.

Tech debt piled on faster than pounds at an all-you-can-eat pancake breakfast. Development velocity slowed, which increased the urgency of shipping features at the expense of writing quality code or refactoring existing problem code.

But there was another threat looming:

Because of the company’s success, each sale was paradoxically getting harder to make. It had already plucked the low-hanging fruit in its niche, so the remaining customers were those who had less of a fit for the company’s product. And each new feature generated less net new revenue than the preceding features, because with fewer customers remaining in the niche, each new feature unlocked a proportionally smaller share of net new revenue.

If the company was to continue to grow, It needed to escape its niche with a bold new effort.

---

<center><img src="/assets/images/vp-marketing.jpg"></center>

---

## Lumburgh

By this time, trust between the C-Suite and Engineering was at an all-time low. The executives didn’t understand why bugs were climbing and velocity was dropping. The [Director of Engineering][raganwald] was articulate in explaining exactly what was going on, but Lumburgh, the VP of Marketing, would always interject with “Poppycock! Back when I worked at FamousCo, we had none of these problems!”

[raganwald]: https://raganwald.com

The C-Suite were receptive when Lumburgh approached them on the sly. “I can start a skunkworks, remotely, under my direct command, to build **The Product of Tomorrow**. It will be [both a floor wax _and_ a dessert topping][shimmer]!”

[shimmer]: https://www.youtube.com/watch?v=wPO8PqHGWFU

Engineering was strictly fire-walled off from The Product of Tomorrow Team, which would emerge from stealth RealSoonNow™️ to replace everything Engineering was working on today.

How did the engineers feel about this? They were already demoralized by the feature factory mindset. They had been complaining forever that if they weren’t given the time to build the product right, they’d never find the time to build it over, and now they felt punished for management’s choice to ignore their warnings.

Resignations followed, first a trickle, then a flow.

Meanwhile, the company's Product Management group was in chaos. Every time they wanted to build something, they’d be stopped with “Hold up, that will be half the cost and twice the value with the Product of Tomorrow!”

The current product was eventually put on life support, because senior management had neither the will, nor the resources, to do anything except fix bugs while waiting for the Product of Tomorrow.

---

<center><img src="/assets/images/wizard-of-oz.jpg"></center>

---

## Whither The Product of Tomorrow?

I was long gone by the time the Product of Tomorrow was killed. Yes, the Product of Tomorrow failed, and the Inner Osborne Effect took the existing product with it. The Product of Tomorrow turned out to be demo-ware, carefully crafted to look good in front of the CEO, but lacked essential features “under the hood.”

The central cause of the failure was another anti-pattern, **CEO as Customer**. And it turns out that a company that can’t invest in the quality of its mainline product, won’t invest in the quality of its replacement, either. That’s a management anti-pattern, and starting over with new people and a blank piece of paper doesn’t change management. Only management can change management.

---

<center><img src="/assets/images/messagepad-100.jpg"></center>

---

## From Osborne 1 to MessagePad 100

But getting back to our company and its executives, the problem wasn't that the executives bet on the Product of Tomorrow, but that they also _announced to its Engineering and Product Management groups that they were betting everything on the Product of Tomorrow_. And then they followed through by obstructing any attempt by Engineering or Product Management to invest in the original product.

Compare and contrast this approach with Apple, who having succeeded with Apple II, went on to make big bets on Apple III, Lisa, Macintosh, Newton, iPhone, and iPad.

Apple III and Lisa failed. Macintosh was underpowered and overpriced on launch. But Apple continued to invest in Apple II, which financed investing in Macintosh, which became its future. Macintosh financed betting on Newton, which failed, and iPhone, which succeeded. Now Apple's betting on AppleTV, iPad and Apple Watch, which are "nice little businesses" compared to iPhone. iPad Pro is close to displacing Macintosh, but Apple is famouly tight-lipped about its visions of the future, and only [once][pink]—to my knowledge—made the grevious mistake of inflicting the Inner Osborne Effect on itself.

[pink]: https://en.wikipedia.org/wiki/Taligent#Development

Could the Product of Tomorrow have succeeded? Maybe. But following Apple's example, the way to do that would have been to make it fully independent, and continue to build the existing product as if the plans for the Product of Tomorrow did not exist. Call the Product of Tomorrow “research.” Or an “experiment.” Locate its team in [Texaco Towers]. But don’t call it the future that will obsolete the present. And especially don't respond to that by choking all progress on the cash cow that is financing the company's bets.

[Texaco Towers]: https://www.folklore.org/StoryView.py?story=Texaco_Towers.txt

### post scriptum

_The Obsborne Effect was not the sole cause of the failure of the Osborne Computer Company, and the Inner Osborne Effect I described above wasn’t the sole cause of either source company's failures. But both companies would have had a fighting chance to succeed had they not pre-announced that they were going all-in on an all-singing, all-dancing piece of vapourware built outside of their core product development groups._
