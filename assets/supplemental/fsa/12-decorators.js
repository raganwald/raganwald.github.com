const optional =
  recognizer => union(EMPTY, recognizer);

function kleenePlus (description) {
  const { start, transitions, accepting } = avoidReservedNames(['empty'], description);

  const looped = {
    start: "empty",
    transitions:
    	transitions.concat(
          accepting.map(
            state => ({ from: state, to: start })
          )
        ).concat([
          { "from": "empty", "to": start }
        ]),
    accepting
  };

  return mergeEquivalentStates(
    powerset(
      removeEpsilonTransitions(
        looped
      )
    )
  );
}

function kleeneStar (description) {
  return optional(kleenePlus(description));
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