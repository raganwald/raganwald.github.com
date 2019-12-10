// 11-decorators.js

function kleeneStar (description) {
  const newStart = "empty";

  const {
    start: oldStart,
    transitions: oldTransitions,
    accepting: oldAccepting
  } = avoidReservedNames([newStart], description);

  const optionalBefore = {
    start: newStart,
    transitions:
      [ { "from": newStart, "to": oldStart } ].concat(oldTransitions),
    accepting: oldAccepting.concat([newStart])
  };

  const optional = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          optionalBefore
        )
      )
    )
  );

  const {
    start: optionalStart,
    transitions: optionalTransitions,
    accepting: optionalAccepting
  } = optional;

  const loopedBefore = {
    start: optionalStart,
    transitions:
      optionalTransitions.concat(
        optionalAccepting.map(
          state => ({ from: state, to: optionalStart })
        )
      ),
    accepting: optionalAccepting
  };

  const looped = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          loopedBefore
        )
      )
    )
  );

  return looped;
}

// ----------

const Aa = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "A", "to": "Aa" },
    { "from": "empty", "consume": "a", "to": "Aa" }
  ],
  "accepting": ["Aa"]
};

verify(kleeneStar(Aa), {
  '': true,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});
