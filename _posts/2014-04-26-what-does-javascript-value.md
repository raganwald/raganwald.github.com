---
layout: default
title: "JavaScript Values Algebra"
tags: [spessore, allonge]
published: true
---

One of JavaScript's defining characteristics is its treatment of functions as first-class values. Like numbers, strings, and other kinds of objects, references to functions can be passed as arguments to functions, returned as the result from functions, bound to variables, and generally treated like any other value.[^reference]

[ja]: https://leanpub.com/javascript-allonge "JavaScript Allongé"

[^reference]: JavaScript does not actually pass functions or any other kind of object around, it passes references to functions and other objects around. But it's awkward to describe `var I = function (a) { return a; }` as binding a reference to a function to the variable `I`, so we often take an intellectually lazy shortcut, and say the function is bound to the variable `I`. This is much the same shorthand as saying that somebody added me to the schedule for an upcoming conference: They really added my name to the list, which is a kind of reference to me.

Here's an example of passing a reference to a function around. This simple array-backed stack has an `undo` function. It works by creating a function representing the action of undoing the last update, and then pushing that onto a stack of actions to be undone:

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

Functions-as-values is a powerful idea. And people often look at the idea of functions-as-values and think, "Oh, JavaScript is a functional programming language." No.

> In computer science, functional programming is a programming paradigm, a style of building the structure and elements of computer programs, that treats computation as the evaluation of mathematical functions and avoids state and mutable data.--[Wikipedia](https://en.wikipedia.org/wiki/Functional_programming)

Functional programming might have meant "functions as first-class values" in the 1960s when Lisp was young. But time marches on, and we must march alongside it. JavaScript does not avoid state, and JavaScript embraces mutable data, so JavaScript does not value "functional programming."

[![Handshake, Glider, Boat, Box, R-Pentomino, Loaf, Beehive, and Clock by Ben Sisko](/assets/images/sisko.jpg)](https://www.flickr.com/photos/bensisto/4193046623)

### objects

JavaScript's other characteristic is its support for objects. Although JavaScript's features seem paltry compared to rich OO languages like Scala, its extreme minimalism means that you can actually build almost any OO paradigm up from basic pieces.

Now, people often hear the word "objects" and think [kingdom of nouns][kon]. But objects are not necessarily nouns, or at least, not models for obvious, tangible entities in the real world.

[kon]: http://steve-yegge.blogspot.ca/2006/03/execution-in-kingdom-of-nouns.html

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
      provider;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    for (key in provider) {
      if (provider.hasOwnProperty(key)) {
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

var Alive = 'alive',
    Dead  = 'dead';

var Cell = {
  numberOfNeighbours: function () {
    return Universe.numberOfNeighbours(this.location);
  },
  stateInNextGeneration: function () {
    if (this.state === Alive) {
      return (this.numberOfNeighbours() === 3)
             ? Alive
             : Dead;
    }
    else {
      return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3)
             ? Alive
             : Dead;
    }
  }
};

var someCell = extend({
  state: Alive,
  location: {x: -15, y: 12}
}, Cell);
{% endhighlight %}

You could say that the "state" of the cell is represented by the primitive value `'alive'` for alive, or `'dead'` for dead. But that isn't modeling the state in any way, that's just a name. The true state of the object is *implicit* in the object's behaviour, not *explicit* in the value of the `.state` property.

Here's a design where we make the state explicit instead of implicit:

{% highlight javascript %}
function delegateToOwn (receiver, propertyName, methods) {
  var temporaryMetaobject;

  if (methods == null) {
    temporaryMetaobject = receiver[propertyName];
    methods = Object.keys(temporaryMetaobject).filter(function (methodName) {
      return typeof(temporaryMetaobject[methodName]) === 'function';
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
  stateInNextGeneration: function () {
    return (this.numberOfNeighbours() === 3)
             ? Alive
             : Dead;
  }
};

var Dead = {
  alive: function () {
    return false;
  },
  stateInNextGeneration: function () {
    return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3)
             ? Alive
             : Dead;
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

In this design, `delegateToOwn` delegates the methods `.alive` and `.stateInNextGeneration` to whatever object is the value of a `Cell`'s `state` property.

So when we write `someCell.state = Alive`, then the `Alive` object will handle `someCell.alive` and `someCell.aliveInNextGeneration`. And when we write `someCell.state = Dead`, then the `Dead` object will handle `someCell.alive` and `someCell.aliveInNextGeneration`.

Now we've taken the implicit states of being alive or dead and transformed them into the first-class values `Alive` and `Dead`. Not a string that is used implicitly in some other code, but all of "The stuff that matters about aliveness and deadness."

This is not different than the example of passing functions around: They're both the same thing, taking something would be *implicit* in another design and/or another language, and making it *explicit*, making it a value. And making the whole thing a value, not just a boolean or a string, the complete entity.

This example is the same thing as the example of a stack that handles undo with a stack of functions: *Behaviour* is treated as a first-class value, whether it be a single function or an object with multiple methods.

### an algebra of functions

If we left it at that, we could come away with an idea that a function is a small, single-purposed object. We would be forgiven for thinking that there's nothing special about functions, they're values representing behaviour.

But functions have another, very important purpose. The form the basis for an *algebra of values*.

Consider these functions, `begin1` and `begin`. They're handy for writing [function advice][advice], for creating sequences of functions to be evaluated for side effects, and for resolving method conflicts when composing mixins:

[advice]: https://en.wikipedia.org/wiki/Advice_(programming)

{% highlight javascript %}
var __slice = [].slice;

function begin1 () {
  var fns = __slice.call(arguments, 0);

  return function () {
    var args = arguments,
        values = fns.map(function (fn) {
          return fn.apply(this, args);
        }, this),
        concretes = values.filter(function (value) {
          return value !== void 0;
        });

    if (concretes.length > 0) {
      return concretes[0];
    }
  }
}

function begin () {
  var fns = __slice.call(arguments, 0);

  return function () {
    var args = arguments,
        values = fns.map(function (fn) {
          return fn.apply(this, args);
        }, this),
        concretes = values.filter(function (value) {
          return value !== void 0;
        });

    if (concretes.length > 0) {
      return concretes[concretes.length - 1];
    }
  }
}
{% endhighlight %}

Both `begin1` and `begin` take one or more functions, and turn them into a third function. This is much the same as `+` taking two numbers, and turning them into a third number.[^exercise]

[^exercise]: Exercise for the reader: Given either `begin1` or `begin`, why are the functions `function () {}` and `function (fn) { return fn; }` considered important?

When you have a bunch of functions that do things in your problem domain (like `writeLedger` and `withdrawFunds`), and you have a way to compose your domain functions, you have a little algebra for taking *values* and computing new values from them.

Just as we can write `1 + 1 = 2`, we can also write `writeLedger + withdrawFunds = transaction`. We have created a very small *algebra of functions*. We can write functions that transform functions into other functions.

### an algebra of values

Functions that transform functions into other functions are very powerful, but it does not stop there.

It's obvious that functions can take objects as arguments and return objects. Functions (or methods) that take an object representing a client and return an object representing and account balance are a necessary and important part of software.

But just as we created an algebra of functions, we can write an algebra of objects. Meaning, we can write functions that take objects and return other objects that represent a *transformation* of their arguments.

Here's a function that transforms an object into a proxy for that object:

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

Have you ever wanted to make an object's properties private while making its methods public? You wanted a proxy for the object:

{% highlight javascript %}
var stackWithPrivateState = proxy(stack);

stack.array
  //=> []
stackWithPrivateState.array
  //=> undefined

stackWithPrivateState.push('hello');
stackWithPrivateState.push('there');
stackWithPrivateState.push('javascript');
stackWithPrivateState.undo();
stackWithPrivateState.undo();
stackWithPrivateState.pop();
  //=> 'hello'
{% endhighlight %}

The `proxy` function transforms an object into another object with a similar purpose. Functions can compose objects as well, here's one of the simplest examples:

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
  //=>
    { fullName: [Function],
      rename: [Function],
      career: [Function],
      setCareer: [Function],
      describe: [Function] }
{% endhighlight %}

Functions that transform objects or compose objects act at a higher level than functions that query objects or update objects. They form an algebra that allows us to build objects by transformation and composition, just as we can use functions like `begin` to build functions by composition.

### javascript values algebra

JavaScript treats functions and objects as first-class values. And the power arising from this is the ability to write functions that transform and compose first-class values, creating an *algebra of values*.

This applies to transforming and composing functions, and it also applies to transforming and composing objects.

![Harpo Marx and three of his children](/assets/images/harpo.jpg)

(discuss on [reddit](http://www.reddit.com/r/javascript/comments/2478ck/javascript_values_algebra/))

---

### appendix 1: a function for composing prototypes out of mixins

First, some helper functions:

{% highlight javascript %}
var __slice = [].slice;

// extend

function extend () {
  var consumer = arguments[0],
      providers = __slice.call(arguments, 1),
      key,
      i,
      provider;

  for (i = 0; i < providers.length; ++i) {
    provider = providers[i];
    for (key in provider) {
      if (provider.hasOwnProperty(key)) {
        consumer[key] = provider[key];
      };
    };
  };
  return consumer;
};

// partialProxy is like "proxy," but it proxies a subset of an
// object's methods and it also has a fixed set of mutable properties

function partialProxy (baseObject, methods, mutableProperties) {
  var proxyObject = Object.create(null);

  if (mutableProperties) {
    mutableProperties.forEach(function (privatePropertyName) {
      proxyObject[privatePropertyName] = null;
    });
  }

  methods.forEach(function (methodName) {
    proxyObject[methodName] = function () {
      var result = baseObject[methodName].apply(baseObject, arguments);
      return (result === baseObject)
             ? proxyObject
             : result;
    }
  });

  Object.preventExtensions(proxyObject);

  return proxyObject;
}

// extendWith Proxy extends an object with behaviour, but restricts
// the behaviour to interact with a proxy to the object. This
// encapsulates each set of behaviour from the object and from each
// other, reducing coupling.

var number = 0;

function methodsOfType (behaviour, type) {
  var methods = [],
      methodName;

  for (methodName in behaviour) {
    if (typeof(behaviour[methodName]) === type) {
      methods.push(methodName);
    }
  };
  return methods;
}

function propertyFlags (behaviour) {
  var properties = [],
      propertyName;

  for (propertyName in behaviour) {
    if (behaviour[propertyName] === null) {
      properties.push(propertyName);
    }
  }

  return properties;
}

function extendWithProxy (baseObject, behaviour) {
  var safekeepingName = "__" + ++number + "__",
      definedMethods = methodsOfType(behaviour, 'function'),
      dependencies = methodsOfType(behaviour, 'undefined'),
      properties = propertyFlags(behaviour),
      methodName;

  definedMethods.forEach(function (methodName) {
    baseObject[methodName] = function () {
      var context = this[safekeepingName],
          result;
      if (context == null) {
        context = partialProxy(this, definedMethods.concat(dependencies), properties);
        properties.forEach(function (propertyName) {
          context[propertyName] = behaviour[propertyName];
        });
        Object.defineProperty(this, safekeepingName, {
          enumerable: false,
          writable: false,
          value: context
        });
      }
      result = behaviour[methodName].apply(context, arguments);
      return (result === context) ? this : result;
    };
  });

  return baseObject;
}
{% endhighlight %}

The `Prototype` function builds prototypes out of an optional super-prototype (or `null`) and one or more behaviours, objects with functions to mix in.

{% highlight javascript %}
function Prototype () {
  var superPrototype = arguments[0],
      baseObject = Object.create(superPrototype),
      behaviours = __slice.call(arguments, 1);

  return behaviours.reduce(function (prototype, behaviour) {
    return extendWithProxy(prototype, behaviour);
  }, baseObject);
}
{% endhighlight %}

Examples:

{% highlight javascript %}
var HasName = {
  // private property, initialized to null
  _name: null,

  // methods
  name: function () {
    return this._name;
  },
  setName: function (name) {
    this._name = name;
    return this;
  }
};

var HasCareer = {
  // private property, initialized to null
  _career: null,

  // methods
  career: function () {
    return this._career;
  },
  setCareer: function (career) {
    this._career = career;
    return this;
  }
};

var IsSelfDescribing = {
  // dependencies, "undefined in this mixin"
  name: undefined,
  career: undefined,

  // method
  description: function () {
    return this.name() + ' is a ' + this.career();
  }
};

// the prototype
var Careerist = Prototype(HasName, HasCareer, IsSelfDescribing);

// create objects with it
var michael    = Object.create(Careerist),
    bewitched = Object.create(Careerist);

michael.setName('Michael Sam');
bewitched.setName('Samantha Stephens');

michael.setCareer('Athlete');
bewitched.setCareer('Thaumaturge');

michael.description()
  //=> 'Michael Sam is a Athlete'
bewitched.description()
  //=> 'Samantha Stephens is a Thaumaturge'
{% endhighlight %}

### appendix 2: a function for safely composing behaviour

Helpers:

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
{% endhighlight %}

The `Prototype` function above can mix more than one behaviour into a prototype, but sometimes you want to make a new behaviour out of two or more existing behaviours without turning them into a prototype. `composeBehaviour` does that.

It is involved because it must check for conflicts and resolve them at the time of composition. The `Prototype` method above is simpler because the individual behaviours each get their own proxy with private state. `composeBehaviour` wires behaviours up so they can share a proxy.

{% highlight javascript %}
function composeBehaviour () {
  var mixins = __slice.call(arguments, 0),
      dummy  = function () {};

  return mixins.reduce(function (acc1, mixin) {
    return Object.keys(mixin).reduce(function (result, methodName) {
      var bDefinition = mixin[methodName],
          bType       = typeof(bDefinition),
          aDefinition,
          aType,
          bResolverKey,
          bDefinition;

      if (result.hasOwnProperty(methodName)) {
        aDefinition = result[methodName];
        aType = typeof(aDefinition);

        if (aDefinition === null && bDefinition === null) {
          throw "'" + methodName + "' cannot be private to multiple mixins."
        }
        else if (aDefinition === null || bDefinition === null) {
          throw "'" + methodName + "' cannot be a method and a property."
        }
        else if (aType ===  'undefined') {
          if (bType === 'function' || bType === 'undefined') {
            result[methodName] = bDefinition;
          }
          else if (bType === 'object') {
            bResolverKey = Object.keys(bDefinition)[0];
            bDefinition = bDefinition[bResolverKey];
            if (bResolverKey === 'around') {
              result[methodName] = function () {
                return bDefinition.apply(this, [dummy] + __slice.call(0, arguments));
              }
            }
            else result[methodName] = bDefinition;
          }
          else throw aType + " cannot be mixed in as '" + methodName + "'";
        }
        else if (bType === 'object') {
          bResolverKey = Object.keys(bDefinition)[0];
          bDefinition = bDefinition[bResolverKey];
          result[methodName] = policies[bResolverKey](aDefinition, bDefinition);
        }
        else if (bType === 'undefined') {
          // do nothing
        }
        else throw "unresolved method conflict for '" + methodName + "'";
      }
      else if (bDefinition === null) {
        result[methodName] = null;
      }
      else if (bType === 'function' || bType === 'undefined') {
        result[methodName] = bDefinition;
      }
      else if (bType === 'object') {
        bResolverKey = Object.keys(bDefinition)[0];
        bDefinition = bDefinition[bResolverKey];
        if (bResolverKey === 'around') {
          result[methodName] = function () {
            return bDefinition.apply(this, [dummy] + __slice.call(0, arguments));
          }
        }
        else result[methodName] = bDefinition;
      }
      else bType + " cannot be used for '" + methodName + "'";

      return result;
    }, acc1);
  }, {});
}
{% endhighlight %}

Examples:

{% highlight javascript %}
// composing compatible mixins

composeBehaviour(
  HasName,
  HasCareer
);

// rejects incompatible mixins

var HasEmployer = {
  // private property, initialized to null
  _name: null,

  // methods
  employer: function () {
    return this._name;
  },
  setEmployer: function (name) {
    this._name = name;
    return this;
  }
};

composeBehaviour(
  HasName,
  HasEmployer,
  HasCareer
);
  //=> '_name' cannot be private to multiple mixins.

// stacking mixins

var IsSelfDescribing = {
  name: undefined,
  career: undefined,

  description: function () {
    return this.name() + ' is a ' + this.career();
  }
};

var NameAndCareer = composeBehaviour(
  HasName,
  HasCareer,
  IsSelfDescribing
);

var Careerist = Prototype(null, NameAndCareer);

var adolphe = Object.create(Careerist);
adolphe.setName('Adolphe Samuel');
adolphe.setCareer('Composer');
adolphe.description()
  //=> 'Adolphe Samuel is a Composer'

// resolving method conflict

var SingsSongs = {
  _songs: null,

  initialize: function () {
    this._songs = [];
    return this;
  },
  addSong: function (name) {
    this._songs.push(name);
    return this;
  },
  songs: function () {
    return this._songs;
  }
};

var HasAwards = {
  _awards: null,

  initialize: function () {
    this._awards = [];
    return this;
  },
  addAward: function (name) {
    this._awards.push(name);
    return this;
  },
  awards: function () {
    return this._awards;
  }
};

composeBehaviour(SingsSongs, HasAwards);
  //=> "unresolved method conflict for 'initialize'"

// plays well with prototypes

var AwardWinningMusician = composeBehaviour(
  SingsSongs,
  resolve(HasAwards, { after: ['initialize'] })
);

var Musician = Prototype(Careerist, AwardWinningMusician);

var henry = Object.create(Musician).initialize();
henry.setName('Seal Henry Samuel');
henry.setCareer('Singer');
henry.addSong('Kiss from a Rose');
henry.addAward('Best British Male');
{% endhighlight %}

---

### notes