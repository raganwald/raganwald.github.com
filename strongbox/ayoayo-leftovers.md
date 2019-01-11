

---

[![Stones](/assets/images/ayoayo/stones.jpg)](https://www.flickr.com/photos/sjdunphy/1311812466)


---

### how to determine the winner

If the game is over, the winner is the player who has captured the most stones. Having grown up with basic arithmetic, our first impulse is perhaps to compare the magnitude of each player's captured stones, or perhaps to perform a subtraction and determine whether the result is negative, zero, or positive.

But as noted earlier, one of the charms of Ayoayo is its simplicity. Toddlers who cannot do sums can--and are--taught to play the game and determine a winner. And the way they do it has some deep implications that can take the curious reader far, infinitely far.

Let's imagine we do not know how to count the stones in the sense of converting a pile of stones into a number. And if we did, we wouldn't know how to compare two numbers. (This is consistent with our code above, we use numbers from `0` to `11` to represent pits, and we sometimes compare numbers to `5` to determine which side of the board a pit is on, but those things are conveniences for the computer's representation.)

The actual steps we've performed so can all be performed by someone who knows nothing more than whether a collection of stones is empty or not, and how to remove stones from the hand one at a time.

Given this knowledge, a winner can be determined by having both players pick up their captured stones, then simultaneously remove one stone from their hand at a time. If one player still has stones in their hand when the other runs out, the player with stones has won. If both players run out simultaneously, the game is a tie.

That's simple, and exactly how [Georg Cantor] set about proving that the set of real numbers is more numerous than the set of natural numbers. Here it is, a function that returns the set of all players who won the game:[^zoolander]

[Georg Cantor]: https://en.wikipedia.org/wiki/Georg_Cantor

[^zoolander]: They use *this exact method* to determine whether the number of visitors to Derek Zoolander's Center For Kids Who Can't Read Good is less than the maximum allowed by fire regulations.

```javascript
function whoWonForPeopleWhoCantCountGood (score) {
  return (function oneAtATime (zero, one) {
    if (zero === 0 && one === 0) {
      return [];
    } else if (zero === 0) {
      return [1];
    } else if (one === 0) {
      return [0];
    } else {
      return oneAtATime(zero - 1, one - 1);
    }
  })(score[0], score[1]);
}
```

I was taught a variation on this simple procedure, one that is easier for small children to carry out as it does not rely on simultaneously doing anything. But at it's core, it's the same algorithm.

---

![We have a winner!](/assets/images/ayoayo/winner.jpg)

*The player owning the bottom rows has filled their pits, with five stones left over. The player owning the top row has fallen five stones short. We have a winner, and we're almost ready to start the revenge match.*

---

Let's imagine we're learning to play. We'll start by learning the number _four_. That's easy, almost all of us have four fingers and hopefully four limbs. You can teach someone what four stones are, by saying, "put your fingers on the table/ground, and place a stone next to each one. That's four."

We now take our captured stones, four at a time, and attempt to fill the pits on our side of the board:

- If we fall short, we have lost.
- If we fill our pits exactly, the game is a tie.
- If we have stones left over, we have won.

When both players do this simultaneously, they are determining the winner, _and_ setting the board up for the next game. How elegant! We won't implement that today, but it should be fairly obvious that we can use techniques like the one we used for `whoWonForPeopleWhoCantCountGood` combined with techniques we used for recursively acting on the pits in a player's row to get to the same outcome.

Instead, let's gather ourselves, and look at what all of our functions have in common.