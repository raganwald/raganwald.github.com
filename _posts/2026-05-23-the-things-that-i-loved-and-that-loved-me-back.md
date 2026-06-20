---
title: The Things That I Loved, That Also Loved Me Back
published: true
tags:
  - noindex
---

[![Gerrit Thomas Rietveld, Chauffeur’s workhome, ©Pedro Kok](/assets/de-stijl/gerrit-rietveld-chauffeur-house-pedro-kok-3.jpg.webp)](https://marcelogardinetti.wordpress.com/2013/01/07/gerrit-rietveld-casa-del-chofer/#jp-carousel-2644)
*Gerrit Thomas Rietveld, Chauffeur’s workhome, ©Pedro Kok*

> Gratitude turns what we have, into enough.

## Threadalyzer

In the mid-nineties, I needed a change from software consulting for the Financial Servcies vertical, and looked for work with a real software development company. I interviewed in The Valley, I even got an offer from SalesForce that I turned down. But I chose a small-ish Toronto company called KL Group that made comnponents for Java. The VP of Software Development explained that their NextBigThing™️ was to build tools for Java development, as the tooling in those early days was wholly inadequate for serious work.

I was hired, given the title of "technical Product Manager," and the CTO handed me two stacks of physical papers. One was a stack of résumés from other people they interviewed. The other was a stack of research papers and theses relating to the analysis of concurrent software execution. The job was to hire a team, then design, build, and ship a tool that would monitor running Java applications and report on various concurrency problems such as data races and of course, deadlocks.

We were not aware of any existing products like this, so I started with those two stacks and a blank piece of paper. The first hire was easy: After reading the research, I looked at the résumés for people who might be a good fit for the work. A fellow named Christian Jaekl was an easy hire: His résumé was in one pile, and his Master's Thesis in CS was in the other! Another easy hire was a C++ wizard named John MacMillan, and we were off to the races.

We ended up building something like a concurrency linter. We licensed the Java Runtime from Sun, instrumented it in some places, and wrote a byte-code "mongler" that inserted JNI calls for the things we couldn't get from instrumenting the runtime or using its primitive interfaces. It was extremely gratifying to build a new kind of programming tool from a blank piece of paper, and I'll never forget that exileration.

As these things go, that wasn't the only innovation for its time. My counterpart on the product side was Alan Armstrong, who was an Engineer that had gone into marketing just as I had been a salesperson who went into software development. It was difficult for the company to reliably ship software using new technologies and developing new kinds of products. Together, we flew to The Valley to take courses in the new field of software product management, and we also hit upon a primitive version of what we now call "Agile" as the right way to build. 

It took all of our combined sales skills to wall off our team from the way the rest of the org worked, but we got the green light and set up shop like the original Macintosh Rebels in a closely shared space with pot-it notes all over the wall of my corner to track our work. We also architected the product in novel—for that org at that time—ways.

The user experience was written in Java Swing and ran on the desktop. The tooling for testing Swing apps didn't exist, and we didn't have time to invent that before shipping our product. So we wrote it as a C++ app with an API, and before writing the first line of Java, we wrote a CLI wrapper. That allowed us to write a test suite that ran on the command line, and I certainly felt like a genius for recognizing that it is impossible to define "The right architecture" without first exploring all of the requirements, including the requirement that the software be buildable.

We and a few other teams making complementary products didn't make it to 100% done-ness by the offocial deadline, but wwhat we had accomplished was shipping highest-priority features with robust and reliable code. The entire releqse was delayed for the other teams to get ready, and instead of finishing the lowest priortity features, we were dispersed to other teams to help them ship. That was the highest value for the org, and not long after that other companies were making the same discoveries about iterative softare development with feedback loops and tight coupling between product management and technical leadership.