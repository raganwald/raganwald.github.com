---
layout: default
tags: [javascript]
published: false
---

One of the goals of the [allong.es] library is to provide easy-to-use tools for writing JavaScript and CoffeeScript programs using *functional composition*. To pick an example out of thin air, this snippet shows how to write a method that uses *Maybe* to ensure that it doesn't do anything if you pass in `null` or `undefined`, and that uses *Fluent* to ensure that it always returns the receiver, jQuery-style:

[allong.es]: http://allong.es

{% highlight javascript %}
User.prototype.setName = fluent( maybe( function (name) {
  this.name = name;
}));
{% endhighlight %}

This principle is so enshrined in function-oriented and functional programming that nearly every library with the word "function" in it includes a *compose* method. Compose is awfully simple in principle:

{% highlight javascript %}
function compose (a, b) {
  return function (c) {
    return a(b(c));
  }
}
{% endhighlight %}

In practice, the [allong.es] version permits the use of any number of functions not just two), and it permits the last function to have any arity whatsoever. But the principle is straightforward.

### back-assbaggery

If you look at *compose*, you see that when you call it, the functions are applied from right-to-left, not left-to-right. Function "b" is called before function "a." This is exactly what we mean when we talk about functional composition, and that's fine.

But what if we are thinking of something else? namely, that we want to apply some functions in sequence? We can use compose, but if we want:

{% highlight javascript %}
function doFourThings (something) {
  var temp1 = doThis(something),
      temp2 = thenThis(temp1),
      temp3 = andThenThis(temp2);
      
  return finallyDoThis(temp3);
}
{% endhighlight %}

We would have to write it like this:

{% highlight javascript %}
var compose = require('allong.es').allong.es.compose;

var doFourThings = compose(finallyDoThis, andThenThis, thenThis, doThis);
{% endhighlight %}

It's back-asswards. That's a hint that maybe we shouldn't be using compose when we're trying to write code that makes the order of operations obvious rather than just saying that we're doing a few different things.

### sequence

Naturally, [allong.es] has you covered:

{% highlight javascript %}
var sequence = require('allong.es').allong.es.sequence;

var doFourThings = sequence(
  doThis,
  thenThis,
  andThenThis,
  finallyDoThis);
{% endhighlight %}

In this form, *Sequence* is simplicity itself: `sequence = flip(compose)` . It's no more and no less than calling "compose" with the arguments flipped from back to front.

### sequence with a twist

Let's up the ante a bit. Consider this code:

{% highlight javascript %}
function meetsMinimumBalanceRequirement (accountNumber) {
  var account = maybe( find )(accountNumber),
      balance = maybe( getWith('balance') )(account),
      ok = maybe( exceedsMinimum )(balance);
      
  return ok;
}
{% endhighlight %}

ALl those calls to "maybe" ensure that if we get a `null` or `undefined` anywhere along the way, the result will be null or undefined without throwing exceptions. Despite that, it's exactly what we saw before, so we can write:

{% highlight javascript %}
var meetsMinimumBalanceRequirement = sequence(
  maybe( find ),
  maybe( getWith('balance') ),
  maybe( exceedsMinimum ));
{% endhighlight %}

This is fine, but if you write something like this more than once, you're going to wind up trying to extract this idea of "maybe sequencing:"

{% highlight javascript %}
var maybeSequence = variadic( function (fns) {
  return sequence.apply(this, map(fns, maybe));
});
{% endhighlight %}

Well done! Hopefully people will consider this "explicit" but not "clever," as in, *It explicitly returns a sequence of functions mapped by maybe*.

### a better way

This "maybeSequence" stuff is very common.[^maybe] So much so that [allong.es] provides a really easy way to express sequencing with Maybe semantics:

{% highlight javascript %}
var Maybe = sequence.Maybe;

var meetsMinimumBalanceRequirement = sequence(Maybe,
  find,
  getWith('balance'),
  exceedsMinimum
);
{% endhighlight %}

[^maybe]: It should be noted that there is a reasonable argument that if you are constantly checking for null or undefined, making it easier to check is simply masking a deeper problem with your design. Never assume that just because your tools make something easy and/or terse, that it's automatically a good idea to do it.

What's going on here? Let's begin with how to use the abstraction without getting into its exact implementation. The abstraction is, when you call `sequence`, you have the option of defining some special behaviour by passing a special object as the first parameter.

What is this first parameter? It's an instance of class `Sequence`.[^class] Hmmm, name smell: There is a function called "sequence", all lower-case, and a class called "Sequence," capitalized. Is that going to be confusing?

[^class]: Where by "class," we really mean, *An object created by the Sequence constructor*, but you knew that.

