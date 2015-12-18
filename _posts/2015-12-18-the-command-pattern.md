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

In JavaScript, we call them, *values*, things we can put in a variable, pass to a function as an argument, or return from a function. Famously, JavaScript functions are values too, which leads to the fact that you can write functions that take functions as arguments and return new functions. It makes it easy to dynamically *compose* functions. For example:

{% highlight javascript %}
function compose (...fns) {
  let snf = fns.reverse();

  return function (arg) {
    for (let fn of snf) {
      arg = fn(arg)
    }
    return arg;
  };
}
{% endhighlight %}
