---
layout: default
title: "OOF: Object-Oriented Functional"
published: false
---

Consider this simple function, well-known to Lispers, Rubyists, and JavaScripters everywhere:

```javascript
function map (array, fn) {
  var result = [];
  for (var index in array) {
    result[index] = fn(array[index]);
  }
  return result;
}
```

Given an array and a function, it returns an array populated with the results of applying the function to each element of the array. If you are to believe function-oriented-programmers ("FOPs"), `map` is a wonderful construct, to be admired and used everywhere, along with its partner `foldl` (a/k/a `reduce`):

```javascript
function foldl (array, fn, acc) {
  if (optionalSeed === void 0) {
    acc = array[0];
    array = array.slice(1);
  }
  for (var index in array) {
    acc = fn(acc, array[index]);
  }
  return acc;
}
```

Let's take it as a given that mapping and folding are Good Things (because they are), and let's not spend many paragraphs explaining why. However, they may be good ideas but poor designs. Here's why:

### map and foldl are poorly designed

Here's a design maxim: Parameters to methods are ordered by importance. The first is the most important, the second is less important than that, and so forth. So according to this maxim, the "standard" `map` function declares that the array being mapped is more important than the function you are using to map the array.

So when I write `salaries = map(employeeList, getSalary)`, I'm saying that 