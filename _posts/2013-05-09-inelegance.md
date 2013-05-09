---
layout: default
tags: javascript
---

There are many definitions of "elegance," but with respect to programming, I like to define it as, "The degree to which a set of features scale." The more things you can do with a few features, the better.

One of the easiest way to make a set of features scale is to make them composeable in as many ways as possible. If you have features A, B, and C, and they don't compose, You can do three things. If they also compose in some binary way, you could have as many as nine: A, B, C, AB, BA, AC, CA, BC, and CB.

To be elegant, you want things to be composeable, and you ideally want them to compose in a natural, simple way. When designing feature "A," you shouldn't have to write special case code for composing A with B and A with C. What happens when you add "D?" Are you supposed to go back and retroactively change A, B, and C to compose with D?

Special case code is often a sign of *inelegance*, a smell that the model is not right. I've written a lot of inelegant code. For example, I was recently working with adding some functional idioms to JavaScript.

(Although these examples are in JavaScript, I don't think the concept of inelegance is JavaScript-specific.)

At some point, I wrote a *curry* function. To [refresh your memory][cpa], currying is:

1. `curry(f(x) {...}) === f(x) {...}`
2. `curry(f(x, y, ...) {...}) = curry(f2(y, ...) { return f(x, y, ...); })`

In other words, it create a chain of functions that take on parameter each. For example, here is a function that curries a binary functionL

    function curry2 (f) {
      return function (first) {
        return function (last) {
          return f(first, last);
        }
      }
    }

[cpa]: http://raganwald.com/2013/03/07/currying-and-partial-application.html "What's the difference between Currying and Partial Application?"

I also wrote a *flip* function that takes any function and reverses its arguments. For example, here is a function that flips any binary function:

    function flip2 (f) {
      return function (first, last) {
        return f(last, first);
      }
    }
    
The two functions compose: You can write `curry2(flip2(f))` (although `flip2(curry2(f))` doesn't make any sense). So far, things are minimal and elegant. Of course, not all functions are binary. How do we write a generalized flip or curry function,one that handles arbitrarily polyadic functions?

JavaScript functions are also objects with properties. one of them, `.length`, is the number of arguments declared. So:

    function () {}.length
      //=> 0
    function (x) {}.length
      //=> 1
    function (x, y) {}.length
      //=> 2
    function (x, y, z) {}.length
      //=> 3
      
Thus, we can discover the declared arity of a function with `.length`. We can also access the number of actual arguments and their values, regardless of arity, with a special variable called `arguments`. For example:

    (function () {
      return '' + arguments.length + '-' + arguments[1];
    })('a', 'b', 'c');
      //=> "3-b"
      
`arguments` isn't actually an array, so if you want to convert it to an array, you need to use some legerdemain:

    function toArray(args) {
      return [].slice.call(args, 0);
    }
      
Putting all this together, I came up with this implementation of `flip`:

    function flip (f) {
      return function () {
        return f.apply(this, toArray(arguments).reverse())
      }
    }
    
    function echo (a, b, c, d) {
      return [a, b, c, d];
    }
    
    echo(1, 2, 3, 4);
      //=> [ 1, 2, 3, 4 ]
      
    flip(echo)(1, 2, 3, 4)
      //=> [ 4, 3, 2, 1 ]
      
Emboldened, I wrote a polyadic version of `curry` with these tools:

    function curry (f) {
      var collectedArgs = [];
      
      if (f.length < 2) {
        return f;
      }
      else return (function getmoreargs (remaining) {
        return function (arg) {
          collectedArgs.push(arg);
          if (remaining === 1) {
            return f.apply(this, collectedArgs);
          }
          else return getmoreargs(remaining - 1);
        };
      })(f.length);
    }
    
    curry(echo)
      //=> [Function]
    curry(echo)(1)
      //=> [Function]
    curry(echo)(1)(2)
      //=> [Function]
    curry(echo)(1)(2)(3)
      //=> [Function]
    curry(echo)(1)(2)(3)(4)
      //=> [ 1, 2, 3, 4 ]
      
Great! Now for the "elegance" test:

    curry(flip(echo))(1)(2)(3)(4)
      //=> TypeError: object is not a function
      
The problem is that `curry` inspects its function to work out how many arguments are expected. But `flip` breaks the implied ocntract by returning a function that doesn't declare any arguments:

    echo.length
      //=> 4
      
    flip(echo).length
      //=> 0
      
Bzzt! Naturally, I wrote a special wrapper to "do the right thing." Leaving out some performance caching, it looks like this:

    function arity (numberOfArgs, fun) {
      if (fun.length === numberOfArgs) return fun;
      var parameters = new Array(numberOfArgs);
      for (var i = 0; i < numberOfArgs; ++i) {
        parameters[i] = "__" + i;
      }
      var pstr = parameters.join();
      var code = "return function ("+pstr+") { return fun.apply(this, arguments); };";
      return (new Function(['fun'], code))(fun);
    };
    
This grisly bit of code actually parses some code at runtime to "wrap" any function in the correct number of arguments. Here it is in action:

    function flip (f) {
      return arity(f.length, function () {
        return f.apply(this, toArray(arguments).reverse())
      });
    }

And now:

    curry(flip(echo))(1)(2)(3)(4)
      //=> [4, 3, 2, 1]
      
Which is nice, and less inelegant than not being able to compose `curry` with `flip`. I could also have used some other special case mechanism like storing the original length of a function in a special property when reversing a function, but it felt less inelegant to cut with JavaScript's grain and respect the way it handles function arity "natively."

This inelegance problem crops up even more when working with large frameworks: Features interact in ways that expose edge cases. It's vital to make code as compseable as possible and thus as elegant as possible, but sooner or later you may find yourself holding your nose and trying to find the minimum level of inelegance.

And it may well be that the least inelegant thing to do is simply declare that certain elements don't compose at all. Maybe that's what should have happened here. Maybe currying flipped functions should simply be banned.

What do you think?