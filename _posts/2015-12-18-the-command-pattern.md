---
layout: default
tags: [allonge, noindex]
---

Wikipedia has a page about the [command pattern][wiki]:

[wiki]: https://en.wikipedia.org/wiki/Command_pattern

> In object-oriented programming, the command pattern is a behavioral design pattern in which an object is used to encapsulate all information needed to perform an action or trigger an event at a later time. This information includes the method name, the object that owns the method and values for the method parameters.

> Four terms always associated with the command pattern are *command*, *receiver*, *invoker* and *client*. A command object knows about receiver and invokes a method of the receiver. Values for parameters of the receiver method are stored in the command. The receiver then does the work. An invoker object knows how to execute a command, and optionally does bookkeeping about the command execution. The invoker does not know anything about a concrete command, it knows only about command interface. Both an invoker object and several command objects are held by a client object. The client decides which commands to execute at which points. To execute a command, it passes the command object to the invoker object.

> Using command objects makes it easier to construct general components that need to delegate, sequence or execute method calls at a time of their choosing without the need to know the class of the method or the method parameters. Using an invoker object allows bookkeeping about command executions to be conveniently performed, as well as implementing different modes for commands, which are managed by the invoker object, without the need for the client to be aware of the existence of bookkeeping or modes.

While this is a useful definition for conventional OOP, there is more to programming than conventional OOP. So let's take a step away from OOP-specifics like "receiver methods." So what is the command pattern, really?

### the value of values

Let's begin by making an observation about the value of values: In programming, we have *nouns*. Things. "Entities."

In JavaScript, we call them, *values*, things we can put in a variable, pass to a function as an argument, return from a function, or both. Integers are values:

{% highlight javascript %}
let one = 1;

function knockOnDoor (times) {
  for(let i = 0; i < times; ++i)
    console.log("knock!");
}

function occurrences (string, term, fromIndex = 0, plus = 0) {
  let i = string.indexOf(term, fromIndex);
  return i < 0
         ? plus
         : occurrences(string, term, i + term.length, ++plus)
}

function occurrences (string, term, fromIndex = 0, plus = 0) {
  let i = string.indexOf(term, fromIndex);
  return i < 0
         ? plus
         : occurrences(string, term, i + term.length, ++plus)
}
{% endhighlight %}

Famously, JavaScript functions are values too, we can assign them to variables, pass, them to functions as arguments, return them from functions, or both:

{% highlight javascript %}
let occurrences = (string, term, fromIndex = 0, plus = 0) => {
  let i = string.indexOf(term, fromIndex);
  return i < 0
         ? plus
         : occurrences(string, term, i + term.length, ++plus)
};

function maybeApply (fn, ...args) {
  if (args.some((arg) => arg == null)) return;
  return fn(...args);
}

let makeCounter = () => {
  let count = 0;
  return () => ++count;
}

let compose = (...fns) =>
  (arg) => {
    for (let fn of fns.reverse()) {
      arg = fn(arg)
    }
    return arg;
  };
{% endhighlight %}

The idea of functions being first-class values goes back to Lisp, and before that to the Lambda Calculus and Combinatory Logic. It's one of the "great discoveries." When we write functions that take functions as arguments, return functions, or both, we're writing "higher-order functions," and that moves us up a level of abstraction. It also gives us new ways to decompose functionality and separate concerns.

### invocations as values

In normal JavaScript programming, we work with values, some of which are functions. What we do with them We invoke functions with those values. So we spend a lot of time talking about values, and a lot of time talking about functions, and every once in a while we talki about "calling" or "invoking" a function.

But an "invocation" is not, itself, a first-class value. Some values you plan to pass to a function are values, and the function itself is a value, but the invocation of the function is not, itself a value. Some laguages have special features for invocations being first-class values, but in JavaScript we have to rustle something up for ourselves.

Let's build about the simplest thing that could possibly work (TSTTCPW). Obviously, we usually invoke a function directly:

{% highlight javascript %}
fn(a, b, c)

// or better still:

fn(...args)
{% endhighlight %}

If we want to capture that invocation and use it as a first-class value, we can wrap it in a function, like this:

{% highlight javascript %}
let invoke = () => fn(...args);
{% endhighlight %}

Now we have a function, `invoke`, that invokes our function with arguments from an array. Any time we want to resolve the invocation, we simply invoke it without arguments:

{% highlight javascript %}
invoke();
{% endhighlight %}

And we know it will invoke our original function for us.

Now, obviously, we've seen how to assign an invocation to a variable. We can also write functions return invocations. The very simplest is one that makes an invocation for us:

{% highlight javascript %}
let invocation = (fn, ...args) =>
  () => fn(...args);
{% endhighlight %}

The `invocation` function makes invocations for us. We can use it in all sorts of ways. Let's say that we have an array of strings:

{% highlight javascript %}
let corpus = [
  "let times = (...matrices) =>",
  "  matrices.reduce(",
  "    ([a,b,c], [d,e,f]) => [a*d + b*e, a*e + b*f, b*e + c*f]",
  "  );",
  "",
  "let power = (matrix, n) => {",
  "  if (n === 1) return matrix;",
  "",
  "  let halves = power(matrix, Math.floor(n / 2));",
  "",
  "  return n % 2 === 0",
  "         ? times(halves, halves)",
  "         : times(halves, halves, matrix);",
  "}",
  "",
  "let matrixFibonacci = (n) =>",
  "  n < 2",
  "  ? n",
  "  : power([1, 1, 0], n - 1)[0];",
  "",
  "matrixFibonacci(62)",
  "  // => 4052739537881"
];
{% endhighlight %}
