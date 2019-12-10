

---

### complementation

We are going to write a very simple decorator that provides the _complementation_ or a recognizer.

What is the complementation of a recognizer? Recall `negation`:

```javascript
const negation =
  fn =>
    (...args) => !fn(...args);
```

`negation` takes a function as an argument, and returns a function that returns the negation of the argument's result. `complementation` does the same thing for recognizers.

What do recognizers do? They recognize sentences that belong to a language. Consider some recognizer `x` that recognizes whether a sentence belongs to some language `X`. The complementation of `x` would be a recognizer that recognizes sentences that do _not_ belong to `X`.

We'll start our work by considering this: Our recognizers fail to recognize a sentence if, when the input ends, they are not in an accepting state. There are two ways this could be true:

1. If the recognizer is in a state that is not an accepting state, or;
2. If the recognizer has halted.

Let's eliminate the second possibility.

Given a recognizer that halts for some input, can we make it never halt? The answer in theory is **no**, because there are an infinite number of symbols that might be passed to a recognizer, and there is no way for our recognizers to encode an infinite number of transitions, one for each possible symbol.

But in practice, we can say that given a recognizer `x`, and some alphabet `A`, we can return a version of `x` that never halts, _provided that every symbol in the input belongs to `A`_.

Our method is simply to create a state for `halted`, and make sure that every state the recognizer has--including the new `halted` state--has transitions to `halted` for any symbols belonging to `A`, but not already consumed.

For example, given the recognizer for binary numbers:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

Let's consider its behaviour when its input consists solely of symbols in the alphabet of numerals, `1234567890`. When the input it empty, it does not halt, it is in the `start` state. If the first symbol it reads is a `0` or `1`, it transitions to `zero` and `notZero` respectively. But if the input is one of `23456789`, it halts.

So the first thing to do is create a `halted` state and add transitions to that state from `start`:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    notZero --> notZero : 0, 1
    zero --> [*]
    notZero --> [*]
</div>

Next, we turn our attention to state `zero`. When the recognizer is in this state, any numeral will cause it to halt, so we add transitions for that:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    zero --> [*]
    notZero --> [*]
</div>

If the recognizer is in state `notZero`, only the numerals `23456789` it to halt, so we add transitions for those:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    notZero-->halted : 2,3,4,5,6,7,8,9
    zero --> [*]
    notZero --> [*]
</div>

And finally, when the recognizer is in the new state `halted`, any numeral causes it to remain in the state halted, so we add transitions for those:

<div class="mermaid">
  stateDiagram
    [*] --> start
    start --> zero : 0
    start --> notZero : 1
    start-->halted : 2,3,4,5,6,7,8,9
    zero-->halted : 1,2,3,4,5,6,7,8,9,0
    notZero --> notZero : 0, 1
    notZero-->halted : 2,3,4,5,6,7,8,9
    halted-->halted : 1,2,3,4,5,6,7,8,9,0
    zero --> [*]
    notZero --> [*]
</div>

The final result is "Unorthodox, but effective," as Williams would say.

Using this methods, here's a decorator that turns a description of a recognizer, into a description of a recognizer that never halts given a sentence in its alphabet:

```javascript
function nonhalting (alphabet, description) {
  const descriptionWithoutHaltedState = avoidReservedNames(["halted"], description);

  const {
    states,
    stateMap,
    start,
    transitions,
    accepting
  } = validatedAndProcessed(descriptionWithoutHaltedState);

  const alphabetList = [...alphabet];
  const statesWithHalted = states.concat(["halted"])

  const toHalted =
    statesWithHalted.flatMap(
      state => {
        const consumes =
          (stateMap.get(state) || [])
      		  .map(({ consume }) => consume);
        const consumesSet = new Set(consumes);
        const haltsWhenConsumes =
          alphabetList.filter(a => !consumesSet.has(a));

        return haltsWhenConsumes.map(
          consume => ({ "from": state, consume, "to": "halted" })
        );
      }
    );

  return reachableFromStart({
    start,
    transitions: transitions.concat(toHalted),
    accepting
  });
}
```

