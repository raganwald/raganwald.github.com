---
layout: default
title: "Mixins, Forwarding, and Delegation in JavaScript"
tags: [spessore, allonge]
---

### preface: where did the prototypes go?

This essay discusses how to separate JavaScript domain properties from object behaviour, *without prototypes*. This is deliberate. By examining four basic ways to have one object define the behaviour of other objects, we gain insight into what we're trying to accomplish at a very basic level.

We can then take this insight to working with prototypes and understand the conveniences that prototypes provide as well as the tradeoffs that they make. That does not mean, of course that just because prototypes (or classes, for that matter) are not mentioned here, that prototypes are considered inferior to any of these techniques.

This is an essay, not a style guide.

## Why metaobjects?

It is technically possible to write software using objects alone. When we need behaviour for an object, we can give it methods by binding functions to keys in the object:

{% highlight javascript %}
var sam = {
  firstName: 'Sam',
  lastName: 'Lowry',
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  rename: function (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
}
{% endhighlight %}

We call this a "naïve" object. It has state and behaviour, but it lacks division of responsibility between its state and its behaviour.

This lack of separation has two drawbacks. First, it intermingles properties that are part of the model domain (such as `firstName`), with methods (and possibly other properties, although none are shown here) that are part of the implementation domain. Second, when we needed to share common behaviour, we could have objects share common functions, but does it not scale: There's no sense of organization, no clustering of objects and functions that share a common responsibility.

Metaobjects solve the lack-of-separation problem by separating the domain-specific properties of objects from their behaviour and implementation-specific properties.

The basic principle of the metaobject is that we separate the mechanics of behaviour from the domain properties of the base object. This has immediate engineering benefits, and it's also the foundation for designing programs with higher-level constructs like formal classes, expectations, and delegation.

---

## Mixins, Forwarding, and Delegation

The simplest possible metaobject in JavaScript is a *mixin*. Consider our naïve object:

{% highlight javascript %}
var sam = {
  firstName: 'Sam',
  lastName: 'Lowry',
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  rename: function (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
}
{% endhighlight %}

We can separate its domain properties from its behaviour:

{% highlight javascript %}
var sam = {
  firstName: 'Sam',
  lastName: 'Lowry'
};

var person = {
  fullName: function () {
    return this.firstName + " " + this.lastName;
  },
  rename: function (first, last) {
    this.firstName = first;
    this.lastName = last;
    return this;
  }
};
{% endhighlight %}

And use `extend` to mix the behaviour in:

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

extend(sam, person);

sam.rename
  //=> [Function]
{% endhighlight %}

This allows us to separate the behaviour from the properties in our code. If we want to use the same behaviour with another object, we can do that:

{% highlight javascript %}
var peck = {
  firstName: 'Sam',
  lastName: 'Peckinpah'
};

extend(peck, person);
{% endhighlight %}

Our `person` object is a *template*, it provides some functionality to be mixed into an object with a function like `extend`. Using templates does not require copying entire functions around, each object gets references to the functions in the template.

Things get even better: You can use more than one template with the same object:

{% highlight javascript %}
var hasCareer = {
  career: function () {
    return this.chosenCareer;
  },
  setCareer: function (career) {
    this.chosenCareer = career;
    return this;
  }
};

extend(peck, hasCareer);
peck.setCareer('Director');
{% endhighlight %}

We say that there is a *many-to-many* relationship between objects and templates.

### scope and coupling

Consider a design that has four kinds of templates, we'll call them `A`, `B`, `C`, and `D`. Objects in the system might mix in one, two, three, or all four templates. There are fifteen such "kinds" of objects, those that mix in `A`, `B`, `AB`, `C`, `AC`, `BC`, `ABC`, `D`, `AD`, `BD`, `ABD`, `CD`, `ACD`, `BCD`, and `ABCD`.

When you make a change to and one template, say `A`, you have to consider how that change will affect each of the eight kinds of objects that mixes `A` in. In only one of those, `A`, do you just consider `A`'s behaviour by itself. In `AB`, `ABC`, `ABD`, and `ABCD`, you have to consider how changes to `A` may interact with `B`, because they both share access to each object's private state. Same for `A` and `C`, and `A` and `D`, of course.

By itself this is not completely revelatory: When objects interact with each other in the code, there are going to be dependencies between them, and you have to manage those dependencies.

Encapsulation solves this problem by strictly limiting the scope of interaction between objects. If object `a` invokes a method `x()` on object `b`, we know that the scope of interaction between `a` and `b` is strictly limited to the method `x()`. We also know that any change in state it may create is strictly limited to the object `b`, because `x()` cannot reach back and touch `a`'s private state.

(There is some simplification going on here as we are ignoring parameters and/or the possibility that `a` is part of `b`'s private state)

However, two methods `x()` and `y()` on the same object are tightly coupled by default, because they both interact with all of the object's private state. When we write an object like this:

{% highlight javascript %}
var counter = {
  _value: 0,
  value: function () {
    return this._value;
  },
  increment: function () {
    ++this._value;
    return this;
  },
  decrement: function () {
    --this._value;
    return this;
  }
}
{% endhighlight %}

We fully understand that `value()`, `increment()`, and `decrement()` are coupled, and they are all together in our code next to each other.

Whereas, if we write:

{% highlight javascript %}
function isanIncrementor (object) {
  object.increment = function () {
    ++this._value;
    return this;
  };
  return object;
}

// ...hundreds of lines of code...

function isaDecrementor (object) {
  object.decrement = function () {
    --this._value;
    return this;
  };
  return object;
}
{% endhighlight %}

Our two templates are tightly coupled to each other, but not obviously so. They just 'happen' to use the same property. And they might never be both mixed into the same object. Or perhaps they might. Who knows?

The technical term for templates referring to an object's private properties is [open recursion][or]. It is powerful and flexible, in exactly the same sense that having objects refer to each other's internal properties is powerful and flexible.

[or]: https://en.wikipedia.org/wiki/Open_recursion#Open_recursion

And just as objects can encapsulate their own private state, so can templates.

### templates with private properties

Let's revisit our `hasCareer` template:

{% highlight javascript %}
var hasCareer = {
  career: function () {
    return this.chosenCareer;
  },
  setCareer: function (career) {
    this.chosenCareer = career;
    return this;
  }
};
{% endhighlight %}

`hasCareer` stores its private state in the object's `chosenCareer` property. As we've seen, that introduces coupling if any other method touches `chosenCareer`. What we'd like to do is make `chosenCareer` private. Specifically:

1. We wish to store a copy of `chosenCareer` for each object that uses the `hasCareer` template. Mark Twain is a writer, Sam Peckinpah is a director.
2. `chosenCareer` must not be a property of each person object, because we don't want other methods accessing it and becoming coupled.

We have a few options. The very simplest, and most "native" to JavaScript, is to use a closure.

### privacy through closures

We'll write our own [functional mixin][fm]:

{% highlight javascript %}
function HasPrivateCareer (obj) {
  var chosenCareer;

  obj.career = function () {
    return chosenCareer;
  };
  obj.setCareer = function (career) {
    chosenCareer = career;
    return this;
  };
  return obj;
}

HasPrivateCareer(peck);
{% endhighlight %}

`chosenCareer` is a variable within the scope of the `hasCareer`, so the `career` and `setCareer` methods can both access it through lexical scope, but no other method can or ever will.

This approach works well for simple cases. It only works for named variables. We can't, for example, write a function that iterates through all of the private properties of this kind of functional mixin, because they aren't properties, they're variables. In the end, we have privacy, but we achieve it by not using properties at all.

### privacy through objects

Another way to achieve privacy in templates is to write them as methods that operate on `this`, but sneakily make `this` refer to a different object. Let's revisit our `extend` function:

{% highlight javascript %}
function extendPrivately (receiver, template) {
  var methodName,
      privateProperty = Object.create(null);

  for (methodName in template) {
    if (template.hasOwnProperty(methodName)) {
      receiver[kemethodNamey] = template[methodName].bind(privateProperty);
    };
  };
  return receiver;
};
{% endhighlight %}

We don't need to embed variables and methods in our function, it creates one private variable (`privateProperty`), and then uses `.bind` to ensure that each method is bound to that variable instead of to the receiver object being extended with the template.

Now we can extend any object with any template, 'privately:'

{% highlight javascript %}
extendPrivately(twain, hasCareer);
twain.setCareer('Author');
twain.career()
  //=> 'Author'
{% endhighlight %}

Has it modified `twain`'s properties?

{% highlight javascript %}
twain.chosenCareer
  //=> undefined
{% endhighlight %}

No. `twain` has `.setCareer` and `.career` methods, but `.chosencareer` is a property of an object created when `twain` was privately extended, then bound to each method using [`.bind`][bind].

[allong.es]: http://allong.es
[bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

The advantage of this approach over closures is that the template and the mechanism for mixing it in are separate: You just write the template's methods, you don't have to carefully ensure that they access private state through variables in a closure.

### another way to achieve privacy through objects

In our scheme above, we used `.bind` to create methods bound to a private object before mixing references to them into our object. There is another way to do it:

{% highlight javascript %}
function forward (receiver, methods, toProvider) {
    for (methodName in methods) {
      receiver[methodName] = function () {
        return toProvider[methodName].apply(toProvider, arguments);
      };
    }
  });

  return receiver;
};
{% endhighlight %}

This function *forwards* methods to another object. Any other object, it could be a metaobject specifically designed to define behaviour, or it could be a domain object that has other responsibilities.

Dispensing with a lot of mixins, here is a very simple example example. We start with some kind of investment portfolio object that has a `netWorth` method:

{% highlight javascript %}
var portfolio = {
  _investments: [],
  addInvestment: function (investment) {
    this._investments.push(investment);
    return this;
  },
  netWorth: function () {
    return this._investments.reduce(
      function (acc, investment) {
        return acc + investment.value;
      },
      0
    );
  }
};
{% endhighlight %}

And next we create an investor who has this portfolio of investments:

{% highlight javascript %}
var investor = {
  //...
}
{% endhighlight %}

What if we want to make investments and to know an investor's net worth?

{% highlight javascript %}
forward(investor, ['addInvestment', 'netWorth'], portfolio);
{% endhighlight %}

We're saying "Forward all requests for `addInvestment` and `netWorth` to the portfolio object."

### forwarding

Forwarding is a relationship between an object that receives a method invocation receiver and a provider object. They may be peers. The provider may be contained by the consumer. Or perhaps the provider is a metaobject.

When forwarding, the provider object has its own state. There is no special binding of function contexts, instead the consumer object has its own methods that forward to the provider and return the result. Our `forward` function above handles all of that, iterating over the provider's properties and making forwarding methods in the consumer.

The key idea is that when forwarding, the provider object handles each method *in its own context*. This is very similar to the effect of our solution with `.bind` above, but not identical.

Because there is a forwarding method in the consumer object and a handling method in the provider, the two can be varied independently. Here's a snippet of our `forward` function from above:

{% highlight javascript %}
consumer[methodName] = function () {
  return toProvider[methodName].apply(toProvider, arguments);
}
{% endhighlight %}

Each forwarding function invokes the method in the provider *by name*. So we can do this:

{% highlight javascript %}
portfolio.netWorth = function () {
  return "I'm actually bankrupt!";
}
{% endhighlight %}

We're overwriting the method in the `portfolio` object, but not the forwarding function. So now, our `investor` object will forward invocations of `netWorth` to the new function, not the original. This is not how out `.bind` system worked above.

That makes sense from a "metaphor" perspective. With our `extendPrivately` function above, we are creating an object as a way of making private state, but we don't think of it as really being a first-class entity unto itself. We're mixing those specific methods into a consumer.

Another way to say this is that mixing in is "early bound," while forwarding is "late bound:" We'll look up the method when it's invoked.

### summarizing what we know so far

So now we have three things: Mixing in a template; mixing in a template with private state for its methods ("Private Mixin"); and forwarding to a first-class object. And we've talked all around two questions:

1. Is the mixed-in method being early-bound? Or late-bound?
2. When a method is invoked on a receiving object, is it evaluated in the receiver's context? Or in the metaobject's state's context?

If we make a little table, each of those three things gets its own spot:

|                        |*Early-bound*|*Late-bound*|
|:-----------------------|:------------|:-----------|
|**Receiver's context**  |Mixin        |            |
|**Metaobject's context**|Private Mixin|Forwarding  |

So... What goes in the missing spot? What is late-bound, but evaluated in the receiver's context?

### delegation

Let's build it. Here's our `forward` function, modified to evaluate method invocation in the receiver's context:

{% highlight javascript %}
function delegate (receiver, methods, toProvider) {
    for (methodName in methods) {
      receiver[methodName] = function () {
        return toProvider[methodName].apply(receiver, arguments);
      };
    }
  });

  return receiver;
};
{% endhighlight %}

