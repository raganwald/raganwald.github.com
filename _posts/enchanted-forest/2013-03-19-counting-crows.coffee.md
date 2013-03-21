---
layout: default
tags: [coffeescript, surrealnumbers, hide-code]
categories: enchanted-forest
permalink: /enchanted-forest/counting-crows.html
published: false
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
    Four = new FlockingBird
      knownToOutrank: [Three]
    Five = new FlockingBird
      knownToOutrank: [Four]
    Six = new FlockingBird
      knownToOutrank: [Five]
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
        
### döpplegangers

"Hmmm," Maude mused, "Given a bird, how do we find the bird representing its negative?"

Horton looked at her. "Well, I do know a way to find what I call the döppleganger of any bird in a flock. For example, the döppleganger of the bird immediately to Mayzie's left is the bird immediately to Mayzie's right, and so forth."

After some discussion that we will omit, Maude understood that given some bird `B`, its  döppleganger could be identified as being the bird that:

1. Is outranked by the döpplegangers of every bird `B` is known to outrank.
2. Outranks the döpplegangers of every bird known to outrank `B`.

She made the following notes:

    FlockingBird::doppleganger = -> new FlockingBird
      knownOutrankedBy: map @knownToOutrank, (its) -> its.doppleganger()
      knownToOutrank: map @knownOutrankedBy, (its) -> its.doppleganger()
      
    describe "One's döppleganger", ->
    
      it "should be of equal rank as NegativeOne", ->
        
        expect( One.doppleganger().isOfEqualRankTo(NegativeOne) ).toEqual true
      
    describe "NegativeOne's döppleganger", ->
    
      it "should be of equal rank as One", ->
        
        expect( NegativeOne.doppleganger().isOfEqualRankTo(One) ).toEqual true
      
    describe "Three's döppleganger", ->
    
      it "should be of equal rank as NegativeThree", ->
        
        expect( Three.doppleganger().isOfEqualRankTo(NegativeThree) ).toEqual true
      
    describe "NegativeThree's döppleganger", ->
    
      it "should be of equal rank as Three", ->
        
        expect( NegativeThree.doppleganger().isOfEqualRankTo(Three) ).toEqual true
      

### squabbling birds

Maude wasn't surprised to hear that sometimes, instead of pairing up to work together, one bird would squabble with another another, following it around and undermining its rank. Unlike a pair, the effective rank of the two birds was equivalent to the rank of the squabbling bird subtracted from the bird it was harassing.

Made had no difficulty working out the implications given what she already knew about pairings and döpplegangers:

    subtract = (bird, squabbler) -> plus(bird, squabbler.doppleganger())
    
    expect( subtract(Three, One).isOfEqualRankTo(Two) ).toEqual true
    
    expect( subtract(Zero, NegativeOne).isOfEqualRankTo(One) ).toEqual true

### nesting birds

"Speaking of pairs," Horton said, "I have discovered something interesting. When two birds mate and nest, they select and defend a territory. You might think that the size of their territory would be commensurate with the rank of the two birds as a pair, but this is not so. So strong is their instinct to protect their nest that when eggs or chicks are in the nest, their rank is equivalent to the *product* of their ranks, not the sum."

Maude started to think in her mind how one might repeatedly sum the ranks of the birds to arrive at the proper result, but Horton was furiously drawing strange characters in the sand.

    # xy = { (XLy + xYL - XLYL) ∪ (XRy + xYR - XRYR) | (XLy + xYR - XLYR) ∪ (XRy + xYL - XRYL) }
    
    multiply = (x, y) ->
      [XLYL, XLYR, XRYL, XRYR] = [[], [], [], []]
    
      for XL in x.knownToOutrank
        do ->
          XLy = multiply(XL, y)
          for YL in y.knownToOutrank
            do ->
              xYL = multiply(x, YL)
              XLYL.push plus(plus(XLy, xYL), multiply(XL, YL).doppleganger())
          for YR in y.knownOutrankedBy
            do ->
              xYR = multiply(x, YR)
              XLYR.push plus(plus(XLy, xYR), multiply(XL, YR).doppleganger())
        
      for XR in x.knownOutrankedBy
        do ->
          XRy = multiply(XR, y)
          for YL in y.knownToOutrank
            do ->
              xYL = multiply(x, YL)
              XRYL.push plus(plus(XRy, xYL), multiply(XR, YL).doppleganger())
          for YR in y.knownOutrankedBy
            do ->
              xYR = multiply(x, YR)
              XRYR.push plus(plus(XRy, xYR), multiply(XR, YR).doppleganger())
              

    
      new FlockingBird 
        knownToOutrank: XLYL.concat(XRYR)
        knownOutrankedBy: XLYR.concat(XRYL)
      
      
    describe "multiplication by zero", ->
    
      it "should turn any number into zero", ->
        expect( multiply(Zero, Zero).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(Zero, One).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(One, Zero).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(Zero, Two).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(Two, Zero).isOfEqualRankTo(Zero) ).toEqual true
        
        expect( multiply(Zero, Zero).isOfEqualRankTo(One) ).toEqual false
        expect( multiply(Zero, One).isOfEqualRankTo(Two) ).toEqual false
        expect( multiply(One, Zero).isOfEqualRankTo(Three) ).toEqual false
        expect( multiply(Zero, Two).isOfEqualRankTo(Two) ).toEqual false
        expect( multiply(Two, Zero).isOfEqualRankTo(One) ).toEqual false
      
    describe "multiplication by one", ->
    
      it "should turn any number into itself", ->
        expect( multiply(Zero, One).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(One, Zero).isOfEqualRankTo(Zero) ).toEqual true
        expect( multiply(One, One).isOfEqualRankTo(One) ).toEqual true
        expect( multiply(One, Two).isOfEqualRankTo(Two) ).toEqual true
        expect( multiply(Two, One).isOfEqualRankTo(Two) ).toEqual true
        
        expect( multiply(Zero, One).isOfEqualRankTo(One) ).toEqual false
        expect( multiply(One, Zero).isOfEqualRankTo(Two) ).toEqual false
        expect( multiply(One, One).isOfEqualRankTo(Zero) ).toEqual false
        expect( multiply(One, Two).isOfEqualRankTo(Three) ).toEqual false
        expect( multiply(Two, One).isOfEqualRankTo(One) ).toEqual false
      
    describe "multiplication by two", ->
    
      it "should double any number", ->
        expect( multiply(Two, Two).isOfEqualRankTo(Four) ).toEqual true
        expect( multiply(Two, Three).isOfEqualRankTo(Six) ).toEqual true
        expect( multiply(Three, Two).isOfEqualRankTo(Six) ).toEqual true