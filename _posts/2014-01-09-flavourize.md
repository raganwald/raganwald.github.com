---
title: flavourize.js
layout: default
tags: [javascript]
---

A little something that has fallen out of writing [JavaScript Spessore][js]:

[js]: https://leanpub.com/javascript-spessore

```javascript
function flavourize (body) {

  function flavoured (arg) {
    var args = [].slice.call(arguments);

    for (var i in flavoured.befores) {
      var flavouring = flavoured.befores[i];
      if (flavouring.apply(this, args) === false) return;
    }

    var returnValue = flavoured.body.apply(this, arguments);

    for (var i in flavoured.afters) {
      var flavouring = flavoured.afters[i];
      flavouring.apply(this, returnValue);
    }

    return returnValue;
  }

  Object.defineProperties(flavoured, {
    befores: {
      enumerable: true,
      writable: false,
      value: []
    },
    body: {
      enumerable: true,
      writable: false,
      value: body
    },
    afters: {
      enumerable: true,
      writable: false,
      value: []
    },
    unshift: {
      enumerable: false,
      writable: false,
      value: function (fn) {
        return this.befores.unshift(fn);
      }
    },
    push: {
      enumerable: false,
      writable: false,
      value: function (fn) {
        return this.afters.push(fn);
      }
    }
  });

  return flavoured;
}
```

Now you can take a function, and add flavours to taste:

```javascript
var double = flavourize(function (n) { return n * 2; });

double(2)
  //=> 4

double('two')
  //=> NaN

function mustBeNumeric () {
  var args = [].slice.call(arguments);

  args.forEach(function (arg) {
    if (typeof(arg) !== 'number') throw ('Argument Error, "' + arg + '" is not a number');
  });
}

double.unshift(mustBeNumeric);

double(2)
  //=> 4

double('two')
  //=> Argument Error, "two" is not a number
```

The "API" is simple: `unshift` adds functions that are executed before the function body, `push` adds functions that are executed after the function body. Think of it like an array, you unshift things onto the begiing and push them onto the end.

These "flavourings" are normally executed for side effects, but you can write [guard clauses](http://c2.com/cgi/wiki?GuardClause). Return `false` from a function you unshift to bail from the whole thing. Note that `null` and `undefined` won't do, it must be `false`.

Cheers!