This new `delegate` function does exactly the same thing as the `forward` function, but the function that does the delegation looks like this:

{% highlight javascript %}
function () {
  return toProvider[methodName].apply(receiver, arguments);
}
{% endhighlight %}

It uses the receiver as the context instead of the provider. This has all the same coupling implications that our mixins have, of course. And it layers in additional indirection. The indirection gives us some late binding, allowing us to modify the metaobject's methods *after* we have delegated behaviour from a receiver to it.

### delegation vs. forwarding

Delegation and forwarding are both very similar. One metaphor that might help distinguish them is to think of receiving an email asking you to donate some money to a worthy charity.

* If you *forward* the email to a friend, and the friend donates money, the friend is donating their own money and getting their own tax receipt.
* If you *delegate* responding to your accountant, the accountant donates *your* money to the charity and you receive the tax receipt.

In both cases, the other entity does the work when you receive the email.

[fm]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/

---

## Later Binding

When comparing Mixins to Delegation (and comparing Private Mixins to Forwarding), we noted that the primary difference is that Mixins are early bound and Delegation is late bound. Let's be specific. Given:

{% highlight javascript %}
var counter = {};

var Incrementor = {
  increment: function () {
    ++this._value;
    return this;
  },
  value: function (optionalValue) {
    if (optionalValue != null) {
      this._value = optionalValue;
    }
    return this._value;
  }
};

