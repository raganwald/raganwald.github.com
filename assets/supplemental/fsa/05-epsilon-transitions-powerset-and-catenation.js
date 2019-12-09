console.log('05-epsilon-transitions-powerset-and-catenation.js');

function epsilonCatenate (_a, _b) {
  const a = dup(_a);
  const b = dup(_b);

  const joinTransitions =
    a.accepting.map(
      from => ({ from, to: b.start })
    );

  return {
    start: a.start,
    accepting: b.accepting,
    transitions:
      a.transitions
        .concat(joinTransitions)
        .concat(b.transitions)
  };
}

function removeEpsilonTransitions ({ start, accepting, transitions }) {
  const acceptingSet = new Set(accepting);
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce(
          (acc, { from, to }) => {
            const toStates = acc.has(from) ? acc.get(from) : new Set();

            toStates.add(to);
            acc.set(from, toStates);
            return acc;
          },
          new Map()
        );

  const epsilonQueue = [...epsilonMap.entries()];
  const epsilonFromStatesSet = new Set(epsilonMap.keys());

  const outerBoundsOnNumberOfRemovals = transitions.length;
  let loops = 0;

  while (epsilonQueue.length > 0 && loops++ <= outerBoundsOnNumberOfRemovals) {
    let [epsilonFrom, epsilonToSet] = epsilonQueue.shift();
    const allEpsilonToStates = [...epsilonToSet];

    // special case: We can ignore self-epsilon transitions (e.g. a-->a)
    const epsilonToStates = allEpsilonToStates.filter(
      toState => toState !== epsilonFrom
    );

    // we defer resolving destinations that have epsilon transitions
    const deferredEpsilonToStates = epsilonToStates.filter(s => epsilonFromStatesSet.has(s));
    if (deferredEpsilonToStates.length > 0) {
      // defer them
      epsilonQueue.push([epsilonFrom, deferredEpsilonToStates]);
    } else {
      // if nothing to defer, remove this from the set
      epsilonFromStatesSet.delete(epsilonFrom);
    }

    // we can immediately resolve destinations that themselves don't have epsilon transitions
    const immediateEpsilonToStates = epsilonToStates.filter(s => !epsilonFromStatesSet.has(s));
    for (const epsilonTo of immediateEpsilonToStates) {
      const source =
        stateMapWithoutEpsilon.get(epsilonTo) || [];
      const potentialToMove =
        source.map(
          ({ consume, to }) => ({ from: epsilonFrom, consume, to })
        );
      const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

      // filter out duplicates
      const needToMove = potentialToMove.filter(
        ({ consume: pConsume, to: pTo }) =>
          !existingTransitions.some(
            ({ consume: eConsume, to: eTo }) => pConsume === eConsume && pTo === eTo
          )
      );
      // now add the moved transitions
      stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(needToMove));

      // special case!
      if (acceptingSet.has(epsilonTo)) {
        acceptingSet.add(epsilonFrom);
      }
    }
  }

  if (loops > outerBoundsOnNumberOfRemovals) {
    error("Attempted to remove too many epsilon transitions. Investigate possible loop.");
  } else {
    return {
      start,
      accepting: [...acceptingSet],
      transitions: [
        ...stateMapWithoutEpsilon.values()
      ].flatMap( tt => tt )
    };
  }
}

function reachableFromStart ({ start, accepting: allAccepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions, true);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reachable
    reachableMap.set(state, transitions);

    const reachableFromThisState =
      transitions.map(({ to }) => to);

    const unprocessedReachableFromThisState =
      reachableFromThisState
        .filter(to => !reachableMap.has(to) && !R.has(to));

    for (const reachableState of unprocessedReachableFromThisState) {
      R.add(reachableState);
    }
  }

  const transitions = [...reachableMap.values()].flatMap(tt => tt);

  // prune unreachable states from the accepting set
  const reachableStates = new Set(
    [start].concat(
      transitions.map(({ to }) => to)
    )
  );

  const accepting = allAccepting.filter( state => reachableStates.has(state) );

  return {
    start,
    transitions,
    accepting
  };
}

// NOTA BENE: `powerset` is unsafe:
// it recycle some of its input states
function powerset (description, P = new StateAggregator()) {
  const {
    start: nfaStart,
    acceptingSet: nfaAcceptingSet,
    stateMap: nfaStateMap
  } = validatedAndProcessed(description, true);

  // the final set of accepting states
  const dfaAcceptingSet = new Set();

  // R is the work "remaining" to be analyzed
  // organized as a set of states to process
  const R = new Set([ nfaStart ]);

  // T is a collection of states already analyzed
  // it is a map from the state name to the transitions
  // from that state
  const T = new Map();

  while (R.size > 0) {
    const [stateName] = [...R];
    R.delete(stateName);

    // all powerset states represent sets of state,
    // with the degenerate case being a state that only represents
    // itself. stateSet is the full set represented
    // by stateName
    const stateSet = P.setFromState(stateName);

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
      const toStatesName = P.stateFromSet(...toStates);

      dfaTransitions.push({ from: stateName, consume, to: toStatesName });

      const hasBeenDone = T.has(toStatesName);
      const isInRemainingQueue = R.has(toStatesName)

      if (!hasBeenDone && !isInRemainingQueue) {
        R.add(toStatesName);
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

const regexC = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: emptySet
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: emptyString
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: union2
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

// ----------

const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

verifyRecognizer(catenation2(zeroes, binary), {
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

verifyEvaluateB('r→e→g', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false
});

verifyEvaluateB('reg', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false
});

verifyEvaluateB('reg|reggie', regexC, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': true
});
