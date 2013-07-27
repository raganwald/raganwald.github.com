---
layout: default
title: "It's a Mad, Mad, Mad World: Scoping in CoffeeScript and JavaScript"
tags: [javascript, coffeescript]
---

> "I've been mad for fucking years, absolutely years, been over the edge for yonks, been working me buns off for bands..."

> "I've always been mad, I know I've been mad, like the most of us...very hard to explain why you're mad, even if you're not mad..."

>--"Speak to Me," Nick Mason

### coffeescript

CoffeeScript, as many people know, is a transpile-to-JavaScript language. For the most part, it does not introduce major changes in semantics. For example, this:

    -> 'Hello, world'
    
Transpiles directly to:

    function () { return 'Hello, world'; }
    
This is convenient syntactic sugar, and by removing what some folks call the "syntactic vinegar" of extraneous symbols, it encourages the use of constructs that would otherwise make the code noisy and obscure the important meaning. The vast majority of features introduced by CoffeeScript are of this nature: They introduce local changes that transpile directly to JavaScript.[^rewrite]

[^rewrite]: There are other possibilities: You could write a Tail-Call Optimized language that transpiles to JavaScript, however its changes wouldn't always be local: Some function calls would be rewritten substantially to use trampolining. Or adding continuations to a language might cause everything to be rewritten in continuation-passing style.

CoffeeScript also introduces features that don't exist in JavaScript, such as destructuring assignment and comprehensions. In each case, the features compile directly to JavaScript without introducing changes elsewhere in the program. And since they don't look like existing JavaScript features, little confusion is created.

### equals doesn't equal equals

One CoffeeScript feature does introduce confusion, and the more you know JavaScript the more confusion it introduces. This is the behaviour of the assignment operator, the lowly (and prevalent!) equals sign:

    foo = 'bar'
    
Although it *looks* almost identical to assignment in JavaScript:

    foo = 'bar';
    
It has *different semantics*. That's confusing. Oh wait, it's worse than that: *Sometimes* it has different semantics. Sometimes it doesn't.

**So what's the deal with that?**

Well, let's review the wonderful world of JavaScript. We'll pretend we're in a browser application, and we write:

    foo = 'bar';
    
What does this mean? Well, *it depends*: If this is in the top level of a file, and not inside of a function, then `foo` is a *global variable*. In JavaScript, global means global across all files, so you are now writing code that is coupled with every other file in your application or any vendored code you are loading.

But what if it's inside a function?

    function fiddleSticks (bar) {
      foo = bar;
      // ...
    }

For another example, many people enclose file code in an Immediately Invoked Function Expression ("IIFE") like this:

    ;(function () {
      foo = 'bar'
      // more code...
    })();
    
What do `foo = 'bar';` or `foo = bar;` mean in these cases? Well, *it depends* as we say. It depends on whether `foo` is *declared* somewhere else in the same scope. For example:

    function fiddleSticks (bar) {
      var foo;
      foo = bar;
      // ...
    }

Or:

    function fiddleSticks (bar) {
      foo = bar;
      // ...
      var foo = batzIndaBelfrie;
      // ...
    } 
    
Or even:

    function fiddleSticks (bar) {
      foo = bar;
      // ...
      function foo () {
        // ...
      }
      // ...
    }
    
Because of something called hoisting, these all mean the same this: `foo` is local to function `fiddleSticks`, and therefore it is NOT global and ISN'T magically coupled to every other file loaded whether written by yourself or someone else.

### nested scope

JavaScript permits scope nesting. If you write this:

    function foo () {
      var bar = 1;
      var bar = 2;
      return bar;
    }

Then `bar` will be `2`. Declaring `bar` twice makes no difference, since both declarations are in the same scope. However, if you nest functions, you can nest scopes:

    function foo () {
      var bar = 1;
      function foofoo () {
        var bar = 2;
      }
      return bar;
    }

Now function `foo` will return `1` because the second declaration of `bar` is inside a nested function, and therefore inside a nested scope, and therefore it's a completely different variable that happens to share the same name. This is called *shadowing*: The variable `bar` inside `foofoo` *shadows* the variable `bar` inside `foo`.

### javascript failure modes

Now over time people have discovered that global variables are generally a very bad idea, and accidental global variables doubly so. Here's an example of why:


    function row (numberOfCells) {
      var str = '';
      for (i = 0; i < numberOfCells; ++i) {
        str = str + '<td></td>';
      }
      return '<tr>' + str + '</tr>';
    }
    
    function table (numberOfRows, numberOfColumns) {
      var str = '';
      for (i = 0; i < numberOfRows; ++i) {
        str = str + row(numberOfColumns);
      }
      return '<table>' + str + '</table>';
    }
    
Let's try it:

    table(3, 3)
      //=> "<table><tr><td></td><td></td><td></td></tr></table>"
      
