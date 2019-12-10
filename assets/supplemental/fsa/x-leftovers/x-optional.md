---

### optional

We've covered the decorators for regexen's `*` postfix operator (`kleene*`), and `+` operator (`kleene+`). Regexen also have a third postfix operator, `?`, that represents a decorator that takes a recognizer as an argument, and returns a recognizer that matches sentences consisting of _zero or one_ sentences its argument recognizes:

```javascript
verify(/^x?$/, {
  '': true,
  'x': true,
  'y': false,
  'xy': false,
  'wx': false,
  'xxx': false
});
  //=>  All 6 tests passing
```

We can easily make a version of `optional` in JavaScript, and we can build it out of functions we have already defined:

```javascript
const optional =
  recognizer => union(EMPTY_STRING, recognizer);

const regMaybeReginald = catenation(
  just('reg'),
  optional(just('inald'))
);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});
  //=> All 6 tests passing

```

`optional` decorates a recognizer by making it--well--"optional."

Now we'll look at `complementation`, a decorator that is inessential in a theoretical sense, but when we need it, extremely handy.
s