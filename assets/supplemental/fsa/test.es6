function toStateMap (transitions) {
  return transitions
      .reduce(
        (acc, transition) => {
          let {
            from,
            consume,
            to
          } = transition;

          if (from == null) {
            console.log(
              `Transition ${JSON.stringify(transition)} does not have a from state. ` +
              `This is not allowed and will be ignored.`
            )
            return acc;
          }

          if (consume == null) {
            console.log(
              `Transition ${JSON.stringify(transition)} does not consume a token. ` +
              `ε-transitions are not supported by this engine and will be ignored.`
            )
            return acc;
          }

          if (to == null) {
            console.log(
              `Transition ${JSON.stringify(transition)} does not have a to state. ` +
              `Assuming that it is a transition back to ${from}.`
            )
            to = from;
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
            if (consume === existingConsume) {
              console.log(
                `Transition ${JSON.stringify(transition)} creates non-determinism ` +
                `between ${to} and ${existingTo}. ` +
                `This is not allowed and will be ignored. Please avoid this in future.`
              )
              return acc;
            }
          }

          existingTransitions.push(transition);

          return acc;
        },
        new Map()
      );
}

function automateFSA({
  start,
  accepting,
  transitions
}) {
  // map from from states to the transitions defined for that from state
  const stateMap = toStateMap(transitions);
  const acceptingStates = new Set(accepting);

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
      return acceptingStates.has(state);
    } else {
      // stopped before reaching the end is a fail
      return false;
    }
  }
}

function test(description, examples) {
  const recognizer = automateFSA(description);

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

console.log(product(theSame, three))

test(product(theSame, three, 'intersection'), [
  '0', '000', '101', '11111', '111011'
])



function epsilonRemoved ({ start, accepting, transitions }) {
  const transitionsWithoutEpsilon =
    transitions
    .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce((acc, { from, to }) => (acc.set(from, to), acc), new Map());

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

    // now add the moved transitions
    stateMapWithoutEpsilon.set(epsilonFrom, moved);

    // and remove the original from our epsilonMap
    epsilonMap.delete(epsilonFrom);
  }

  return {
    start,
    accepting,
    transitions: [...stateMapWithoutEpsilon.values()]
  };
}

function reachableFromStart ({ start, acceptimng, transitions: allTransitions }) {
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
    transitions: [...reachableMap.values()]
  };
}