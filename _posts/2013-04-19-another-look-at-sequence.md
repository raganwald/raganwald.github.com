---
layout: default
tags: [javascript]
---

### preamble

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

In this form, *Sequence* looks like simplicity itself: `sequence = flip(compose)`. It has the same mechanism as calling "compose" with the arguments flipped from back to front.

But semantically, it's different. The compose function is all about doing more than one thing; *The sequence function is all about doing things in a specific order*. In this post, we're going to look at the ways it can be used and some of the very special features it has.

By the end, we'll have a handle on using sequence to manage asynchronous functions, special error handling, and other "programmable semantics."

## Mapping Semantics

We saw how to use sequence to emulate what we can already do with semicolons. Let's up the ante a bit. Consider this code:

{% highlight javascript %}
function meetsMinimumBalanceRequirement (accountNumber) {
  var account = maybe( find )(accountNumber),
      balance = maybe( getWith('balance') )(account),
      ok = maybe( exceedsMinimum )(balance);
      
  return ok;
}
{% endhighlight %}

Those calls to "maybe" ensure that if we get a `null` or `undefined` anywhere along the way, the result will be null or undefined without throwing exceptions. Despite that, it's exactly what we saw before, so we can write:

{% highlight javascript %}
var meetsMinimumBalanceRequirement = sequence(
  maybe( find ),
  maybe( getWith('balance') ),
  maybe( exceedsMinimum ));
{% endhighlight %}

Maybe isn't the only function decorator we might want to use with sequence. *Andand* and *oror* are similarly useful. Andand is a lot like "maybe" it is looking for *truthiness* rather than just existence.

Consider the way Ruby on Rails filters work: They are chained together, but if any of them return something "falsy," the entire chain is aborted. We can get the same effect like this

{% highlight javascript %}
sequence(
  andand(authorizeUser),
  andand(fetchRecord),
  andand(updateRecord)
)(user);
{% endhighlight %}

For example, if *authorizeUser* returns something falsy, the rest of the functions are skipped.

*OrOr* has its uses as well. C-style functions (or functions that wrap such an API) often return an error value rather than raising an exception. "Oror" handles this by skipping the remaining functions if any function returns a *truthy* value.

In JavaScript, 0 is false and non-zero integers are truthy, so oror is perfect for such sequences. For a moment, please pretend that the JavaScript world is synchronous, and we don't have to do any special dances with callbacks, promises, or other async code. We could write something like:

{% highlight javascript %}
var fs = require('fs');

sequence(
  oror(function () { return fs.mkdir('./hello',0777); }),
  oror(function () { return fs.writeFile('./hello/world.txt', 'Hello!'); }),
  oror(function () { return fs.readFile('./hello/world.txt', 'UTF-8'); })
)();
{% endhighlight %}

Oror links these functions together and skips the remainder of the sequence if any function returns something truthy like a non-zero integer, which is exactly the functionality you want (or would want if you could solve the async problem. Stay tuned!).

### drying up

This code is not DRY. Furthermore, the explicit calls to decorators like maybe and oror imply that these are the concerns of individual functions, when we are really thinking that this is a property of the sequence of functions itself.

What we want is a way to say that the group of functions is governed by maybe, andand, or oror semantics. And we can do that, thanks to the way two different features interact.

First, *sequence* has flattening semantics. Meaning, you can pass in functions or arrays of functions as you please:

{% highlight javascript %}
sequence(
  andand(authorizeUser),
  [andand(fetchRecord), andand(updateRecord)]
)(user);
{% endhighlight %}

This feature allows you to arrange your code in a hierarchy to aid readability if you like, and it also allows you two write functions that return lists of functions to be evaluated by sequence. That is very powerful, but let's not get distracted just yet. Just file away the idea that sequence evaluates the functions in order without concerns for arrays.

Next, the function decorators *maybe*, *andand*, and *oror* all have "map-if-many" semantics. Here's the code from [allong.es]:

{% highlight javascript %}
function mapIfMany (fn) {
  return variadic( function (argList) {
    if (argList.length === 1) {
      return fn.call(this, argList[0]);
    }
    else return map(argList, fn);
  });
}

var maybe = mapIfMany( function maybe (fn) {
  fn = functionalize(fn);
  return function () {
    var i;

    if (arguments.length === 0) {
      return
    }
    else {
      for (i = 0; i < arguments.length; ++i) {
        if (arguments[i] == null) return arguments[i];
      }
      return fn.apply(this, arguments)
    }
  }
});
{% endhighlight %}

