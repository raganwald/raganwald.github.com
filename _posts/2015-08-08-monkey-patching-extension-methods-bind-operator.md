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

This kind of thing is very convenient, and this is part of the reason why Rails is popular. In addition to methods like `second` being added to Array, you also get methods like `days`, and `from_now` added to `Number`, so you can write code like:

{% highlight ruby %}
access.expires_at(14.days.from_now)
{% endhighlight %}

And it goes on and on with all kinds of methods added to all kinds of classes. This kind o fthing was consdered and discarded

[rails]: http://rubyonrails.org/

[Babel]: http://babeljs.io
