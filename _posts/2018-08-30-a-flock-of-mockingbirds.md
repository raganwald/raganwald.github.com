---
tags: [recursion, noindex]
---

### combinators

The word "combinator" has a precise technical meaning in mathematics:

> "A combinator is a higher-order function that uses only function application and earlier defined combinators to define a result from its arguments."--[Wikipedia][combinators]

[combinators]: https://en.wikipedia.org/wiki/Combinatory_logic "Combinatory Logic"

In this essay, we will be using a much looser definition of "combinator:" Pure functions that act on other functions to produce functions. If Objects are nouns and Methods are verbs, **Combinators are the adverbs of programming**.

If we were learning Combinatorial Logic, we'd start with the most basic combinators like `S`, `K`, and `I`, and work up from there to practical combinators. We'd learn that the fundamental combinators are named after birds following the example of Raymond Smullyan's famous book [To Mock a Mockingbird][mock]. Needless to say, the title of the book and its central character is the inspiration for this essay!

[mock]: http://www.amazon.com/gp/product/B00A1P096Y/ref=as_li_ss_tl?ie=UTF8&camp=1789&creative=390957&creativeASIN=B00A1P096Y&linkCode=as2&tag=raganwald001-20

There are an infinite number of combinators, but in this article we will focus on the *mockingbird*, also called the `M` combinator, or sometimes the ω or "little omega."[^little-omega]

---

## Notes

[^little-omega]: The "little omega" notation comes from David C Keenan's delightful [To Dissect a Mockingbird](http://dkeenan.com/Lambda/) web page.
