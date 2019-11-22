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

const optional =
  recognizer => union(EMPTY, recognizer);

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