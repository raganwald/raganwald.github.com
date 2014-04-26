---
layout: default
title: "Everything is a Value"
tags: [spessore, allonge]
---

> 'Functional programming’ is something of a misnomer, in that it leads a lot of people to think of it as meaning 'programming with functions’, as opposed to programming with objects. But if object-oriented programming treats everything as an object, functional programming treats everything as a value – not just functions, but everything.

> This of course includes obvious things like numbers, strings, lists, and other data, but also other things we OOP fans don’t typically think of as values: IO operations and other side effects, GUI event streams, null checks, even the notion of sequencing function calls.

> If you’ve ever heard the phrase 'programmable semicolons’ you’ll know what I’m getting at.--James Coglan[^cite]

[^cite]: [Callbacks are imperative, promises are functional](https://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity/)

As James pointed out, one of JavaScript's defining characteristics is that *everything is a value*.[^disclaimer] Everything can be stored in an array or as the property of an object. Everything can be passed to a function or method as a parameter. Everything can be returned from a method or parameter. You can use `===` and `!==` on everything.

[^disclaimer]: Well, not *everything*. Operators like `+` aren't values. Unlike CoffeeScript and Ruby, statements don't evaluate to values, and unlike Smalltalk, blocks aren't values. But "everything is a value" is a phrase that works well enough for the purpose of this post, so put aside your pedantry and read on.

Especially, some people note, functions. Functions are values. Functions can be passed as parameters. Functions can be returned from functions. An example, here's a simple array-backed stack with an `undo` function:

{% highlight javascript %}
var stack = {
  array: [],
  undo: null,
  push: function (value) {
    this.undo = function () {
      this.array.pop();
      this.undo = null;
    };
    return this.array.push(value);
  },
  pop: function () {
    var popped = this.array.pop();
    this.undo = function () {
      this.array.push(popped);
      this.undo = null;
    };
    return popped;
  },
  isEmpty: function () {
    return array.length === 0;
  }
};

stack.push('hello');
stack.push('there');
stack.undo();
stack.pop();
  //=> 'hello'
{% endhighlight %}

We're treating the `undo` function like any other value and putting it in a property. We could stick functions into an array if we wanted:

{% highlight javascript %}
var stack = {
  array: [],
  undoStack: [],
  push: function (value) {
    this.undoStack.push(function () {
      this.array.pop();
    });
    return this.array.push(value);
  },
  pop: function () {
    var popped = this.array.pop();
    this.undoStack.push(function () {
      this.array.push(popped);
    });
    return popped;
  },
  isEmpty: function () {
    return array.length === 0;
  },
  undo: function () {
    this.undoStack.pop().call(this);
  }
};

stack.push('hello');
stack.push('there');
stack.push('javascript');
stack.undo();
stack.undo();
stack.pop();
  //=> 'hello'
{% endhighlight %}

Functions-as-values is a powerful idea. And people often look at the idea of functions-as-values and think, "Oh, JavaScript is a functional programming language." No. JavaScript is an everything-is-a-value language. So instead of passing some boolean around and then writing some code saying "if true, do this, if false, do that," you just pass a function that does *this*, or you pass a function that does *that*.

> Objects aren't some different paradigm. There is no tension between JavaScript the functional language and JavaScript the object-oriented language

Objects aren't some different paradigm. There is no tension between JavaScript the functional language and JavaScript the object-oriented language. When you see JavaScript the everything-is-a-value language, you see that objects are a natural growth of the idea that everything can be made into an explicit value, even things with behaviour.

[![Handshake, Glider, Boat, Box, R-Pentomino, Loaf, Beehive, and Clock by Ben Sisko](/assets/images/sisko.jpg)](https://www.flickr.com/photos/bensisto/4193046623)

### states as values

One example concerns [state machines][ssm]. We *could* implement a cell in [Conway's Game of Life][gol] using `if` statements and a boolean property to determine whether the cell was alive or dead:[^4r]

[ssm]: https://en.wikipedia.org/wiki/Finite-state_machine
[^4r]: This exercise was snarfed from [The Four Rules of Simple Design](https://leanpub.com/4rulesofsimpledesign)
[gol]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

{% highlight javascript %}
var __slice = [].slice;

function extend () {
  var consumer = arguments[0],
      providers = __slice.call(arguments, 1),
      key,
      i,
      provider,
      except;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    except = provider['except'] || [];
    except.push('except');
    for (key in provider) {
      if (except.indexOf(key) < 0 && provider.hasOwnProperty(key)) {
        consumer[key] = provider[key];
      };
    };
  };
  return consumer;
};

var Universe = {
  // ...
  numberOfNeighbours: function (location) {
    // ...
  }
};

var Cell = {
  numberOfNeighbours: function () {
    return Universe.numberOfNeighbours(this.location);
  },
  aliveInNextGeneration: function () {
    if (this.alive) {
      return (this.numberOfNeighbours() === 3);
    }
    else {
      return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3);
    }
  }
};

var someCell = extend({
  alive: true,
  location: {x: -15, y: 12}
}, Cell);
{% endhighlight %}

You could say that the "state" of the cell is the boolean value `true` for alive or `false` for dead. But that isn't really making the state a value. The "state" in a state machine includes the behaviour of the object that depends on the state.

In the design above, the true state of the object is *implicit* in the object's behaviour, but it isn't a value. Here's a design where we make the state a value:

{% highlight javascript %}
function delegateToOwn (receiver, propertyName, methods) {
  var temporaryMetaobject;

  if (methods == null) {
    temporaryMetaobject = receiver[propertyName];
    methods = Object.keys(temporaryMetaobject).filter(function (methodName) {
      return typeof(temporaryMetaobject[methodName]) == 'function';
    });
  }
  methods.forEach(function (methodName) {
    receiver[methodName] = function () {
      var metaobject = receiver[propertyName];
      return metaobject[methodName].apply(receiver, arguments);
    };
  });

  return receiver;
};

var Alive = {
  alive: function () {
    return true;
  },
  aliveInNextGeneration: function () {
    return (this.numberOfNeighbours() === 3);
  }
};

var Dead = {
  alive: function () {
    return false;
  },
  aliveInNextGeneration: function () {
    return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3);
  }
};

var Cell = {
  numberOfNeighbours: function () {
    return thisGame.numberOfNeighbours(this.location);
  }
}

delegateToOwn(Cell, 'state', ['alive', 'aliveInNextGeneration']);

var someCell = extend({
  state: Alive,
  location: {x: -15, y: 12}
}, Cell);
{% endhighlight %}

`delegateToOwn` delegates the methods `alive` and `aliveInNextGeneration` to whatever object is the value of a `Cell`'s `state` property.

So when we write `someCell.state = Alive`, then the `Alive` object will handle `someCell.alive` and `someCell.aliveInNextGeneration`. And when we write `someCell.state = Dead`, then the `Dead` object will handle `someCell.alive` and `someCell.aliveInNextGeneration`.

Now we've taken the implicit states of being alive or dead and transformed them into the first-class values `Alive` and `Dead`. Not a boolean that is used implicitly in some other code, but the actual "stuff that matters about aliveness and deadness."

This is not different than the example of passing functions around: They're both the same thing, taking something would be *implicit* in another design and/or another language, and making it *explicit*, making it a value. And making the whole thing a value, not just a boolean or a string, the complete entity.

### an algebra of values

> In computer science, functional programming is a programming paradigm, a style of building the structure and elements of computer programs, that treats computation as the evaluation of mathematical functions and avoids state and mutable data.--[Wikipedia](https://en.wikipedia.org/wiki/Functional_programming)

By this definition, JavaScript is not and never will be functional programming, because it does not avoid state and it embraces mutable data. But what it has in common with functional programming is an *algebraic approach to values*.

Consider this function, `memoize`:

{% highlight javascript %}
function memoize (fn) {
  var unmemo = {},
      memo = unmemo;

  return function () {
    if (memo === unmemo) {
      memo = fn.apply(this, arguments);
    }
    return memo;
  }
}
{% endhighlight %}

`memoize` transforms a function into another function, but one that has the same "signature." Languages like Haskell have type systems that make this clearer, but the idea is simple to grasp for now. `memoize` takes one function as input, and returns a function as output that acts like the function it took as input. Only there's a twist, it's [memoized].

[memoized]: https://en.wikipedia.org/wiki/Memoization

Functions can also *compose* other functions. Hand-waving over context, we can write:

{% highlight javascript %}
function compose (a, b) {
  return function (c) {
    return a(b(c));
  }
}
{% endhighlight %}

But `compose` isn't the only function that takes two functions and returns another similar function. Here are two other examples (there are infinitely many examples, but only so much space in a blog):

{% highlight javascript %}
function before (a, b) {
  return function () {
    a.apply(this, arguments);
    return b.apply(this, arguments);
  }
}

function after (a, b) {
  return function () {
    b.apply(this, arguments);
    return a.apply(this, arguments);
  }
}
{% endhighlight %}

`before` and `after` are very handy for writing [function advice][advice], and again they speak to the idea of transforming functions into other functions that have similar "signatures" or "types."

[advice]: https://en.wikipedia.org/wiki/Advice_(programming)

When you have a bunch of functions that do things in your problem domain (like `writeLedger` and `withdrawFunds`), and you have functions for transforming (like `memoize`) or composing (like `before`) your domain functions, you have a little algebra for taking *values* and computing new values from them.

Just as we can write `1 + 1 = 2`, we can also write `writeLedger + withdrawFunds = transaction`.

### objects as values

being able to compute values from values seems so obvious and basic, we do it with numbers, strings, arrays, and functions. But that isn't some special property of "functional programing," it's a special property of everything-is-a-value.

If you have objects as values, you can write an algebra of objects. Here's a function that transforms an object into a proxy for that object:

{% highlight javascript %}
function proxy (baseObject, optionalPrototype) {
  var proxyObject = Object.create(optionalPrototype || null),
      methodName;
  for (methodName in baseObject) {
    if (typeof(baseObject[methodName]) ===  'function') {
      (function (methodName) {
        proxyObject[methodName] = function () {
          var result = baseObject[methodName].apply(baseObject, arguments);
          return (result === baseObject)
                 ? proxyObject
                 : result;
        }
      })(methodName);
    }
  }
  return proxyObject;
}
{% endhighlight %}

Have you ever wanted to make an object's properties private while making its methods public? You wanted a proxy for the object.

And here's a function that composes two or more objects:

{% highlight javascript %}
var __slice = [].slice;

function meld () {
  var melded = {},
      providers = __slice.call(arguments, 0),
      key,
      i,
      provider,
      except;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    for (key in provider) {
      if (provider.hasOwnProperty(key)) {
        melded[key] = provider[key];
      };
    };
  };
  return melded;
};

var Person = {
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  rename: function (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
};

var HasCareer = {
  career: function () {
    return this.chosenCareer;
  },
  setCareer: function (career) {
    this.chosenCareer = career;
    return this;
  },
  describe: function () {
    return this.fullName() + " is a " + this.chosenCareer;
  }
};

var PersonWithCareer = meld(Person, HasCareer);
{% endhighlight %}

Objects are certainly about classes and prototype chains and methods, but they're values, and that means that we can write algebras for them. `meld` is a very simple, naïve example, but you can build up form there to composing traits over partial proxies with conflict resolution policies.

And again, this is not some "different thing," composing mixins into prototypes is the same thing as composing functions, which is the same thing as adding one and one to get two: It's everything-as-a-value, just on a larger scale.

(discuss on [reddit](http://www.reddit.com/r/programming/comments/23zlqt/everything_in_javascript_is_a_value/))

---

[![Harpo Marx and three of his children](/assets/images/harpo.jpg)](http://en.wikipedia.org/wiki/Harpo_Marx)

### appendix

A function for composing mixins over partial proxies:

{% highlight javascript %}
// policies for resolving methods

var policies = {
  overwrite: function overwrite (fn1, fn2) {
    return fn2;
  },
  discard: function discard (fn1, fn2) {
    return fn1;
  },
  before: function before (fn1, fn2) {
    return function () {
      fn2.apply(this, arguments);
      return fn1.apply(this, arguments);
    }
  },
  after: function after (fn1, fn2) {
    return function () {
      fn1.apply(this, arguments);
      return fn2.apply(this, arguments);
    }
  },
  around: function around (fn1, fn2) {
    return function () {
      var argArray = [fn1.bind(this)].concat(__slice.call(arguments, 0));
      return fn2.apply(this, argArray);
    }
  }
};

// helper for writing resolvable mixins

function resolve(mixin, policySpecification) {
  var result = extend(Object.create(null), mixin);

  Object.keys(policySpecification).forEach(function (policy) {
    var methodNames = policySpecification[policy];

    methodNames.forEach(function (methodName) {
      result[methodName] = {};
      result[methodName][policy] = mixin[methodName];
    });
  });

  return result;
}

// composing mixins

function composeMixins () {
  var mixins = __slice.call(arguments, 0),
      dummy  = function () {};

  return mixins.reduce(function (acc1, mixin) {
    return Object.keys(mixin).reduce(function (result, methodName) {
      var bDefinition = mixin[methodName],
          bType       = typeof(bDefinition),
          aFunc,
          aType,
          bResolverKey,
          bFunc;

      if (result.hasOwnProperty(methodName)) {
        aFunc = result[methodName];
        aType = typeof(aFunc);

        if (aType ===  'undefined') {
          if (bType === 'function' || bType === 'undefined') {
            result[methodName] = bDefinition;
          }
          else if (bType == 'object') {
            bResolverKey = Object.keys(bDefinition)[0];
            bFunc = bDefinition[bResolverKey];
            if (bResolverKey === 'around') {
              result[methodName] = function () {
                return bFunc.apply(this, [dummy] + __slice.call(0, arguments));
              }
            }
            else result[methodName] = bFunc;
          }
          else throw 'unimplemented';
        }
        else if (bType === 'object') {
          bResolverKey = Object.keys(bDefinition)[0];
          bFunc = bDefinition[bResolverKey];
          result[methodName] = policies[bResolverKey](aFunc, bFunc);
        }
        else if (bType === 'undefined') {
          // do nothing
        }
        else throw 'unimplemented'
      }
      else if (bType === 'function' || bType === 'undefined') {
        result[methodName] = bDefinition;
      }
      else if (bType == 'object') {
        bResolverKey = Object.keys(bDefinition)[0];
        bFunc = bDefinition[bResolverKey];
        if (bResolverKey === 'around') {
          result[methodName] = function () {
            return bFunc.apply(this, [dummy] + __slice.call(0, arguments));
          }
        }
        else result[methodName] = bFunc;
      }
      else throw 'unimplemented';

      return result;
    }, acc1);
  }, {});
}

// disjoint composition

var HasName = {
  name: function () {
    return this.name;
  },
  setName: function (name) {
    this.name = name;
    return this;
  }
};

var HasCareer = {
  career: function () {
    return this.name;
  },
  setCareer: function (name) {
    this.name = name;
    return this;
  }
};

var NameAndCareer = composeMixins(
  HasName,
  HasCareer
);

// stacking mixins

var IsSelfDescribing = {
  name: undefined,
  career: undefined,

  description: function () {
    return this.name() + ' is a ' + this.career();
  }
};

var NameAndCareerTwo = composeMixins(
  HasName,
  HasCareer,
  IsSelfDescribing
);

// resolving conflict

var HasChildren = {
  initialize: function () {
    this._children = [];
    return this;
  },
  addChild: function (name) {
    this._children.push(name);
    return this;
  },
  numberOfChildren: function () {
    return this._children.length;
  }
};

var IsAuthor = {
  initialize: function () {
    this._books = [];
    return this;
  },
  addBook: function (name) {
    this._books.push(name);
    return this;
  },
  books: function () {
    return this._books;
  }
};

var WritesABoutParenting = composeMixins(
  HasChildren,
  resolve(IsAuthor, { after: ['initialize'] })
);
{% endhighlight %}