---
title: "Ruby's Hashes and Perl's Autovivification, in JavaScript"
tags: [recursion,allonge]
---

The Ruby programming language has the notion of a [Hash]. A `Hash` is a dictionary-like collection of unique keys and their values. Ruby hashes have most of the semantics of an ES6 `Map`, but also have the syntactic conveniences of Plain-Old-JavaScript-Objects ("POJOs").

[Hash]: https://ruby-doc.org/core-2.5.1/Hash.html

Interestingly, Ruby hashes also have the notion of programmatically determine a default value to be returned when accessing keys that have not been set. In JavaScript, the default value is always `undefined`.

In this essay we will look at rolling our own `Hash` class with Ruby-like semantics, and then we'll examine one of the most interesting things that can be built on top of a `Hash`: [Autovivification][autovivification]. We'll go into a more thorough explanation below, but autovivifying hashes can be summed up as, *Hashes that are recursively hashes, all the way down*.

If that doesn't whet our curiosity, nothing will!

---

[![©2007 Eagan Snow](/assets/images/ideaistic.jpg)](https://www.flickr.com/photos/egansnow/362210305)

---

## Ruby Hashes

As noted, the Ruby programming language has the notion of a [Hash]. A `Hash` is a dictionary-like collection of unique keys and their values.[^namunamu]

[^namunamu]: Programming language libraries have an awful track record for naming things. A "hash" is generally, of course, a way of implementing a "dictionary" or "associative array." But we generally use the word "Hash" to describe a dictionary, even if we don't particularly care how it's implemented.

Ruby hash literals have several syntaxes, including:

```ruby
grades = { "Jane Doe" => 10, "Jim Doe" => 6 }
options = { :font_size => 10, :font_family => "Arial" }
options2 = { font_size: 10, font_family: "Arial" }
```

Ruby hashes are thus a little like JavaScript's `Map`, because they permit the use of any object as a key, not just strings. On the other hand, you can access the values of a Ruby hash using square braces, like this:

```ruby
grades = { "Jane Doe" => 10, "Jim Doe" => 6 }
options = { :font_size => 10, :font_family => "Arial" }
options2 = { font_size: 10, font_family: "Arial" }

grades["jane doe"]
  #=> 10
options[:font_family]
  #=> "Arial"
```
That's more like a JavaScript object. With a JavaScript `Map`, we have to use `.get` and `.set`, instead of `[]` and `[]=`.

Ruby hashes have a default value that is returned when accessing keys that do not exist in the hash. If no default is set, `nil` is used. That is like JavaScript objects, which return `undefined` when we access a key that was not set. But in Ruby, you can set a different default value by sending it as an argument to `#new`:

```ruby
grades = Hash.new(0)
grades["Dorothy Doe"] = 9

grades["Tom Swift"]
  #=> 0
grades["Dorothy Doe"]
  #=> 9
```

Another way to provide a default value that is returned when accessing keys that do not exist in the hash is to supply a block. If a block is specified, it will be called with the hash object and the key, and should return the default value. It is the block's responsibility to store the value in the hash if required.

```ruby
h = Hash.new { |hash, key| hash[key] = "Go Fish: #{key}" }
h["c"]           #=> "Go Fish: c"
h["d"]           #=> "Go Fish: d"
```

JavaScript objects do not have any notion of a default value that we can set. It's always `undefined`.

---

### implementing hash in javascript

Given that JavaScript already has `Object` and `Map`, the only motivation to snarf any of `Hash`'s behaviour is going to be the ability to set our own default values. This is rather handy in Ruby, and it might be handy in JavaScrip too. So let's come up with a toy implementation we can play with.

The first thing we have to decide is whether we'll base our implementation on `Object` or `Map`. For the purposes of this essay, `Object` has the nicer syntax, and using objects as dictionaries is the usual case in JavaScript. And a `Map` implementation will be trivial once the basic pattern is articulated. (The `HashMap` implementation based on delegating to a `Map`, is <a href="#HashMap">below</a>.)

When we create an instance of `Hash`, we'll wrap it in a `Proxy`[^proxy] to handle access.

[^proxy]: The [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object is used to define custom behaviour for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc). It is enormously flexible, but extremely slow compared to "native" behaviour. Does that mean we should never use it? No, it means we should use our judgment.

What behaviour do we want?

```javascript
// use case zero
const obj = new Hash();

obj instanceof Hash
  //=> true

// use case one
const ages = new Hash();
ages["Dorothy Doe"] = 23;

ages["Tom Swift"]
  //=> undefined
ages["Dorothy Doe"]
  //=> 23

// use case two
const grades = new Hash(0);
grades["Dorothy Doe"] = 9;

grades["Tom Swift"]
  //=> 0
grades["Dorothy Doe"]
  //=> 9

// use case three
const h = new Hash((hash, key) => hash[key] = `Go Fish: ${key}`);

h["c"]
  //=> "Go Fish: c"
h["d"]
  //=> "Go Fish: d"
```

Since classes derive from `Object` by default, and since JavaScript objects all support `[]` notation, we can just use an empty class to handle use cases zero and one:

```javascript
class Hash {
  // T.B.D.
}

const obj = new Hash();

obj instanceof Hash

const ages = new Hash();
ages["Dorothy Doe"] = 23;

ages["Tom Swift"]
  //=> undefined
ages["Dorothy Doe"]
  //=> 23
```

Use case two allows us to pass a non-function value as a default. We'll make a constructor function, and incorporate a `Proxy`. Note that JavaScript allows us to return something other than the object created from a constructor. That is ripe for abuse, but returning decorated instances form a constructor is perfectly cromulant.

```javascript
class Hash {
  constructor (defaultValue = undefined) {
    return new Proxy(this, {
      get (target, key) {
            return Reflect.has(target, key)
                 ? Reflect.get(target, key)
                 : defaultValue;
          }
    });
  }
}

const grades = new Hash(0);
grades["Dorothy Doe"] = 9;

grades["Tom Swift"]
  //=> 0
grades["Dorothy Doe"]
  //=> 9
```

Our third use case involves checking whether the defaultValue is an ordinary value or a function. We could check every time it's accessed, but instead we'll assign different function bodies to the proxy's `get` key. That way, it's only checked at (open air quotes) compile time (close air quotes):[^questionable]

[^questionable]: This is a questionable optimization. It's not excessively clever code, but the performance benefit is negligible given the costs of using a proxy for these instances, and it precludes us from implementing another feature of Ruby's hashes, the ability to mutate the default value of an existing instance.

```javascript
class Hash {
  constructor (defaultValue = undefined) {
    return new Proxy(this, {
      get:
        (defaultValue instanceof Function)
          ? ((target, key) =>
              Reflect.has(target, key)
                ? Reflect.get(target, key)
                : defaultValue(target, key))
          : ((target, key) =>
              Reflect.has(target, key)
                ? Reflect.get(target, key)
                : defaultValue)
    });
  }
}

const h = new Hash((hash, key) => hash[key] = `Go Fish: ${key}`);

h["c"]
  //=> "Go Fish: c"
h["d"]
  //=> "Go Fish: d"
```

As noted, we can make a `Map`-like Hash with even less hackery, we don't need a proxy! But most idiomatic JavaScript uses objects, so that's what we'll use. this is enough to set the stage for the next bit of snarfing.

---

![Bride of Frankenstein](/assets/images/bride-of-frankenstein.jpg)

---

## Autovivifying Hashes

The Perl language also has hashes, and they have an interesting feature called [autovivification]. As explained in [Implementing autovivification in Ruby hashes]:

[autovivification]: https://en.m.wikipedia.org/wiki/autovivification
[Implementing autovivification in Ruby hashes]: https://www.sbf5.com/~cduan/technical/ruby/ycombinator.shtml

> In Perl, the following line will successfully run:
>
> `$h{'a'}{'b'}{'c'} = 1;`
>
> even if `$h` was previously `undefined`. Perl will automatically set `$h` to be an empty hash, it will assign `$h{'a'}` to be a reference to an empty hash, `$h{'a'}{'b'} to be an empty hash, and then finally assign `$h{'a'}{'b'}{'c'}` to `1`, all automatically.

This is called autovivification in Perl: hash and array variables automatically "come to life" as necessary. This is incredibly convenient for working with multidimensional arrays, for example.

The syntax is a little different than Ruby or JavaScript, but the example snippet shows two things:

1. `$h` is a variable that has not yet been bound. In JavaScript, it would be `undefined`. If we tried to assign one of its properties, it would break. In Perl, trying to assign a property of an undefined variable turns it into a hash. So `$h{'a'} = 1` would "autovivify" `$h` and then assign `1` to `{'a'}`.
2. Given a hash `$h`, the code `$h{'a'}{'b'}{'c'} = 1;` assigns hashes to `{'a'}`, and then `{'a'}{'b'}`, and then it assigns `1` to `{'a'}{'b'}{'c'}`.

This would be like writing this JavaScript:

```javascript
const h['a']['b']['c'] = 1;
```

And having the interpreter execute it as if we had written:

```javascript
const h = { a: { b: { c: 1 } } };
```

Can we do this? Almost. We can't autovivify a new variable as a hash, but given a hash, we can autovivify its values. Certainly. And we can tear a page out of Ruby's book, as inspired by [Implementing autovivification in Ruby hashes].

---

### attempting to autovivify ruby-style hashes

Let's review the `Hash` pseudo-class we created above. One of the things we can do is provide a default value for a hash. What if the default value is another Hash? BTW, for shits and giggles, we'll use property-based notation in these examples, just to show how confusing JS can be for people coming from a more disciplined OO language:

```javascript
const h2 = new Hash(new Hash());

h2.a.b = 1;

h2.a
  //=> a new hash

h2.a.b
  //=> 1
```

This arrangement looks promising, but it has two bugs. Rubyists have been bitten by the first one so often, they probably spotted it before I could mention that this code has a bug. I'll show you the failure case:

```javascript
h2.c.d = 2;

h2.a.d
  //=> 2
```

We have passed a single hash as the default value, so all of the keys that get 'autovivified' share the same hash. We really need to generate a new one every time we want a default value. For that, we need to use the function form:

```javascript
const h3 = new Hash((target, key) => target[key] = new Hash());

h3.a.b = 1;
h3.c.d = 2;

h3.a.b
  //=> 1

h3.c.d
  //=> 2

h3.a.d
  //=> undefined
```

That's what we expect. And it leads us to the next problem. This only goes one level deep. It "vivifies" `h.a` and `h.b` as separate hashes, but when we type `h3.a.d`, we want another hash. But that's two levels deep, so it doesn't work. We can fix it to handle two levels:

```javascript
const h4 = new Hash(
  (target, key) =>
    target[key] = new Hash(
      (target, key) =>
        target[key] = new Hash()
    )
);
```

Or three:

```javascript
const h5 = new Hash(
  (target, key) =>
    target[key] = new Hash(
      (target, key) =>
        target[key] = new Hash(
          (target, key) =>
            target[key] = new Hash()
        )
    )
);
```

But we can only type so much of that. How do we make it work for an arbitrary number of levels?

---

### autovivifying hashes in Javascript, the classical approach

We've been doing everything in an "OO" style so far, let's take things to their natural OO conclusion:

```javascript
class AutovivifyingHash extends Hash {
  constructor () {
    super(
      (target, key) => target[key] = new AutovivifyingHash()
    );
  }
}

const avh = new AutovivifyingHash();

avh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

avh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

It works! We've introduced recursion by having our constructor use a reference to the name of the class.

That being said, maybe we don't want a brand new class, maybe we want to use our `Hash`, but do something recursive with the function we use to generate default values. Something like:

```javascript
const autovivifyingHash = () =>
  new Hash(
    (target, key) => target[key] = autovivifyingHash()
  );

const fh = autovivifyingHash();

fh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

fh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

We're still performing recursion by name. Which is fine, JavaScript has names and scopes, we ought to make use of them. But that being said, it's good to know how to make an autovivifying hash without requiring a reference to a class or a function.

And we remember how to do that from the essays on recursive combinators: [To Grok a Mockingbird], and [Why Y? Deriving the Y Combinator in JavaScript]:

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html
[Why Y? Deriving the Y Combinator in JavaScript]: http://raganwald.com/2018/09/10/why-y.html

```javascript
const why =
  fn =>
    (x => x(x))(
      maker =>
        (...args) =>
          fn(maker(maker), ...args)
    );


const yh = new Hash(
  why((myself, target, key) => target[key] = new Hash(myself))
);

yh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

yh.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

This style allows us to make autovivifying hashes wherever we like, without having to set up a new class and a new module. This is exactly the approach explained in [Implementing autovivification in Ruby hashes].

Of course, in Ruby the `Hash` class comes baked in, so there's a good incentive to build upon a standard and very common data structure. In JavaScript, we have to build our own. If we're not that interested in classical OO, maybe we can back up and strip things down to their essentials?

### autovivifying hashes in Javascript, the idiomatic approach

If we pare things down to their essentials, we can drop the entire `Hash` class and just use a function. Here it is calling itself by name:

```javascript
const autovivifying = () => new Proxy({}, {
  get: (target, key) =>
    Reflect.has(target, key)
      ? Reflect.get(target, key)
      : target[key] = autovivifying()
});

const ah = autovivifying();

ah.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

ah.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

And if we want to go "pure" and avoid any issues with binding, we'll use `why` as above, but without any classes involved:

```javascript
const ph = why(
  myself => new Proxy({}, {
    get: (target, key) =>
      Reflect.has(target, key)
        ? Reflect.get(target, key)
        : target[key] = myself()
  })
)();

ph.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

ph.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

Yowza, our code is not in Kansas any more.

---

[![Scottish Parliament ©2006 Martin Pettitt](/assets/images/scottish-parliament.jpg)](https://www.flickr.com/photos/mdpettitt/202698841)

---

## Of Course! But Maybe…

Most of the time, we do not debate whether the things in this blog belong in production--or any, really--code. The point is to explore ideas. What matters is not "here is something we can use tomorrow," as much as, "here are some ideas that change the way we think about code."

When we integrate those changes to the way we think about code with the various forces acting upon our code decisions, we may end up with something that on the surface is entirely different from the code in these posts, but has been influenced by the journey we take working things out.

But that being said, this particular post touches on various ways to build this feature, from heavyweight OO to lightweight functions, with exotica like proxies tossed around at will. When we discuss whether and/or when to use such techniques, we also discuss ideas of general application around abstraction and pragmatism.

So here goes.

---

### do we need a hash class?

We began by writing a `Hash` class to imitate what Ruby provides "out-of-the-box:"

```javascript
class Hash {
  constructor (defaultValue = undefined) {
    return new Proxy(this, {
      get:
        (defaultValue instanceof Function)
          ? ((target, key) =>
              Reflect.has(target, key)
                ? Reflect.get(target, key)
                : defaultValue(target, key))
          : ((target, key) =>
              Reflect.has(target, key)
                ? Reflect.get(target, key)
                : defaultValue)
    });
  }
}
```

And we still need to put autovivification on top of this:

```javascript
class AutovivifyingHash extends Hash {
  constructor () {
    super((target, key) => target[key] = new AutovivifyingHash());
  }
}
```

This seems like overkill if all we want is autovivification. If that's all we need, better to write the simplest thing that could possibly work:

```javascript
const autovivifying = () => new Proxy({}, {
  get: (target, key) =>
    Reflect.has(target, key)
      ? Reflect.get(target, key)
      : target[key] = autovivifying()
});
```

It may come down to whether a particular code base leans towards OO or lightweight FP. Both are fine approaches (as are mixed-paradigm approaches), so it could be that regardless of the number of lines of code, the approach that resembles the rest of the code base is most correct.

---

### the rule of three

When might it be sensible to write `Hash`? Well, in programming there is a [rule of three]. It is usually applied to removing duplication: When you first write something, you obviously don't worry about duplication. If you rite it a second time, make a note of the duplication, but don't rush to refactor things. Only when you need to write it for the third time do you refactor everything to eliminate duplication.

[rule of three]: https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)

Why wait for the third use? And why do we even count the first use? Well, there is a cost to de-duplication, often in the form of generalization and/or abstraction. Take the `Hash` class. If we write the entire class but only use it to make the `AutovivivifyingHash` class, we are incurring the costs of de-duplication before we've even used it twice.

In essence, we're deciding that at some point we will use `Hash` again, and at that time we can benefit from a single class multiple pieces of code can share, but we'd like to pay that cost **now**. This is called _Premature Abstraction_.

Of ourse, it could be that we spot multiple uses for the `Hash` class. In that case, there is a benefit to bundling it up on its own. And the rule of three helps us with this decision. If there are two other pieces of code that would benefit from being written with (or refactored to use) `Hash`, just the way it is, then having a separate `Hash` class is a win.

If not, we shouldn't bother. If and when we have another use for it, we can refactor. This isn't the kind of decision where we fear that if we fail to make the perfect choice today, we'll be stuck with our mistake forever.

---

### should we be even more oo?

<a NAME="HashMap"/>And as long as we are not being fanatic about functions being superior to classes, we might want to also consider whether a `Hash` based on `Map` is superior to one based on `Object`. Consider:

```javascript
const DEFAULT_KEY = Symbol("default-key");
const MAP = Symbol("map");

class HashMap {
  constructor (defaultValue = undefined) {
    this[MAP] = new Map();
    this[DEFAULT_KEY] = defaultValue;
  }

  has(key) {
    return this[MAP].has(key);
  }

  get (key) {
    if (this[MAP].has(key)) {
      return this[MAP].get(key);
    } else {
      const defaultValue = this[DEFAULT_KEY];

      if (defaultValue instanceof Function) {
        return defaultValue(this, key);
      } else {
        return defaultValue;
      }
    }
  }

  set (key, value) {
    return this[MAP].set(key, value);
  }
}

class AutovivifyingHashMap extends HashMap {
  constructor () {
    super((target, key) => target.set(key, new AutovivifyingHashMap()));
  }
}

const hm = new AutovivifyingHashMap();
hm.get(1).get(2).set(3, 123);

hm.get(1).get(2).get(3)
  //=> 123;
```

`HashMap` as given here delegates to an instance of `Map`, while allowing for a custom default value. The obvious advantage is that since it's based on `Map`, we can use arbitrary values as keys (including primitives and object references), not just strings. If you need that, you need `HashMap`, not `Map`, period.[^memoize][^delegate]

[^memoize]: For example, in this exact blog you can find a `memoize` function decorator. It uses an object-based dictionary to store a mapping from keys to result values. Quite obviously, a `Map`-based implementation would be more generally useful.

[^delegate]: In general, we prefer delegation/composition to extension (aka "inheritance"). This is discussed at length in [Mixins, Forwarding, and Delegation in JavaScript](http://raganwald.com/2014/04/10/mixins-forwarding-delegation.html). But it should be noted that with respect to the built-in `Map` class, we should be careful. Extending `Map` generally works in environments that provide a native `Map` class, but can break when transpiling ES6 to ES5 for compatibility.

Its advantage from an architectural perspective is that there's no `Proxy` magic. We are not against metaprogramming of any kind, but sometimes in a code base we make the decision to prefer explicit to implicit. We can generally expect that if we call a `.get` method on a `HashMap` class, that it will decorate the basic functionality of `Map`. In JavaScript, we don't normally expect the behaviour of `[]` or `.foo` to be customized.

The idea of overriding methods is canon in OOP, so overriding `.get` to autovivify another dictionary is colouring well within the lines. A certain type of OO purist would prefer this approach, even if it means giving up the `[]` and `[]=` syntax. If the remainder of the code base leans towards this philosophy, `HashMap` may be superior to `Hash`.

On the other hand, if the code base leans heavily on using POJOs as dictionaries, and using `[]` and `[]=` to access them, `Hash` may be the better choice.

---

### but libraries

There's another special consideration. If we are writing code for others, such as when writing a library, then the rule of three doesn't apply. If our library is successful, then even the least commonly used classes and functions will be used in dozens or even hundreds of code bases. Conversely, with a library change is hard: We can't reach out and refactor our downstream dependents if we decide in the future to increase the level of abstraction.

That makes fairly obvious sense. Our architectural decisions around our application code should favour pragmatism, while our architectural decisions around libraries encourage more forward-thinking.

And there's another way in which libraries influence our choices. If we have something like the `Hash` class tucked away in a library, it's a lot easier to justify building on it. We have some idea that maintaining it is "free." Whereas, every line of code we write carries a cost of some kind.

If we have to write our own `Hash` or `HashMap` class, fine, but we need good reasons to add the abstraction and maintenance cost to our code. But if we can get it "for free," then of course we still need to understand how it works, but it's easier to justify building on it if we never have to worry about maintaining `Hash` or `HashMap` itself.

---

### does autovivification make sense in javascript?

Now here's another question. `Hash` is part of Ruby's standard idioms, so an autovivifying hash isn't a big leap away from how Ruby already works. There is precedent for a hash to have default values, even dynamically generated default values.

But JavaScript doesn't have anything like Ruby's `Hash` to begin with. So whether we're building a brand new `Hash`/`HashMap` class, or using the lightweight, idiomatic approach, we're taking *two* steps forward with autovivifying hashes, we're promoting the idea of a dictionary generating default values, and also promoting the idea that the entire process is recursive. Well, maybe one-and-a-half steps forward, a sesqui-leap outside of the comfort zone.

What do we get in return? We get to write:

```javascript
const h = autovivifying();

h.a.b.c = "Poirot's Famous Case";
```

And we do so to avoid writing:

```javascript
const h = { a: { b: { c: "Poirot's Famous Case" } } };
```

It's not gi-normously more compact, but there is some value in the autovivifying syntax if conceptually we are trying to think of a path to some data in a tree. And in all fairness, if we only look at initializing data (which is the normal case for working ina strongly functional style), we ignore the benefits of autovivification in a more imperative style.

if we are given an existing autovivifying hash, we can easily add anything we want, anywhere in its tree, with `h.a.b.c = "Poirot's Famous Case";`. But we cannot write `h = { a: { b: { c: "Poirot's Famous Case" } } };` for an existing data structure, because we might overwrite existing hashes.

An autovivifying hash might be a win, more-so if we expect to update existing hashes.

---

### let's debate performance

*This space left intentionally blank.*

Ok, seriously, it's important to know things like, "`Proxy` is dog-slow compared to ordinary object access." But after that, most things don't need to be fast. If something does need to be fast, you profile it.

Wait! Stop!! We don't mean that we should run speed tests on the various snippets of code to determine which idiom is the fastest. We mean that in production, when we identify an honest-to-goodness bottleneck that has meaningful impact on outcomes like user experience, only then do we drill down and figure out which slow piece of code is holding things up.

Until then, we prioritize ease of writing and maintaining code. And since we have confidence that we can refactor our code safely, we know that if and when we discover that `Proxy` is a problem, for example, we can easily rewrite our code then.

---

[![Vulcan & two Lancasters formation ©2014 Alan Wilson](/assets/images/avro.jpg)](https://www.flickr.com/photos/ajw1970/14806884698)

---

## Looking Back

We started with a Ruby data structure and idiom, the `Hash` class and its ability to customize the default value for missing keys. We implemented a version in JavaScript, and then following the suggestion of [Implementing autovivification in Ruby hashes], we looked at a few ways to implement [autovivification], both on top of `Hash` and without it.

Finally, we looked at some of the considerations before adopting these ideas:

1. We should not abstract based on one or two applications, wait until we have three uses for an abstraction. That applies to `Hash` and `AutovivifyingHash`.
2. It's slightly easier to adopt something like `Hash` is we can get it from a library.
3. Our consideration around how the [rule of three] does not apply if we ourselves are writing a library: It's our job to guess that dozens or hundreds of downstream users will adopt our abstraction.
4. If we need arbitrary objects as keys, or if we prefer a more pure OO approach, a `Map`-based approach may be preferred.
5. Auto-vivification is not much of a win for immutable data, but may be useful if we are constantly adding data to tree-like structures.
6. Premature optimization is the root of all evil, but it's not wrong to be aware of the performance of our implementation.

**ttfn!**

(discuss on [/r/javascript](https://www.reddit.com/r/javascript/comments/9gld36/rubystyle_hashes_and_autovivification_in/) and [Hacker News](https://news.ycombinator.com/item?id=18005008))

----

## Notes
