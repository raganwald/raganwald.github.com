---
layout: default
tags: [allonge, noindex]
---

*Mixins* solve a very common problem in class-centric OOP: For non-trivial applications, there is a *many-to-many* relationship between behaviour and classes, and it does not neatly decompose into a tree. The mixin approach is to leave classes in a single inheritence hierarchy, and to mix additional behaviour into individual classes as needed.

Here's a simplified functional mixin for classes:

{% highlight javascript %}
function mixin (behaviour, sharedBehaviour = {}) {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin (clazz) {
    for (let property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  for (let property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      enumerable: sharedBehaviour.propertyIsEnumerable(property)
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag]
  });
  return _mixin;
}
{% endhighlight %}

Thisis more than enough to do a lot of very good work in JavaScript, but we can do better. First, we note that our `mixin` function returns a function that *destructively modifies* its target class's prototype. This works just fine if we consider that what we want to do is say that *Every `BookCollector` has `addToCollection` and `collection` methods, and these are their definitions*.

This is perfect if we are from the "final-by-default" tribe
