---
title: "Maximally Pessimum Dyck Word Validation"
tags: [recursion,allonge]
---

Alice and Bobbie were comparing notes after interviewing interns for an upcoming work term with their company, HipCo. Their interview process, although often maligned on social media, worked reasonably well for their purposes: They spent an hour with each candidate, devoting twenty minutes to introductions and some basic behavioural questions, about half an hour to a basic programming problem, and the remaining ten minutes or so was turned over to the candidate to ask them questions.

They quickly went over all of the the candidates but one. Alice held that back for the end of their meeting.

"And then there was Sharleen," said Alice. "Sharleen has decent marks, is in third year, and raised no red flags in the behavioural questions." Bobbie waited, expecting a revelation with respect to the programming problem, and was not dissapointed.

"I asked our usual question, determining whether a string of brackets was a valid [Dyck Word], that is, a word in the Dyck language."

[Dyck Word]: https://en.wikipedia.org/wiki/Dyck_language

> In the theory of formal languages of computer science, mathematics, and linguistics, a Dyck word is a balanced string of square brackets [ and ]. The set of Dyck words forms Dyck language.

> Dyck words and language are named after the mathematician [Walther von Dyck]. They have applications in the parsing of expressions that must have a correctly nested sequence of brackets, such as arithmetic or algebraic expressions.

[Walther von Dyck]: https://en.wikipedia.org/wiki/Walther_von_Dyck

"Sharleen did write working code to determine whether a string was a valid Dyck Word. But it was unlike any solution I've ever seen before. She obviously didn't memorize any of the solutions we find on those hack-the-job-interview web sites. Here's what she presented to handle the simple case of only one type of parenthesis..."

---

![Meaning of the word Dyck](/assets/images/dyck.png)

---

### determining whether a string is a valid dyck word

Here is Sharleen's first solution:

```javascript
function isDyckWord (before) {
  if (before === '') return true;

  const after = before.replace('[]','');

  return (before !== after) && isDyckWord(after);
}
```

Having shared the solution with Bobbie, Alice continued.

"I was, I admit, suprised. Normally the first cut has some kind of stack, and then we ask abut optimizing to an integer. I asked about performance, and she cheerfully admitted that the solution was nearly maximally pessimum, with n-squared run time as the algorithm scans the string on every call to `isDyckWord`. But she pointed out that the solution is insanely simple, and she favours simplicity first, optimization second."

"She was ridiculously complacent about this, so I poked at another problem. What, I asked her, would this do on when presented with a worst-case string, say one that consisted of 100,000 `[`s followed by 100,000 `]`s? Was she not concerned with the possibility of a stack overflow?"

"Sharleen thought for a moment, then said that it depended very much upon the level of optimization in the JavaScript engine. A sufficiently smart just-in-time compiler would recognize that the call to `isDyckWord(after)` was effectively in tail position, and then use Tail Call Optimization to convert this recursive function into a loop."

"But if it didn't, Sharleen presented a trivial change:"

```javascript
function isDyckWord (before) {
  if (before === '') return true;

  const after = before.replace('()','');

  if (before === after) {
    return false;
  } else {
    return isDyckWord(after);
  }
}
```

"JavaScript's specification calls for Tail-Call Optimization, she explained, and thus this recursive function would be executed as a loop and not take up stack space proportional to the depth of the deepest nesting. I wondered aloud about space, and she was ready for my question: She explained that because this duplicated the string at each pass, it consumed space proportional to the size of the input, regardless of the depth of nesting."

"I pulled out the question of handling multiple types of parenetheses. Using the conventional solution of tracking the last seen opening parenthesis on a stack, we can convert the stack to a count when there is only one kind of parenthesis. But if we introduce additional types, e.g. `[](){}`, the stack must be used, and the solution requires space proportional to the deepest nesting."

"I asked if she could create a solution for multiple parentheses, and if so, what space would it require? With a few keystrokes, Sharleen added the two new types of parentheses:"

```javascript
function isExtendedDyckLanguageWord (before) {
  if (before === '') return true;

  const after = before.replace('()','').replace('[]','').replace('{}','');

  if (before === after) {
    return false;
  } else {
    return isExtendedDyckLanguageWord(after);
  }
}
```

"I could see at once that this solution was likewise in tail call form and would require space proportional to the size of the input, as before."

Bobbie was amazed at this idiosyncratic solution. "Well," Bobbie said at last, "at least you weren't discussing [deterministic vs. non-deterministic pattern matching and its relationship to pushdown automata][Pattern Matching and Recursion]."

[Pattern Matching and Recursion]: http://raganwald.com/2018/10/17/recursive-pattern-matching.html

"No," Alice admitted, "the opposite. This solution was remarkably simple, even if it is the least performant thing I've ever seen. Sharleen had an outrageous amount of confidence to present this in an interview and cheerfully admit to its shortcomings."

"So?" Asked Bobbie, "Did you press her to write a faster solution?"

"No," Alice replied, "By this time I was sure that she was trolling me, and I'll be damned if I was going to let her whip out a fast solution. So instead, I asked her to _prove_ that her solution worked. It's one thing to memorize some code, another to be able to reason about it, at least informally."

"Ooooooh," nodded Bobbie, "Good call. And what did she say?"

"Well..." answered Alice, "Bobbie, how would you argue that this solution works?"

---

And now, dear reader, let me ask **you** the same question: Does Sharleen's solution work? If so, how would you reason that it must work?