What this means is that if you call "maybe" with a single function (the usual case), you get a wrapped function back. But if you call it with more than one function as separate arguments, you get an array of functions back. The same is true or andand and oror.

When we put that together with *sequence*, we get:

{% highlight javascript %}
var meetsMinimumBalanceRequirement = sequence( maybe(
  find,
  getWith('balance'),
  exceedsMinimum
));

sequence( andand(
  authorizeUser,
  fetchRecord,
  updateRecord
))(user);

sequence( oror(
  function () { return fs.mkdir('./hello',0777); },
  function () { return fs.writeFile('./hello/world.txt', 'Hello!'); },
  function () { return fs.readFile('./hello/world.txt', 'UTF-8'); }
))();
{% endhighlight %}

Each one of these decorators returns an array of decorated functions, and sequence is evaluating them one by one. Thus, we can elegantly manage the semantics of a sequence of functions, while communicating that we want maybe (or andand, or oror) semantics throughout.

And of course, you can write your own decorators and use them with sequence. Just be sure they have "map-if-many" semantics.

### summary

The sequence function can be enhanced by decorating the functions you pass in to add semantics. The [allong.es] library includes three such decorators: *maybe*, *andand*, and *oror*. You can also write your own, provided that you incorporate "map-if-many" semantics.

## Chaining Semantics

What we've seen so far is pretty useful. Being able to decorate functions with semantics inside a sequence cleans up the code and opens the door for generating sequences of functions dynamically.

Is there anything else we could do besides decorate functions? Yes. Let's consider how the *sequence* function might work. Somewhere in its core, it might contain a *reduce* method. If it didn't do anything else, it might look like this:

{% highlight javascript %}
var sequence = variadic( function (fns) {
  return function (argument) {
    return fns.reduce(function (value, fn) {
      return fn(value);
    }, argument);
  };
});
{% endhighlight %}

In it's core is the reduce method, wherein we have a value being passed from one function to the next, and we transform the value with our (possible decorated) function, like this:

    original argument -> [function 1] -> first value -> [function 2] -> second value ...
    
We've discussed how to transform the functions. So what else could we meddle with? How about the way we chain the functions together!?

### sequence with a capital S

Let's begin with a use case. We'll pick logging. Our functions have signatures that look like this:

{% highlight javascript %}
function double (number) {
  var result = number * 2;
  return [result, ['' + number + ' * 2 = ' + result]];  
}

function plus1 (number) {
  var result = number * 1;
  return [result, ['' + number + ' + 1 = ' + result]];  
}
{% endhighlight %}

How are we to chain these together to calculate `2 * 2 + 1`? Our problem is that we no longer have functions that tidily have compatible inputs and outputs.Well, if we were writing our own version of sequence, it could look like this:

{% highlight javascript %}
var sequenceWithLogging = variadic( function (fns) {
  return function (argument) {
    return flatten(fns).reduce(function (valueAndLogList, fn) {
      var value = valueAndLogList[0],
          logList = valueAndLogList[1],
          resultAndLogList = fn(value),
          result = resultAndLogList[0],
          resultLogList = flatten(logList.concat(resultAndLogList[1]));
          
      return [result, resultLogList];
    }, [argument, []]);
  };
});
{% endhighlight %}

Then we could write:

{% highlight javascript %}
sequenceWithLogging( double, plus1 )(2)
  //=> [5, ['2 * 2 = 4', '4 + 1 = 5']]
{% endhighlight %}

That looks good, but we don't want to rewrite sequence by hand every time we want a new set of semantics involving some special chaining. So let's extract the bits we want into an object:

{% highlight javascript %}
var WithLogging = {
  chain: function (valueAndLogList, fn) {
            var value = valueAndLogList[0],
                logList = valueAndLogList[1],
                resultAndLogList = fn(value),
                result = resultAndLogList[0],
                resultLogList = flatten(logList.concat(resultAndLogList[1]));
          
            return [result, resultLogList];
          },
  of: function (argument) {
    return [argument, []];
  }
};
{% endhighlight %}

The two things we've changed are called *chain* and *of*. "Chain" handles chaining functions together when their inputs and outputs don't fit, and "of" handles getting the initial argument into the proper form for the head of the chain.

Out of embarrassment, we won't examine the code within sequence that supports this, but you don't need to visit a sausage factory to enjoy sausages[^sausages]. Here's how you use our new object:

