---
title: "“We will encourage you to develop the three great virtues of a programmer: laziness, impatience, and hubris”"
layout: default
tags: [allonge, noindex]
---

(*This post is a work-in-progress*)

### larry wall

[![Larry Wall and Camelia, the Perl 6 Mascot](/assets/images/Larry_Wall_and_Camelia.jpg)](https://en.wikipedia.org/wiki/Perl_6#/media/File:FOSDEM_2015_Larry_Wall_and_Camelia_the_Perl6_logo.jpg)

---

### laziness and eagerness

In computing, "laziness" is a broad term, generally referring to not doing any work unless you need it. Whereas its opposite is "eagerness," doing as much work as possible in case you need it later.

For example, consider this JavaScript:

{% highlight javascript %}
function ifThen (a, b) {
  if (a) return b;
}

ifThen(1 === 0, 2 + 3)
  //=> undefined
{% endhighlight %}

Now, here's the question: Does JavaScript compute `2+3`? You probably know the answer: Yes it does. When it comes to passing arguments to a function invocation, JavaScript is *eager*, it evaluates all of the expressions, and it does so whether the value of the expression is used or not.

If JavaScript was *lazy*, it would not evaluate `2+3` in the expression `ifThen(1 === 0, 2 + 3)`. So is JavaScript an "eager" language? Mostly. But not always! If we write: `1 === 0 ? 2 + 3 : undefined`, JavaScript does *not* evaluate `2+3`. Operators like `?:` and `&&` and `||`, along with program control structures like `if`, are lazy. You just have to know in your head what is eager and what is lazy.

And if you want something to be lazy that isn't naturally lazy, you have to work around JavaScript's eagerness. For example:

{% highlight javascript %}
function ifThenEvaluate (a, b) {
  if (a) return b();
}

ifThenEvaluate(1 === 0, () => 2 + 3)
  //=> undefined
{% endhighlight %}

JavaScript eagerly evaluates `() => 2 + 3`, which is a function. But it doesn't evaluate the expression in the body of the function until it is invoked. And it is not invoked, so `2+3` is not evaluated.

Wrapping expressions in functions to delay evaluation is a longstanding technique in programming. They are colloquially called [thunks](https://en.wikipedia.org/wiki/Thunk), and there are lots of interesting applications for them.

### generating laziness

The bodies of functions are a kind of lazy thing: They aren't evaluated until you invoke the function. This is related to `if` statements, and every other kind of control flow construct: JavaScript does not evaluate statements unless the code actually encounters the statement.

Consider this code:

{% highlight javascript %}
function containing(value, list) {
  let listContainsValue = false;

  for (const element of list) {
    if (element === value) {
      listContainsValue = true;
    }
  }

  return listContainsValue;
}
{% endhighlight %}

You are doubtless chuckling at its naïveté. Imagine this list was the numbers from one to a billion--e.g. `[1, 2, 3, ..., 999999998, 999999999, 1000000000]`--and we invoke:

{% highlight javascript %}
const billion = [1, 2, 3, ..., 999999998, 999999999, 1000000000];

containing(1, billion)
  //=> true
{% endhighlight %}

We get the correct result, but we iterate over every one of our billion numbers first. Awful! Small children and the otherwise febrile know that you can `return` from anywhere in a JavaScript function, and the rest of its evaluation is abandoned. So we can write this:

{% highlight javascript %}
function containing(list, value) {
  for (const element of list) {
    if (element === value) {
      return true;
    }
  }

  return false;
}
{% endhighlight %}

This version of the function is lazier than the first: It only does the minimum needed to determine whether a particular list contains a particular value.

From `containing`, we can make a similar function, `findWith`:

{% highlight javascript %}
function findWith(predicate, list) {
  for (const element of list) {
    if (predicate(element)) {
      return element;
    }
  }
}
{% endhighlight %}

`findWith` applies a predicate function to lazily find the first value that evaluates truthily. Unfortunately, while `findWith` is lazy, its argument is evaluated eagerly, as we mentioned above. So let's say we want to find the first number in a list that is greater than `99` and is a palindrome:

{% highlight javascript %}
function isPalindromic(number) {
  const forwards = number.toString();
  const backwards = forwards.split('').reverse().join('');

  return forwards === backwards;
}

function gt(minimum) {
  return (number) => number > minimum;
}

function every(...predicates) {
  return function (value) {
    for (const predicate of predicates) {
      if (!predicate(value)) return false;
    }
    return true;
  };
}

const billion = [1, 2, 3, ..., 999999998, 999999999, 1000000000];

findWith(every(isPalindromic, gt(99)), billion)
  //=> 101
{% endhighlight %}

It's the same principle as before, of course, we iterate through our billion numbers and stop as soon as we get to `101`, which is greater than `99` and palindromic.

But JavaScript eagerly evaluates the arguments to `findWith`. So it evaluates `isPalindromic, gt(99))` and binds it to `predicate`, then it eagerly evaluates `billion` and bids it to `list`.

But what if we had a much more expensive computation to perform to get our numbers? Like this one:



(*This post is a work-in-progress*)

