---
title: "From Mixins to Object Composition"
layout: default
tags: [allonge]
---

In [Why Are Mixins Considered Harmful][harmful], we saw that concatenative sharing--as exemplified by mixins--leads to snowballing complexity because of three effects:

[harmful]: http://raganwald.com/2016/07/16/why-are-mixins-considered-harmful.html

0. Lack of Encapsulation
0. Implicit Dependencies
0. Name Clashes

We looked at some variations on creating encapsulation to help reduce the "surface area" for dependencies to grow and names to clash, but noted that this merely slows down the growth of the problem, it does not fix it.

That being said, that doesn't mean that mixins are terrible. Mixins are simple to understand and to implement. As we'll see in this essay, it is straightforward to refactor away from mixins, and then we can work on reducing our code's complexity.

For many projects, mixins are the right choice right now, the important thing is to understand their limitations and the problems that may arise, so that we can know when to incorporate a heavier, but more complexity-taming architecture.

It is more important to know how to refactor to a particular architecture, than to know in advance which architecture can serve all of our needs now, and in the future.

In this post, we are going to look at _object composition_, a technique that has a few more moving parts than mixins, but opens up the opportunity to make dependencies explicit, enforce a stronger level of encapsulation, and can be built upon for richer forms of method decoration.

---

[![mixing deck](/assets/images/mixing-deck.jpg)](https://www.flickr.com/photos/sparetomato/2641114425)

### encapsulation for mixins

Mixins can encapsulate methods and properties. We saw in [the previous post][harmful] how we can use symbols (or pseudo-random strings) to separate methods intended to be a part of the interface from those intended to be part of the implementation (a/k/a "private"). Take this mixin where we have just used a comment to indicate our preferences:

```javascript
const Coloured = {
  // __Public Methods__
  setColourRGB ({r, g, b}) {
    return this.colourCode = {r, g, b};
  },
  getColourRGB () {
    return this.colourCode;
  },
  getColourHex () {
    return this.rgbToHex(this.colourCode);
  },

  // __Private Methods__
  componentToHex(c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex({r, g, b}) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
};

class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
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

Object.assign(Todo.prototype, Coloured);
```

We write `Coloured` as:

```javascript
const colourCode = Symbol('colourCode');
const componentToHex = Symbol('componentToHex');
const rgbToHex = Symbol('rgbToHex');

const Coloured = {
  setColourRGB ({r, g, b}) {
    return this[colourCode] = {r, g, b};
  },
  getColourRGB () {
    return this[colourCode];
  },
  getColourHex () {
    return this[rgbToHex](this.getColourRGB());
  },
  [componentToHex](c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  [rgbToHex]({r, g, b}) {
    return "#" + this[componentToHex](r) + this[componentToHex](g) + this[componentToHex](b);
  }
};
```

But let's move along a bit and we'll see how to fix the implicit/explicit problem. First, let's look at another way to create encapsulation, using composition.

---

[![stone wall](/assets/images/stone-wall.jpg)](https://www.flickr.com/photos/79586895@N00/2361224966)

### encapsulating behaviour with object composition

"Composition" is a general term for any mixing of behaviour from two entities. Mixins as described above is a form of composition. Functional composition is another. Object composition is when we mix two objects, not an object and a prototype or two functions.

Let's do it by hand: We'll start with Our `Todo` class as usual:

```javascript
class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
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

We'll give it a `colouredObject` property, using the `Symbol` pattern from above:

```javascript
const colourCode = Symbol('colourCode');
const componentToHex = Symbol('componentToHex');
const rgbToHex = Symbol('rgbToHex');

const Coloured = {
  setColourRGB ({r, g, b}) {
    return this[colourCode] = {r, g, b};
  },
  getColourRGB () {
    return this[colourCode];
  },
  getColourHex () {
    return this[rgbToHex](this.getColourRGB());
  },
  [componentToHex](c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  [rgbToHex]({r, g, b}) {
    return "#" + this[componentToHex](r) + this[componentToHex](g) + this[componentToHex](b);
  }
};

const colouredObject = Symbol('colouredObject');

class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
    this[colouredObject] = Object.assign({}, Coloured);
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

Now we have a copy of `Coloured` in every `Todo` instance. But we haven't actually added any behaviour to `Todo`. To do that, we'll delegate some methods from `Todo` to `Coloured`:

```javascript
class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
    this[colouredObject] = Object.assign({}, Coloured);
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
  setColourRGB ({r, g, b}) {
    return this[colouredObject].setColourRGB({r, g, b});
  }
  getColourRGB () {
    return this[colouredObject].getColourRGB();
  }
  getColourHex () {
    return this[colouredObject].getColourHex();
  }
}
```

Presto, we have the `setColourRGB`, `getColourRGB`, and `getColourHex` methods added to `Todo`, but we delegate them to a separate object, `this[colouredObject]`, to implement. All of `this[colouredObject]`'s properties and other methods are somewhat encapsulated away.

As a bonus, we have what we might call "weak explicit dependencies:" Looking at `Todo`, it's quite easy to see that we have delegated the `setColourRGB`, `getColourRGB`, and `getColourHex` methods. If we had a much bigger and more complex class with lots of object compositions, we could easily see which methods were delegated to which objects.

All the same, this has an awful lot of moving parts compared to `Object.assign`. Do we have to type all of this? Or is there an easier way?

---

### automating object composition

Let's automate the process. To begin with, let's recognize that although `Object.assign` can be all you need for naïve mixins, a better way to write them is to turn the mixin definition into a function that transforms a class, like this:

```javascript
const FunctionalMixin = (behaviour) =>
  target => {
    Object.assign(target.prototype, behaviour);
    return target;
  };

const colourCode = Symbol('colourCode');
const componentToHex = Symbol('componentToHex');
const rgbToHex = Symbol('rgbToHex');


const Coloured = FunctionalMixin({
  setColourRGB ({r, g, b}) {
    return this[colourCode] = {r, g, b};
  },
  getColourRGB () {
    return this[colourCode];
  },
  getColourHex () {
    return this[rgbToHex](this.getColourRGB());
  },
  [componentToHex](c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  [rgbToHex]({r, g, b}) {
    return "#" + this[componentToHex](r) + this[componentToHex](g) + this[componentToHex](b);
  }
});

const Todo = Coloured(class {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
});
```

Angus Croll calls this a [functional mixin][croll], and [they work very well in ES6][fmes6].

[fmes6]: http://raganwald.com/2015/06/17/functional-mixins.html "Functional Mixins in ECMAScript 2015"

[croll]: https://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/

If we are adventurous, we might use a compiler that supports proposed--but unratified--JavaScript features like class decorators. If we do, functional mixins are very elegant:

```javascript
@Coloured
class Todo {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
};
```

Now, if we write our mixins like this, what about refactoring mixins into object composition?

```javascript
const ObjectComposer = (behaviour) =>
  target => {
    const composedObject = Symbol('composedObject');
    const exportedMethodNames = Object.keys(behaviour);

    for (const methodName of exportedMethodNames) {
      Object.defineProperty(target.prototype, methodName, {
        value: function (...args) {
          if (this[composedObject] == null) {
            this[composedObject] = Object.assign({}, behaviour);
          }
          return this[composedObject][methodName](...args);
        },
        writeable: true
      });
    }
    return target;
  };

const colourCode = Symbol('colourCode');
const componentToHex = Symbol('componentToHex');
const rgbToHex = Symbol('rgbToHex');

const Coloured = ObjectComposer({
  setColourRGB ({r, g, b}) {
    return this[colourCode] = {r, g, b};
  },
  getColourRGB () {
    return this[colourCode];
  },
  getColourHex () {
    return this[rgbToHex](this.getColourRGB());
  },
  [componentToHex](c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  [rgbToHex]({r, g, b}) {
    return "#" + this[componentToHex](r) + this[componentToHex](g) + this[componentToHex](b);
  }
});

const Todo = Coloured(class {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
});
```

If we look carefully at the `ObjectComposer` function, we see that for each method of the behaviour we want to compose, it makes a method in the target's prototype that delegates the method to the composed object. In our hand-rolled example, we initialized the object in the target's constructor. For simplicity here, we lazily initialize it.

And wonder of wonders, because `Object.keys` does not enumerate symbols, every method we bind to a symbol in the behaviour is kept "private."

This is a bit more complex, but it gives us almost everything mixins already gave us. But we wanted more, specifically explicit dependencies. Can we do that?

---

[![list](/assets/images/list.jpg)](https://www.flickr.com/photos/liste1/4389738706)

### making delegation explicit

Sure thing! Here's a new version of `ObjectComposer`:

```javascript
const ObjectComposer = (behaviour) =>
  (...exportedMethodNames) =>
    target => {
      const composedObject = Symbol('composedObject');

      for (const methodName of exportedMethodNames) {
        Object.defineProperty(target.prototype, methodName, {
          value: function (...args) {
            if (this[composedObject] == null) {
              this[composedObject] = Object.assign({}, behaviour);
            }
            return this[composedObject][methodName](...args);
          },
          writeable: true
        });
      }
      return target;
    };

const Coloured = ObjectComposer({
  // __Public Methods__
  setColourRGB ({r, g, b}) {
    return this.colourCode = {r, g, b};
  },
  getColourRGB () {
    return this.colourCode;
  },
  getColourHex () {
    return this.rgbToHex(this.colourCode);
  },

  // __Private Methods__
  componentToHex(c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex({r, g, b}) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
});

const Todo = Coloured('setColourRGB', 'setColourRGB')(class {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
});

let t = new Todo('test');
t.setColourRGB({r: 1, g: 2, b: 3});
t.getColourHex();
  //=> t.getColourHex is not a function
```

That is correct! We didn't explicitly say that we wanted to "import" the `getColourHex` method, so we didn't get it. This is fun! What about resolving name conflicts? Let's make a general-purpose renaming option:

```javascript
const ObjectComposer = (behaviour) =>
  (...exportedMethodNames) => {
    const methodNameMap = exportedMethodNames.reduce((acc, name) => {
      const splits = name.split(' as ');

      if (splits.length === 1) {
        acc[name] = name;
      } else if (splits.length == 2) {
        acc[splits[0]] = splits[1]
      }
      return acc;
    }, {});
    return target => {
      const composedObject = Symbol('composedObject');

      for (const methodName of Object.keys(methodNameMap)) {
        const targetName = methodNameMap[methodName];

        Object.defineProperty(target.prototype, targetName, {
          value: function (...args) {
            if (this[composedObject] == null) {
              this[composedObject] = Object.assign({}, behaviour);
            }
            return this[composedObject][methodName](...args);
          },
          writeable: true
        });
      }
      return target;
    };
  }

const Coloured = ObjectComposer({
  // __Public Methods__
  setColourRGB ({r, g, b}) {
    return this.colourCode = {r, g, b};
  },
  getColourRGB () {
    return this.colourCode;
  },
  getColourHex () {
    return this.rgbToHex(this.colourCode);
  },

  // __Private Methods__
  componentToHex(c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex({r, g, b}) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
});

const Todo = Coloured('setColourRGB as setColorRGB', 'getColourRGB as getColorRGB', 'getColourHex as getColorHex')(class {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
});

let t = new Todo('test');
t.setColorRGB({r: 1, g: 2, b: 3});
t.getColorHex()
  //=> #010203
```

I do not condone these Americanized misspellings, of course, but they demonstrate a facility that can be used to resolve unavoidable naming conflicts.[^error]

[^error]: We can also extend this function to report if we are accidentally overwriting an existing method. Whether we wish to do so is an interesting discussion we will not have here. Some feel that permitting overriding is excellent OOP practise, others dissent. A very good practise is to only permit it when signalling that you intend to do so, e.g. to write `'override setColourRGB'`. We will leave those details for another day.

---

[![recursive surface](/assets/images/recursive-surface.jpg)](https://www.flickr.com/photos/elijahporter/8056518708)

### going deeper

Our naïve mixins can do a few things that our object composition cannot. For one thing, we can write a method that returns `this`. Our composed objects should not return `this`, because their `this` is not the same thing as the target instance's `this`.

A related issue is that our composed objects cannot call any of the class's methods. We can write completely independent standalone functionality like `Coloured` above, but we can't write functionality that "decorates" existing functionality.

For example, what if we want to compose this behaviour with `Todo`?

```javascript
const Coloured = {
  // __Public Methods__
  setColourRGB ({r, g, b}) {
    return this.colourCode = {r, g, b};
  },
  getColourRGB () {
    return this.colourCode;
  },
  getColourHex () {
    return this.rgbToHex(this.colourCode);
  },
  colouredTitle () {
    return `<span font-color=${this.getColourHex()}>${this.title()}</span>`;
  },

  // __Private Methods__
  componentToHex(c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex({r, g, b}) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
};
```

The `colouredTitle` method isn't going to work, because we want to access the instance's `title` method, not the composed object (which doesn't have one). What to do?

Well, if we can use delegation to "export" a bunch of methods, perhaps we can use delegation to import them as well:

```javascript
const ObjectComposer =
  (...importedMethodNames) =>
    (behaviour) =>
      (...exportedMethodNames) =>
        target => {
          const composedObject = Symbol('composedObject');
          const instance = Symbol('instance');

          for (const exportedMethodName of exportedMethodNames) {
            Object.defineProperty(target.prototype, methodName, {
              value: function (...args) {
                if (this[composedObject] == null) {
                  this[composedObject] = Object.assign({}, behaviour);
                  this[composedObject][instance] = this;
                  for (const importedMethodName of importedMethodNames) {
                    this[composedObject][methodName] = function (...args) {
                      return this[instance][methodName](...args);
                    }
                  }
                }
                return this[composedObject][methodName](...args);
              },
              writeable: true
            });
          }
          return target;
        };
```

Now we can write:

```javascript
const Coloured = ObjectComposer('title')({
  // __Public Methods__
  setColourRGB ({r, g, b}) {
    return this.colourCode = {r, g, b};
  },
  getColourRGB () {
    return this.colourCode;
  },
  getColourHex () {
    return this.rgbToHex(this.colourCode);
  },
  colouredTitle () {
    return `<span font-color=${this.getColourHex()}>${this.title()}</span>`;
  },

  // __Private Methods__
  componentToHex(c) {
    const hex = c.toString(16);

    return hex.length == 1 ? "0" + hex : hex;
  },
  rgbToHex({r, g, b}) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }
});

const Todo = Coloured('setColourRGB', 'colouredTitle')(class {
  constructor (name) {
    this.name = name || 'Untitled';
    this.done = false;
  }
  title () {
    return this.name;
  }
  do () {
    this.done = true;
    return this;
  }
  undo () {
    this.done = false;
    return this;
  }
});

let t = new Todo('test');

t.setColourRGB({r: 1, g: 2, b: 3});
t.colouredTitle();
  //=> <span font-color=#010203>test</span>
```

Note that we are explicit about our dependencies in both directions.[^error2]

[^error2]: As already noted, we can also add lots of error checking, like noting when a dependency doesn't exist. The `Coloured` function should raise an error if it depends on `title` but is being mixed into a class that doesn't have a `title` method.

---

### can we go even deeper?

Sure. We could use the [subclass factory] pattern, this would allow us to override methods, and call `super`. It also has some performance advantages in a modern JIT. We usually don't need to prematurely optimize for performance, but sometimes we care deeply about that.

[subclass factory]: http://raganwald.com/2015/12/28/mixins-subclass-factories-and-method-advice.html

Now that we have the beginnings of a protocol for declaring our dependencies in both directions, we can start thinking about other kinds of behaviour we'd like to mix in, like decorating individual methods with before or after advice, e.g. `updateLastModified after setColourRGB`.

If we whole-heartedly embrace object composition, we can even go from composing objects with classes to composing classes with each other: This would allow us to write constructors for our composed objects.

---

[![the finish line](/assets/images/finish-line.gif)](https://www.flickr.com/photos/seattlemunicipalarchives/2677136693)

### so where do we finish?

Let's step back and look at what we have: We have a way to make something that looks a lot like  functional mixin, but behind the scenes it implements object composition. Unlike a mixin, we get explicit dependencies. This adds some declarations to our code, but we win in the long run by having code that is easier to trace when we need to work out what is going on or how to refactor something that has grown.

```javascript
// create an object composition function.
// this object depends upon the class defining
// a `title` method:
const Coloured = ObjectComposer('title')({
  // ...
});

// compose `Coloured` with `Todo`, including the
// `setColouredRGB` method and the `colouredTitle`
// method, renamed `htmlTitle`:
const Todo = Coloured('setColourRGB', 'colouredTitle as htmlTitle')(class {
  // ...
});
```

Our example implementation is dense but small, showing us that JavaScript can be powerful when we choose to put it to work. And now we have the tools to tame growing dependencies, implicit dependencies, and name clashes.

And that's enough for us to make sensible decisions about whether to use mixins now and refactor in the future, stick with mixins, or go for composition right off the bat.

---

[![the composition](/assets/images/composition.jpg)](https://www.flickr.com/photos/nickwebb/3734989365)

### afterword: "prefer composition to inheritance"

The problems outlined with mixins are the same as the problems we have discovered with inheritance over the last 30+ years. Subclasses have implicit dependencies on their superclasses. This makes superclasses extremely fragile: One little change could break code in a subclass that is in an entirely different file, what we call "action at a distance," or its more pejorative term, "coupling." Likewise, naming conflicts can easily occur between subclasses and superclasses.

The root cause is the lack of encapsulation in the relationship between subclasses and superclasses. This is the exact same problem between classes and mixins: The lack of encapsulation.

In OOP, the unit of encapsulation is the object. An object has a defined interface of public methods, and behind this public interface, it has methods and properties that implement its interface. Other objects are supposed to interact only with the public methods.

For this reason, the mature OOP community has migrated away from "inheritance" as the primary way to share behaviour, towards object composition and delegation. The revelations we are having about mixins are a sign that as the JavaScript community matures, it will inevitably rediscover what OOP languages already know.

---

### have your say

Have an observation? Spot an error? You can open an [issue](https://github.com/raganwald/raganwald.github.com/issues/new), discuss this on [reddit](https://www.reddit.com/r/javascript/comments/4u243o/from_mixins_to_object_composition_raganwaldcom/), or even [edit this post](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-07-20-prefer-composition-to-inheritance.md) yourself!

---

### notes
