---
layout: default
published: no
ad: javascript-allonge
---

The function utility belt library [allong.es] contains handy JavaScript functions extracted from the book [JavaScript Allongé][ja]. One technique described in the book and in the articles "[Tortoises, Teleporting Turtles, and Iterators](http://raganwald.com/2013/02/15/turtles-and-iterators.js.html)" and "[The "Drunken Walk" Programming Problem](http://raganwald.com/2013/02/17/a-drunken-walk.html)" is the use of *functional iterators* to separate the concern of traversing a data structure from what you want to do with the data structure.

[allong.es]: http://allong.es
[ja]: https://leanpub.com/javascript-allonge

To recapitulate, a functional iterator is a stateful function you call repeatedly to obtain the values in a data structure. For example, here is a function that takes an array and returns an iterator over the array:

{% highlight javascript %}
function ArrayIterator (array) {
  var index;
  index = 0;
  return function() {
    return array[index++];
  };
};

var i = ArrayIterator([1962, 6, 14]);
i();
  //=> 1962
i();
  //=> 6
i();
  //=> 14
i();
  //=> undefined
{% endhighlight %}

As mentioned, functional iterators are a very useful mechanism for working with data structures. But we can take it a step further.