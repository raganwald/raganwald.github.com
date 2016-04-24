---
layout: default
title: Would you buy a used software design from this man?
published: false
---

Spotted in mid-refactor:

```javascript
function flip (fn) {
  fn = functionalize(fn);
  var fnLength = fn.length
  
  if (fnLength === 0) {
    return variadic( function (args) {
      return fn.apply(this, reverse(args));
    });
  }
  else if (fnLength === 1) {
    return fn;
  }
  else if (fnLength === 2) {
    return function (a, b) {
      if (b == null) {
        return function (b) {
          return fn.call(this, b, a);
        }
      }
      else return fn.call(this, b, a);
    };
  }
  else if (fnLength === 3) {
    return function (a, b, c) {
      if (b == null && c == null) {
        return function (b, c) {
          if (c == null) {
            return function (c) {
              return fn(c, b, a);
            };
          }
          else return fn(c, b, a);
        }
      }
      else if (c == null) {
        return function (c) {
          return fn(c, b, a);
        };
      }
      else return fn(c, b, a);
    };
  }
  else {
    // fixed length
    return variadic( function (args) {
      var argsLength = args.length;
      
      if (argsLength >= fnLength) {
        return fn.apply(this, reverse(args).slice(0, fnLength));
      }
      else {
        return 
      }
    });
  }

};
```

Ouch!