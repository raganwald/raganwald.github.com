---
title: Zee Hackenbush Bird (Hidden Specs)
layout: default
tags: [coffeescript, surrealnumbers, hide-specs]
categories: enchanted-forest
---

Previous: [A Surreal Encounter With a Winged Elephant](./horton.html)

---

Moses led Maude to a sandy riverbank, where a number of birds had congregated. Maude watched for a few moments, and she saw that all along the riverbank, birds were arrayed, each with a small territory. Each bird had collected river pebbles of various colours and had them arranged in rows or pits.

Other birds would flutter along from one territory to another, examining the arrangements of stones. They would sometimes engage each other in conversation, and in some places they would rearrange the stones in concert with the bird stationed there in some kind of elaborate ritual.

### the bowerbirds and their pebbles

"Each of these birds," explained Moses, "Makes a bower out of pebbles. Prospective mates inspect the bowers looking for signs of intelligence. A few bowerbirds find it sufficient to make elaborate patterns of pebbles and sand, the Mandelbrot Bird[^Mandelbrot] is a spectacular example of this type. But on this riverbank, the birds specialize in patterns of pebbles that can be rearranged in specific patterns.

[^Mandelbrot]: [Benoit Mandelbrot](https://en.wikipedia.org/wiki/Benoit_Mandelbrot) (1924 − 2010)

"To fully appreciate the bower's ingenious owner, the inspecting bird will interact with the stones. If they are intrigued or excited by what they discover, they favour the owner with their, um, admiration."

Maude was intrigued by the birds and had a look at a few that were close by. Each bird had laid out several rows of pits in the sand, and most of the pits contained pebbles. The birds were taking turns scooping pebbles out of pits and distributing them to other pits. "What is going on with these?" she asked.

<a href="http://www.flickr.com/photos/laempel/5969810490/" title="Sanfrauen beim Mancala by leo.laempel, on Flickr"><img src="http://farm7.staticflickr.com/6149/5969810490_cb25e6f6fa_z.jpg" width="480" height="640" alt="Sanfrauen beim Mancala"></a>

"Ah," said Moses. "These are bowerbirds from the Mancala or Oware family.[^mancala] As you can see, their bowers consist of rows of pits."

[^mancala]: [Manacala](https://en.wikipedia.org/wiki/Mancala) and [Oware](https://en.wikipedia.org/wiki/Oware)

### game birds

"An essential part of their ritual bower behaviour is that each bird chooses a pit, picks up the pebbles it it, and then distributes them to other pits is a prescribed fashion, typically one at a time, clockwise. The birds alternate distributing stones in this fashion."

"At some point, the ritual reaches an end and the birds evaluate the result, declaring either the host or visiting bird the *winner*. The important thing to note about these games is that the host bird devises a series of rules proscribing the allowed actions, the birds alternate actions, and that every ritual ends with one or the other winning. No randomness or hidden information is involved."

"Hmm," said Maude, "it sounds like you’re describing *games*. We play games in my village."

"Yes," said Moses, "These are games, although 'game' is a word used very broadly to describe everything from fighting over a twig to use for nesting to highly formal rituals like these."

"Mancala Birds are what we call *game birds*, but they aren’t the only ones. See these other birds over there? They play their games by moving and removing coloured pebbles from grids. One of them, the Sensei Bird, has an amazing bower featuring a 19 by 19 lattice and some kind of nesting territory game."

Maude considered. "You said that I’d learn something about the significance of Horton’s proper flocks here. It sounds like I’m going to learn about his work with pebbles on grids of cells."

Moses cawed loudly. "No, no, despite the resemblance, Horton’s work with grids is not a game in this sense at all. Let us walk a little further down the beach to talk to my friend Zee Hackenbush Bird. He is one of the oldest and most respected of the game birds."

"In fact, his bower is so advanced that it is no longer a game. He has a bower that models other games, and his interest is in analyzing games rather than playing them."

Moses led Maude down the riverbank to a shaded area where a single bird was stepping back and forth between twelve or thirteen bowers arranged in a semicircle. At each bower, a cluster of young birds were chattering and discussing what was laid out before them.

"That," whispered Moses reverentially, "is Zee Hackenbush Bird."

### zee hackenbush bird

What Maude saw was an awkward bird with broad, black tail and breast feathers that looked a little like an old-fashioned man's frock coat. Its head was balding and a bushy fringe of feathers adorned the top of its beak. One long, brown, stiff wattle protruded like a cigar protrudes from a smoker's mouth. Its gait was low and long, as if it stooped rather than stepped.

Moses drew Maude forward and introduced her to him. Surprisingly, Zee Hackenbush Bird was friendly and given to joking. "Call me Hugo," he said, and batted his eyes at her rogueishly. She found him funny and charming.

"Hugo," she asked, "Moses tells me that you can explain the significance of Horton's flocks. They seem like an idle circus distraction, a complicated way to do things that are otherwise very simple, like arithmetic."

Zee Hackenbush Bird waggled his eyebrows. "Of course," he said, "Horton and I work on the exact same underlying principles, but he has a way of describing the implications that is novel, but unpersuasive."

"I find that the important thing is to focus on what new ideas a discovery makes easy, rather than what old ideas a discovery replicates. You said you are familiar with Horton’s flocking birds?"

Maude nodded, and Zee Hackenbush bird led them over to one of his bowers.

"This," and here he waved his wing over several rows of black and white pebbles, "Is a game I have modestly named *Hackenstrings*. It is a good introduction for someone as intelligent and curious as you are."

Zee Hackenbush Bird opened his beak and delivered what must have been a very familiar lecture, for he sang it in a squeaky voice while strutting and dancing back and forth.[^walker]

[^walker]: See [Hackenstrings, and the 0.999... ?= 1 FAQ](http://web.archive.org/web/20070120052054/http://www.maths.nott.ac.uk/personal/anw/Research/Hack/) by A.N. Walker, School of Mathematical Sciences, University of Nottingham

## Hackenstrings

Hackenstrings is a simple game. We take as the "board" one or more rows of pebbles, and each pebble is either black or white. We have two players, one of whom is designated as Black, the other as White.

These two colours are arbitrary, and we could just as easily use any two ways of designating pebbles and players, provided we can always identify which pebbles "belong" to which player.

We always assume that White plays first, but this is not material.

A "move" consists of choosing any stone of the player’s colour, and removing that stone along with all others to its right in the same row regardless of colour. For example, given:

&#8594;&#9679;&#9679;&#9679;&#9679;  
&#8594;&#9675;&#9675;&#9675;  

If it was White’s turn, White could choose to remove the third white stone on the fourth row, which also removes the fourth, producing:

&#8594;&#9679;&#9679;  
&#8594;&#9675;&#9675;&#9675;  

Black would then be able to select any of the three stones on the second row. The game ends when one player has no legal move on their turn. That player loses.

This very simple game is subject to easy analysis. You can probably work it out intuitively: White can always win simply by taking a single stone from the right of the first row. We can make it slightly more complex:

&#8594;&#9679;  
&#8594;&#9675;&#9675;&#9675;  
&#8594;&#9679;&#9679;&#9679;  

Or even:

&#8594;&#9679;&#9679;&#9679;&#9679;  
&#8594;&#9675;&#9675;&#9675;  
&#8594;&#9675;&#9675;  
&#8594;&#9679;&#9679;&#9679;  

White still has a winning strategy: Take a single stone from the right of any row.

Provided the game consists of one or more rows, where each row consist only of pebbles of the same colour, if one player has more pebbles than the other, that player always has a winning strategy.

### evaluating a game

This business of "having a winning strategy" is important, so much so that we'll formalize it. Every game can be given a *value*. We'll formalize the value by assigning it a number. What number? Let's start with the simplest possible game:

    
    
This is the game where there are no pebbles. If White plays first, White loses with best play. We give this game a zero. We can add pebbles to the game and end up with the same outcome: White loses if White plays first. As long as we add an equal number of white and black pebbles, and as long as each row only contains pebbles of one colour, if there are an equal number of pebbles, the game evaluates to zero.

What happens if one player has more pebbles than the other? Let's consider the case where White has one pebble and Black has none:

&#8594;&#9679;

If it's White's turn to play, White takes the pebble and the game becomes transformed into the game above where it is Black's turn to play. We know this to be a win for White. If it's Black's turn to play, Black loses immediately.

So adding one pebble for White turns this from a game where White loses if it's White's turn to play into a game where White always wins. This is better than zero, so let's call this game one. If we add another pebble for White, we can call it two, another white pebble makes it three, and so on.

What if we add pebbles for Black? This game:

&#8594;&#9675;

Is a win for Black whether it is White's turn to play or not. That's worse than zero, so we call it negative one. Additional stones for Black make it negative two, negative three, and so on.

Now if we add stones for both White and Black but refrain from mixing stones of two different colours on the same line, we end up with games like this:

&#8594;&#9679;  
&#8594;&#9675;&#9675;&#9675;  
&#8594;&#9679;&#9679;&#9679;  

Intuitively, the best strategy for each player is to remove a single stone on their turn. Since they alternate taking stones, you can reduce any such game by removing an equal number of stones of each colour, leaving zero or more stones of a single colour.

Or more succinctly, every game of this type can be evaluated by counting +1 for each white stone and -1 for each black stone.

### maude's simple evaluator

Maude started with the following notes:

    {isArray, every, reduce, isEmpty} = require 'underscore'

    white = {}
    black = {}

    class SimpleHackenstringGame
      invert = (colour) ->
        if colour is white
          black
        else if colour is black
          white
      stoneValue = (colour) ->
        if colour is white
          1
        else if colour is black
          -1
      validRow = (row) ->
        isArray(row) and every(row, (stone) -> stone is white or stone is black)
      constructor: (@rows) ->
        throw 'invalid' unless isArray(@rows) and every(@rows, validRow)
      evaluation: ->
        reduce @rows,
          (acc, row) ->
              startColour = row[0]
              firstOther = row.indexOf(invert(startColour))
              if row.length is 0
                acc
              else if firstOther < 1
                row.length * stoneValue(startColour) + acc
              else
                throw "TODO: Implement Me"
          , 0

Then she checked her work:

    describe "SimpleHackenstringGame", ->
    
      noRows = new SimpleHackenstringGame([])
      oneEmptyRow = new SimpleHackenstringGame([[]])
      twoEmptyRows = new SimpleHackenstringGame([[]])
    
      describe "construction", ->

        it "shouldn't throw an error for no rows or empty rows", ->
          expect( -> noRows ).not.toThrow()
          expect( -> oneEmptyRow ).not.toThrow()
          expect( -> twoEmptyRows ).not.toThrow()

        it "shouldn't throw an error for rows with stones", ->
          expect( -> new SimpleHackenstringGame([[white]]) ).not.toThrow()
          expect( -> new SimpleHackenstringGame([[white, white]]) ).not.toThrow()
          expect( -> new SimpleHackenstringGame([[black]]) ).not.toThrow()
          expect( -> new SimpleHackenstringGame([[white, black]]) ).not.toThrow()

        it "should throw an error for a row with a non-stone", ->
          expect( -> new SimpleHackenstringGame([[{}]]) ).toThrow()

      describe "evaluation", ->

        it "should be zero for empty games", ->
          expect( noRows.evaluation() ).toEqual(0)
          expect( twoEmptyRows.evaluation() ).toEqual(0)
        
        it "shoudl be zero for equal games", ->
          expect( new SimpleHackenstringGame([[white], [black]]).evaluation() ).toEqual(0)
          
        it "should be positive for games where white has more stones", ->
          whiteWins = new SimpleHackenstringGame [
            [white]
            [black, black, black]
            [white, white, white, white]
          ]
          expect( whiteWins.evaluation() ).toEqual 2
          
Zee Hackenbush continued his lecture on Hackenstrings:

### mixed rows

The rules of the game permit a row to have both white and black stones in any order. Let's start with the simplest and second simplest games we've seen. This is the simplest:

&#8594;

White loses when playing first and wins when playing second. That's worse than:

&#8594;&#9679;

Where White always wins, but better than:

&#8594;&#9675;

Where White always loses whether going first or second. These games evaluate to `0`, `+1`, and `-1` respectively.

Let's add a stone to the same row on the last game:

&#8594;&#9675;&#9679;

This is a win for Black no matter what, but consider the fact that it's a little "asymmetrical:" If White plays first, the game is transformed into:

&#8594;&#9675;

And Black wins as above. But if Black plays first, the game is transformed into:

&#8594;

And White doesn't get a move. Thus, the game is clearly worse than zero, but not quite as bad as 

&#8594;&#9675;

Where White never gets to move. What is better than `-1` but worse than `0`? Let's guess `-1/2`. And if that is the case, then this game:

&#8594;&#9679;&#9675;

Is going to be a win for White no matter what, and thus better than `0` but not as good as:

&#8594;&#9679;

Which is a win for White without Black getting a move. We'll call that game `+1/2` since it lies between `0` and `+1`.

If we apply this reasoning to more complex mixed rows, we arrive at a surprisingly simple evaluation for each row. First, we evaluate and remove the first stone and all stones of the same colour. So given:

&#8594;&#9679;&#9675;  
&#8594;&#9675;&#9675;

We take the first row as `+1` and the second row as `-2` for a total of `-1` and are left with:

&#8594;&#9675;  
&#8594;

Now we remove the first stone from each row and assign it a value of `+1/2` or `-1/2` respectively. In this case, we have one black stone so we get `-1/2`. We add that to our existing `-1` and end up with `-1 1/2`.

If there are any stones remaining (there weren't in this example), we remove and assign them values of `+1/4` or `-1/4`. If there are still stones remaining, we remove and assign them values of `+1/8` or `-1/8`. This continues until there are no stones remaining.

This seems very arbitrary, but if you play the games out, you see that the stones that are leftmost on a row are the most important because they cannot be removed by the other player, and the further a stone is to the right of those stones, the less significance it has to the outcome of a game.

### maude works with dyadic fractions

Maude began by making some notes about dyadic fractions. A dyadic fraction is a fraction where the denominator is a natural power of two.[^dyadic]

    {applyLeft} = require('allong.es')
    twoToPowerOf = applyLeft(Math.pow, 2)

    class Dyadic
      constructor: (@a, @b) ->
        [@a, @b] = [@a / 2, @b - 1] until (@a % 2 or @b is 0)
      toString: ->
        denominator = twoToPowerOf(@b)
        if denominator is 1
          "" + @a
        else if @a > denominator
          [units, a] = [Math.floor(@a / denominator), @a % denominator]
          "#{units} #{a}/#{denominator}"
        else
          "#{@a}/#{denominator}"
      plus: (that) ->
        b = Math.max(this.b, that.b)
        a1 = this.a * twoToPowerOf(b - this.b)
        a2 = that.a * twoToPowerOf(b - that.b)
        new Dyadic(a1 + a2, b)

Then she checked her work:
        
    describe "dyadic", ->
    
      it "should have readable output", ->
        expect( new Dyadic(5, 0).toString() ).toEqual '5'
        expect( new Dyadic(5, 1).toString() ).toEqual '2 1/2'
        expect( new Dyadic(5, 2).toString() ).toEqual '1 1/4'
        expect( new Dyadic(5, 3).toString() ).toEqual '5/8'
        
      it "should handle overflow", ->
        expect( new Dyadic(10, 3).toString() ).toEqual '1 1/4'
        
      it "should handle plus", ->
        expect( new Dyadic(5, 3).plus(new Dyadic(5, 3)).toString() ).toEqual '1 1/4'
        
With dyadic fractions under her belt, she was able to extend her understanding of evaluating Hackenstring games with rows of mixed pebbles:

    {isArray, every, reduce, isEmpty} = require 'underscore'

    white = {}
    black = {}
    zero = new Dyadic(0, 0)

    class MixedHackenstringGame
      invert = (colour) ->
        if colour is white
          black
        else if colour is black
          white
      stoneValue = (colour) ->
        if colour is white
          1
        else if colour is black
          -1
      validRow = (row) ->
        isArray(row) and every(row, (stone) -> stone is white or stone is black)
      constructor: (@rows) ->
        throw 'invalid' unless isArray(@rows) and every(@rows, validRow)
      evaluation: ->
        reduce @rows,
          (acc, row) ->
              startColour = row[0]
              if row.length is 0
                acc
              else
                firstOther = row.indexOf(invert(startColour))
                if firstOther is -1
                  acc.plus(new Dyadic(row.length * stoneValue(startColour), 0))
                else
                  acc = acc.plus (new Dyadic(firstOther * stoneValue(startColour), 0))
                  row.slice(firstOther).forEach (stone, index) ->
                    acc = acc.plus (new Dyadic(stoneValue(stone), index + 1))
                  acc
          , zero

Then she checked her work:
    
    describe "MixedHackenstringGame", ->
    
      noRows = new MixedHackenstringGame([])
      oneEmptyRow = new MixedHackenstringGame([[]])
      twoEmptyRows = new MixedHackenstringGame([[]])
    
      describe "regression-free evaluation", ->

        it "should be zero for empty games", ->
          expect( noRows.evaluation().toString() ).toEqual '0'
          expect( twoEmptyRows.evaluation().toString() ).toEqual '0'
        
        it "should be zero for equal games", ->
          wb = new MixedHackenstringGame([[white], [black]])
          expect( wb.evaluation().toString() ).toEqual '0'
          
        it "should be positive for games where white has more stones", ->
          whiteWins = new MixedHackenstringGame [
            [white]
            [black, black, black]
            [white, white, white, white]
          ]
          expect( whiteWins.evaluation().toString() ).toEqual '2'
          
      describe "with mixed stones", ->
      
        it "should be -1/2 for b-w", ->
          bw = new MixedHackenstringGame([ [black, white] ])
          expect( bw.evaluation().toString() ).toEqual '-1/2'

Maude played around with a few more examples, then challenged Zee Hackenbush Bird.

### the challenge

"This is all very interesting," said Maude, "And I think I see where you are going with Hackenstrings. I wouldn't have grasped it without some context, but knowing that you're using Hackenstrings to explain Horton's flocks, I'm guessing that a HackenString game is another way of expressing the numbers that proper flocks can express."

"And they seem easier to work with than flocks with their birds that know sets of birds they outrank or are outranked by. Nevertheless, I fail to see what Hackenstring games make--as you put it--easy that oridinary arithmatic cannot handle."

Zee Hackenbush Bird waggled his eyebrows and stalked back and forth theatrically. "You have grasped the essential points. We could carry on to discuss arithmetic in Hackenstrings. Compared to the system arboreal primates use, it has several advantages. As my old professor The Walker Bird has said, the concept of addition is natural, consisting merely of laying out adjacent rows; negation, and hence subtraction, is natural, consisting of swapping the ownership of each pebble."

"But I think the most exciting thing that Hackenstrings make easy require us to take a little leave of our senses."

And with that, he opened his discussion of *Irrational Hackenstrings*.

---

Coming Soon: **Hyperreal Hackenstrings, from the Infinite to the Infinitesimal**

---

notes:

[^dyadic]: [Dyadic fractions or dyadic reals](https://en.wikipedia.org/wiki/Dyadic_fraction)