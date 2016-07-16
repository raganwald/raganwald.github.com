---
title: "On Babies and Bathwater: Are Mixins Considered Harmful?"
layout: default
tags: [allonge, noindex]
---

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

Are [Mixins Considered Harmful](https://facebook.github.io/react/blog/2016/07/13/mixins-considered-harmful.html)?

Dan Abramov wrote something that sounds familiar to everyone[^everyone] who works with legacy applications:

[^everyone]: Yes, I said _everyone_, I didn't cover my ass with a phrase like "many people." Everyone.

> However it’s inevitable that some of our code using React gradually became incomprehensible. Occasionally, the React team would see groups of components in different projects that people were afraid to touch. These components were too easy to break accidentally, were confusing to new developers, and eventually became just as confusing to the people who wrote them in the first place.

You can ignore out the word "React:" All legacy applications exhibit this behaviour: They accumulate chunks of code that are easy to break and confusing to everyone, even the original authors. Worse, such chunks of code tend to grow over time, they are infectious: People write code to work around the incomprehensible code instead of refactoring it, and the workarounds become easy to break accidentally and confusing in their own right. The problems grow over time.

How do mixins figure into this? Dan articulated four issues with mixins:

0. Mixins introduce implicit dependencies:

  > Sometimes a component relies on a certain method defined in the mixin, such as getClassName(). Sometimes it’s the other way around, and mixin calls a method like renderHeader() on the component. JavaScript is a dynamic language so it’s hard to enforce or document these dependencies.

  > Mixins break the common and usually safe assumption that you can rename a state key or a method by searching for its occurrences in the component file.

---

### important message

(*This is a work-in-progress, feel free to read and even submit an edit, but do not post on Reddit or Hacker News, thank you.*)

([edit this post yourself](https://github.com/raganwald/raganwald.github.com/edit/master/_posts/2016-05-07-javascript-generators-for-people-who-dont-give-a-shit-about-getting-stuff-done.md))

---

### notes
