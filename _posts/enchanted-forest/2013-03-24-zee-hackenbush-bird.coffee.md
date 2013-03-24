---
title: Zee Hackenbush Bird
layout: default
tags: [coffeescript, surrealnumbers, hide-code]
categories: enchanted-forest
permalink: /enchanted-forest/hackenbush.html
---

Previous: [A Surreal Encounter With a Winged Elephant](./horton.html)

**WARNING: THIS ESSAY IS A WORK IN PROGRESS**

---

Moses led Maude to a sandy riverbank, where a number of birds had congregated. Maude watched for a few moments, and she saw that all along the riverbank, birds were arrayed, each with a small territory. Each bird had collected river pebbles of various colours and had them arranged in rows or pits.

Other birds would flutter along from one territory to another, examining the arrangements of stones. They would sometimes engage each other in conversation, and in some places they would rearrange the stones in concert with the bird stationed there in some kind of elaborate ritual.

### the bowers

"Each of these birds," explained Moses, "Makes a bower out of pebbles. Prospective mates inspect the bowers looking for signs of intelligence. A few bowerbirds find it sufficient to make elaborate patterns of pebbles and sand, the Mandelbrot Bird[^Mandelbrot] is a spectacular example of this type. But on this riverbank, the birds specialize in patterns of pebbles that can be rearranged in specific patterns.

[^Mandelbrot]: [Benoit Mandelbrot](https://en.wikipedia.org/wiki/Benoit_Mandelbrot) (1924 − 2010)

"To fully appreciate the bower's ingenious owner, the inspecting bird will interact withe the stones. If they are intrigued or excited by what they discover, they favour the owner with their, um, admiration."

Maude was intrigued by the birds and had a look at a few that were close by. Each bird had laid out several rows of pits in the sand, and most of the pits contained pebbles. The birds were taking turns scooping pebbles out of pits and distributing them to other pits. "What is going on with these?" she asked.

<a href="http://www.flickr.com/photos/laempel/5969810490/" title="Sanfrauen beim Mancala by leo.laempel, on Flickr"><img src="http://farm7.staticflickr.com/6149/5969810490_cb25e6f6fa_z.jpg" width="480" height="640" alt="Sanfrauen beim Mancala"></a>

"Ah," said Moses. "These are bowerbirds from the Mancala or Warri famly. As you can see, their bowers consist of rows of pits."

### game birds

"An essential part of their ritual bower behaviour is that each bird chooses a pit, picks up the pebbles it it, and then distributes them to other pits is a proscribed fashion, typically one at a time, clockwise. The birds alternate distributing stones in this fashion."

"At some point, the ritual reaches an end and the birds evaluate the result, declaring either the host or visiting bird the *winner*. The important thing to note about these games is that the host bird devises a series of rules proscribing the allowed actions, the birds alternate actions, and that every ritual ends with one or the other winning. No randomness or hidden information is involved."

"Hmm," said Maude, "it sounds like you’re describing *games*. We play games in my village."

"Yes," said Moses, "These are games, although 'game' is a word used very broadly to describe everything from fighting over a twig to use for nesting to highly formal rituals like these."

"Mancala Birds are what we call *game birds*, but they aren’t the only ones. See these other birds over there? They play their games by moving and removing coloured pebbles from grids. One of them, the Sensei Bird, has an amazing bower featuring a 19 by 19 lattice and some kind of nesting territory game."

Maude considered. "You said that I’d learn something about the significance of Horton’s proper flocks here. It sounds like I’m going to learn about his work with pebbles on grids of cells."

Moses cawed loudly. "No, no, despite the resemblance, Horton’s work with grids is not a game in this sense at all. Let us walk a little further down the beach to talk to my friend Zee Hackenbush Bird. He is one of the oldest and most respected of the game birds."

"In fact, his bower is so advanced that it is no longer a game. He has a bower that models other games, and his interest is in analyzing games rather than playing them. Here we are!"

### zee hackenbush bird

Moses led Maude down the riverbank to a shaded area where a single bird was stepping back and forth between twelve or thirteen bowers arranged in a semicircle. At each bower, a cluster of young birds were chattering and discussing what was laid out before them.

"That," whispered Moses reverentially, "is Zee Hackenbush Bird."

What Maude saw was an awkward bird with broad, black tail and breast feathers that looked a little like an old-fashioned man's frock coat. It's head was balding and a bushy fringe of feathers adorned the top of its beak. One long, brown, stiff wattle protruded like a cigar protrudes from a smoker's mouth. It's gait was low and long, as if it stooped rather than stepped.

Moses drew Maude forward and introduced her to him. Surprisingly, Zee Hackenbush Bird was friendly and given to joking. "Call me Hugo," he said, and batted his eyes at her rogueishly. She found him funny and charming.

"Hugo," she asked, "Moses tells me that you can explain the significance of Horton's flocks. They seem like an idle circus distraction, a complicated way to do things that are otherwise very simple, like arithmetic."

Zee Hackenbush Bird waggled his eyebrows. "Of course," he said, "Horton and I work on the exact same underlying principles, but he has a way of describing the implications that is novel, but unpersuasve."

"I find that the important thing is to focus on what new ideas a discovery makes easy, rather than what old ideas a discovery replicates. You said you are familiar with Horton’s flocking birds?"

Maude nodded, and Zee Hackenbush bird led them over to one of his bowers.

"This," and here he waved his wing over several rows of black and white pebbles, "is a game I have modestly named Hackenstrings. It is a good introduction for someone as intelligent and curious as you are."

Zee Hackenbush Bird opened his beak and delivered what must have been a very familiar lecture, for he sang it in a squeaky voice while strutting and dancing back and forth.

## Hackenstrings

Hackenstrings is a simple game. We take as the "board" one or more rows of pebbles, and each pebble is either black or white. We have two players, one of whom is designated as Black, the other as White.

These two colours are arbitrary, and we could just as easily use any two ways of designating pebbles and players, provided we can always identify which pebbles "belong" to which player.

We always assume that White plays first, but this is not material.

A "move" consists of choosing any stone of the player’s colour, and removing that stone along with all others to its right in the same row regardless of colour. For example, given:

&#9679;&#9679;&#9679;&#9679;  
&#9675;&#9675;&#9675;  

If it was White’s turn, White could choose to remove the third white stone on the fourth row, which also removes the fourth, producing:

&#9679;&#9679; 
&#9675;&#9675;&#9675;  

Black would then be able to select any of the three stones on the second row. The game ends when one player has no legal move. That player loses.

This very simple game is subject to easy analysis. You can probably work it out intuitively, but just to be thorough, let's consider all of the possibilities.

* White has four possible moves on the first turn.
* Black always has three possible moves on the second turn.

There are, therefore, twelve possible situations after White and Blck have taken their firs