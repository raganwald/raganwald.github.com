---
title: "Recursion? We don't need no stinking recursion!"
published: false
tags: [noindex, allonge]
---

> Every recursive algorithm can be implemented with iteration

True.

Whether we _should_ implement a recursive algorithm with iteration is, as they say, "an open problem," and the factors going into that decision are so varied that there is no absolute "Always favour recursion" or "Never use recursion" answer.

However, what we can say with certainty is that knowing _how_ to implement a recursive algorithm with iteration is deeply interesting! And as a bonus, this knoweledge is useful when we do encounter one of the situations where we want to convert an algorithm that is normally recursive into an iterative algorithm.

So... We're off!

### recursion, see recursion

The shallow definition of a recursive algorithm is a function that directly or indirectly calls itself. Digging a little deeper, most recursive algorithms address the situation where the solution to a problem can be obtained by dividing it into smaller pieces that are similar to the initial problem, solving them, and then combining the solution.

This is known as "divide and conquer," and here is an example: Counting the number of leaves in a tree. Our tree is represented as either a leaf, represented as an map from the word "leaf" to a value (`{leaf: "green"}`), or a branch, represented as map from the word "branch" to an array of subtrees.

So a tree that is a single leaf is just `{leaf: "green"}`, while a tree that is a branch containing three leaves might be `{branch: [{leaf: "green"}, {leaf: "green"}, {leaf: "green"}]}`. Branches can contain branches, so we could also have something like:

```
const tree = {branch: [
  {branch: [
    {leaf: "green"}, {leaf: "green"}
  ]},
  {branch: [
    {branch: [
      {leaf: "green"}
    ]},
    {branch: [
      {leaf: "green"}, {leaf: "green"}
    ]},
    {leaf: "green"}
  ]}
]};
```
 
 A recursive algorithm to count the leaves in a tree is:
 
 ```
 function numberOfLeaves(tree) {
  