The result is correct, if considerably larger:

```javascript
const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
}

nonhalting('1234567890', binary);
  //=>
    {
      "start": "start",
      "transitions": [
        { "from": "start", "to": "zero", "consume": "0" },
        { "from": "start", "to": "notZero", "consume": "1" },
        { "from": "notZero", "to": "notZero", "consume": "0" },
        { "from": "notZero", "to": "notZero", "consume": "1" },
        { "from": "start", "consume": "2", "to": "halted" },
        { "from": "start", "consume": "3", "to": "halted" },
        { "from": "start", "consume": "4", "to": "halted" },
        { "from": "start", "consume": "5", "to": "halted" },
        { "from": "start", "consume": "6", "to": "halted" },
        { "from": "start", "consume": "7", "to": "halted" },
        { "from": "start", "consume": "8", "to": "halted" },
        { "from": "start", "consume": "9", "to": "halted" },
        { "from": "zero", "consume": "1", "to": "halted" },
        { "from": "zero", "consume": "2", "to": "halted" },
        { "from": "zero", "consume": "3", "to": "halted" },
        { "from": "zero", "consume": "4", "to": "halted" },
        { "from": "zero", "consume": "5", "to": "halted" },
        { "from": "zero", "consume": "6", "to": "halted" },
        { "from": "zero", "consume": "7", "to": "halted" },
        { "from": "zero", "consume": "8", "to": "halted" },
        { "from": "zero", "consume": "9", "to": "halted" },
        { "from": "zero", "consume": "0", "to": "halted" },
        { "from": "notZero", "consume": "2", "to": "halted" },
        { "from": "notZero", "consume": "3", "to": "halted" },
        { "from": "notZero", "consume": "4", "to": "halted" },
        { "from": "notZero", "consume": "5", "to": "halted" },
        { "from": "notZero", "consume": "6", "to": "halted" },
        { "from": "notZero", "consume": "7", "to": "halted" },
        { "from": "notZero", "consume": "8", "to": "halted" },
        { "from": "notZero", "consume": "9", "to": "halted" },
        { "from": "halted", "consume": "1", "to": "halted" },
        { "from": "halted", "consume": "2", "to": "halted" },
        { "from": "halted", "consume": "3", "to": "halted" },
        { "from": "halted", "consume": "4", "to": "halted" },
        { "from": "halted", "consume": "5", "to": "halted" },
        { "from": "halted", "consume": "6", "to": "halted" },
        { "from": "halted", "consume": "7", "to": "halted" },
        { "from": "halted", "consume": "8", "to": "halted" },
        { "from": "halted", "consume": "9", "to": "halted" },
        { "from": "halted", "consume": "0", "to": "halted" }
      ],
      "accepting": [ "zero", "notZero" ]
    }
```

Let's verify that it still recognizes the same "language:"

```javascript
verify(nonhalting('1234567890', binary), {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});
  //=> All 16 tests passing
```

Now given a recognizer that never halts, what is the `complementation` of that recognizer? Well, given that it is always going to be in one of its states when the input stops, if it is a state that is not one of the original recognizer's accepting states, then it must have failed to recognize the sentence.

This points very clearly to how to implement `complementation`:

```javascript
function complementation (alphabet, description) {
  const nonhaltingDescription = nonhalting(alphabet, description);

  const {
    states,
    start,
    transitions,
    acceptingSet
  } = validatedAndProcessed(nonhaltingDescription);

  const accepting = states.filter(state => !acceptingSet.has(state));

  return { start, transitions, accepting }
}

verify(complementation('1234567890', binary), {
  '': true,
  '0': false,
  '1': false,
  '01': true,
  '10': false,
  '2': true,
  'two': false
});
```

Note that we do not have a perfect or "ideal" `complementation`, we have "complementation over the alphabet `1234567890`." You can see, for example, that it fails to recognize `'two'`, because letters are not part of its alphabet.

