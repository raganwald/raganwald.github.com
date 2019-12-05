console.log('04-product-and-union.js')

// A state aggregator maps a set of states
// (such as the two states forming part of the product
// of two finite-state recognizers) to a new state.
class StateAggregator {
  constructor () {
    this.map = new Map();
    this.inverseMap = new Map();
  }

  stateFromSet (...states) {
    const materialStates = states.filter(s => s != null);

    if (materialStates.some(ms=>this.inverseMap.has(ms))) {
      error(`Surprise! Aggregating an aggregate!!`);
    }

    if (materialStates.length === 0) {
      error('tried to get an aggregate state name for no states');
    } else if (materialStates.length === 1) {
      // do not need a new state name
      return materialStates[0];
    } else {
      const key = materialStates.sort().map(s=>`(${s})`).join('');

      if (this.map.has(key)) {
        return this.map.get(key);
      } else {
        const [newState] = names();

        this.map.set(key, newState);
        this.inverseMap.set(newState, new Set(materialStates));

        return newState;
      }
    }
  }

  setFromState (state) {
    if (this.inverseMap.has(state)) {
      return this.inverseMap.get(state);
    } else {
      return new Set([state]);
    }
  }
}

function product (a, b, P = new StateAggregator()) {
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
  const start = P.stateFromSet(aStart, bStart);
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
        ({ consume, to: bTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
      );
    } else if (bTransitions.length === 0) {
      const bTo = null;
      abTransitions = aTransitions.map(
        ({ consume, to: aTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
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

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
      }

      for (const [consume, bTo] of bConsumeToMap.entries()) {
        const aTo = null;

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
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

function union2 (a, b) {
  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [null].concat(aDeclaredStates);

  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [null].concat(bDeclaredStates);

  // P is a mapping from a pair of states (or any set, but in union2 it's always a pair)
  // to a new state representing the tuple of those states
  const P = new StateAggregator();

  const productAB = product(a, b, P);
  const { start, transitions } = productAB;

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => P.stateFromSet(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => P.stateFromSet(aState, bAcceptingState))
    );

  const allAcceptingStates =
    [...new Set([...statesAAccepts, ...statesBAccepts])];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

const regexB = {
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
    }
  },
  defaultOperator: undefined,
  toValue (string) {
    return literal(string);
  }
};

// ----------


verifyRecognizer(union2(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

verifyEvaluateB('a', regexB, {
  '': false,
  'a': true,
  'A': false,
  'aa': false,
  'AA': false
});

verifyEvaluateB('A', regexB, {
  '': false,
  'a': false,
  'A': true,
  'aa': false,
  'AA': false
});

verifyEvaluateB('a|A', regexB, {
  '': false,
  'a': true,
  'A': true,
  'aa': false,
  'AA': false
});
