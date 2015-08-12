---
title: "Extension Methods, Monkey-Patching, and the Bind Operator"
layout: default
tags: allonge
---

### extension methods

In some programming languages, there is a style of "monkey-patching" classes in order to add convenience methods. For example, let's say that we're using [Ruby on Rails][rails], and we have an array called `chain_of_command`. Although Ruby's `Array` class does not define a special method for obtaining the second element of an array, we can still write:

{% highlight ruby %}
second_in_command = chain_of_command.second()
{% endhighlight %}

This is possible because deep within ActiveSupport is [this](https://github.com/rails/rails/blob/ed03d4eaa89a7b4ab09e7f5da76b522d04650daf/activesupport/lib/active_support/core_ext/array/access.rb#L33-L35) snippet of code:

{% highlight ruby %}
class Array

  # ...

  def second
    self[1]
  end
end
{% endhighlight %}

This code adds a `second` method to *every* instance of Array, everywhere in our running instance of Ruby. (There are also word methods for getting the `third`, `fourth`, `fifth`, and `forty_two` of an array. The code does not document why the last one isn't called `forty_second`).

We also get methods like `days` and `from_now` added to `Number`, so we can write:

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

People call this *Monkey patching*, but to be precise, the phrase "monkey patching" is a colloquial expression referring to one particular way of implementing extension methods. We'll look at some others in a moment, but the thing to remember right now is that an extension method is a method extending the behaviour of a class that is defined later and/or elsewhere from the primary class definition, however that might happen to be implemented.

### there is more than one way to do it

The obvious alternative to extension methods is to write utility functions, or methods in utility classes. So instead of writing `chain_of_command.second()` we write `second(chain_of_command)`. Functions are easy in languages like JavaScript:

{% highlight javascript %}
const second = indexed => indexed[1];
{% endhighlight %}

In Ruby, we can make a method that reads like a function call:

{% highlight ruby %}
module Kernel
  def second (indexed)
    indexed[1]
  end
end
{% endhighlight %}

Close enough for government work! So, the key question is, *Why should we write extension methods instead of functions?*

### the "oo" arguments against and for extension methods

There is a general principle in OO that objects should be responsible for implementing all of the operations where they are the primary participant. So by this reasoning, if you want a `second` operation on arrays, the `Array` class should be responsible for implementing it.

At first glance, an extension method accomplishes this. `Array` should be responsible for implementing `.second`, and look! We opened the `Array` class up and added `second` to it. But this reasoning does not apply to a language like Ruby that has a strong distinction between the static organization of the code in `.rb` files and the runtime organization of the code in classes and instances.

At *runtime*, an extension method makes `Array` responsible for implementing the `.second` method, but in the organization of the code, the programming entity responsible for defining `.second` is `ActiveSupport`, not `Array`. And if there was source code for `Array`, we would not find a `second` method in it, or a reference to `include ActiveSupport` or anything like that.

Thus, we can't really say that `Array` is responsible for `second` in a conceptual sense. And thus, making `second` a method of all arrays isn't about what the programmer thinks of as an array being responsible for its behaviour. It's a syntactic consideration.

Is that wrong?

No, that is not wrong. The *other* OO perspective is that objects should be responsible for implementing the *central and characteristic* operations where they are the primary participant. Thus `Array` implements `[]`, `.push`, `.pop`, and so forth. An operation like `.second` can be implemented in terms of `Array`'s primary operations, so it is a secondary concern.

Secondary concerns could be defined elsewhere, and thus there is an OO argument in favour of `.second` not being an `Array` method.

### the syntactic argument for extension methods

If `.second` isn't an object's primary responsibility, then why implement something like `.second` as a method? Why not as a function?

There are two syntactic arguments for extension methods. First, there is the question of consistency. This Ruby reads in a consistent way:

{% highlight ruby %}
chain_of_command
  .select { |officer| officer.belongs_to(club) }
  .map(&:salary)
  .reduce(&:+)
{% endhighlight %}

Likewise, this JavaScript reads in a consistent way:

{% highlight javascript %}
sum(
  pluck(
    select(
      chain_of_command,
      officer => belongs_to(officer, club)
    ),
    'salary'
  )
);
{% endhighlight %}

But *this* JavaScript can't make up its mind which way to go:

{% highlight javascript %}
sum(
  chain_of_command
    .find(officer => belongs_to(officer, club))
    .map(get('salary'))
);
{% endhighlight %}

Ugh.

Making everything in one expression into a method (or everything in one expression into a function) allows us to write more readable code by having chained expressions read in a consistent direction using a consistent invocation style. And if you choose to use methods, extension methods help us make everything read like a method, even things that aren't an entity's primary responsibility.

### drawbacks of monkey-patching as an implementation

Modifying core classes has been considered and rejected many times by many other object-oriented communities. The essential problem is that classes are global in scope. A modification made to a class like `Array` affects the code used within Rails and your own application code as you'd expect. But it also affects the code within every other gem you use, so if one of them happens to define a `.second` method, that gem is incompatible with ActiveSupport.

If every gem defined its own extensions to every core class, you'd have an unmanageable mess. Rails gets away with it, because it's the 800 pound gorilla of Ruby libraries, so everyone else works around their choices. Most other rubyists avoid the practice entirely.

Some early JavaScript libraries tried to follow suit, but for technical reasons, this caused even more headaches for programmers than it did in languages like Ruby, so today you find that most JavaScript programmers view the practice with extreme suspicion.

[rails]: http://rubyonrails.org/

But not all. You still find some libraries implementing things like `Function.prototype.delay`, and of course anybody who tries to use two such libraries in the same code base is in for a headache.

### static extension methods as an implementation

Various mechanisms have been proposed to permit writing expressions syntactically as `14.days.from_now` without actually modifying a global class like `Number`. One of the most widely used is C# 3.0's [Extension Methods].

[Extension Methods]: https://en.wikipedia.org/wiki/Extension_method#Extension_methods

In C#, we can write an extension method for a class like this:

{% highlight C# %}
public static class Something
{
  // ...

  public static string Reverse(this string input)
  {
    char[] chars = input.ToCharArray();
    Array.Reverse(chars);
    return new String(chars);
  }

  public void BackAsswardAlphabet()
  {
    return "abcdefghijklmnopqrstuvwxyz".Reverse();
  }
}
{% endhighlight %}

The compiler knows that `Reverse` is to be implemented as an extension method on strings, by virtue of the `this string` portion of the signature. And since it's defined as a static member of the `Something` class, it is not actually changing strings in any way.

The code within the `BackAsswardAlphabet` method includes the expression `"abcdefghijklmnopqrstuvwxyz".Reverse()`, and the C# compiler knows that `"abcdefghijklmnopqrstuvwxyz"` is a string, and therefore that it should treat `"abcdefghijklmnopqrstuvwxyz".Reverse()` as if we had actually written `Something.Reverse("abcdefghijklmnopqrstuvwxyz")`.

This is only possible because C# includes static typing, and thus that the compiler knows that `"abcdefghijklmnopqrstuvwxyz"` is a string, so it can resolve the extension method at compile time.

Languages like Javascript ought to know the same thing for a string literal, and for any `const` variable bound to a string literal, but reasoning about types beyond some very simple cases is very difficult in "untyped" languages, so this technique is out of reach until some future version of JavaScript brings us [gradual typing](https://en.wikipedia.org/wiki/Gradual_typing).

### es.maybe's bind operator as an implementation

One of the features proposed for possible inclusion in a future formal release of ECMAScript (a/k/a "ES.maybe") is the bind operator, `::`. In short, `::fn` is equivalent to `fn.bind(this)`, `foo::bar` is equivalent to `bar.bind(foo)`, and `foo::bar(baz)` is equivalent `foo::bar(baz)`. We can experiment with it right now using transpilation tools like [Babel].

[Babel]: http://babeljs.io

Its uses for abbreviating code where we are already using `.bind`, `.call`, and `.apply` have been explored elsewhere. It's nice, because something like `foo::bar(baz)` looks like what we're trying to say: "Treat `.bar` as a method being sent to `foo` with the parameter `baz`." When we write `foo::bar(baz)`, we're saying something different: "Send the `.call` method to the entity `bar` with the parameters `foo` and `baz`."

And that speaks *directly* to our exploration of extension methods. Consider:

{% highlight javascript %}
Array.prototype.second = function () {
  return this[1];
};

['a', 'b', 'c'].second()
  //=> 'b'
{% endhighlight %}

With the bind operator, we can write:

{% highlight javascript %}
function second () {
  return this[1];
};

const abc = ['a', 'b', 'c'];

abc::second()
  //=> 'b'
{% endhighlight %}

Now we're writing `abc::second()` instead of `abc.second()`. But we aren't modifying `Array`'s prototype in any way. And we still have syntax that puts the subject of the operation first, like a method.

If we're using JavaScript and have a tolerance for ES.maybe features, the bind operator provides a very good alternative to monkey-patching extension methods.

### summary

Extension methods are a reasonable design choice when we want to provide the syntactic appearance of methods, and also wish to provide secondary functionality that does not belong in the core class definition (or was not shipped in the standard implementation fo a class we don't control).

Monkey-patching is a popular choice in some languages, but has deep and difficult-to-resolve conflicting dependency problems. There are some language-specific alternatives, such as C#'s extension method syntax, and ES.maybe's bind operator.
