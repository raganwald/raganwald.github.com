// 07-powerset-and-catenation.js

function isDeterministic (description) {
  const { stateMap } = validatedAndProcessed(description, true);

  const transitionsGroupedByFromState = [...stateMap.values()];

  const consumptions =
    transitionsGroupedByFromState
      .map(
        transitions => transitions.map( ({ consume }) => consume )
      );

  return consumptions.every(
    consumes => consumes.length === new Set(consumes).size
  );
}

function parenthesizedStates (description) {
  const { states } = validatedAndProcessed(description, true);

  // produces a map from each state's name to the name in parentheses,
  // e.g. 'empty' => '(empty)'
  const parenthesizeMap =
    states
      .reduce(
        (acc, s) => (acc.set(s, `(${s})`), acc),
        new Map()
      );

  // rename all the states
  return renameStates(parenthesizeMap, description);
}

function powerset (description) {
  // optional, but it avoids a lot of excess (())
  if (isDeterministic(description)) {
    return description;
  }

  const renamedDescription = parenthesizedStates(description);

  const {
    start: nfaStart,
    acceptingSet: nfaAcceptingSet,
    stateMap: nfaStateMap
  } = validatedAndProcessed(renamedDescription, true);

  // the final set of accepting states
  const dfaAcceptingSet = new Set();

  // R is the work "remaining" to be analyzed
  // organized as a map from a name to a set of states.
  // initialized with a map from the start state's
  // name to a degenerate set containing only the start state
  const R = new Map([
    [nfaStart, new Set([nfaStart])]
  ]);

  // T is a collection of states already analyzed
  // it is a map from the state name to the transitions
  // from that state
  const T = new Map();

  while (R.size > 0) {
    const [[stateName, stateSet]] = R.entries();
    R.delete(stateName);

    // get the aggregate transitions across all states
    // in the set
    const aggregateTransitions =
      [...stateSet].flatMap(s => nfaStateMap.get(s) || []);

    // a map from a symbol consumed to the set of
    // destination states
    const symbolToStates =
      aggregateTransitions
        .reduce(
          (acc, { consume, to }) => {
            const toStates = acc.has(consume) ? acc.get(consume) : new Set();

            toStates.add(to);
            acc.set(consume, toStates);
            return acc;
          },
          new Map()
        );

    const dfaTransitions = [];

  	for (const [consume, toStates] of symbolToStates.entries()) {
      const toStatesName = [...toStates].sort().join('');

      dfaTransitions.push({ from: stateName, consume, to: toStatesName });

      const hasBeenDone = T.has(toStatesName);
      const isInRemainingQueue = R.has(toStatesName)

      if (!hasBeenDone && !isInRemainingQueue) {
        R.set(toStatesName, toStates);
      }
    }

    T.set(stateName, dfaTransitions);

    const anyStateIsAccepting =
      [...stateSet].some(s => nfaAcceptingSet.has(s));

    if (anyStateIsAccepting) {
      dfaAcceptingSet.add(stateName);
    }

  }

  return {
    start: nfaStart,
    accepting: [...dfaAcceptingSet],
    transitions:
      [...T.values()]
        .flatMap(tt => tt)
  };
}

function catenation2 (a, b) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(a, b)
      )
    )
  );
}

// ----------


const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

verify(catenation2(zeroes, binary), {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});