extend(counter, Incrementor);
{% endhighlight %}

We are mixing `Incrementor` into `counter`. At some point later, we encounter:

{% highlight javascript %}
counter.value(42);
{% endhighlight %}

What function handles the invocation of `.value`? because we mixed `Incrementor` into `counter`, it's the same function as `Incrementor.counter`. We don't look that up when `counter.value(42)` is evaluated, because that was bound to `counter.value` when we extended `counter`. This is early binding.

However, given:

{% highlight javascript %}
var counter = {};

delegate(counter, ['increment', 'value'], Incrementor);

// ...time passes...

counter.value(42);
{% endhighlight %}

We again are most likely invoking `Incrementor.value`, but now we are determining this *at the time `counter.value(42)` is evaluated*. We bound the target of the delegation, `Incrementor`, to `counter`, but we are going to look the actual property of `Incrementor.value` up when it is invoked. This is late binding, and it is useful in that we can make some changes to `Incrementor` after the delegation has been set up, perhaps to add some logging.

It is very nice not to have to do things like this in a very specific order: When things have to be done in a specific order, they are *coupled in time*. Late binding is a decoupling technique.

### but wait, there's more

But we can get *even later than that*. Although the specific function is late bound, the target of the delegation, `Incrementor`, is early bound. We can late bind that too! Here's a variation on `delegate`:

