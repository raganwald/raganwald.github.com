---
layout: default
title: Two Brief Points About CoffeeScript 1.5
tags: coffeescript
---

### first, constructors must return their instance

Jeremy Ashkenas recently announced that CoffeeScript 1.5 is out. One of its changes concerns constructors created with CoffeeScript's `class` keyword. It used to be possible to write this:

    ###
    class Weird
      constructor: ->
        return { exclamation: "That's Strange" }
    ###
        
And when you wrote `new Weird()`, you'd get a plain object, not an instance of `Weird`. This is no longer the case. Now when you write the above, you get an error: *CANNOT RETURN A VALUE FROM A CONSTRUCTOR: "{ EXCLAMATION: "THAT'S STRANGE" }" IN CLASS WEIRD*. Does this matter? Only in edge cases. in [JavaScript Allongé][ja], I borrowed a pattern from [Effective JavaScript](http://effectivejs.com). Here's the use case. Consider this constructor with a variable number of arguments:

[ja]: http://leanpub.com/javascript-allonge

    class Contact
      constructor: (@name, @emails...) ->
        
We can write things like `new Contact('raganwald', 'reg@braythwayt.com', 'reg@raganwald.com')`. Good. Now: How do we call this programmatically if we have an array of contacts? Don't say "Use`.apply`," that doesn't work for constructors, just for normal functions. So we have to rewrite its signature. Or do we?

    ###
    class Contact
      constructor: (@name, @emails...) ->
        self = if this instanceof Contact then this else new Contact()
        self.name = name
        self.emails = emails
        return self
      doSomething: ->
        # ...
      doSomethingElse: ->
        # ...
    ###
        
Then, whenever we wanted to use `.apply`, we could:

    ### 
    testArray = ['raganwald', 'reg@braythwayt.com', 'reg@raganwald.com']
  
    Contact.apply(null, testArray)
      #=> returns a new contact record
    ###
        
Other benefits would include being able to use combinators on constructors:

    ###
    class Router
      constructor: (something, somethingElse) ->
        self = if this instanceof Contact then this else new Contact()
        self.something = something
        self.somethingElse = somethingElse
        return self
    
    SingletonRouter = once(Router)
    ###

However, we're not going to be able to do that any more. It's not a huge deal, there are other ways to work around these infrequent use cases, and overall the benefit of having constructors constrained to always return the instance is likely to far outweigh the lack of flexibility.

### working around the change

You can work around this issue very easily. CoffeeScript doesn't stop you from writing a JavaScript-style class, so you can simply write your constructor function directly, eschewing the convenience of the `class` keyword:

    Contact = (@name, @emails...) ->
      self = if this instanceof Contact then this else new Contact()
      self.name = name
      self.emails = emails
      return self
    Contact::doSomething = ->
      # ...
    Contact::doSomethingElse = ->
      # ...
      
    console.log new Contact('raganwald', 'reg@braythwayt.com', 'reg@raganwald.com')
      #=> { name: 'raganwald',
      #     emails: 
      #     [ 'reg@braythwayt.com', 'reg@raganwald.com' ] }

    testArray = ['raganwald', 'reg@braythwayt.com', 'reg@raganwald.com']
  
    Contact.apply(null, testArray)
      #=> { name: 'raganwald',
      #     emails: 
      #     [ 'reg@braythwayt.com', 'reg@raganwald.com' ] }
      
### second, literate coffeescript

The other news, and yes I've buried the lede by leaving it for last, is that CoffeeScript now supports a "literate" mode. Here's what Jeremy has to say:

> "Besides being used as an ordinary programming language, CoffeeScript may also be written in "literate" mode. If you name your file with a  .litcoffee extension, you can write it as a Markdown document — a document that also happens to be executable CoffeeScript code. The compiler will treat any indented blocks (Markdown's way of indicating source code) as code, and ignore the rest as comments."
>
> "Just for kicks, a little bit of the compiler is currently implemented in this fashion: See it as a document, raw, and properly highlighted in a text editor."
>
> "I'm fairly excited about this direction for the language, and am looking forward to writing (and more importantly, reading) more programs in this style. As 1.5.0 is the first version of CoffeeScript that supports it, let us know if you have any ideas for improving the feature."

Does it work? It certainly does, and I have a very powerful use case for it. This blog post was written as a literate CoffeeScript document, so I was able to run it by typing `coffee 2013-02-27-literate-coffeescript.litcoffee` on the command line.

For the moment, Jekyll insists on parsing  `.litcoffee` files as text, so whenever I want to write about CoffeeScript, I need to add a `.md` to the suffix before pushing to the server. But that's still much better than error-prone cutting and pasting of snippets, and in the fullness of time I hope that CoffeeScript will recognize `.coffee.md` as [Literate CoffeeScript](https://github.com/jashkenas/coffee-script/issues/2736).

That's going to be a big time saver.