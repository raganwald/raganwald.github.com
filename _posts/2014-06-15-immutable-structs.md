---
layout: default
title: "Structs and ImmutableStructs"
tags: spessore
---

Sometimes we want to share objects by reference for performance and space reasons, but we don't want them to be mutable. One motivation is when we want many objects to be able to share a common entity without worrying that one of them may inadvertently change the common entity.

JavaScript provides a way to make properties *immutable*:

{% highlight javascript %}
"use strict";

var rentAmount = {};

Object.defineProperty(rentAmount, 'dollars', {
  enumerable: true,
  writable: false,
  value: 420
});

Object.defineProperty(rentAmount, 'cents', {
  enumerable: true,
  writable: false,
  value: 0
});

rentAmount.dollars
  //=> 420

rentAmount.dollars = 600;
  //=> 600

rentAmount.dollars
  //=> 420
{% endhighlight %}

`Object.defineProperty` is a general-purpose method for providing fine-grained control over the properties of any object. When we make a property `enumerable`, it shows up whenever we list the object's properties or iterate over them. When we make it writable, assignments to the property change its value. If the property isn't writable, assignments are ignored.

When we want to define multiple properties, we can also write:

{% highlight javascript %}
var rentAmount = {};

Object.defineProperties(rentAmount, {
  dollars: {
    enumerable: true,
    writable: false,
    value: 420
  },
  cents: {
    enumerable: true,
    writable: false,
    value: 0
  }
});

rentAmount.dollars
  //=> 420

rentAmount.dollars = 600;
  //=> 600

rentAmount.dollars
  //=> 420

We can make properties immutable, but that doesn't prevent us from adding properties to an object:

{% highlight javascript %}
rentAmount.feedbackComments = []
rentAmount.feedbackComments.push("The rent is too damn high.")
rentAmount
  //=>
    { dollars: 420,
      cents: 0,
      feedbackComments: [ 'The rent is too damn high.' ] }
{% endhighlight %}

Immutable properties make an object *closed for modification*. This is a separate matter from making it *closed for extension*. But we can do that too:

{% highlight javascript %}
Object.preventExtensions(rentAmount);

function addCurrency(amount, currency) {
  "use strict";

  amount.currency = currency;
  return currency;
}

addCurrency(rentAmount, "CAD")
  //=> TypeError: Can't add property currency, object is not extensible
{% endhighlight %}

### structs

Many other languages have a formal data structure that has one or more named properties that are open for modification, but closed for extension. Here's a function that makes a Struct:

{% highlight javascript %}
function Struct (template) {
  if (Struct.prototype.isPrototypeOf(this)) {
    var struct = this;

    Object.keys(template).forEach(function (key) {
      Object.defineProperty(struct, key, {
        enumerable: true,
        writable: true,
        value: template[key]
      });
    });
    return Object.preventExtensions(struct);
  }
  else return new Struct(template);
}

var rentAmount2 = Struct({dollars: 420, cents: 0});

addCurrency(rentAmount2, "ISK");
  //=> TypeError: Can't add property currency, object is not extensible
{% endhighlight %}

And when you need an `ImmutableStruct`:

{% highlight javascript %}
function ImmutableStruct (template) {

  if (ImmutableStruct.prototype.isPrototypeOf(this)) {
    var immutableObject = this;

    Object.keys(template).forEach(function (key) {
      Object.defineProperty(immutableObject, key, {
        enumerable: true,
        writable: false,
        value: template[key]
      });
    });
    return Object.preventExtensions(immutableObject);
  }
  else return new ImmutableStruct(template);
}

ImmutableStruct.prototype = new Struct({});

function copyAmount(to, from) {
  "use strict"

  to.dollars = from.dollars;
  to.cents   = from.cents;
  return to;
}

var immutableRent = ImmutableStruct({dollars: 1000, cents: 0});

copyAmount(immutableRent, rentAmount);
  //=> TypeError: Cannot assign to read only property 'dollars' of #<Struct>
{% endhighlight %}

Structs and Immutable Structs are a handy way to prevent inadvertent errors and to explicitly communicate that an object is intended to be used as a struct and not as a dictionary. We'll return to structs later when we discuss reflection and classes.