{% highlight javascript %}
function delegateToOwn (receiver, methods, propertyName) {
    for (methodName in methods) {
      receiver[methodName] = function () {
        var toProvider = receiver[propertyName];
        return toProvider[methodName].apply(receiver, arguments);
      };
    }
  });

  return receiver;
};
{% endhighlight %}

This function sets things up so that an object can delegate to one of its own properties. Let's take another look at the investor example. First, we'll set up our portfolio to separate behaviour from properties with a standard mixin:

{% highlight javascript %}
var HasInvestments = {
  addInvestment: function (investment) {
    this._investments.push(investment);
    return this;
  },
  netWorth: function () {
    return this._investments.reduce(
      function (acc, investment) {
        return acc + investment.value;
      },
      0
    );
  }
};

var portfolio = extend({_investments: []}, HasInvestments);
{% endhighlight %}

Next we'll make that a property of our investor, and delegate to the property, not the object itself:

{% highlight javascript %}
var investor = {
  // ...
  nestEgg: portfolio
}

delegateToOwn(investor, ['addInvestment', 'netWorth'], 'nestEgg');
{% endhighlight %}

Our `investor` object delegates the `addInvestment` and `netWorth` methods to its own `nestEgg` property. So far, this is just like the `delegate` method above. But consider what happens if we decide to assign a new portfolio to our investor:

