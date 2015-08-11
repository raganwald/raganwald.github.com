---
title: "Monkey-Patching, Extension Methods, and the Bind Operator"
layout: default
tags: [allonge, noindex]
---

### extension methods

In some programming languages, there is a style of "monkey-patching" classes in order to add convenience methods. For example, if you use [Ruby on Rails][rails], you can write things like:

{% highlight ruby %}
second_in_command = chain_of_command.second()
{% endhighlight %}

This is possible, because deep within ActiveSupport is [this](https://github.com/rails/rails/blob/ed03d4eaa89a7b4ab09e7f5da76b522d04650daf/activesupport/lib/active_support/core_ext/array/access.rb#L33-L35) snippet of code:

{% highlight ruby %}
class Array

  # ...

  def second
    self[1]
  end
end
{% endhighlight %}

This code adds a `second` method to *every* instance of Array everywhere in your running instance of Ruby. (There are also word methods for getting the `third`, `fourth`, `fifth`, and `forty_two` of an array. The code does not document why the last one isn't called `forty_second`).

You also get methods like `days` and `from_now` added to `Number`, so you can write code like:

{% highlight ruby %}
access.expires_at(14.days.from_now)
{% endhighlight %}

And it goes on and on with all kinds of methods added to all kinds of classes. These kinds of methods are generally thought to provide readability, convenience, or both, and it is one of the reasons why Rails became popular.

We can do the same kind of thing in JavaScript, of course. Here's a `.second` extension method for `Array`:

{% highlight javascript %}
Array.prototype.second = function () {
  return this[1];
};

['a', 'b', 'c'].second()
  //=> 'b'
{% endhighlight %}

A method added to a class from a place other than the class's primary definition is called an *extension method*. Note that methods defines in modules/mixins are not extension methods, we are referring to a method added completely orthogonally from the code or library or built-in that defines the standard behaviour of the class.

### the "oo" argument for extension methods

The obvious alternative to extension methods is to write utility functions, or methods in Utility classes. So instead of writing `chain_of_command.second()` you write things like `second(chain_of_command)`. Functions (or things in Ruby that read like functions) are easy.

In Ruby:

{% highlight ruby %}
module Kernel
  def second (indexed)
    indexed[1]
  end
end
{% endhighlight %}

Or in JavaScript:

{% highlight javascript %}
const second = indexed => indexed[1];
{% endhighlight %}

Why should we write extension methods instead of functions?

There are two "Object-Oriented" considerations when choosing between writing utility functions, and writing extension methods. First, there is a general principle in OO that objects should be responsible for implementing all of the operations where they are the primary participant. So by this reasoning, if you want a `second` operation on arrays, `Array` should be responsible for implementing it.

Although at *runtime*, an extension method makes arrays responsible for implementing the `.second` method, in actual fact the programming entity responsible for defining `.second` is `ActiveSupport`, not `Array`. So writing `chain_of_command.second` isn't really about objects being responsible for their methods.

That is not a bad thing *per se*, there is an argument that sometimes, a cross-cutting concern should not be conflated with an entity's primary concern. So perhaps, a method like `.second` isn't really the primary concern of an array, and therefore, although it may be *implemented* as an extension method, it isn't really an array's responsibility.

Looking at

If it isn't an object's primary responsibility, then why implement something like `.second` as a method?

The second consideration is purely grammatical. In programming language syntax, there are the notions *prefix* and *infix* operators. For example, unary negation (`debit = -credit`) is a prefix operator, and addition is an infix operator (`debit = debit + interest`).

Likewise, functions can be seen as *prefix* notation, and methods are *infix* notation. Further to that, in contemporary OO languages, the primary subject of an operation comes first, then the operation, then secondary object(s) or value(s) if any.

### drawbacks of monkey-patching as an implementation

Modifying core classes has been considered and rejected many times by many other object-oriented communities. The essential problem is that classes are global in scope. A modification made to a class like `Array` affects the code used within Rails and your own application code as you'd expect. But it also affects the code within every other gem you use, so if one of them happens to define a `.second` method, that gem is incompatible with ActiveSupport.

If every gem defined its own extensions to every core class, you'd have an unmanageable mess. Rails gets away with it, because it's the 800 pound gorilla of Ruby libraries, so everyone else works around their choices. Most other rubyists avoid the practice entirely.

Some early JavaScript libraries tried to follow suit, but for technical reasons, this caused even more headaches for programmers than it did in languages like Ruby, so today you find that most JavaScript programmers view the practice with extreme suspicion.

[rails]: http://rubyonrails.org/

But not all. You still find some libraries implementing things like `Function.prototype.delay`, and of course anybody who tries to use two such libraries in the same code base could be in for a headache.

### static extension methods

Various mechanisms have been proposed to permit writing expressions syntactically as `14.days.from_now` without actually modifying a global class like `Number`. One of the most widely used is C# 3.0's [Extension Methods].

[Extension Methods]: https://en.wikipedia.org/wiki/Extension_method#Extension_methods

In C#, you can write an extension method for a class like this:

{% highlight C# %}
public static string Reverse(this string input)
{
    char[] chars = input.ToCharArray();
    Array.Reverse(chars);
    return new String(chars);
}
{% endhighlight %}

[Babel]: http://babeljs.io