[^sausages]: And perhaps it's best if you don't!

{% highlight javascript %}
sequence(WithLogging, double, plus1 )(2)
  //=> [5, ['2 * 2 = 4', '4 + 1 = 5']]
{% endhighlight %}

Behind the scenes, sequence checks to see if the first object defines object or prototype methods for *chain*, *of*, and as it happens, *map*.

If you define a map method, sequence uses it the way we used our decorators. So we can also write:

{% highlight javascript %}
sequence( { map: andand },
  authorizeUser,
  fetchRecord,
  updateRecord
)(user);
{% endhighlight %}

The benefit of the object approach is that if you need to define some semantics that include mapping and chaining, you can do it in one place.

If you're just mapping, you can use decorators or an object. And if you want to compose two sets of semantics, you can use both.

### composing semantics

We did some hand-waving about asynchronicity. Here's some example code showing how to write and read a file in Node:

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

We pretended these functions were synchronous, but we can see that they are actually asynchronous, and they accept a callback as their last parameter. So we need to chain them together using the callbacks.

They also check for an error being returned, so we need to decorate them to provide error checking. We know how to do that with a decorator.

Let's pretend that the [allong.es] library already defines a handy object for chaining callbacks called *Callback*. Good thing it does:

{% highlight javascript %}
var Callback = {
  of: variadic( function (values) {
    return function(callback) {
      return callback.apply(this, values);
    };
  }),
  map: function(fn) {
    if (fn.length === 1) {
      return function(value) {
        return function(callback) {
          return fn(value, callback);
        };
      };
    }
    else return variadic(fn.length, function(values) {
      return function (callback) {
        return fn.apply(this, values.concat([callback]));
      }
    });
  },
  chain: function(mValue, fn) {
    var _this = this;
    if (fn.length === 1) {
      return function(callback) {
        return mValue(function(value) {
          return _this.map(fn)(value)(callback);
        });
      };
    }
    else return function(callback) {
      return mValue(variadic(fn.length, function (values) {
        return _this.map(fn).apply(this, values)(callback);
      }));
    };
  }
};
{% endhighlight %}

Instead of nesting our code, we can wrap the individual pieces in functions that just take a callback:

{% highlight javascript %}
var fs = require('fs');

sequence(Callback,
  function (callback) { fs.mkdir('./hello', 0777, callback); },
  function (callback) { fs.writeFile('./hello/world.txt', 'Hello!', callback); },
  function (callback) { fs.readFile('./hello/world.txt', 'UTF-8', callback); }
)()(function(err, data) {
  if (err) throw err;
  console.log('DATA:', data);
})
  // Prints "DATA: Hello!" and returns undefined
{% endhighlight %}

Some of this can be cleaned up. Observe:

{% highlight javascript %}
fs.mkdir.length
  //=> 3
fs.writeFile.length
  //=> 4
fs.readFile.length
  //=> 2
{% endhighlight %}

"mkdir" and "writeFile" both require the callback parameter. Therefore, we can use partial application to convert them into a function taking one argument. Unfortunately, "readFile" does not have this extra arity, so we must leave the wrapper function in place for it:

{% highlight javascript %}
sequence(Callback,
  callLeft(fs.mkdir, './hello', 0777),
  callLeft(fs.writeFile, './hello/world.txt', 'Hello!'),
  function (callback) { fs.readFile('./hello/world.txt', 'UTF-8', callback); }
)()(function(err, data) {
  if (err) throw err;
  console.log('DATA:', data);
})
  // Prints "DATA: Hello!" and returns undefined
{% endhighlight %}

Thus, we've used *Callback* to sequence pieces of code that would otherwise require nested callbacks. Hopefully, you will not be surprised to learn that [allong.es] also supports *sequence(Then, ...)* for sequencing functions that return promises.

## Summary

Now, there are various one-off library functions for doing all of these things. But what we've seen here is that instead of one special function for sequencing functions, another for functions with a particular kind of wrapping semantics,  another for chaining functions that take callbacks, and yet another for chaining functions that return promises, we have just one function, *sequence* that handles them all in a unified manner.

Furthermore, it is expandable: You can write functions that generate lists of functions to sequence. You can write your own definitions for chaining and mapping functions. You can control your own semantics.

The sequence function is very simple to use for the simple case. But it *scales with the complexity of what you would like to accomplish*.