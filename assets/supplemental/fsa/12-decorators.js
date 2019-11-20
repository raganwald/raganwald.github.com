function kleeneStar (description) {
  const newStart = "empty";
  const { start: oldStart, transitions, accepting: oldAccepting } =
        avoidReservedNames([newStart], description);

  const looped = {
    start: newStart,
    transitions:
    	transitions.concat(
          oldAccepting.map(
            state => ({ from: state, to: newStart })
          )
        ).concat([
          { "from": newStart, "to": oldStart }
        ]),
    accepting: oldAccepting.concat([newStart])
  };

  return reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          looped
        )
      )
    )
  );
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