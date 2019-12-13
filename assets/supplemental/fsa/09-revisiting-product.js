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

const complement =
  s => difference(zeroOrMore(anySymbol()), s);

const levelTwoExpressions = {
  operators: {
    // formal regular expressions

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
    },

    // level one operators

    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: zeroOrOne
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: oneOrMore
    },
    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: anySymbol
    },
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: anyDigit
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: anyWord
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: anyWhitespace
    },

    // level two operators

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
    '¬': {
      symbol: Symbol('¬'),
      type: 'prefix',
      precedence: 40,
      fn: complement
    }
  },
  defaultOperator: '→',
  escapedValue (symbol) {
    if (symbol === 'd') {
      return digitsSymbol;
    } else if (symbol === 'w') {
      return wordSymbol;
    } else if (symbol === 's') {
      return whitespaceSymbol;
    } else {
      return symbol;
    }
  },
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

verifyEvaluateB('0|1(0|1)*', levelTwoExpressions, {
  '': false,
  'an odd number of characters': false,
  'an even number of characters': false,
  '0': true,
  '10': true,
  '101': true,
  '1010': true,
  '10101': true
});

verifyEvaluateB('.(..)*', levelTwoExpressions, {
  '': false,
  'an odd number of characters': true,
  'an even number of characters': false,
  '0': true,
  '10': false,
  '101': true,
  '1010': false,
  '10101': true
});

verifyEvaluateB('(0|1(0|1)*)∩(.(..)*)', levelTwoExpressions, {
  '': false,
  'an odd number of characters': false,
  'an even number of characters': false,
  '0': true,
  '10': false,
  '101': true,
  '1010': false,
  '10101': true
});

verifyEvaluateB('(a|b|c)\\(b|c|d)', levelTwoExpressions, {
  '': false,
  'a': true,
  'b': false,
  'c': false,
  'd': false
});

verifyEvaluateB('.*Braithwaite.*\\.*Reggie Braithwaite.*', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaiteb': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});

verifyEvaluateB('(.*\\.*Reggie )(Braithwaite.*)', levelTwoExpressions, {
  'Braithwaite': true,
  'Reg Braithwaite': true,
  'The Reg Braithwaiteb': true,
  'The Notorious Reggie Braithwaite': false,
  'Reggie, but not Braithwaite?': true,
  'Is Reggie a Braithwaite?': true
});

