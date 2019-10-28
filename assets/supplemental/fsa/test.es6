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
}) {
  const alphabetSet = toAlphabetSet(transitions);
  const stateMap = toStateMap(transitions);
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
    alphabet,
    alphabetSet,
    states,
    stateSet,
    stateMap,
    start,
    accepting,
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

const f = {
  start: 'start',
  accepting: ['f'],
  transitions: [
    { from: 'start', consume: 'f', to: 'f' }
  ]
};

const empty = {
  start: 'start',
  accepting: ['start'],
  transitions: []
};

// test(f, ['', 'f', 'foo'])

////////////////////////////////////////////////////////////////////////////////

// Test cases:
// either or both combined states are null
// either or both combined states are

function product (a, b, mode = 'union') {
  const R = new Map();
  const T = new Map();

  function abToAB (aState, bState) {
    return`(${aState || ''})(${bState || ''})`;
  }

  const [{ start: aStart }, { start: bStart }] = [a, b];
  const [aStateMap, bStateMap] = [toStateMap(a.transitions), toStateMap(b.transitions)];

  // seed R
  const start = abToAB(aStart, bStart);
  R.set(start, [aStart, bStart]);

  // seed S
  const S = new Map();
  S.set(start, [aStart, bStart]);

  while (R.size > 0) {
    const [[abState, [aState, bState]]] = R.entries();
    const aTransitions = aState != null ? (aStateMap.get(aState) || []) : [];
    const bTransitions = bState != null ? (bStateMap.get(bState) || []) : [];

    let abTransitions = [];

    if (T.has(abState)) {
      console.log(`Error taking product: T and R both have ${abState} at the same time.`);
      return;
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
  	  S.set(to, [aTo, bTo]);

      // more work to be done?
      if (!T.has(to) && !R.has(to)) {
        R.set(to, [aTo, bTo]);
      }
    }

    R.delete(abState);
  }

  const transitions =
    [...T.values()].flatMap(
      tt => tt.map(
        ({ from, consume, to }) => ({ from, consume, to })
      )
    );

  const [aAccepting, bAccepting] =
    [new Set(a.accepting), new Set(b.accepting)];

  const union =
    [...S.entries()].reduce(
      (acc, [abState, [aState, bState]]) =>
        aAccepting.has(aState) || bAccepting.has(bState) ? acc.concat([abState]) : acc,
      []
    );

  const intersection =
    [...S.entries()].reduce(
      (acc, [abState, [aState, bState]]) =>
        aAccepting.has(aState) && bAccepting.has(bState) ? acc.concat([abState]) : acc,
      []
    );

  const accepting = { union, intersection }[mode];

  return { start, accepting, transitions };

}

const theSame = {
  start: 'start',
  accepting: ['0', '1'],
  transitions: [
    { from: 'start', consume: '0', to: '0' },
    { from: '0', consume: '0', to: '0' },
    { from: 'start', consume: '1', to: '1' },
    { from: '1', consume: '1', to: '1' }
  ]
};

const three = {
  start: 'start',
  accepting: ['3'],
  transitions: [
    { from: 'start', consume: '0', to: '1' },
    { from: 'start', consume: '1', to: '1' },
    { from: '1', consume: '0', to: '2' },
    { from: '1', consume: '1', to: '2' },
    { from: '2', consume: '0', to: '3' },
    { from: '2', consume: '1', to: '3' }
  ]
};

// test(three, [
//   '0', '101', '11111', , '111011'
// ])

// console.log(product(theSame, three))

// test(product(theSame, three, 'intersection'), [
//   '0', '000', '101', '11111', '111011'
// ])

const delayedC = {
  start: 'start',
  accepting: 'c',
  transitions: [
    { from: 'start', to: 'a' },
    { from: 'a', to: 'b' },
    { from: 'b', to: 'c' },
    { from: 'c', consume: 'c', to: 'c' }
  ]
};

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

const withOrphans = reachableFromStart(epsilonRemoved(delayedC));

//////////////////////
//  Epsilon Removal //
//////////////////////

function epsilonRemoved ({ start, accepting, transitions }) {
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce((acc, { from, to }) => (acc.set(from, to), acc), new Map());
  const acceptingSet = new Set(accepting);

  while (epsilonMap.size > 0) {
    let [[epsilonFrom, epsilonTo]] = [...epsilonMap.entries()];

    const seen = new Set([epsilonFrom]);

    while (epsilonMap.has(epsilonTo)) {
      if (seen.has(epsilonTo)) {
        const display =
          [...seen]
            .map(f => `${f} -> ${epsilonMap.get(f)}`)
            .join(', ');
        console.log(`The epsilon path { ${display} } includes a loop. This is invalid.`);

        return undefined;
      }
      epsilonFrom = epsilonTo;
      epsilonTo = epsilonMap.get(epsilonFrom);
      seen.add(epsilonFrom);
    }

    // from -> to is a valid epsilon transition
    // remove it by making a copy of the destination
    // (destination must not be an epson, by viture of above code)

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

    // and remove the original from our epsilonMap
    epsilonMap.delete(epsilonFrom);
  }

  return {
    start,
    accepting: [...acceptingSet],
    transitions: [
      ...stateMapWithoutEpsilon
        .values()

    ].flatMap( tt => tt )
  };
}

    ////////////////
    // NFA -> DFA //
    ////////////////

function dfa ({ start, accepting, transitions }) {
  const singles =
    transitions
      .reduce(
        (acc, { from, to }) => (acc.add(from), acc.add(to), acc)
        ,
        new Set()
      );
  const nameMap =
    [...singles]
      .reduce(
        (acc, state) => (acc.set(state, state), acc),
        new Map()
      );
  const separator = Math.random().toString().substring(2);
  function name (states) {
    const key = states.join(separator);

    if (nameMap.has(key)) {
      return nameMap.get(key);
    } else {
      const base = `{${states.join(',')}}`;
      let readable = base;
      let n = 1;

      const existingStates = new Set([...nameMap.values()]);

      while (existingStates.has(readable)) {
        readable = `${base}-${++n}`;
      }

      return readable;
    }
  }

  const nfaStateMap = toStateMap(transitions, true);
  const dfaStateMap = new Map();
  const nfaAcceptingSet = new Set(accepting);
  const dfaAcceptingSet = new Set();

  const R = new Map();
  R.set(name([start]), [start]);

  while (R.size > 0) {
    const [[state, states]] = [...R.entries()];
    R.delete(state);

    // get the aggregate transitions
    const transitions =
      states.flatMap(s => nfaStateMap.get(s) || []);

    const distinctConsumptions =
      new Set(transitions.map(({ consume }) => consume));

    const routes =
      transitions.reduce(
        (acc, { consume, to }) => {
          acc.set(consume, (acc.get(consume) || []).concat([to]));
          return acc;
        },
        new Map()
      );

    const nfaTransitions = [];
  	for (const [consume, destinations] of routes.entries()) {
      const destination = name(destinations);

      nfaTransitions.push({ from: state, consume, to: destination });
      if (!dfaStateMap.has(destination) && !R.has(destination)) {
        R.set(destination, destinations);
      }
    }

    dfaStateMap.set(state, nfaTransitions);

    const anyStateIsAccepting =
      states.find(s => nfaAcceptingSet.has(s));
    if (anyStateIsAccepting) {
      dfaAcceptingSet.add(state);
    }

  }

  return {
    start,
    accepting: [...dfaAcceptingSet],
    transitions:
      [...dfaStateMap.values()]
        .flatMap(tt => tt)
  };
}

const fubar = {
  start: 'start',
  accepting: ['f'],
  transitions: [
    { from: 'start', consume: 'f', to: 'f' },
    { from: 'start', consume: 'f', to: 'f-2' },
    // { from: 'f', consume: 'u', to: 'fu' },
    // { from: 'fo', consume: 'o', to: 'foo' },
    // { from: 'f-2', consume: 'u', to: 'fu' },
    // { from: 'fu', consume: 'b', to: 'fub' },
    // { from: 'fub', consume: 'a', to: 'fuba' },
    // { from: 'fuba', consume: 'r', to: 'fubar' }
  ]
};

const r = {
  start: 'start',
  accepting: ['reginald', '.reggie'],
  transitions: [
    { from: 'start', consume: 'r', to: 'r' },
    { from: 'r', consume: 'e', to: 're' },
    { from: 're', consume: 'g', to: 'reg' },
    { from: 'reg', consume: 'i', to: 'regi' },
    { from: 'regi', consume: 'n', to: 'regin' },
    { from: 'regin', consume: 'a', to: 'regina' },
    { from: 'regina', consume: 'l', to: 'reginal' },
    { from: 'reginal', consume: 'd', to: 'reginald' },
    { from: 'start', consume: 'r', to: '.r' },
    { from: '.r', consume: 'e', to: '.re' },
    { from: '.re', consume: 'g', to: '.reg' },
    { from: '.reg', consume: 'g', to: '.regg' },
    { from: '.regg', consume: 'i', to: '.reggi' },
    { from: '.reggi', consume: 'e', to: '.reggie' },
  ]
};

const toWin = {
  start: 'start',
  accepting: ['accepting'],
  transitions: [
    { from: 'start', consume: '1', to: '1' },
    { from: '1', to: 'accepting' }
  ]
};

    ///////////////////
    //  COMPOSITION  //
    ///////////////////

// naively return all states mentioned,
// whether reachable or not,in use or not
function statesOf(description) {
  return description
    .transitions
      .reduce(
        (states, { from, to }) => {
          if (from != null) states.add(from);
          if (to != null) states.add(to);
          return states;
        },
        new Set([description.start].concat(description.accepting))
      );
}
// console.log(statesOf({
//   start: 'start',
//   accepting: ['foo', 'bar'],
//   transitions: [
//     // { from: 'start', consume: '0', to: 'foo' },
//     // { from: 'foo', consume: '1', to: 'bar' }
//     ]
// }))

// given a mapping of individual names, renames all the states in
// an fas, including the start and accepting. any names not in the map
// rename unchanged
function renameStates (nameDictionary, { start, accepting, transitions }) {
  const translate =
    before =>
      (nameDictionary[before] != null) ? nameDictionary[before] : before;

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
const mule = {
  start: 'start',
  accepting: ['foo', 'bar'],
  transitions: [
    { from: 'start', consume: '0', to: '0' },
    { from: '0', consume: '1', to: 'foo' }
    ]
};

// console.log(renameStates({ 0: 'zero', foo: 'baz' }, mule))

// given an iterable of names that are reserved,
// renames any states in a name so that they no longer
// overlap with reserved names
function resolveCollisions(reserved, description) {
  const reservedSet = new Set(reserved);
  const states = statesOf(description);

  const nameMap = {};

  // build the map to resolve overlaps with reserved names
  for (const state of states) {
    const match = /^(.*)-(\d+)$/.exec(state);
    let base = match == null ? state : match[1];
    let counter = match == null ? 1 : Number.parseInt(match[2], 10);
    let resolved = state;
    while (reservedSet.has(resolved)) {
      resolved = `${base}-${++counter}`;
    }
    if (resolved !== state) {
  		nameMap[state] = resolved;
    }
    reservedSet.add(resolved);
  }

  // apply the built map
  return renameStates(nameMap, description);
}

const mule2 = {
  start: 'start-2',
  accepting: ['foo', 'bar'],
  transitions: [
    { from: 'start-2', consume: '0', to: '0' },
    { from: '0', consume: '1', to: 'foo' }
    ]
};

function prepareSecondForCatenation (start, accepting, first, second) {
  const uncollidedSecond =  resolveCollisions(statesOf(first), second);

  const acceptingSecond =
    uncollidedSecond.accepting === accepting
  	  ? uncollidedSecond
      : renameStates({ [uncollidedSecond.accepting]: accepting }, uncollidedSecond);

  return acceptingSecond;
}

function prepareFirstForCatenation(start, accepting, first, second) {
  const nameMap = {
    [first.accepting]: second.start,
    [first.start]: start
  };
  const { transitions } =
    renameStates(nameMap, first);

  return {
    start,
    accepting,
    transitions:
  	  transitions.map(
        ({ from, consume, pop, to, push }) => {
          const transition = { from };
          if (consume != null && consume !== "") transition.consume = consume;
          if (pop != null) transition.pop = pop;
          if (to != null) transition.to = to;
          if (push != null) transition.push = push;

          return transition;
        }
      )
  };
}

function catenation (first, second) {
  const cleanSecond =  resolveCollisions(statesOf(first), second);

  const joinTransitions =
    first.accepting.map(
      from => ({ from, to: cleanSecond.start })
    );

  const nfaWithJoins = {
    start: first.start,
    accepting: second.accepting,
    transitions:
      first.transitions
        .concat(joinTransitions)
        .concat(cleanSecond.transitions)
  };

  const nfa = epsilonRemoved(nfaWithJoins);

  const catenatedDfa = dfa(nfa);

  return catenatedDfa;
}

const zeroes = {
  start: 'start',
  accepting: ['start'],
  transitions: [
    { from: 'start', consume: '0', to: 'start' }
  ]
};

const zeroOne = {
  alphabet: '01',
  states: ['start', 'zero'],
  start: 'start',
  accepting: ['one'],
  transitions: [
    { from: 'start', consume: '0', to: 'zero' },
    { from: 'zero', consume: '1', to: 'one' },
  ]
};

const binaryNumber = {
  "alphabet": "01",
  "states": ["start", "zero", "one or more"],
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "one or more" },
    { "from": "one or more", "consume": "0", "to": "one or more" },
    { "from": "one or more", "consume": "1", "to": "one or more" }
  ],
  "accepting": ["zero", "one or more"]
};

test(binaryNumber, [
  '', '0', '1', '00', '01', '10', '11',
  '000', '001', '010', '011', '100',
  '101', '110', '111',
  '10100011011000001010011100101110111'
]);

