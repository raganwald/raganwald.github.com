console.log('09-revisiting-product.js');

function productOperation (a, b, setOperator) {
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

  const statesAAccepts = new Set(
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => P.stateFromSet(aAcceptingState, bState))
    )
  );
  const statesBAccepts = new Set(
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => P.stateFromSet(aState, bAcceptingState))
    )
  );

  const allAcceptingStates =
    [...setOperator(statesAAccepts, statesBAccepts)];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

function setUnion (set1, set2) {
  return new Set([...set1, ...set2]);
}

function union (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setUnion)
  );
}

function setIntersection (set1, set2) {
  return new Set(
    [...set1].filter(
      element => set2.has(element)
    )
  );
}

function intersection (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setIntersection)
  );
}

function setDifference (set1, set2) {
  return new Set(
    [...set1].filter(
      element => !set2.has(element)
    )
  );
}

function difference (a, b) {
  return mergeEquivalentStates(
    productOperation(a, b, setDifference)
  );
}

const levelTwoExpressions = {
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
      fn: union2merged
    },
    '∪': {
      symbol: Symbol('∪'),
      type: 'infix',
      precedence: 10,
      fn: union
    },
    '∩': {
      symbol: Symbol('∩'),
      type: 'infix',
      precedence: 10,
      fn: intersection
    },
    '\\': {
      symbol: Symbol('-'),
      type: 'infix',
      precedence: 10,
      fn: difference
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: catenation2
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: zeroOrMore
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

// ----------

verifyEvaluateB('(a|b|c)|(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'd': true
});

verifyEvaluateB('(a|b|c)∪(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': true,
  'c': true,
  'd': true
});

verifyEvaluateB('(a|b|c)∩(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': false,
  'b': true,
  'c': true,
  'd': false
});

verifyEvaluateB('(a|b|c)\\(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': false,
  'c': false,
  'd': false
});