Not if you follow the English rule (apologies to non-English speakers) that proper names, i.e. nouns, are capitalized, and verbs are not. So if I say that *I saw Harry harry the hounds*, "Harry" is a person and "harry" is a verb meaning *to harass, annoy, or prove a nuisance to by or as if by repeated attacks; worry.*

So "Sequence" is the class, as in "a Sequence," and "sequence" is the verb, as in "sequence these functions." Ok, but let's ask: What's going on? What is this "Maybe" Sequence? Here's the definition straight from the library:

{% highlight javascript %}
var Maybe = new Sequence({
  map: maybe
});
{% endhighlight %}

There's a lot we could say about this, but it boils down to being able to control what the functions do and how the functions are wired together. In this case, we say that we're *mapping Maybe over the functions in the sequence*. It's as if we wrote something like this:

{% highlight javascript %}
var meetsMinimumBalanceRequirement = apply(sequence, [
  find,
  getWith('balance'),
  exceedsMinimum].map(maybe)
);
{% endhighlight %}

As far as "Maybe" (with a capital M) is concerned, that's all that's going on. There's another piece, but before we get there, let's look at some other uses for Sequences (with a capital S) that map.

### mapping sequences

Behind the scenes, if you don't specify a map with a Sequence the sequence function actually uses the default Sequence, it's called *Identity*. It looks like this:

{% highlight javascript %}
function identity (fn) { return fn; }

var Identity = new Sequence({
  map: identity
});
{% endhighlight %}

You can confirm this for yourself by writing `sequence(Identity, ...)` anywhere you'd write `sequence(...)`. You get the exact same result. What else could we do with mapping?

We could make some variations using the *andand* and *oror* function decorators from [allong.es]:

{% highlight javascript %}
var AndAnd = new Sequence({
  map: andand
});

var OrOr = new Sequence({
  map: oror
});
{% endhighlight %}

Calling `sequence(AndAnd, ...)` would be a lot like `sequence(Maybe, ...)`, only it is looking for *truthiness*. Consider the way Ruby on Rails filters work: They are chained together, but if any of them return something "falsy," the entire chain is aborted.

That's what our *AndAnd* sequence does:

{% highlight javascript %}
sequence(AndAnd,
  authorizeUser,
  fetchRecord,
  updateRecord
)(user);
{% endhighlight %}

If *authorizeUser* returns something falsy, the rest of the functions are skipped.

*OrOr* has its uses as well. When you have a C-style API (or functions that wrap such an API). C-style functions often return an error value rather than raising an exception, and "OrOr" handles this by skipping the remaining functions if any function returns a truthy value.

In JavaScript, 0 is false and non-zero integers are truthy, so OrOr is perfect for such sequences. For a moment, please pretend that the JavaScript world is synchronous, and we don't have to do any special dances with callbacks, promises, or other async code. We could write something like:

{% highlight javascript %}
var fs = require('fs');

sequence(OrOr,
  function () { return fs.mkdir('./hello',0777); },
  function () { return fs.writeFile('./hello/world.txt', 'Hello!'); }
  function () { return fs.readFile('./hello/world.txt', 'UTF-8'); }
)();
{% endhighlight %}

*OrOr* links these functions together and skips the remainder of the sequence if any function returns something truthy like a non-zero integer.

------------------------------------------------------------------

{% highlight javascript %}
var fs = require('fs');

fs.mkdir('./hello',0777,function(err) {
  if (err) throw err;

  fs.writeFile('./hello/world.txt', 'Hello!', function(err) {
    if (err) throw err;
    console.log('File created with contents: ');

    fs.readFile('./hello/world.txt', 'UTF-8', function(err, data) {
      if (err) throw err;
      console.log(data);
    });
  });
});
{% endhighlight %}

Having seen "sequence" and "maybeSequence," you'll be tempted to write "callbackSequence" (or search for a library that provides a similar function for taming nested callbacks). But let's stop the madness! We're *repeating ourselves*.

Wouldn't it be better if we could simply write:

{% highlight javascript %}
var doFourThings = sequence(
  doThis,
  thenThis,
  andThenThis,
  finallyDoThis);
  
// and:

var meetsMinimumBalanceRequirement = sequence(Maybe,
  find,
  getWith('balance'),
  exceedsMinimum);

// and:

var fs = require('fs');

function checkError (err, callback) {
  if (err) throw err;
  callback();
}

sequence(Callback,
  applyLeft(fs.mkdir, './hello', 0777),
  checkError,
  applyLeft(fs.writeFile, './hello/world.txt', 'Hello!'),
  checkError,
  applyLeft(fs.readFile, './hello/world.txt', 'UTF-8'),
  function(err, data) {
    if (err) throw err;
    console.log(data);
  }
);
{% endhighlight %}

Not bad, but what's with all the "check error" code? This reminds