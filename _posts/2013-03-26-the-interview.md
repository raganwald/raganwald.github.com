---
layout: default
tags: [ruby]
---

It had been a long and gruelling process, but the ThinkWare team had whittled the virtual stack of resumes down to Bob and Carol.

"Bob was great," said Alice, "The interview got off to a great start when I fizzbuzzed him with Fibonacci. He asked whether I wanted an Enumerator or iterative function. When I suggested he try something recursive, he had no trouble whatsoever." 

Ted was equally enthusiastic about Carol. "Super solid on algorithms, she brought up [raganwald's matrix implementation](http://raganwald.com/2008/12/12/fibonacci.html) and we had a good laugh about how you could beat the pants off it with a caching solution. She wrote one and it worked just fine with the 10,000th, 100,000th, and 1,000,000th numbers."

![The Fibonacci Spiral](/assets/images/fib.gif)

### scott

The team talked for a while longer before deciding to ask for enough budget to hire both Bob and Carol. Later, at BEvERage-O'Clock, someone asked about Scott."Who else interviewed Scott? He was a handful!" The team chuckled, the story had been going around the office for a week.

"A difficult case?"

"That's putting it mildly," said [Williams](http://raganwald.com/2011/11/01/williams-master-of-the-comefrom.html), the grizzled veteran who had handled Scott's first meeting of the day. "When I asked him to write Fibonacci for me, he refused, saying that this was no way to interview someone."

"I tried to explain that we value craftsmanship, and that this was as good an opportunity as any to discuss the many different considerations when writing software (not to mention validate that someone can actually write software), but I think he flipped the bozo bit on me, he acted like I was a blithering idiot for thinking there was anything to discuss with respect to Fibonacci."

"What did you do?" Wondered the team. Williams was a sweet guy, but he had a martial arts background and some strong opinions about interpersonal respect.

"Oh, I said that if it was obvious, maybe he could tell me what the only true solution might be. He told me that there was a closed form solution and I would fail an interview with him if I didn't know that and submit it."

"After some cajoling, he wrote this for me:"

```ruby
def closed_fib(n)
  a = Math.sqrt(5)
  return ((1/a)*(((1+a)/2)**n)).round()
end

(0..100).each do | i |
  puts closed_fib(i)
end

#=> 0
#   1
#   1
#   2
#   3
#   ...
#   135301852344707186688
#   218922995834555891712
#   354224848179263111168
```

"He wrote it quickly, and that was impressive, but I got nowhere trying to quiz him about its limitations. For example, I asked him if we were calculating the 1,000,000th Fibonacci number how we could be sure that Ruby's built-in `**` operator wouldn't take a naïve approach with big integers?"

"I also asked him how we could be sure that `Math.sqrt(5)` would have the necessary precision for the 100,000th number, and how he would calculate the necessary precision, but he looked at me like he was Samuel L. Jackson and I was asking 'what' too many times."

"I gave him one last chance, I said that I'd asked the previous candidate to give me the 10,000th, 100,000th, and 1,000,000th Fibonacci numbers, and perhaps if his algorithm had some limitations we could discuss some alternatives?"

"But he let me know that he did not suffer fools gladly, and hadn't I heard him twice the first time that this was the correct implementation? In response, I simply typed this into `irb`:"

```ruby
closed_fib(10000)
#=> FloatDomainError: Infinity
#   	from (irb):38:in `truncate'
#   	from (irb):38:in `closed_fib'
#   	from (irb):44
#   	from /Users/williams/.rvm/rubies/ruby-1.9.3-p327/bin/irb:16:in `<main>'
```

"After he left, I emailed his resume to StinkWare, our competition. They deserve each other."

The team had a good laugh about that.

### the moral of the story

Even the most "obvious" programs have hidden limitations or considerations, and what makes programming such as fascinating (and maddening!) discipline is the need to take nothing for granted and to be flexible about the notion that there is always more than one way to do it.

In this case (Ruby 1.9.3), the closed-form solution is excellent up to somewhere between n = 1,000 and n = 10,000, and then the imprecisions and trade-offs inherent in number representations and library math routines come into play.

An integer-only solution doesn't suffer from these limitations in Ruby, although the performance of an iterative solution would be crippling. So like anything, keep an open mind about the strengths and weaknesses of any approach, no matter how "obvious" things may seem.