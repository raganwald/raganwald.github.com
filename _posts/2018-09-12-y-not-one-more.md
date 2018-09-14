---
title: Why not one more? Snarfing ideas from Ruby and Python
tags: [recursion,allonge,noindex]
---

In [Why Y? Deriving the Y Combinator in JavaScript], we derived the Why Bird and Y Combinator from the Mockingbird, a recursive combinator we first saw in [To Grok a Mockingbird].

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html
[Why Y? Deriving the Y Combinator in JavaScript]: http://raganwald.com/2018/09/10/why-y.html

WHile higely important theoretically, the most practical application for the Y Combinator usually given is when we want to decorate a recursive function, such as when memoizing it. That idea has been mentioned a number of times independently.

Another interesting application is given in Ruby, for [implementing autovivification in Ruby hashes].

[implementing autovivification in Ruby hashes]: https://www.sbf5.com/~cduan/technical/ruby/ycombinator.shtml

For a couple of reasons, it's unlikely to be generally useful in JavaScript, but the ideas behind it are interesting and may be useful in their own right. That, and it's a great hack!

So let's try to apply it to JavaScript. We'll start with a look at Ruby's `Hash` class.

### ruby hashes are not javascript objects

The Ruby programming language has the notion of a [Hash]. A `Hash` is a dictionary-like collection of unique keys and their values. Also called associative arrays, they are similar to Arrays, but where an Array uses integers as its index, a `Hash` allows you to use any object type.

[Hash]: https://ruby-doc.org/core-2.5.1/Hash.html

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
That's more like a JavaScript object. With a JavaScript `Map`, we have to use `.at` to access values by key.

Ruby hashes have a default value that is returned when accessing keys that do not exist in the hash. If no default is set, `nil` is used. You can set the default value by sending it as an argument to `#new`:

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

JavaScript objects do not have any notion of a default value, and especially not any notion of dynamically returning a value for missing keys.

### implementing hash in javascript

Given that JavaScript already has `Object` and `Map`, the only motivation to snarf any of `Hash`'s behaviour is going to be the ability to set default values. This is rather handy in Ruby, so let's come up with a toy implementation we can play with in JavaScript.

the first thing we have to decide is whether we'll base our implementation on `Object` or `Map`. For the purposes of this essay, `Object` has the nicer syntax, and using objects as dictionaries is the usual case in JavaScript. And a `Map` implemention will be trivial once the basic pattern is articulated.

When we create an instance of `Hash`, we'll wrap it in a `Proxy`[^proxy] to handle access.

[^proxy]: The [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object is used to define custom behavior for fundamental operations (e.g. property lookup, assignment, enumeration, function invocation, etc). It is enormously flexible, but extremely slow compared to "native" behaviour. Does that mean we should never use it? No, it means we should use our judgment.

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
      get: function (target, key) {
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

Our third use case involves checking whether the defaultValue is an ordinary value or a function. We could check every time it's accessed, but instead we'll assign different function bodies to the proxy's `get` key. That way, it's only checked at (open air quotes) compile time (close air quotes):

```javascript
class Hash {
  constructor (defaultValue = undefined) {
    return new Proxy(this, {
      get: function (target, stringKey) {
        if (defaultValue instanceof Function) {
          return Reflect.has(target, stringKey)
            ? Reflect.get(target, stringKey)
            : defaultValue(target, stringKey);
        } else {
          return Reflect.has(target, stringKey)
            ? Reflect.get(target, stringKey)
            : defaultValue;
        }
      }
    });
  }
}

const h = new Hash((hash, key) => hash[key] = `Go Fish: ${key}`);

h["c"]
  //=> "Go Fish: c"
h["d"]
  //=> "Go Fish: d"
```

As noted, we can make a `Map`-like Hash with even less hackery, we don't need a proxy! But most idomatic JavaScript uses objects, so that's what we'll use. this is enough to set the stage for the next bit of snarfing.

### autovivifying hashes

The Perl language also has hashes, and they have an interesting feature called [autovivification]. As explained in [implementing autovivification in Ruby hashes]:

[autovivification]: https://en.m.wikipedia.org/wiki/Autovivification

> In Perl, the following line will successfully run:
>
> `$h{'a'}{'b'}{'c'} = 1;`
>
> even if `$h` was previously `undefined`. Perl will automatically set `$h` to be an empty hash, it will assign `$h{'a'}` to be a reference to an empty hash, `$h{'a'}{'b'} to be an empty hash, and then finally assign `$h{'a'}{'b'}{'c'}` to `1`, all automatically.

This is called autovivication in Perl: hash and array variables automatically "come to life" as necessary. This is incredibly convenient for working with multidimensional arrays, for example.

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

Can we do this? Almost. We can't autovivify a new variable as a hash, but given a hash, we can autovivify its values. Certainly. And we can tear a page out of Ruby's book, as inspired by [implementing autovivification in Ruby hashes].

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
const h4 = new Hash((target, key) => target[key] = new Hash((target, key) => target[key] = new Hash()));
```

Or three:

```javascript
const h5 = new Hash((target, key) => target[key] = new Hash((target, key) => target[key] = new Hash((target, key) => target[key] = new Hash())));
```

But we can only type so much of that. How do we make it work for an arbitrary number of levels?

### autovivifying hashes, the classical and functional approaches

We've been doing everything in an "OO" style so far, let's take things to their natural OO conclusion:

```javascript
class AutovivifyingHash extends Hash {
  constructor () {
    super((target, key) => target[key] = new AutovivifyingHash());
  }
}

const autoHash = new AutovivifyingHash();

autoHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

autoHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

It works! We've introduced recursion by having our constructor use a reference to the name of the class.

That being said, maybe we don't want a brand new class, maybe we want to use our `Hash`, but do something recursive with the function we use to generate default values. Something like:

```javascript
const autoVivifyingHash = () => new Hash(((target, key) => target[key] = autoVivifyingHash()));

const fHash = autoVivifyingHash();

fHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

fHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
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


const yHash = new Hash(
  why((myself, target, key) => target[key] = new Hash(myself))
);

yHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z = 'alpha beta';

yHash.a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z
  //=> "alpha beta"
```

This style allows us to make autovivifying hashes wherever we like, without having to set up a new class and a new module. This is exactly the approach explained in [implementing autovivification in Ruby hashes].

That being said, it's up to the reader of our code to sort out what's going on. Is the lighter weight worth it?

Let's discuss.

---

---

The essays in this series on recursive combinators are: [To Grok a Mockingbird], and [Why Y? Deriving the Y Combinator in JavaScript]. Enjoy them both!

[To Grok a Mockingbird]: http://raganwald.com/2018/08/30/to-grok-a-mockingbird.html
[Why Y? Deriving the Y Combinator in JavaScript]: http://raganwald.com/2018/09/10/why-y.html

---

## Notes
