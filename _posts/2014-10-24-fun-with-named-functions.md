---
layout: default
title: Fun with Named Functions in JavaScript
tags: [javascript]
---

In JavaScript, you make a named function like this:

{% highlight javascript %}
function rank () {
  return "Captain";
}
{% endhighlight %}

Interestingly, that can be a *function declaration* if it appears inline by itself. For example:

{% highlight javascript %}
function officer () {
  return rank() + " Reginald Thistleton";
  
  function rank () { return "Captain"; }
}

officer()
  //=> 'Captain Reginald Thistleton'
{% endhighlight %}

![Captain Reginald Thistleton](/assets/images/reginaldthistleton.png)

The function `rank` is defined in the function declaration `function rank () { return "Captain"; }`. We use the function `rank` in the statement `return rank() + " Reginald Thistleton";`. We can deduce two things from this:

1. Declaring a named function binds the function to the name in its surrounding environment. That's why we can use the function `rank` within the function `officer`. Likewise, `officer` is declared in the global environment, and that's why we can use it on the Node command line (or wherever we're testing this code).<br/><br/>
1. We can declare a named function anywhere and its binding can be used *everywhere*. That's why we can declare `rank` at the bottom of the function, but use it at the top.

That's a function declaration. What about function *expressions*? As we know, we can declare a function in an expression, meaning we can use it anywhere, like this:

{% highlight javascript %}
(function () { return "Captain Reginald Thistleton"; })()
  //=> 'Captain Reginald Thistleton'
{% endhighlight %}

Or this:

{% highlight javascript %}
!function () { return "Captain Reginald Thistleton"; }()
  //=> false
{% endhighlight %}

Or this:

{% highlight javascript %}
var reggie = function () { return "Captain Reginald Thistleton"; };
{% endhighlight %}

This last statement binds an anonymous function to a variable in its environment. The binding takes place when the statement is executed, not before everything is executed. Therefore, this won't work:

{% highlight javascript %}
function officer () {
  return rank() + " " + given() + " Thistleton";
  
  var given = function () { return "Reginald"; };
  
  function rank () { return "Captain"; }
}

officer()
  //=> TypeError: undefined is not a function
{% endhighlight %}

But this will:

{% highlight javascript %}
function officer () {
  var given = function () { return "Reginald"; };
  
  return rank() + " " + given() + " Thistleton";
  
  function rank () { return "Captain"; }
}

officer()
  //=> 'Captain Reginald Thistleton'
{% endhighlight %}

So, this is a named function: `function rank () { return "Captain"; }`, and this is an anonymous function: `function () { return "Captain"; }`. Pop quiz:

1. Is `function () { return "Reginald"; }` an expression or a declaration?
1. Is `function surname () { return "Thistleton"; }` an expression or a declaration?

The answers are 1: `function () { return "Reginald"; }` is always an expression, but 2: `function surname () { return "Thistleton"; }` can be an expression or a declaration, depending on how you use it. For example:

{% highlight javascript %}
function officer () {
  var given = function () { return "Reginald"; };
  
  return rank() + " " + given() + " " + surname();
  
  function rank () { return "Captain"; }
  
  function surname () { return "Thistleton"; }
}

officer()
  //=> 'Captain Reginald Thistleton'
{% endhighlight %}

And also:

{% highlight javascript %}
function officer () {
  var given   = function () { return "Reginald"; },
      surname = function family () { return "Thistleton"; };
  
  return rank() + " " + given() + " " + surname();
  
  function rank () { return "Captain"; }
}

officer()
  //=> 'Captain Reginald Thistleton'
{% endhighlight %}

We've used `function family () { return "Thistleton"; ` as an expression here, and bound the value to the name `surname` just as we did with an anonymous function. It's a *named function expression*, and it is very interesting.

### trace elements

In most environments, there is some way of inspecting the call stack for debugging or documentation purposes. For example:

{% highlight javascript %}
function officer () {
  return rank() + " " + given() + " Thistleton";
  
  var given = function () { return "Reginald"; };
  
  function rank () { return "Captain"; }
}

officer()
  //=> TypeError: undefined is not a function
         at officer (repl:5:39)
{% endhighlight %}

Note the second line: `at officer (repl:5:39)`. We know that the `TypeError` occurred within the `officer` function. How does the environment know it's the officer function? Because we named it in the declaration.

If we used an anonymous function bound to a name, Node can deduce the name of the function:

{% highlight javascript %}
var officer = function () {
  return rank() + " " + given() + " Thistleton";
  
  var given = function () { return "Reginald"; };
  
  function rank () { return "Captain"; }
}

officer()
  //=> TypeError: undefined is not a function
         at officer (repl:5:39)
{% endhighlight %}

But not all functions are so easily deduced. Callbacks in Node, event handlers in the browser, and functions passed to higher-order functions and methods are all often anonymous:

{% highlight javascript %}
[1962, 6, 14].filter(function (n) { return n <= 12; })
  //=> [ 6 ]
{% endhighlight %}

Sometimes, such functions go wrong:

{% highlight javascript %}
function factorial (n) {
  system.out.println(n);
  
  return n < 2 ? n : n * factorial(n-1);
}

[1962, 6, 14].filter(function (n) { return factorial(n) % 2 == 1; })
  //=> ReferenceError: system is not defined
          at factorial (repl:2:1)
          at repl:1:45
          at Array.filter (native)
{% endhighlight %}

We seem to have confused "JavaScript" with "Java," and looking at the stack trace, we can see it happens within `factorial`, but what calls it? `repl:1:45` is not very helpful. This case is trivial enough to work it out, but lots of stack traces are much deeper and contain multiple anonymous functions.

But we know that a function expression doesn't need to be anonymous:

{% highlight javascript %}
function factorial (n) {
  system.out.println(n);
  
  return n < 2 ? n : n * factorial(n-1);
}

[1962, 6, 14].filter(function numbersWithOddFactorials (n) { return factorial(n) % 2 == 1; })
  //=> ReferenceError: system is not defined
          at factorial (repl:2:1)
          at numbersWithOddFactorials (repl:1:70)
          at Array.filter (native)
{% endhighlight %}

Naming functions is extremely useful for debugging purposes. There are very few reasons *not* to name functions. Where by "very few", we mean "probably zero."

Are there any other benefits? Yes.

### scope

When we use a named function expression (not a declaration, but an expression), the name of the function is **not** bound in its enclosing environment:

{% highlight javascript %}
function officer () {
  var given   = function () { return "Reginald"; },
      surname = function family () { return "Thistleton"; };
  
  return rank() + " " + given() + " " + family();
  
  function rank () { return "Captain"; }
}

officer()
  //=> ReferenceError: family is not defined
{% endhighlight %}

So, when we *declare* a function, its name is bound in the enclosing environment, but when we use the function as an *expression*, its name is not bound in the enclosing environment. So where *is* it bound?

Here's a named function expression: `function even (n) { return n == 0 ? true : !even(n-1) }`. We'll use it in an Immediately Invoked Function Expression ("IIFE"):

{% highlight javascript %}
(function even (n) { return n == 0 ? true : !even(n-1) })(42)
  //=> true

even
  //=> ReferenceError: even is not defined
{% endhighlight %}

Aha! The name is bound *inside* the body of the function. This is very useful if you're writing a lot of recursive functions, but where else?

### class is in session

Well, how about "classes" (please excuse the scare-quotes):

{% highlight javascript %}
function Board () {
  this.height = Board.defaultHeight;
  this.width  = Board.defaultWidth;
  // ...
}

Board.defaultheight = Board.defaultWidth = 8;
{% endhighlight %}

We're making a "constructor" function, old-school style, and we're using properties of the constructor function as the rough equivalent of "class variables" in other languages.

So far there's nothing special about this, because our constructor is a function declaration. But let's write a function that generates classes:

{% highlight javascript %}
function boardMaker (defaultSize) {
  var konstruktor = function Board () {
    this.height = Board.defaultHeight;
    this.width  = Board.defaultWidth;
    // ...
  };

  konstruktor.defaultHeight = konstruktor.defaultWidth = defaultSize;
  
  return konstruktor;
}
{% endhighlight %}

Now we can make different board constructors, and each constructor's `Board` variable doesn't conflict with any other constructor's `Board` variable:

{% highlight javascript %}
var Chess   = boardMaker(8),
    Go      = boardMaker(19),
    SmallGo = boardMaker(9);

var board = new Go();

board.height
  //=> 19
{% endhighlight %}

### closures

Of course, we could accomplish a similar thing by taking advantage of JavaScript's closures, like this:

{% highlight javascript %}
function boardMaker (defaultSize) {
  var defaultHeight = defaultSize,
      defaultWidth  = defaultSize;
      
  var konstruktor = function Board () {
    this.height = defaultHeight;
    this.width  = defaultWidth;
    // ...
  };
  
  return konstruktor;
}
{% endhighlight %}

We won't say this is *worse* or *better*, but it's not the same. First, as elegant as a closure is (closures really are awesome), it does use more memory: The JavaScript runtime can't throw away the invocation environment after `boardMaker` returns, it has to save it because `konstructor` refers to its variables. That might matter in some implementations.

Second, the `defaultHeight` and `defaultWidth` variables are only visible to `function Board`. So given the code we've written, we can't change our minds and write `SmallGo.defaultHeight = SmallGo.defaultWidth = 11`.

In the end, closures and properties belonging to functions serve different purposes, and we enjoy having both tools in our toolbox.

### in closing

Named functions can be either declared in a statement *or* used in an expression. Named function expressions creates readable stack traces. The name of the function is bound inside its body, and that can be useful. And we can use the name to have a function invoke itself, or to access its properties like any other object.

---

Happy trails, and if you find functions interesting, you'll love my book [JavaScript Allongé](https://leanpub.com/javascript-allonge). It's free to read online and free as in speech!