---
layout: default
tags: [coffeescript, surrealnumbers, hide-code]
categories: enchanted-forest
permalink: /enchanted-forest/counting-crows.html
---

Previous: [A Surreal Encounter with a Winged Elephant](./horton.html)

---

### natural numbers

Maude had suddenly realized that a proper flock of birds could model the whole numbers, including the plus or "addition" function. She recapitulated what she knew:

1. Each bird on the branch represented a number
2. Presuming they were added in the manner Horton proscribed, each bird represented a number one larger than the number represented by the bird to its left.
3. The `P` or `Plus` operation modelled addition.
4. Since any bird plus Mayzie was equal to itself, Mayzie must represent zero.

She collected her notes and added some new numbers:

    {any, map} = require('underscore')

    class FlockingBird
    
      constructor: ({@knownOutrankedBy, @knownToOutrank} = {}) ->
        @knownOutrankedBy or= []
        @knownToOutrank   or= []
        
      standsAgainst: (rival) ->
        courtingBird = this
        case1 = any @knownOutrankedBy, (gb) -> rival.standsAgainst(gb)
        case2 = any rival.knownToOutrank, (lb) -> lb.standsAgainst(courtingBird)
        (not case1) and (not case2)

      confused: ->
        case1a = any @knownToOutrank, (lb) -> lb.confused()
        case1b = any @knownOutrankedBy, (gb) -> gb.confused()
        case2  = any @knownToOutrank, (lb) =>
          any @knownOutrankedBy, (gb) ->
            lb.standsAgainst(gb)
        !!(case1a or case1b or case2)
        
      isOfEqualRankTo: (otherBird) ->
        case1 = @standsAgainst(otherBird)
        case2 = otherBird.standsAgainst(this)
        case3 = not @confused() and not otherBird.confused()
        case1 and case2 and case3
    
      outranks: (otherBird) ->
        case1 = @standsAgainst(otherBird)
        case2 = not @isOfEqualRankTo(otherBird)
        case1 and case2

    plus = (B1, B2) ->
      PL1B2s = map B1.knownToOutrank,  (L1) -> plus(L1, B2)
      PL2B1s = map B2.knownToOutrank,  (L2) -> plus(L2, B1)
      PG1B2s = map B1.knownOutrankedBy, (G1) -> plus(G1, B2)
      PG2B1s = map B2.knownOutrankedBy, (G2) -> plus(G2, B1)
      new FlockingBird
        knownToOutrank:   PL1B2s.concat(PL2B1s)
        knownOutrankedBy: PG1B2s.concat(PG2B1s)

    Zero = new FlockingBird()
    One = new FlockingBird
      knownToOutrank: [Zero]
    Two = new FlockingBird
      knownToOutrank: [One]
    Three = new FlockingBird
      knownToOutrank: [Two]
    # ...

But she had a question. "Horton," she asked, "You said that Mayzie is sitting in the middle of the branch. Presuming that Mayzie is zero, what birds would sit to her left?"

Horton bounced the question back to Maude: "What numbers are less than zero?"

### negative numbers

Maude quickly answered, "Negative numbers," and then pursed her lips in thought. Up to that moment, all new "numbers" had been constructed by adding a new bird that knew it outranked the bird to its left. Which meant that:

1. Every bird knew the bird to its left.
2. No bird knew the bird to its right.

There was no way to add a bird to the left of Mayzie using this scheme, since she didn't know any birds she outranked. What to do? Maude realized that if she changed the scheme and altered Mayzie to accommodate a new bird to Mayzie's left, she would just be changing Mayzie from a "zero" to a "one." She had to leave Mayzie unaltered.

So what could she do with the new bird to Mayzie's left? It couldn't know a bird to its left, she would have to construct an infinite chain of birds to make that work. Th enew bird to Mayzie's left could only know a bird to its *right*, i.e. Mayzie.

Maude decided to try this. There was some logic to this, it would be symmetrical to the positive numbers. Now the number to Mayzie's left would be outranked by Mayzie, only Mayzie wouldn't know it. So Maude wrote:

    NegativeOne = new FlockingBird
      knownOutrankedBy: [Zero]
      
And if this held, by extension:

    NegativeTwo = new FlockingBird
      knownOutrankedBy: [NegativeOne]
    NegativeThree = new FlockingBird
      knownOutrankedBy: [NegativeTwo]

And so forth. She then decided to check her work:

    describe "negative one plus zero", ->
      
      it "should equal negative one", ->
      
        expect( plus(NegativeOne, Zero).isOfEqualRankTo NegativeOne ).toEqual true
        expect( plus(Zero, NegativeOne).isOfEqualRankTo NegativeOne ).toEqual true

    describe "negative one plus negative one", ->
      
      it "should equal negative one", ->
      
        expect( plus(NegativeOne, NegativeOne).isOfEqualRankTo NegativeTwo ).toEqual true

    describe "negative one plus positive one", ->
      
      it "should equal negative one", ->
      
        expect( plus(NegativeOne, One).isOfEqualRankTo Zero ).toEqual true
        expect( plus(One, NegativeOne).isOfEqualRankTo Zero ).toEqual true
        
### negativity

Horton collected some grasses in his trunk and conveyed them to his mouth. After chewing on them thoughtfully, he asked Maude a question:

"You are a very bright student, this should be easy for you. Now that you understand the ranking of birds in a proper flock and you understand about birds on a branch to the left of Mayzie, you should be able to work out how birds handle *disgrace and redemption*, or what I call a *turnabout*.

"From time to time, a bird will commit some sin in the flock or perhaps"

