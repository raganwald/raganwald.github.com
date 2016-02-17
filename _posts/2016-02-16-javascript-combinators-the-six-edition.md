---
title: "JavaScript Combinators, the 'six' edition"
layout: default
tags: [allonge, noindex]
---

### foreword

![](/assets/images/combinators/title.png)

This talk was given at [NDC London](http://ndc-london.com) on January 13, 2016. This is not a literal transcript: A selection of [the original slides](https://speakerdeck.com/raganwald/javascript-combinators-the-six-edition) are shown here, along with some annotations explaining the ideas presented.

You can also [watch the full talk][vimeo] online.

[vimeo]: https://vimeo.com/153097877

---

# Part I: The Basics

![](/assets/images/combinators/intro-1.png)

In 2014, I gave a talk about [JavaScript Combinators](https://vimeo.com/97408202) at NDC Oslo. Combinators are first-class functions that give us simple and powerful ways to take functions and combine them togther.

When it's easy to combine functions, that encourages us to write smaller, single-responsibility functions, and that leads to cleaner, well-factored software architecture. We're going to look at decomposing functions into smaller, simplere functions. And we'll also look at how combinators help us compose functions in rich ways.

![](/assets/images/combinators/intro-2.png)



---

### image credits

[https://www.flickr.com/photos/fatedenied/7335413942](https://www.flickr.com/photos/fatedenied/7335413942)
[https://www.flickr.com/photos/fatedenied/7335413942](https://www.flickr.com/photos/fatedenied/7335413942)
[https://www.flickr.com/photos/mwichary/2406482529](https://www.flickr.com/photos/mwichary/2406482529)
[https://www.flickr.com/photos/tompagenet/8580371564](https://www.flickr.com/photos/tompagenet/8580371564)
[https://www.flickr.com/photos/ooocha/2869485136](https://www.flickr.com/photos/ooocha/2869485136)
[https://www.flickr.com/photos/oskay/2550938136](https://www.flickr.com/photos/oskay/2550938136)
[https://www.flickr.com/photos/baccharus/4474584940](https://www.flickr.com/photos/baccharus/4474584940)
[https://www.flickr.com/photos/micurs/4906349993](https://www.flickr.com/photos/micurs/4906349993)
[https://www.flickr.com/photos/purdman1/2875431305](https://www.flickr.com/photos/purdman1/2875431305)
[https://www.flickr.com/photos/daryl_mitchell/15427050433](https://www.flickr.com/photos/daryl_mitchell/15427050433)
[https://www.flickr.com/photos/the00rig/3753005997](https://www.flickr.com/photos/the00rig/3753005997)
[https://www.flickr.com/photos/robbie1/8656027235](https://www.flickr.com/photos/robbie1/8656027235)
[https://www.flickr.com/photos/mwichary/2406489333](https://www.flickr.com/photos/mwichary/2406489333)
[https://www.flickr.com/photos/pedrosimoes7/17386505158](https://www.flickr.com/photos/pedrosimoes7/17386505158)
[https://www.flickr.com/photos/a-barth/2846621384](https://www.flickr.com/photos/a-barth/2846621384)
[https://www.flickr.com/photos/mleung311/9468927282](https://www.flickr.com/photos/mleung311/9468927282)
[https://www.flickr.com/photos/bludgeoner86/5590795033](https://www.flickr.com/photos/bludgeoner86/5590795033)
[https://www.flickr.com/photos/49024304@N00/](https://www.flickr.com/photos/49024304@N00/)
[https://www.flickr.com/photos/29143375@N05/4575806708](https://www.flickr.com/photos/29143375@N05/4575806708)
[https://www.flickr.com/photos/30239838@N04/4268147953](https://www.flickr.com/photos/30239838@N04/4268147953)
[https://www.flickr.com/photos/benetd/4429314827](https://www.flickr.com/photos/benetd/4429314827)
[https://www.flickr.com/photos/shimgray/2811100997](https://www.flickr.com/photos/shimgray/2811100997)
[https://www.flickr.com/photos/wordridden/4308645407](https://www.flickr.com/photos/wordridden/4308645407)
[https://www.flickr.com/photos/sidelong/18620995913](https://www.flickr.com/photos/sidelong/18620995913)
[https://www.flickr.com/photos/stawarz/3848824508](https://www.flickr.com/photos/stawarz/3848824508)
[https://www.flickr.com/photos/mwichary/3338901313](https://www.flickr.com/photos/mwichary/3338901313)

### notes
