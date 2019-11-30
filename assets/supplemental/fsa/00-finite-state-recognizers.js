// 01-validated-and-processed.js

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

// 02-automate.js

function automate (description) {
  if (description instanceof RegExp) {
    return string => !!description.exec(string)
  } else {
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
}

function verify (description, tests) {
  try {
    const recognizer = automate(description);
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = recognizer(example);
        if (actual === expected) {
          return 'pass';
        } else {
          return `fail: ${JSON.stringify({ example, expected, actual })}`;
        }
      }
    )

    const failures = outcomes.filter(result => result !== 'pass');
    const numberOfFailures = failures.length;
    const numberOfPasses = numberOfTests - numberOfFailures;

    if (numberOfFailures === 0) {
      console.log(`All ${numberOfPasses} tests passing`);
    } else {
      console.log(`${numberOfFailures} tests failing: ${failures.join('; ')}`);
    }
  } catch(error) {
    console.log(`Failed to validate the description: ${error}`)
  }
}

// ----------

const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
};

verify(binary, {
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

const reg = {
  "start": "empty",
  "accepting": ["reg"],
  "transitions": [
    { "from": "empty", "consume": "r", "to": "r" },
    { "from": "empty", "consume": "R", "to": "r" },
    { "from": "r", "consume": "e", "to": "re" },
    { "from": "r", "consume": "E", "to": "re" },
    { "from": "re", "consume": "g", "to": "reg" },
    { "from": "re", "consume": "G", "to": "reg" }
  ]
};

verify(reg, {
  '': false,
  'r': false,
  'R': false,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

const uppercase = {
  "start": "uppercase",
  "accepting": ["uppercase"],
  "transitions": [
    { "from": "uppercase", "consume": "A", "to": "uppercase" },
    { "from": "uppercase", "consume": "B", "to": "uppercase" },
    { "from": "uppercase", "consume": "C", "to": "uppercase" },
    { "from": "uppercase", "consume": "D", "to": "uppercase" },
    { "from": "uppercase", "consume": "E", "to": "uppercase" },
    { "from": "uppercase", "consume": "F", "to": "uppercase" },
    { "from": "uppercase", "consume": "G", "to": "uppercase" },
    { "from": "uppercase", "consume": "H", "to": "uppercase" },
    { "from": "uppercase", "consume": "I", "to": "uppercase" },
    { "from": "uppercase", "consume": "J", "to": "uppercase" },
    { "from": "uppercase", "consume": "K", "to": "uppercase" },
    { "from": "uppercase", "consume": "L", "to": "uppercase" },
    { "from": "uppercase", "consume": "M", "to": "uppercase" },
    { "from": "uppercase", "consume": "N", "to": "uppercase" },
    { "from": "uppercase", "consume": "O", "to": "uppercase" },
    { "from": "uppercase", "consume": "P", "to": "uppercase" },
    { "from": "uppercase", "consume": "Q", "to": "uppercase" },
    { "from": "uppercase", "consume": "R", "to": "uppercase" },
    { "from": "uppercase", "consume": "S", "to": "uppercase" },
    { "from": "uppercase", "consume": "T", "to": "uppercase" },
    { "from": "uppercase", "consume": "U", "to": "uppercase" },
    { "from": "uppercase", "consume": "V", "to": "uppercase" },
    { "from": "uppercase", "consume": "W", "to": "uppercase" },
    { "from": "uppercase", "consume": "X", "to": "uppercase" },
    { "from": "uppercase", "consume": "Y", "to": "uppercase" },
    { "from": "uppercase", "consume": "Z", "to": "uppercase" }
  ]
};

verify(uppercase, {
  '': true,
  'r': false,
  'R': true,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

// 03-product.js

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

// 04-union-and-intersection.js

function union2 (a, b) {
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

function intersection2 (a, b) {
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

// ----------

verify(union2(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

verify(intersection2(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

// 05-resolve-conflicts.js

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

// 06-epsilons.js

function epsilonCatenate (first, second) {
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

// 08-epsilon-union.js

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

function union2p (first, second) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonUnion(first, second)
      )
    )
  );
}

// ----------

verify(union2p(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

// 09-merge-equivalent-states.js

const keyS =
  (transitions, accepting) => {
    const stringifiedTransitions =
      transitions
        .map(({ consume, to }) => `${consume}-->${to}`)
        .sort()
        .join(', ');
    const acceptingSuffix = accepting ? '-->*' : '';

    return `[${stringifiedTransitions}]${acceptingSuffix}`;
  };

function mergeEquivalentStates (description) {
  searchForDuplicate: while (true) {
    let {
      start,
      transitions: allTransitions,
      accepting,
      states,
      stateMap,
      acceptingSet
    } = validatedAndProcessed(description);

    const statesByKey = new Map();

    for (const state of states) {
      const stateTransitions = stateMap.get(state) || [];
      const isAccepting = acceptingSet.has(state);
      const key = keyS(stateTransitions, isAccepting);

      if (statesByKey.has(key)) {
        // found a dup!
        const originalState = statesByKey.get(key);

        if (start === state) {
          // point start to original
          start = originalState;
        }

        // remove duplicate's transitions
        allTransitions = allTransitions.filter(
          ({ from }) => from !== state
        );

        // rewire all former incoming transitions
        allTransitions = allTransitions.map(
          ({ from, consume, to }) => ({
            from, consume, to: (to === state ? originalState : to)
          })
        );

        if (isAccepting) {
          // remove state from accepting
          accepting = accepting.filter(s => s !== state)
        }

        // reset description
        description = { start, transitions: allTransitions, accepting };

        // and then start all over again
        continue searchForDuplicate;
      } else {
        statesByKey.set(key, state);
      }
    }
    // no duplicates found
    break;
  }

  return description;
}

function union2pm (first, second) {
  return mergeEquivalentStates(
    powerset(
      reachableFromStart(
        removeEpsilonTransitions(
          epsilonUnion(first, second)
        )
      )
    )
  );
}

// ----------

verify(union2pm(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

// 10-nary.js

function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(union2pm(a, b));

  return union(ab, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(intersection2(a, b));

  return intersection(ab, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = mergeEquivalentStates(catenation2(a, b));

  return catenation(ab, ...rest);
}

// ----------

verify(union(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
})

verify(intersection(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
})

verify(catenation(zeroes, binary), {
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

// 12-building-blocks.js

const EMPTY_SET = {
  "start": "empty",
  "transitions": [],
  "accepting": []
};

const EMPTY_STRING = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

function just1 (symbol) {
  return {
    "start": "empty",
    "transitions": [
      { "from": "empty", "consume": symbol, "to": "recognized" }
    ],
    "accepting": ["recognized"]
  };
}

function just (str = "") {
  const recognizers = str.split('').map(just1);

  return catenation(...recognizers);
}

function any (str = "") {
  const recognizers = str.split('').map(just1);

  return union(...recognizers);
}

// ----------

verify(EMPTY_SET, {
  '': false,
  '0': false,
  '1': false
});

verify(EMPTY_STRING, {
  '': true,
  '0': false,
  '1': false
});

verify(just1('0'), {
  '': false,
  '0': true,
  '1': false,
  '01': false,
  '10': false,
  '11': false
});

const reginald = catenation(
  just1('r'),
  just1('e'),
  just1('g'),
  just1('i'),
  just1('n'),
  just1('a'),
  just1('l'),
  just1('d')
);

verify(reginald, {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});

verify(just('r'), {
  '': false,
  'r': true,
  'reg': false,
  'reggie': false,
  'reginald': false,
  'reginaldus': false
});

verify(just('reginald'), {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});

verify(any('r'), {
  '': false,
  'r': true,
  'reg': false
});

const capitalArrReg = catenation(any('Rr'), just('eg'));

verify(capitalArrReg, {
  '': false,
  'r': false,
  'R': false,
  'reg': true,
  'Reg': true,
  'REG': false,
  'Reginald': false
});

const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '1234567890';

const anyAlphaNumeric = any(ALPHANUMERIC);

const rSomethingG = catenation(any('Rr'), anyAlphaNumeric, any('Gg'));

verify(rSomethingG, {
  '': false,
  'r': false,
  're': false,
  'Reg': true,
  'Rog': true,
  'RYG': true,
  'Rej': false
});

console.log('13-compiling-formal-regular-expressions.js');

const operatorToPrecedence = new Map(
  Object.entries({
    '|': 1,
    '→': 2,
    '*': 3
  })
);

function peek (stack) {
  return stack[stack.length - 1];
}

function shuntingYardVersion1 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];

  for (const symbol of input) {
    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
    } else {
      outputQueue.push(symbol);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

const binaryOperators = new Set(['→', '|']);

function shuntingYardVersion2 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

function shuntingYardVersion3 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('∩');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(topOfOperatorStack);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStackPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(topOfOperatorStack);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const topOfOperatorStack = operatorStack.pop();

    outputQueue.push(topOfOperatorStack);
  }

  return outputQueue;
}

const formalOperators = new Map(
  Object.entries({
    '∅': { symbol: Symbol('∅'), precedence: 99, arity: 0, fn: () => EMPTY_SET },
    'ε': { symbol: Symbol('ε'), precedence: 99, arity: 0, fn: () => EMPTY_STRING },
    '|': { symbol: Symbol('|'), precedence: 1, arity: 2, fn: union },
    '→': { symbol: Symbol('→'), precedence: 2, arity: 2, fn: catenation },
    '*': { symbol: Symbol('*'), precedence: 3, arity: 1, fn: kleeneStar }
  })
);

function basicShuntingYard (formalRegularExpressionString, operators = formalOperators) {
  const valueOf =
    something => {
      if (operators.has(something)) {
        const { symbol, arity } = operators.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const isCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity > 0;
  const isBinaryCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity === 2;

  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSymbol
          // do not use valueOf

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('->');
          awaitingValue = false;
        }

      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStack = operatorStack.pop();

        outputQueue.push(valueOf(topOfOperatorStack));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { arity, precedence } = operators.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (arity > 0 && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const topOfOperatorStackPrecedence = operators.get(peek(operatorStack)).precedence;

        if (precedence < topOfOperatorStackPrecedence) {
          const topOfOperatorStack = operatorStack.pop();

          outputQueue.push(valueOf(topOfOperatorStack));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isBinaryCombinator(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(valueOf(symbol));
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    
    if (operators.has(op)) {
      const { symbol: opSymbol } = operators.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function rpnToDescription (rpn, operators = formalOperators) {
  const symbols = new Map(
    [...operators.entries()].map(
      ([key, { symbol, arity, fn }]) => [symbol, { arity, fn }]
    )
  );

  if (rpn.length === 0) {
    return EMPTY_SET;
  } else {
    const stack = [];

    for (const element of rpn) {
      if (typeof element === 'string') {
        stack.push(just1(element));
      } else if (symbols.has(element)) {
        const { arity, fn } = symbols.get(element);

        if (stack.length < arity) {
          error(`Not emough values on the stack to use ${element}`)
        } else {
          const args = [];

          for (let counter = 0; counter < arity; ++counter) {
            args.unshift(stack.pop());
          }

          stack.push(fn.apply(null, args))
        }
      } else {
        error(`Don't know what to do with ${element}'`)
      }
    }
    if (stack.length != 1) {
      error(`should only be one value to return, but there were ${stack.length}`);
    } else {
      return stack[0];
    }
  }
}

function toFiniteStateRecognizer (formalRegularExpression, operators = formalOperators) {
  return rpnToDescription(
    basicShuntingYard(formalRegularExpression, operators),
    operators
  );
}

// ----------

const binary2 = union(just1('0'), catenation(just1('1'), kleeneStar(union(just('0'), just('1')))));

verify(binary2, {
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

const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

verify(toFiniteStateRecognizer(''), {
  '': false,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('ε'), {
  '': true,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0*'), {
  '': true,
  '0': true,
  '1': false,
  '00': true,
  '01': false,
  '10': false,
  '11': false,
  '000': true,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0|(1(0|1)*)'), {
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
  '111': true
});

console.log('14-enhancements.js');

function kleenePlus (description) {
  return catenation(description, kleeneStar(description));
}

const operators2 = new Map(
  [...formalOperators.entries()].concat([
    ['+', { symbol: Symbol('+'), precedence: 3, arity: 1, fn: kleenePlus }]
  ])
);

const SYMBOLIC = `~\`!@#$%^&*()_-+={[}]|\\:;"'<,>.?/`;
const WHITESPACE = ` \r\n\t`;
const EVERYTHING = any(ALPHANUMERIC + SYMBOLIC + WHITESPACE);

const operators3 = new Map(
  [...formalOperators.entries()].concat([
    ['.', { symbol: Symbol('.'), precedence: 99, arity: 0, fn: () => EVERYTHING }]
  ])
);

// ----------

verify(kleenePlus(Aa), {
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

const zeroOrMoreAs = toFiniteStateRecognizer('(a|A)*', operators2);
const oneOrMoreAs = toFiniteStateRecognizer('(a|A)+', operators2);

verify(zeroOrMoreAs, {
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

verify(oneOrMoreAs, {
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

const oddLength = toFiniteStateRecognizer('.(..)*', operators3);

verify(oddLength, {
  '': false,
  '1': true,
  '{}': false,
  '[0]': true,
  '()()': false,
  'x o x': true
});
