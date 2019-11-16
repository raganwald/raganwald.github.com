

function error (description) {
  console.log({ error: description });
  throw description;
}

function toStateMap (transitions, allowNFA = false) {
  return transitions
      .reduce(
        (acc, transition) => {
          let {
            from,
            consume,
            to
          } = transition;

          if (from == null) {
            error(
              `Transition ${JSON.stringify(transition)} does not have a from state. ` +
              `This is not allowed.`
            );
          }

          if (consume == null) {
            error(
               `Transition ${JSON.stringify(transition)} does not consume a token. ` +
              `ε-transitions are not allowed.`
            );
          }

          if (to == null) {
            error(
              `Transition ${JSON.stringify(transition)} does not have a to state. ` +
              `This is not allowed.`
            );
          }

          if (!acc.has(from)) {
            acc.set(from, []);
          }

          const existingTransitions = acc.get(from);

          for (const { consume: existingConsume, to: existingTo } of existingTransitions) {
            if (consume === existingConsume && to === existingTo) {
              console.log(
                `Transition ${JSON.stringify(transition)} already exists. ` +
                `Duplicates will be ignored. Please avoid this in future.`
              )
              return acc;
            }
            if (!allowNFA && consume === existingConsume) {
              error(
                `Transition ${JSON.stringify(transition)} creates non-determinism ` +
                `between ${to} and ${existingTo}. ` +
                `This is not allowed.`
              );
            }
          }

          existingTransitions.push(transition);

          return acc;
        },
        new Map()
      );
}

function toAlphabetSet (transitions) {
  return new Set(
    transitions.map(
      ({ consume }) => consume
    )
  )
}

function toStateSet (transitions) {
  return new Set(
    transitions.reduce(
      (acc, { from, to }) => {
        acc.add(from);
        acc.add(to);
        return acc;
      },
      new Set()
    )
  )
}

function validatedAndProcessed ({
  alphabet,
  states,
  start,
  accepting,
  transitions
}, allowNFA = false) {
  const alphabetSet = toAlphabetSet(transitions);
  const stateMap = toStateMap(transitions, allowNFA);
  const stateSet = toStateSet(transitions);
  const acceptingSet = new Set(accepting);

  // validate alphabet if present
  if (alphabet != null) {
    const declaredAlphabetSet = new Set(alphabet.split(''));

    const undeclaredSymbols =
      [...alphabetSet]
        .filter(
          sym => !declaredAlphabetSet.has(sym)
        )
    	.map(x => `'${x}'`);

    if (undeclaredSymbols.length > 0) {
      error(
        `the symbols ${undeclaredSymbols.join(', ')} are used, but not present in the alphabet`
      );
    }
  } else {
    alphabet = [...alphabetSet].join('');
  }

  // validate states if present
  if (states != null) {
    const declaredStateSet = new Set(states);

    const undeclaredStates =
      [...stateSet]
        .filter(
          state => !declaredStateSet.has(state)
        )
    	.map(x => `'${x}'`);

    if (undeclaredStates.length > 0) {
      error(
        `the states ${undeclaredStates.join(', ')} are used, but not present in the states declaration`
      );
    }

    const unusedStates =
      states
        .filter(
          state => !stateSet.has(state)
        )
    	.map(x => `'${x}'`);

    if (unusedStates.length > 0) {
      error(
        `the states ${unusedStates.join(', ')} are declared, but not used in the transitions`
      );
    }
  } else {
    states = [...stateSet];
  }

  return {
    alphabet,
    alphabetSet,
    states,
    stateSet,
    stateMap,
    start,
    accepting,
    acceptingSet,
    transitions
  };
}

function automate (description) {
  const {
    stateMap,
    start,
    acceptingSet,
    transitions
  } = validatedAndProcessed(description);

  return function (string) {
    let state = start;
    let unconsumed = string;

    while (unconsumed !== '') {
      const transitionsForThisState = stateMap.get(state) || [];
      const transition =
      	transitionsForThisState.find(
          ({ consume }) => consume === unconsumed[0]
      	);

      if (transition == null) {
        // the machine stops
      	break;
      }

      const { to } = transition;
      unconsumed = unconsumed.substring(1);

      state = to;
    }

    // machine has reached a terminal state.
    if (unconsumed === '') {
      // reached the end. do we accept?
      return acceptingSet.has(state);
    } else {
      // stopped before reaching the end is a fail
      return false;
    }
  }
}

