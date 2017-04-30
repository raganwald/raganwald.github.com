---
title: "Transducers"
layout: default
tags: [allonge, noindex]
---

In [Using iterators to write highly composeable code][part-i], we took a look at a data transformation and analysis algorithm, and saw that the obvious [staged approach] was highly decomposed, but presented a performance problem in that it created excess duplicates of the entire data set.

Whereas the [singe pass approach] was much more memory-efficient, but the code was entangled and monolithic. On a problem small enough to fit in a blog post this isn't a massive problem, but it's easy to see how such an approach in production leads to highly coupled, fragile code that cannot be easily factored or decomposed.

[part-i]: http://raganwald.com/2017/04/19/incremental.html
[staged approach]: http://raganwald.com/2017/04/19/incremental.html#I
[singe pass approach]: http://raganwald.com/2017/04/19/incremental.html#II

We concluded by looking at a [stream approach]. In the stream approach, we process the data in stages, but by using iterators and generators, we were able to process the data one datum at a time. This gave us the factorability of the staged approach, with the memory footprint of the single pass approach.

[stream approach]: http://raganwald.com/2017/04/19/incremental.html#III

Iterators have some other advantages, of course. In the [stream approach], we ended up folding the data down to a single value, he
