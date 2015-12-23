---
title: super() considered hmmm-ful
layout: default
tags: [allonge, noindex]
---

[![Threat Display](/assets/images/threat-display.jpg)](https://www.flickr.com/photos/winnu/7292115026)

I highly recommend reading Justin Fagnani's ["Real" Mixins with JavaScript Classes](http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/). To summarize my understanding, Justin likes using "mixins," but takes issues with the way they are implemented as described in things like [Using ES7 Decorators as Mixins](http://raganwald.com/2015/06/26/decorators-in-es7.html).

My understanding is that Justin wants to be able to have a fully open many-to-many relationship between meta-objects and objects, that's why Justin wants more than just a tree hierarchy of classes. This is great, just about everyone agrees that flattened hierarchies are superior to deep hierarchies, especially when the deep hierarchies are an accidental complexity created by trying to fake a many-to-many relationship using a tree.

Justin also wants to have mixins be much more equivalent to classes, especially with respect to being able to override a method from either a mixin or a class, and to be able to call `super()` in such a method to call the mixin's original definition, just as you would for a class.

Finally, Justin wants to create code that existing engines can optimize easily, and avoid changing the "shape" of prototypes.

I don't particularly treat these objections as criticism: They describe what Justin needs from a tool they intend to use in production, while I am giving examples of tools for the purpose of understanding how pieces of the language can fit together in extremely simple and elegant ways.

One of the things I like the most about Justin's article is that it shines a light on two longstanding debates in OOP, both going back at least as far as Smalltalk. The first is about deep class hierarchies. My opinion can be expressed in three words: [Don't do that!](http://raganwald.com/2014/03/31/class-hierarchies-dont-do-that.html)

The second debate is more subtle, and it concerns overriding methods.

### overriding considerations

It's a massive oversimilification to suggest that there are only two sides to that debate, but for the purpose of this discussion, there are two different OOP tribes. One of them is called **virtual-by-default**, and the other is called **final-by-default**.



---

notes:
