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

function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

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

verify(kleenePlus(Aa, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

const regMaybeReginald = catenation(
  just('reg'),
  optional(just('inald'))
);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

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

const numberButNotBinary = complementation('1234567890', binary);

verify(complementation('1234567890', binary), {
  '': true,
  '0': false,
  '1': false,
  '01': true,
  '10': false,
  '2': true,
  'two': false
});// 11-decorators.js

verify(kleeneStar(Aa, {
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

verify(kleenePlus(Aa, {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

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

const numberButNotBinary = complementation('1234567890', binary);

verify(complementation('1234567890', binary), {
  '': true,
  '0': false,
  '1': false,
  '01': true,
  '10': false,
  '2': true,
  'two': false
});