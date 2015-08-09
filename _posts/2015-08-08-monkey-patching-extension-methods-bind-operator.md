---
title: "Monkey-Patching, Extension Methods, and the Bind Operator"
layout: default
tags: [allonge, noindex]
---

In some programming languages, there is a style of "monkey-patching" classes in order to add convenience methods. For example, if you use [Ruby on Rails][rails], you can write things like:

{% highlight ruby %}
second_in_command = chain_of_command.second
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

However.

Modifying core classes has been considered and rejected many times by many other object-oriented communities. The essential problem is that classes are global in scope. A modification made to a class like `Array` affects the code used within Rails and your own application code as you'd expect. But it also affects the code within every other gem you use, so if one of them happens to define a `.second` method, that gem is incompatible with ActiveSupport.

If every gem defined its own extensions to every core class, you'd have an unmanageable mess. Rails gets away with it, because it's the 800 pound gorilla of Ruby libraries. Most other rubyists avoid the practice.

Some early JavaScript libraries tried to follow suit, but for technical reasons, this caused even more headaches for programmers than it did in languages like Ruby, so today you find that most JavaScript programmers view the practice with extreme suspicion.

[rails]: http://rubyonrails.org/



[Babel]: http://babeljs.io
