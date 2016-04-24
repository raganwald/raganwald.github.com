---
title: Did you ever take that test yourself?
layout: default
tags: allonge
---

Chris Sturgill wrote a perfectly sane blog post called [Tests Are Overhyped](http://sturgill.github.io/2013/04/15/tests-are-overhyped/). His thesis is that some people take testing to extremes where they are no longer beneficial, and slavishly follow test-centric practices for "cargo cult" reasons rather without any introspection over what they are trying to accomplish.

Perfectly cogent and reasonable, and I agree with this thesis. Unfortunately, I posted an ungracious criticism of the article. I took Chris to task for taking testing down without suggesting anything concrete. Do you see the irony? I criticized his blog post without suggesting a concrete improvement on it.

Well, time to apologize and make up for my foolishness. Chris, I was wrong, I apologize. And here is a taste of my own medicine, some advice about testing.

### a good testing practice

Here is a testing rule of thumb: **If some piece of functionality in your code ought to be documented, write tests for that piece first.**

Now you may not get around to writing all the developer documentation that you'd like. I appreciate that. Or maybe you will be documenting it. This heuristic still applies. Here's my thinking:

First, some code is so wonderfully written or obvious that it doesn't really need comments.

Great! Testing the "obvious" code is lower priority. It's easier to read, probably has fewer bugs, and the next developer working with it ought to be able to bang out tests for it if you don't get around to finishing those tests yourself.

But some code could use a few guide posts along the way. Perhaps you needed to optimize for performance over obviousness. You drop in a comment explaining that a particular method is memoized for performance.

Now write a test verifying that the memoization works properly. This code is higher risk. There's a chance someone won't understand what it is doing. Or make assumptions about the method returning different things when called more than once. Or break it by accident.

The test helps you document the memoization, albeit in a place removed from the code itself.[^grouch] The test will also catch those breakages down the road. Any code can break, but some code is more likely to break than others. My anecdotal experience[^anecdote] is that code that needs a little help explaining is more likely to break and/or harder to fix for the person who didn't write it.

[^grouch]: If you can get a code browser that will show you the tests for a method next to the code for a method, start using it.

[^anecdote]: "The plural of anecdote is not data." The singular, even less so.

Of course, there are various kinds of comments. A test explains what the code is expected to do. If you are artful, the test can give heavy hints as to how it does it. I don't know how to write a test that explains *why* the code was written this way. So test aren't really a substitute for documentation. And I don't try to make them do that job.

I just think of the need for documentation as a "risk smell," and a hint that tests for that bit of code are going to be more valuable than tests for code that is "obvious."

### exeunt

And that's it: If a piece of code "ought" to have some comment or developer documentation, tests for that code are higher priority than tests for self-explanatory code. Write them first.

I can't tell you that you should *always* follow this pattern, but what I do say is that it is a kind of "default" for me. Meaning, if I don't have a good reason to do otherwise, I try to follow this rule.

---

([discuss](https://news.ycombinator.com/item?id=5557621))

notes: