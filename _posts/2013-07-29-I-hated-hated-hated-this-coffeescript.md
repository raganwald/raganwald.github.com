---
title: "I hated, hated, hated this CoffeeScript"
layout: default
tags: [coffeescript]
---

In [It's a Mad, Mad, Mad, Mad World: Scoping in CoffeeScript and JavaScript][mad], I translated a small snippet of JavaScript almost directly to CoffeeScript. The point was to compare the way JavaScript and CoffeeScript scope variables, so it was necessary to reproduce the code and variables almost directly.

[mad]: http://raganwald.com/2013/07/27/Ive-always-been-mad.html

I discussed the failure modes of each language. Then, in the conclusion, I offered that JavaScript programmers rarely encounter the JavaScript failure modes. This is true: The often `use strict` and/or various lint tools that identify possible failures early. I also offered that CoffeeScript programmers rarely encounter CoffeeScript's failure modes this is also true, for different reasons. One of those reasons is that idiomatic CoffeeScript rarely resembles idiomatic JavaScript.

CoffeeScript code that is a direct translation of JavaScript is not idiomatic. It's ugly, so much so that people will hate, hate, hate it. And even worse, it is much more likely to contain errors than idiomatic CoffeeScript. Let's take another look at some JavaScript:

{% highlight javascript %}
function table (numberOfRows, numberOfColumns) {
  var i,
      str = '';
  for (i = 0; i < numberOfRows; ++i) {
    str = str + row(numberOfColumns);
  }
  return '<table>' + str + '</table>';
  
  function row (numberOfCells) {
    var i,
        str = '';
    for (i = 0; i < numberOfCells; ++i) {
      str = str + '<td></td>';
    }
    return '<tr>' + str + '</tr>';
  }
}
{% endhighlight %}

One way to write this same thing in idiomatic CoffeeScript is to use a *comprehension*. Comprehensions are familiar to Python programmers (as is CoffeeScript's significant whitespace). Here's a comprehension-based implementation with the debug line that was a failure mode in the previous code by "capturing" a local variable:

{% highlight coffeescript %}
console.log('here') for i in [1..5]

table = (numberOfRows, numberOfColumns) ->
  row = (numberOfColumns) ->
    "<tr>#{ ('<td></td>' for i in [1..numberOfColumns]).join('') }</tr>"
  "<table>#{ (row(numberOfColumns) for i in [1..numberOfRows]).join('') }</table>"

table(3,3)
  #=> "<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>"
{% endhighlight %}

It works because CoffeeScript creates a safe for loop behind the scenes for us, and using string interpolation we avoid having to use extra variables for catenation. This code is possible in CoffeeScript because everything, including comprehensions, is an expression on CoffeeScript. JavaScript has lots of statements, such as its for loops, that do not produce values. So in JavaScript, we have to manually collect the values with extra variables.

It will always be possible to make a mistake with scopes in CoffeeScript, however the point of this example is that when you naturally use the features CoffeeScript provides, you need fewer non-essential variables such as loop indices, and therefore have fewer opportunities to make these mistakes.

So the moral of the story is this: When you adopt a language, learn to program using the language's features in a natural way. Do not write JavaScript code in CoffeeScript, just as you wouldn't write CoffeeScript in JavaScript. This way, you'll have fewer bugs. And nobody will hate, hate, hate your code.