We only get one row, because the variable `i` in the function `row` is global, and so is the variable `i` in the function `table`, so they're the exact same global variable. Therefore, after counting out three columns, `i` is `3` and the `for` loop in `table` finishes. Oops!

And this is especially bad because the two functions could be anywhere in the code. If you accidentally use a global variable and call a function elsewhere that accidentally uses the same global variable, pfft, you have a bug. This is nasty because there's this weird action-at-a-distance where a bug in one file reaches out and breaks some code in another file.

Now, this isn't a bug in JavaScript the language, just a feature that permits the creation of very nasty bugs. So I call it a *failure mode*, not a language bug.

### coffeescript to the rescue

CoffeeScript addresses this failure mode in two ways. First, all variables are local to functions. If you wish to do something in the global environment, you must do it explicitly. So in JavaScript:

    UserModel = Backbone.Model.extend({ ... });

    var user = new UserModel(...);
    
While in CoffeeScript:

    window.UserModel = window.Backbone.Model.extend({ ... })

    user = new window.UserModel(...)
    
Likewise, CoffeeScript bakes the IIFE enclosing every file in by default. So instead of:

    ;(function () {
      // ...
    })();
    
You can just write your code.[^bare]

[^bare]: If you don't want the file enclosed in an IIFE, you can compile your CoffeeScript with the `--bare` command-line switch.

The net result is that it is almost impossible to replicate the JavaScript failure mode of creating or clobbering a global variable by accident. That is a benefit.

### what would coffeescript do?

This sounds great, but CoffeeScript can be surprising to JavaScript programmers. Let's revisit our `table` function. First, we'll fix it:

    function row (numberOfCells) {
      var i,
          str = '';
      for (i = 0; i < numberOfCells; ++i) {
        str = str + '<td></td>';
      }
      return '<tr>' + str + '</tr>';
    }

    function table (numberOfRows, numberOfColumns) {
      var i,
          str = '';
      for (i = 0; i < numberOfRows; ++i) {
        str = str + row(numberOfColumns);
      }
      return '<table>' + str + '</table>';
    }
    
    table(3, 3)
      //=> "<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>"
      
Good! Now suppose we notice that no function calls `row` other than `table`. Although there is a slightly more "performant" way to do this, we decide that the clearest and simplest way to indicate this relationship is to nest `row` inside `table` Pascal-style:

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
    
It still works like a charm, because the `i` in `row` shadows the `i` in `table`, so there's no conflict. Okay. Now how does it work in CoffeeScript?

Here's one possible translation to CoffeeScript:

    table = (numberOfRows, numberOfColumns) ->
      row = (numberOfCells) ->
        str = ""
        i = 0
        while i < numberOfCells
          str = str + "<td></td>"
          ++i
        "<tr>" + str + "</tr>"
      str = ""
      i = 0
      while i < numberOfRows
        str = str + row(numberOfColumns)
        ++i
      return "<table>" + str + "</table>"
      
    table(3,3)
      //=> "<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>"

It works just fine. Here's another:  

    table = (numberOfRows, numberOfColumns) ->
      str = ""
      i = 0
      row = (numberOfCells) ->
        str = ""
        i = 0
        while i < numberOfCells
          str = str + "<td></td>"
          ++i
        "<tr>" + str + "</tr>"
      str = ""
      i = 0
      while i < numberOfRows
        str = str + row(numberOfColumns)
        ++i
      return "<table>" + str + "</table>"
      
    table(3,3)
      //=> "<table><tr><td></td><td></td><td></td></tr></table>"
      
Broken! And a third:

    str = ""
    i = 0
    table = (numberOfRows, numberOfColumns) ->
      row = (numberOfCells) ->
        str = ""
        i = 0
        while i < numberOfCells
          str = str + "<td></td>"
          ++i
        "<tr>" + str + "</tr>"
      str = ""
      i = 0
      while i < numberOfRows
        str = str + row(numberOfColumns)
        ++i
      return "<table>" + str + "</table>"
  
    table(3,3)
      //=> "<table><tr><td></td><td></td><td></td></tr></table>"
    
Also broken! Although the three examples look similar, the first gives us what we expect but the second and third do not. What gives?

Well, CoffeeScript doesn't allow us to "declare" that variables are local with `var`. They're always local. But local to *what?* In CoffeeScript, they're local to *the function that contains the first assignment to the variable*.[^params] So in our first example, reading from the top, the first use of `str` and `i` is inside the `row` function, so CoffeeScript makes them local to `row`.

[^params]: Or the first use of the variable as a parameter, much the same thing.

A little later on, the code makes an assignment to `i` and `str` within the `table` function. This scope happens to enclose `row`'s scope, but it is different so it can't share the `str` and `i` variables. CoffeeScript thus makes the `i` and `str` in `table` variables local to `table`. As a result, the `i` and `str` in `row` end up shadowing the `i` and `str` in `table`.