function test(description, examples) {
  const recognizer = automate(description);

  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

// This function computes a state name for the product given
// the names of teh states for a and b
function abToAB (aState, bState) {
  return`(${aState || ''})(${bState || ''})`;
}

function product (a, b, mode = 'union') {
  const {
    stateMap: aStateMap,
    start: aStart
  } = validatedAndProcessed(a);
  const {
    stateMap: bStateMap,
    start: bStart
  } = validatedAndProcessed(b);

  // R is a collection of states "remaining" to be analyzed
  // it is a map from the product's state name to the individual states
  // for a and b
  const R = new Map();

  // T is a collection of states already analyzed
  // it is a map from a product's state name to the transitions
  // for that state
  const T = new Map();

  // seed R
  const start = abToAB(aStart, bStart);
  R.set(start, [aStart, bStart]);

  while (R.size > 0) {
    const [[abState, [aState, bState]]] = R.entries();
    const aTransitions = aState != null ? (aStateMap.get(aState) || []) : [];
    const bTransitions = bState != null ? (bStateMap.get(bState) || []) : [];

    let abTransitions = [];

    if (T.has(abState)) {
      error(`Error taking product: T and R both have ${abState} at the same time.`);
    }

    if (aTransitions.length === 0 && bTransitions.length == 0) {
      // dead end for both
      // will add no transitions
      // we put it in T just to avoid recomputing this if it's referenced again
      T.set(abState, []);
    } else if (aTransitions.length === 0) {
      const aTo = null;
      abTransitions = bTransitions.map(
        ({ consume, to: bTo }) => ({ from: abState, consume, to: abToAB(aTo, bTo), aTo, bTo })
      );
    } else if (bTransitions.length === 0) {
      const bTo = null;
      abTransitions = aTransitions.map(
        ({ consume, to: aTo }) => ({ from: abState, consume, to: abToAB(aTo, bTo), aTo, bTo })
      );
    } else {
      // both a and b have transitions
      const aConsumeToMap =
        aTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );
      const bConsumeToMap =
        bTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );

      for (const { from, consume, to: aTo } of aTransitions) {
        const bTo = bConsumeToMap.has(consume) ? bConsumeToMap.get(consume) : null;

        if (bTo != null) {
          bConsumeToMap.delete(consume);
        }

        abTransitions.push({ from: abState, consume, to: abToAB(aTo, bTo), aTo, bTo });
      }

      for (const [consume, bTo] of bConsumeToMap.entries()) {
        const aTo = null;

        abTransitions.push({ from: abState, consume, to: abToAB(aTo, bTo), aTo, bTo });
      }
    }

    T.set(abState, abTransitions);

    for (const { to, aTo, bTo } of abTransitions) {
      // more work remaining?
      if (!T.has(to) && !R.has(to)) {
        R.set(to, [aTo, bTo]);
      }
    }

    R.delete(abState);
  }

  const accepting = [];

  const transitions =
    [...T.values()].flatMap(
      tt => tt.map(
        ({ from, consume, to }) => ({ from, consume, to })
      )
    );

  return { start, accepting, transitions };

}

