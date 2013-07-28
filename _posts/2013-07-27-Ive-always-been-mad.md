---
layout: default
title: "It's a Mad, Mad, Mad, Mad World: Scoping in CoffeeScript and JavaScript"
tags: [javascript, coffeescript]
---

> "I've been mad for fucking years, absolutely years, been over the edge for yonks, been working me buns off for bands..."

> "I've always been mad, I know I've been mad, like the most of us...very hard to explain why you're mad, even if you're not mad..."

>--"Speak to Me," Nick Mason

### coffeescript

CoffeeScript, as many people know, is a transpile-to-JavaScript language.[^trans] For the most part, it does not introduce major changes in semantics. For example, this:

{% highlight coffeescript %}
-> 'Hello, world'
{% endhighlight %}

Transpiles directly to:

{% highlight javascript %}
function () { return 'Hello, world'; }
{% endhighlight %}

