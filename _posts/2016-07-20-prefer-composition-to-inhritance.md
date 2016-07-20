---
layout: default
tags: [allonge, noindex]
---

In [Why Are Mixins Considered Harmful](http://raganwald.com/2016/07/16/why-are-mixins-considered-harmful.html), we saw that concatenative sharing--as exemplified by mixins--leads to snowballing complexity because of three effects:

0. Lack of Encapsulation
0. Implicit Dependencies
0. Name Clashes

We looked at some variations on creating encapsulation to help reduce the "surface area" for dependencies to grow and names to clash, but noted that this merely slows down the growth of the problem, it does not fix it.

Today we are going to look at how we can get the same effect as mixing behaviour into classes using composition, and how that can be engineered to solve the encapsulation, implicit dependencies, and name clash problems.

But first, a disclaimer:

###

---



---

### have your say

...

---

### notes