function union (a, b) {
  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [''].concat(aDeclaredStates);
  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [''].concat(bDeclaredStates);

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => abToAB(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => abToAB(aState, bAcceptingState))
    );
  const allAcceptingStates =
    statesAAccepts.concat(
      statesBAccepts.filter(
        state => statesAAccepts.indexOf(state) === -1
      )
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

function intersection (a, b) {
  const {
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const {
    accepting: bAccepting
  } = validatedAndProcessed(b);

  const allAcceptingStates =
    aAccepting.flatMap(
      aAcceptingState => bAccepting.map(bAcceptingState => abToAB(aAcceptingState, bAcceptingState))
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

// given a mapping of individual names, renames all the states in
// an fas, including the start and accepting. any names not in the map
// rename unchanged
function renameStates (nameMap, { start, accepting, transitions }) {
  const translate =
    before =>
      nameMap.has(before) ? nameMap.get(before) : before;

  return {
    start: translate(start),
    accepting: accepting.map(translate),
    transitions:
    	transitions.map(
      	({ from, consume, to }) => {
          const transition = { from: translate(from), to: translate(to || from) };
          if (consume != null) transition.consume = consume;

          return transition;
        }
      )
  };
}

const allStates =
  ({ start, transitions }) => {
    const stateSet = toStateSet(transitions);
    stateSet.add(start);
    return stateSet;
  };

function resolveConflictsWithNames (conflictingStates, description) {
  const conflictingStatesSet = new Set(conflictingStates);
  const descriptionStatesSet = allStates(description);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const descriptionState of descriptionStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(descriptionState);
    let base = match == null ? descriptionState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = descriptionState;
    while (conflictingStatesSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== descriptionState) {
  		nameMap.set(descriptionState, resolved);
    }
    conflictingStatesSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}

// given an iterable of names that are reserved,
// renames any states in a name so that they no longer
// overlap with reserved names
function resolveConflicts (first, second) {
  return resolveConflictsWithNames(allStates(first), second);
}

function epsilonJoin (first, second) {
  const unconflictedSecond =  resolveConflicts(first, second);

  const joinTransitions =
    first.accepting.map(
      from => ({ from, to: unconflictedSecond.start })
    );

  return {
    start: first.start,
    accepting: unconflictedSecond.accepting,
    transitions:
      first.transitions
        .concat(joinTransitions)
        .concat(unconflictedSecond.transitions)
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
  const epsilonFromStatesSet = new Set(epsilonMap.values());

  while (epsilonQueue.length > 0) {
    let [epsilonFrom, epsilonToSet] = epsilonQueue.shift();
    const epsilonToStates = [...epsilonToSet];
    // we can immediately resolve destinations that themselves don't have epsilon transitions
    const immediateEpsilonToStates = epsilonToStates.filter(s => !epsilonFromStatesSet.has(s));
    // we defer resolving destinations that have epsilon transitions
    const deferredEpsilonToStates = epsilonToStates.filter(s => epsilonFromStatesSet.has(s));

    if (deferredEpsilonToStates.length > 0) {
      // defer them
      epsilonQueue.push([epsilonFrom, deferredEpsilonToStates]);
    } else {
      // if nothing to defer, remove this from the set
      epsilonFromStatesSet.delete(epsilonFrom);
    }

    // now add all the transitions
    for (const epsilonTo of epsilonToStates) {
      const source =
        stateMapWithoutEpsilon.get(epsilonTo) || [];
      const moved =
        source.map(
          ({ consume, to }) => ({ from: epsilonFrom, consume, to })
        );

      const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

      // now add the moved transitions
      stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(moved));

      // special case!
      if (acceptingSet.has(epsilonTo)) {
        acceptingSet.add(epsilonFrom);
      }
    }
  }

  return {
    start,
    accepting: [...acceptingSet],
    transitions: [
      ...stateMapWithoutEpsilon.values()
    ].flatMap( tt => tt )
  };
}

function reachableFromStart ({ start, accepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reacdhable
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

  return {
    start,
    accepting,
    transitions: [...reachableMap.values()].flatMap(tt => tt)
  };
}

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

function avoidReservedNames (reservedStates, second) {
  const reservedStateSet = new Set(reservedStates);
  const { stateSet: secondStatesSet } = validatedAndProcessed(second);

  const nameMap = new Map();

  // build the map to resolve overlaps with reserved names
  for (const secondState of secondStatesSet) {
    const match = /^(.*)-(\d+)$/.exec(secondState);
    let base = match == null ? secondState : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = secondState;
    while (reservedStateSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== secondState) {
  		nameMap.set(secondState, resolved);
    }
    reservedStateSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, second);
}

function epsilonUnion (first, second) {
  const newStartState = 'empty';
  const cleanFirst = avoidReservedNames([newStartState], first);
  const cleanSecond = resolveConflicts(cleanFirst, avoidReservedNames([newStartState], second));

  const concurrencyTransitions = [
    { "from": newStartState, "to": cleanFirst.start },
    { "from": newStartState, "to": cleanSecond.start },
  ];

  return {
    start: newStartState,
    accepting: cleanFirst.accepting.concat(cleanSecond.accepting),
    transitions:
      concurrencyTransitions
    	.concat(cleanFirst.transitions)
        .concat(cleanSecond.transitions)
  };
}

function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [''].concat(aDeclaredStates);
  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [''].concat(bDeclaredStates);

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => abToAB(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => abToAB(aState, bAcceptingState))
    );
  const allAcceptingStates =
    statesAAccepts.concat(
      statesBAccepts.filter(
        state => statesAAccepts.indexOf(state) === -1
      )
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return union({ start, accepting, transitions }, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const {
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const {
    accepting: bAccepting
  } = validatedAndProcessed(b);

  const allAcceptingStates =
    aAccepting.flatMap(
      aAcceptingState => bAccepting.map(bAcceptingState => abToAB(aAcceptingState, bAcceptingState))
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return intersection({ start, accepting, transitions }, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = powerset(
    removeEpsilonTransitions(
      epsilonJoin(a, b)
    )
  );

  return catenation(ab, ...rest);
}