The second example is different. The first `i` encountered by CoffeeScript is in `table`, so CoffeeScript makes it local to `table` as we'd expect. The second `i` is local to `row`. But since `row` in enclosed by `table`, it's possible to make that `i` refer to the `i` already defined, and thus CoffeeScript does *not* shadow the variable. The `i` inside `row` is the same variable as the `i` inside `table`.

In the third example, `i` (and `str`) are declared outside of both `table` and `row`, and thus again they all end up being the same variable with no shadowing.

Now, CoffeeScript *could* scan an entire function before deciding what variables belong where, but it doesn't. That simplifies things, because you don't have to worry about a variable being declared later that affects your code. Everything you need to understand is in the same file and above your code.

In many cases, it also allows you to manipulate whether a variable is shadowed or not by carefully controlling the order of assignments. That's good, right?

### all those against the bill, say "nay nay!"

Detractors of this behaviour say this is not good. When JavaScript is written using `var`, the meaning of a function is not changed by what is written elsewhere in the file before the code in question. Although you can use this feature to control shadowing by deliberately ordering your code to get the desired result, a simple refactoring can break what you've already written.

For example, if you write:

    table = (numberOfRows, numberOfColumns) ->
      row = (numberOfCells) ->
        str = ""
        i = 0
        while i < numberOfCells
          str = str + "<td></td>"
          ++i
        "<tr>" + str + "</tr>"
      str = ""
      i = 0
      while i < numberOfRows
        str = str + row(numberOfColumns)
        ++i
      return "<table>" + str + "</table>"
  
    table(3,3)
      //=> "<table><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td></tr></table>"
      
All will be well, until you are debugging late one night, and you add:

    console.log('Hello!') for i in [1..5]
    
    table = (numberOfRows, numberOfColumns) ->
      row = (numberOfCells) ->
        str = ""
        i = 0
        while i < numberOfCells
          str = str + "<td></td>"
          ++i
        "<tr>" + str + "</tr>"
      str = ""
      i = 0
      while i < numberOfRows
        str = str + row(numberOfColumns)
        ++i
      return "<table>" + str + "</table>"
  
    table(3,3)
      //=> "table><tr><td></td><td></td><td></td></tr></table>"
      
This breaks your code because the `i` you used at the top "captures" the other variables so they are now all the same thing. To someone used to JavaScript, this is a Very Bad Thing™. When you write this in JavaScript:

    function row (numberOfCells) {
      var i,
          str = '';
      for (i = 0; i < numberOfCells; ++i) {
        str = str + '<td></td>';
      }
      return '<tr>' + str + '</tr>';
    }
    
It will always mean the same thing no matter where it is in a file, and no matter what comes before it or after it. There is no spooky "action-at-a-distance" where code somewhere else changes what this code means.

### coffeescript's failure mode

In this case, CoffeeScript has a failure mode: The meaning of a function seems to be changed by altering its position within a file or (in what amounts to the same thing) by altering code that appears before it in a file in the same or enclosing scopes. In contrast, JavaScript's `var` declaration never exhibits this failure mode. JavaScript has a different action-at-a-distance failure mode, where *neglecting* `var` causes action at a much further distance: The meaning of code can be affected by code written in an entirely different file.

Mind you it isn't even remotely true that the meaning of our `row` function is affected by declaring an `i` in an enclosing scope. Our function always did what it was expected to do and always will. It's really the meaning of the *enclosing* code that changes. If we maintain the habit of always initializing variables we expect to use locally, our functions work just fine.

So one way to look at this is that `row` is fine, but moving `i` around changes the meaning of the code where you move `i`. And why wouldn't you expect making changes to `table` to change its meaning?

### so which way to the asylum?

To many people, both design choices are insane. Accidentally getting global variables when you neglect `var` is brutal, and action-at-a-distance affecting the meaning of a function (even if it is always within the same file) flies against everything we have learned about the importance of writing small chunks of code that completely encapsulate their behaviour.

Of course, programmers tend to internalize the languages they learn to use. If you write a lot of JavaScript, you habitually use `var` and may have tools that slap your wrist when you don't. You're bewildered by all this talk of action-at-a-distance. It will seems to you to be one of those rookie mistake problems that quickly goes away and is not a practical concern.

Likewise, if you write twenty thousand lines of CoffeeScript, you may never be bitten by its first-use-is-a-declaration behaviour. You may be in the habit of using variable names like `iRow` and `iColumn` out of habit. You may find that your files never get so large and your functions so deeply nested that a "capture" problem takes longer than three seconds to diagnose and fix.

It's a bit of a cop-out, but I suggest that this issue resembles the debate over strong, manifest typing vs. dynamic typing. In theory, one is vastly preferable to the other. But in practice, large stable codebases are written with both kinds of languages, and programmers seem to adjust to overcome the failure modes of their tools unconsciously while harvesting the benefits that each language provides.