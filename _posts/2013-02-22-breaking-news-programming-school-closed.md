---
title: Hilbert's School Closed for Discriminatory Practices
layout: default
tags: javascript
---

Much has been made of the lack of diversity in the technology field. While there are many causes for it and not all of the factors represent intentional or even systemic discrimination, there are from time to time disturbing incidents that make me despair. One such has just been revealed to me, and I am proud to be the one with the scoop.

You read here about [Hilbert's Grand JavaScript School][hgjs]. After a stunningly successful first week offering its revolutionary *Learn javaScript in Five Days* course, authorities in Thailand have closed it for failing to offer seating on a fair and equitable basis.

[hgjs]: http://raganwald.com/2013/02/21/hilberts-school.html

Operator Dr. Hilbert "Bertie" David protested that he accepted an infinite number of students and was able to accommodate an additional one million, infinity, infinity times infinity, and infinity cubed students on successive days, so clearly his school was incapable of denying education to anyone.

Prosecuting Justice the Honourable Georgina "Can't-Be-Deterred" Orr disputed his claims and allowed reporters to interview what appeared to be an infinite number of women, people of colour, older programmers, and programmers who failed to meet minimal hipster standards who were denied seats using Dr. David's methods.

### the case for the prosecution

"The entire thing is a fraud," Ms Orr proclaimed, "It is an illusion of equal access masking the same old tired privilege and discrimination. We will show in court that Dr. David pretended to provide access to all but secretly blocked entire classes of applicants by assigning them student IDs that would never be assigned to seats, not even given an infinite amount of time to operate his [algorithms][hgjs]."

"And this was not just some smattering of minorities being denied. We will show that the number of candidates being denied was not only larger than the infinite number of candidates seated in his course, it was larger than can be counted using any method prior to certain techniques developed for this investigation and prosecution."

A reporter asked for an example, and Ms Orr was ready with charts and diagrams to explain.

"Although he covered up his fraudulent behaviour with JavaScript Mumbo-Jumbo, all of his seat assignments boiled down to putting the students he accepted into a one-to-one correspondence with the numbers on his seats. His defence rests on the proposition that given an infinite number of students, there is always a method of putting them into a one-to-one correspondence with the natural numbers, and thus he is accommodating all students regardless of background.."

"We will prove that to the contrary, his plan did *not* accommodate all students, and worse, that only a small minority of students were assigned seats while an extremely large number, much larger than his so-called infinity, were left without access to education."

![Infinity](/assets/images/infinity.png)

### exhibit one

"Exhibit one in our prosecution are the Bus Mechanics."

"As you know, on Day Four, Reddit hired an infinite number of buses, each of which held an infinite number of Redditors. The buses came from Zero To Infinity Bus Lines. This is a union shop, and we spoke with Mike, the Shop Steward. He told us that the Maintenance Workers have negotiated a strict schedule with management. Each worker works on a different bus every day, and no two workers work the buses in the same order. In fact, there's one worker for every possible schedule of buses, that's a contractual requirement."

"After preparing the buses for the Reddit Trip, the Mike and the Mechanics attempted to attend the JavaScript School and were unable to be seated. Dr. David claims he is able to accommodate everyone, but in fact he only has room for a very small fraction of the people seeking education and he discriminates against disadvantaged groups like Mike and the Mechanics."

### the defence

"In his defence, he will claim he seated them all somewhere in his auditorium. If that is true, we can number the seats they occupied from zero up, something like this:"

    M.0 - Some mechanic
    M.1 - Another mechanic
    M.2 - A third mechanic
    M.3 - The fourth mechanic
    
    ...
    
    M.infinity

"It doesn't matter how he chose to seat them or where, if they are all in his auditorium occupying seats that have numbers on them, we can order them and assign them numbers of our own from zero. He claims that every mechanic can be seated. We will prove this is impossible."

### the crucial evidence

We will call to the stand a mechanic turned away. We will select this mechanic as follows. Every mechanic has a unique schedule of buses. Here's one possible arrangement:

    M.0 - Bus 0, Bus 1, Bus 42, Bus 6, Bus 97, ..., 19
    M.1 - Bus 0, Bus 1, Bus 42, Bus 6, Bus 95, ..., 1337
    M.2 - Bus 42, Bus 6, Bus 3, Bus 9, Bus 11, ..., 1000000
    M.3 - Bus 5, Bus 4, Bus 2, Bus 10, Bus 99, ..., 12
    
    ...
    
    M.infinity - Bus 2, Bus 3, Bus 5, Bus 7, Bus 11, ..., 42
    
We call the number of the seat *m*, and B(*m*, *n*) is the number of the bus that mechanic *m* worked on after working on *n* previous buses. So B(3, 2) will be 2, B(0, 2) will be 42, and B(2, 4) will be 11.
    
We will call to the stand a Mechanic who has not been seated. We can find such a mechanic according to the following rules:

1. The mechanic must not have worked on Bus 0 first
2. The mechanic must not have worked on Bus 1 second
3. The mechanic must not have worked on Bus 3 third
4. The mechanic must not have worked on Bus 42 last

Let's say that Z(*n*) is the bus that our witness worked on after *n* previous buses. Our rule is that Z(*n*) shall not be equal to B(*n*, *n*). There are, after all, and infinite number of buses that fit the bill. Essentially, we move *diagonally* along our mechanics, selecting a bus that doesn't match. So one such witness might be:

  Z: Bus 1, Bus 2, Bus 4, Bus 3, ..., Bus 99
  
Where is our witness seated in the auditorium? Not in the first position, nor the second, nor the third, and so on, because in each position we have an infinite number of buses to choose from, and we can always find a bus that doesn't match that position or any of the buses previously selected for this witness.

In fact, there are an *infinite number of such witnesses!* And furthermore, we assert that the number of mechanics not seated is much, much larger than the number of people in Dr. David's so-called infinite auditorium.

### the prosecution rests

Georgina Orr's fist crashed on the table. "We will demonstrate all this and much more, proving the Dr. David is a fraud and that he discriminates freely. If he knows what's good for him, he will recognize that his policies have *real consequences* and will sign a consent order promising to refrain from describing his school as having infinite capacity and furthermore will find an equitable method of giving his limited seats to prospective students."