{% highlight javascript %}
var retirementPortfolio = {
  _investments: [
    {name: 'IRA fund', worth: '872,000'}
  ]
}

investor.nestEgg = retirementPortfolio;
{% endhighlight %}

The `delegateToOwn` delegation now delegates to the new portfolio, because it is bound to the property name, not to the original object. This seems questionable for portfolios--what happens to the old portfolio when you assign a new one?--but has tremendous application for modeling classes of behaviour that change dynamically.

### state machines

A very common use case for this delegation is when building [finite state machines][ssm]. As described in the book [Understanding the Four Rules of Simple Design][4r] by Corey Haines, you can implement [Conway's Game of Life][gol] using if statements. Hand waving furiously over other parts of the system, you might get:

[ssm]: https://en.wikipedia.org/wiki/Finite-state_machine
[4r]: https://leanpub.com/4rulesofsimpledesign
[gol]: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life

{% highlight javascript %}
var Universe = {
  // ...
  numberOfNeighbours: function (location) {
    // ...
  }
};

var thisGame = extend({}, Universe);

var Cell = {
  alive: function () {
    return this._alive;
  },
  numberOfNeighbours: function () {
    return thisGame.numberOfNeighbours(this._location);
  },
  aliveInNextGeneration: function () {
    if (this.alive()) {
      return (this.numberOfNeighbours() === 3);
    }
    else {
      return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3);
    }
  }
};

var someCell = extend({
  _alive: true,
  _location: {x: -15, y: 12}
}, Cell);
{% endhighlight %}

This business of having an `if (alive())` in the middle of a method is a hint that cells are stateful. We can extract this into a FSM with delegation:

{% highlight javascript %}
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
    return fale;
  },
  aliveInNextGeneration: function () {
    return (this.numberOfNeighbours() === 2 || this.numberOfNeighbours() === 3);
  }
};

var FsmCell = {
  numberOfNeighbours: function () {
    return thisGame.numberOfNeighbours(this._location);
  }
}

delegateToOwn(Cell, ['alive', 'aliveInNextGeneration'], '_state');

var someFsmCell = extend({
  _state: Alive,
  _location: {x: -15, y: 12}
}, FsmCell);
{% endhighlight %}

Our `FsmCell`s delegate `alive` and `aliveInNextGeneration` to their `_state` property, and you can change the state of a cell by assigning it a new state:

{% highlight javascript %}
someFsmCell._state = Dead;
{% endhighlight %}

In practice, states would be assigned en masse, but this demonstrates one of the simplest possible state machines. In the wild, most business objects are state machines, sometimes with multiple, loosely coupled states. Employees can be in or out of the office, on probation, on contract, or permanent. Part time or full time.

Delegation to a property representing state takes advantage of late binding to break behaviour into smaller components that have cleanly defined responsibilities.

### late bound forwarding

The exact same technique can be used for forwarding to a property, and forwarding to a property can also be used for some kinds of state machines. Forwarding to a property has lower coupling than delegation, and is preferred where appropriate.

---

## Summary

We've seen four techniques for separating object behaviour from object properties:

1. Mixins
2. Private Mixins
3. Forwarding
4. Delegation

We've also seen how to implement "later binding" delegation by delegating or forwarding to an object property, and how this can be used for building a state machine. We've seen how these four techniques can be understood to implement two orthogonal ideas: Early versus late binding, and whether methods are evaluated in the receiver's context or the metaobject's context.

We deliberately haven't discussed prototypes or the things you can build with prototypes (like classes). Instead, we take our understanding gleaned from these prototype-less techniques to help us understand what prototypes offer and what tradeoffs they make.

(discuss on [hacker news](https://news.ycombinator.com/item?id=7566879) and [reddit](http://www.reddit.com/r/javascript/comments/22p3ex/mixins_forwarding_and_delegation_in_javascript/))
