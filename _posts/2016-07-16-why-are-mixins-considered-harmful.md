---
title: "Why Are Mixins Considered Harmful?"
layout: default
tags: [allonge]
---

In [Mixins Considered Harmful](https://facebook.github.io/react/blog/2016/07/13/mixins-considered-harmful.html), Dan Abramov wrote something that sounds familiar to everyone[^everyone] who works with legacy applications:

[^everyone]: Yes, I said _everyone_, I didn't cover my ass with a phrase like "many people." Everyone.

> Some of our code using React gradually became incomprehensible. Occasionally, the React team would see groups of components in different projects that people were afraid to touch. These components were too easy to break accidentally, were confusing to new developers, and eventually became just as confusing to the people who wrote them in the first place.

This is not specific to "React:" All legacy applications exhibit this behaviour: They accumulate chunks of code that are easy to break and confusing to everyone, even the original authors. Worse, such chunks of code tend to grow over time, they are infectious: People write code to work around the incomprehensible code instead of refactoring it, and the workarounds become easy to break accidentally and confusing in their own right. The problems grow over time.

[![bikes on queen street west in toronto](/assets/images/bikes.jpg)](https://www.flickr.com/photos/55828065@N05/8294796797)

How do mixins figure into this? Dan articulated three issues with mixins:

0. Mixins introduce implicit dependencies
0. Mixins cause name clashes
0. Mixins cause snowballing complexity

He's 100% right!

### dependencies

Mixins absolutely introduce dependencies. Let's look at how this happens. The simplest form of mixin uses `Object.assign` to mix a template object into a class's prototype. For example, here's a class of todo items:

```javascript
class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
}
```

And a "mixin" that is responsible for colour-coding:

```javascript
const Coloured = {
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourRGB () {
    return this.colourCode;
  }
};
```

Mixing colour coding into our Todo prototype is straightforward:

```javascript
Object.assign(Todo.prototype, Coloured);

new Todo('test')
  .setColourRGB({r: 1, g: 2, b: 3})
  //=> {"name":"test","done":false,"colourCode":{"r":1,"g":2,"b":3}}
```

Note that our mixin simply grows our class' prototype via copying, a process sometimes called "concatenative sharing." Because the mixin's methods wind up being the prototype's methods, this is really no different than simply adding the mixin's methods directly to the class by hand.

The consequence is that every mixin and class method can access every other mixin and class method. Furthermore, every mixin method can read and write the properties written by class methods, and every class method can read and write the properties written by mixin methods.

In short, the concatenative sharing mechanism permits the maximum possible set of dependencies between the class and its mixins. This is a problem, because these dependencies exemplify the complete opposite of the principles of encapsulation: The point of encapsulation is to define an interface through which entities interact with each other. Each entity then implements its behaviour using private methods and properties that are hidden from other entities.

Mixins do not permit any encapsulation whatsoever, and over time dependencies gradually creep into the code.

### implicit dependencies

So we see that mixins permit dependencies. But worse, they permit _implicit_ dependencies. Consider our `Coloured` mixin from above. It defines two methods, `setColourRGB` and `getColourRGB`. But when we mix it into `Todo`, how do we know what methods we are mixing in? We don't:

```javascript
Object.assign(Todo.prototype, Coloured);
```

We have to examine the code carefully to determine that we have added `setColourRGB` and `getColourRGB` to the `Todo` class. And if we use multiple mixins, the source for each method or property must be divined through careful analysis of the source code and behaviour.

As we saw above, mixins also introduce the possibility of dependencies between a mixin's methods and a class's methods. Just as we must carefully examine the source to understand what dependencies the `Todo` class has on `Coloured`, we must likewise carefully examine `Coloured` to determine whether it has any dependencies on `Todo`. In this case, it doesn't, but that is not obvious.

As code grows, as `Coloured` gains in complexity, dependencies can be introduced, but they will not be obvious.

This problem is another that has been well-understood for decades. JavaScript has tried to address it in another context: When we use modules in ES6, each module explicitly names the entities it exports, for example this module exports two functions:

```javascript
export function getWith (key) {
  return (map) => map[key];
}

export function dict (map) {
  return (key) => map[key];
}

/// ...
```

All other entities are private to the module. This is encapsulation, and we saw that mixins do not provide encapsulation. But modules do something else as well. When we import a module, we explicitly name the entities we wish to import from it:

```javascript
import { getWith } from 'foo/bar/lists';

/// ...
```

This is an *explicit* dependency. We can now use the `getWith` function at will. If we later try to use the `dict` function, it will not be available because we haven't imported it. We have to manually import it as well, like this:

```javascript
import { getWith, dict } from 'foo/bar/utils';

/// ...
```

The dependencies are _explicit_, not implicit. We can see the dependencies declared in the source, and we can even write tools for statically checking that the dependencies are fulfilled.[^static] If mixin dependencies were explicit, we would know which methods were being mixed into a class because they would be declared. And likewise, there would be some mechanism for declaring which methods and/or properties that a mixin depends upon when it is mixed int a class.

[^static]: being able to statically check dependencies is marvellously useful, but it solves a problem that is entirely orthogonal to the software engineering problem we are discussing here.

But the various patterns for implementing "naïve" mixins have no such mechanisms for making dependencies explicit. As a result, dependencies can creep as we see above, _and_ there is no obvious way to notice that the dependencies are creeping, or to disentangle the dependencies.

### name clashes

Since class methods and mixin methods wind up all being properties of the class prototype, you cannot give any method or property any name you like. In one big class file, you have the same problem: The various methods and properties needed all must have the same name.

What makes mixins different, is that in a single class you can easily inspect the code and determine which property and method names are already in use. But when modifying a mixin, you cannot easily determine which class or classes may already depend on this mixin. The name clashes reach out between files. Mixins create "action-at-a-distance," and the name clashes happen at a distance as well.

For example, what happens if we decide that we ought to be able to name colours instead of using their RGB values?

```javascript
const Coloured = {
  setColourName (name) {
    this.name = name;
  },
  setColourRGB ({r, g, b}) {
    this.colourCode = {r, g, b};
    return this;
  },
  getColourName () {
    return this.name;
  },
  getColourRGB () {
    return this.colourCode;
  }
};
```

Oops. We just broke `Todo`. The name clash problem is a second-order consequence of concatenative sharing. JavaScript solved this problem for modules: When you import a module, you explicitly name your dependencies as we saw above. You can also rename them to avoid conflicts:

```javascript
import { getWith: squareBracketAccessWith } from 'foo/bar/lists';

function getWith (key) {
  return (gettable) => gettable.get(key);
}

/// ...
```

This file imports `getWith` as `squareBracketAccessWith` so that it does not conflict with the `getWith` function it defines for itself.

Mixins provide no mechanism for resolving name clashes, and because they have implicit dependencies, we have no easy way of even noticing that we have a name clash to begin with. So as we grow or classes and mixins, we bump into them more and more. Worse, if we try to expand a class by adding another mixin, we may discover that we have irresolvable name clashes.

### snowballing complexity

Dan wrote:

> Every new requirement makes the mixins harder to understand. Components using the same mixin become increasingly coupled with time. Any new capability gets added to all of the components using that mixin. There is no way to split a “simpler” part of the mixin without either duplicating the code or introducing more dependencies and indirection between mixins. Gradually, the encapsulation boundaries erode, and since it’s hard to change or remove the existing mixins, they keep getting more abstract until nobody understands how they work.

This makes sense, and it's a direct consequence of the dependencies between mixins, the fact that these dependencies are implicit, and the fact that names can clash between mixins.

### this is all true, and very familiar

If this seems very familiar, congratulations. Like me, you wrote Java in the 1990s and 2000s. Or Ruby in the 2000s.[^or] When you have a hierarchy of classes, you have the exact same set of problems:

[^or]: Or C++. Or Smalltalk. Or Python. Or any other OOP language, really. Let's not get hung up on whether it was actually Java.

When you have classes depending upon superclasses, you have implicit dependencies and name clashes caused by the lack of encapsulation. A subclass has access by default to all of the private properties and methods of its superclass, just as a class has access by default to all of the private properties and methods of its superclass.

Languages like Java, Ruby, and C++ provide mechanisms for minimizing these dependencies in the form of access controls. A superclass has a way of making certain properties and methods `private`, and such properties and methods are not only walled off from access by the outside world, they are not accessible by subclass code either.

Such access mechanisms help control dependencies and eliminate some of the name clashes by reducing the "surface area" of implicit dependencies. But such languages still have the implicit dependencies problem, and experience has shown that over time, class hierarchies snowball in complexity just as Dan describes mixin architectures as snowballing in complexity.

In classes, this is known as a [fragile base class problem](https://en.wikipedia.org/wiki/Fragile_base_class_problem), and it is exactly the same as the mixin problem.

It turns out that with class hierarchies, we have a fragile base class problem and a many-to-many dependencies problem. Mixins solve the many-to-many dependencies problem, but spread out the fragile base class problem and introduce new vectors for dependencies between mixins.

We can reduce the surface area with encapsulation techniques, but if we want to eliminate the implicit dependencies problem, we need a whole new mechanism for mixing in behaviour. Concatenative sharing simply doesn't scale over time, space, and teams.

## So what can we do about mixins?

The first and simplest thing to do about mixins doesn't solve the problems of implicit dependencies and name clashes, but it will reduce the rate at which they increase complexity. Thus, your architecture will fail to scale, but fail at a much slower rate.

Sometimes, that's enough! Sometimes, software development is about being lean, about tightening the conjecture-experiment-feedback cycle. Doing "the minimum" to get to the next cycle is sometimes a big win.

The first and simplest thing to do is to impose some encapsulation for classes and mixins. Do not have all your "private" properties and methods intermingled. This will reduce the number of accidental (or deliberate) dependencies and eliminate a number of accidental name clashes.

There are a few techniques. The first is to use helper functions instead of private methods. Let's say we have:

```javascript
export default class Widget {

  // __public methods__
  foo (baz) {
    this._bar(baz);
  },

  // __private methods__
  _bar(baz) {
    return this.snaf = baz;
  }

  // ...
}
```

`_bar` is obviously a private method, and we have signalled this with a naming convention. However, we can still have someone make a dependency on it, and we can accidentally define a `_bar` in a mixin by accident.

We can refactor `_bar` into a helper function by extracting its body from the class, and then changing our invocations from `this._bar(baz)` to `bar.call(this, baz)`:

```javascript
export default class Widget {

  // __public methods__
  foo (baz) {
    bar.call(this, baz);
  },

  // ...
}

function bar(baz) {
  return this.snaf = baz;
}
```

By invoking helper functions like `bar` with `.call(this, baz)`, we give them access to the instance's private state just like a method. However, because helper functions are explicitly _not_ exported, they are private to our class.

If we use this technique with classes and with mixins, we limit the dependencies and potential name clashes to those we explicitly have decided ought to be public methods. Helper functions can never name clash because they exist in separate scopes.

The syntax looks a little unusual, but it is better to get all your work done in 40 hours a week using something that looks odd than to work 70 hours a week dealing with ugly consequences of code that looks simple but has terrible consequences.

The only disadvantage of this approach is that while it solves the problem of dependencies and name clashes between methods, it does nothing for properties. Someone can write a mixin that depends on the `snaf` property or accidentally collides with it.

To fix that problem, we either wait until JavaScript introduces private properties, or we use symbols for method and property names.

### using symbols for method and property names

With an extra level of indirection, we can use symbols for method and property names instead of strings. Here's how to refactor our class above to use symbols as method and property names.

We start with our base class or mixin. We'll rewrite the above example to look like a [subclass factory](http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html) for the sake of argument:

```javascript
export default subclassFactory({

  // __public methods__
  foo (baz) {
    this._bar(baz);
  },

  // __private methods__
  _bar(baz) {
    return this.snaf = baz;
  }

  // ...
});
```

The first step is to replace the names of our private methods and properties with string constants:

```javascript
const bar = 'bar';
const snaf = 'snaf';

export default subclassFactory({

  // __public methods__
  foo (baz) {
    this[bar](baz);
  },

  // __private methods__
  [bar](baz) {
    return this[snaf] = baz;
  }

  // ...
});
```

Next, we replace the strings with symbols:

```javascript
const bar = Symbol.'bar';
const snaf = 'snaf';

export default subclassFactory({

  // __public methods__
  foo (baz) {
    this[bar](baz);
  },

  // __private methods__
  [bar](baz) {
    return this[snaf] = baz;
  }

  // ...
});
```

Now our `bar` private method and `snaf` property are still properties of our subclass factory object and instance respectively, but their actual names are not shared with the class or other mixins and will not every result in a name clash.

Using either helper functions or symbols for private methods and properties will cut down on dependencies, but if we want to do something about _implicit_ dependencies, we need to rethink mixins altogether.

We'll do that in the next post.

---

### have your say

(you can [edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-07-16-why-are-mixins-considered-harmful.md))

---

### notes
