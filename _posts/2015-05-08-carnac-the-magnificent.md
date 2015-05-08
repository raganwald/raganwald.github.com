---
layout: default
title: "Carnac the Magnificent"
---

Programmers love to discuss interviewing programmers. And hate to discuss it. Interviewing touches the very heart of human social interaction: It's a process for picking "winners" and "losers," for determining who's "in" and who's "out."

Today I'd like to discuss an anti-pattern, **Carnac the Magnificent**.

> Carnac the Magnificent was a recurring comedic role played by Johnny Carson on The Tonight Show Starring Johnny Carson. One of Carson's most well known characters, Carnac was a "mystic from the East" who could psychically "divine" unknown answers to unseen questions.--[wikipedia](https://en.wikipedia.org/wiki/Carnac_the_Magnificent)

The "Carnac the Magnificent" anti-pattern is setting up a situation where the only way to pass is to guess what the interviewer is looking for. Here's an example from a blog post that is currently causing a lot of tongues to wag:

> Write a program that outputs all possibilities to put `+` or `-` or nothing between the numbers `1`, `2`, ..., `9` (in this order) such that the result is always `100`. For example: `1 + 2 + 34 – 5 + 67 – 8 + 9 = 100`.

According to [TFA], this question is a "filter," designed to separate those who have no hope of being a programmer from those who have the basic qualifications to write software for a living.

[TFA]: http://www.urbandictionary.com/define.php?term=TFA

### the problem with the problem

So what is the problem? Well, the problem is that **there are too many ways to solve the problem**.

For starters, you can generate all of the possible strings (e.g. `123456789`, `12345678-9`, `12345678+9`, `1234567-89`, `1234567-8-9`, `1234567-8+9`, `1234567+89`, `1234567+8-9`, `1234567+8+9`, ...), then use `eval` to compute the answer, and select those that evaluate to `100`.

Or you could do the same thing, but avoid `eval` and bake in a little of your own computation. Because `eval` is know to be "bad."

And of course, this brute force executes fewer than 10,000 iterations, and runs faster than you can blink on contemporary hardware. But you're applying for a job where you're supposed to know about "scale" and "speed," so you could optimize things and not do obviously wasted computations. Nothing that starts with `12345` can ever add up to `100`, for example. Aren't programmers supposed to know this?

And should you solve this recursively or iteratively? One is fast, the other reveals the underlying mathematical symmetry of the problem.

### no hire!

There are a bunch of ways forward (many more than these four considerations, in fact).

And you can easily imagine a sadistic interviewer failing a candidate for getting the correct answer the wrong way. If you use `eval`, you're a bozo. And if you write your way around `eval`, you're a "theorist" who doesn't know when to use the right tool for the job. If you don't optimize, you don't value scale. And if you do optimize, you're wasting time that could be better used for another part of the interview.

And if you solve it without recursion, you don't grasp elegance. And if you do solve it with recursion, sorry, but we use JavaScript here, Lisp jobs are down the hall.

So maybe what you should do is ask the interviewer about the hidden requirements. Optimize for speed above all else? Write tests or not? Is shorter code better? Should the code be factored neatly and all repetition DRY'd out?

That seems reasonable, diving requirements is part of a developer's job. And some interviewers will rate you highly for that. But others will consider it wasting time when all they wanted as a working answer, any answer, you are obviously tedious and slow and can't GetShitDone™.

The bottom line is, there is no right thing to do given a problem where the interviewer does not make it very, very clear what they want. The only person who can get this right is Carnac the Magnificent, a mystic from the east who can read minds and the contents of sealed envelopes.

### stress

Now let's be honest: If the interviewer and the interviewee are on the same page, this doesn't seem bad. But the fact is, the interviewee will be stressed 100% of the time. And that is not good for the interviewee or for the interviewing process.

There is good stress and bad stress, and uncertainty about what the interviewer wants is bad stress. You aren't testing whether the candidate can solve hard problems, you're testing whether the candidate can write code just before an all-hands where the CEO will announce layoffs.

### the right way forward

If all you want is working code, say so, preferably in writing so that all candidates get the same information:

> Write a program that outputs all possibilities to put `+` or `-` or nothing between the numbers `1`, `2`, ..., `9` (in this order) such that the result is always `100`. For example: `1 + 2 + 34 – 5 + 67 – 8 + 9 = 100`. Use any technique you want, the only thing that matters is getting the correct answer.

Or be up front that you want production-ish code:

> Write a program that outputs all possibilities to put `+` or `-` or nothing between the numbers `1`, `2`, ..., `9` (in this order) such that the result is always `100`. For example: `1 + 2 + 34 – 5 + 67 – 8 + 9 = 100`. Although this is a toy problem, solve it using the kind of code you're use in a production code base.

Or encourage the candidate to ask questions:

> Write a program that outputs all possibilities to put `+` or `-` or nothing between the numbers `1`, `2`, ..., `9` (in this order) such that the result is always `100`. For example: `1 + 2 + 34 – 5 + 67 – 8 + 9 = 100`. Feel free to ask questions if you need clarification on what is required.

### simple, right?

That's simple, right? So why do people do this to interviewers? My theory is *They don't know they are asking a Carnac the Magnificent problem*. Interviewers often have a huge blind spot about how it feels to be on the other side of the table.

Perhaps they were hired with this exact same question, they wrote out an answer without asking any questions, they were hired, what's the problem? Or they asked a few questions, they weren't failed for wasting time, why do some candidates charge ahead without asking questions?

You need to have experience with interviews and experience working with a variety of programmers to appreciate how a "simple" technical question might actually have hidden pitfalls. Sometimes that's a pitfall in itself! Imagine a 22 year-old extremely smart programmer interviewing a 52 year-old veteran. Why is the veteran thinking so hard about this problem? Their brain must have fossilized. NO HIRE.

<iframe width="420" height="315" src="https://www.youtube.com/embed/76wzA2A2T1Q" frameborder="0" allowfullscreen></iframe><br/>

### tl;dr

It's so easy to get good results from questions like this: Be clear about what you want from the candidate. And let me be brutally frank:

**Part of the job of being a software developer is to understand the ways in which things that appear simple—like code, user experiences, security protocols, and almost everything else we touch—are not actually simple**. And it is our job to either make them simple, or make it very clear that they aren't that simple and document the way in which they aren't simple.

If you're interviewing candidates, it's your responsibility to figure out that the interviewing process, including the questions you ask, isn't as simple as it appears, and then to **make it simple**. Ask hard questions, fine, but don't make the process hard.

So if you are interviewing programmers, here's your homework: Go through all of your interview questions, whether technical or otherwise, and ask yourself if there are any hidden assumptions about what you expect. Then ask yourself if your process would be even better if you made those implicit requirements explicit.

I think you'll find that eliminating Carnac the Magnificent from your interviewing process will make it better.

(discuss on [reddit](http://www.reddit.com/r/programming/comments/35afm0/carnac_the_magnificent/))

---

*post scriptum*:

> Maybe the central problem in software is that not enough devs are old enough to remember Carnac.—[Eric Sink](https://twitter.com/eric_sink/status/596671692367372289)