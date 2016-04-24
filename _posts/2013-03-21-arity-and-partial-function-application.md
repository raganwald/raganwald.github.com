---
title: Arity and Partial Function Application
layout: default
tags: allonge
---

This morning I was perusing [/r/javascript](http://reddit.com/r/javascript), where I saw an announcement for version 2.0.0 of the [Craft] JavaScript utility belt library.

[Craft]: http://craftjs.org/

Unlike other libraries, Craft is not afraid to extend the prototypes for built-in "classes" such as `Function`. For example, Craft provides `Function.prototype.attach`, which provides the same functionality as `Function.prototype.bind`. I presume it's for backward compatibility in browsers that don't support `.bind`.

Now, some libraries would shim `.bind` if it isn't present, and others would provide a function that calls `.bind` if its present. There are trade-offs between the three approaches, and personally I think that it's a win to have libraries that take different approaches to this issue so that programmers can select the approach that fits their personal needs.

But it reminded me of an open issue in my own [allong.es] library that I'm going to fix today. Let me show you. Here's how `Function.prototype.bind works`:

[allong.es]: http://allong.es

```javascript
function greet (whom) {
  return this.greeting + " " + whom;
};

var polite = greet.bind({ greeting: "hello" });

polite("bind");
  //=> 'hello bind'
```

And `Function.prototype.attach`:

```javascript
var casual = greet.attach({ greeting: "howdy" });

casual("attach");
  //=> 'howdy attach'
```

What's the difference? Let's check the function arity:

```javascript
polite.length;
  //=> 1
casual.length;
  //=> 0
```

`Function.prototype.bind` returns a new function with the correct arity. `Function.prototype.attach` returns a function that declares no arguments and instead extracts them from the `arguments` pseudo-variable, therefore it has no arity. `Function.prototype.partial` does the exact same thing.

I knew to check this, because [allong.es] uses the exact same technique. And frankly, it's usually just fine. I've been doing things this way for years, and besides a little weight gain and declining eyesight, I feel just fine.

### when arity matters

I noticed this [a few weeks ago][5] when I started to work with some functions that need to know the arity of a function they are manipulating. I'm going to start talking about [allong.es] now because I don't want to make it seem like I'm criticizing [Craft]. Just the opposite, I think it's neat-o, and I don't know that it would be improved by changing this behaviour.

[5]: https://github.com/raganwald/allong.es/issues/5

But here's why I am looking at changing [allong.es]. Consider `curry`, a function that turns a polyadic function into a chained or nested series of unary functions:

```javascript
var curry = require('allong.es').curry;

function introduction (a, b, c) {
  return '' + a + ', ' + b + ', may I introduce you to ' + c
};

introduction('hello', 'alice', 'bob');
  //=> 'hello, alice, may I introduce you to bob'
  
var curried = curry(introduction);

curried('hello')('alice')('bob');
  //=> 'hello, alice, may I introduce you to bob'
```

The trouble is that the current implementation of `curry` relies on checking the arity of the function you are currying. So we would expect that if we were to use `applyFirst` to partially apply the first argument of `introduction`, we should be able to curry the remaining two arguments:

```javascript
var applyLeft = require('allong.es').applyLeft;

function introduction (a, b, c) {
  return '' + a + ', ' + b + ', may I introduce you to ' + c
};
casual = applyLeft(introduction, 'howdy');

casual('ted', 'carol');
  //=> 'howdy, ted, may I introduce you to carol'
  
var curried = curry(casual);

curried('ted')('carol');
  //=> ???
```

But no:

```javascript
TypeError: string is not a function
```

The problem is that `applyFirst`, like Craft's `Function.prototype.attach`, returns a function with arity zero. But `curry` relies on the function having the proper arity. So they each work separately, but not together.

### a symptom of a general problem

This is, in the very small, a problem that happens with a lot of "greenspunning." When you're emulating or hacking together new functionality, it is sometimes challenging but often straightforward to get it to work for the "common case," the one in the tests.

But in reality there will be little edge cases you don't handle properly. They may seem incredibly rare when you think of a person writing some code that uses your function or library directly in their domain code, but they aren't as rare as you think.

The reason is that when we write libraries, we tend to think that because we've wrapped the implementation up inside of a nice polite API, we can use more "advanced" techniques like working with the `arguments` array instead of parameters directly. There's a subtle "social order" where libraries are expected to do the heavy lifting and client code is expected to be simple and readable, relying on libraries for anything complicated.

When the client code calls several libraries, you end up with advanced code interacting with advanced code, and the mathematics of it are such that the likelihood of edge cases interacting rises exponentially.

### what to do

Well, I'm going to change [allong.es]. Given that it includes `applyLeft` and `curry`, it seems wrong to say that they aren't compatible and composeable. But at the same time, there's nothing unreasonable about a library like Craft simply choosing to emphasize KISS. Different design priorities produce different choices.

