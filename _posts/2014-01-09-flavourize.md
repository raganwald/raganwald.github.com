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

    flavoured.befores.forEach( function (flavouring) {
      flavouring.apply(this, args);
    }, this);

    var returnValue = flavoured.body.apply(this, arguments);

    flavoured.afters.forEach( function (flavouring) {
      flavouring.call(this, returnValue);
    }, this);

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

double('two)
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

Cheers!