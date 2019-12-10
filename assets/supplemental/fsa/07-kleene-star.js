console.log('07-kleene-star.js');

function oneOrMore (description) {
  const {
    start,
    transitions,
    accepting
  } = description;

  const withEpsilonTransitions = {
    start,
    transitions:
      transitions.concat(
        accepting.map(
          acceptingState => ({ from: acceptingState, to: start })
        )
      ),
      accepting
  };

  const oneOrMore = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          withEpsilonTransitions
        )
      )
    )
  );

  return oneOrMore;
}

function zeroOrOne (description) {
  return union2merged(description, emptyString());
}

function zeroOrMore (description) {
  return zeroOrOne(oneOrMore(description));
}

const formalRegularExpressions = {
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

const Aa = {
  "start": "empty",
  "transitions": [
    { "from": "empty", "consume": "A", "to": "Aa" },
    { "from": "empty", "consume": "a", "to": "Aa" }
  ],
  "accepting": ["Aa"]
};

verifyRecognizer(Aa, {
  '': false,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyEvaluateB('((a|A)|ε)', formalRegularExpressions, {
  '': true,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyRecognizer(zeroOrOne(Aa), {
  '': true,
  'a': true,
  'A': true,
  'aa': false,
  'Aa': false,
  'AA': false,
  'aaaAaAaAaaaAaa': false,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyRecognizer(oneOrMore(Aa), {
  '': false,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyRecognizer(zeroOrMore(Aa), {
  '': true,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyEvaluateB('(a|A)*', formalRegularExpressions, {
  '': true,
  'a': true,
  'A': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verifyEvaluateB('ab*c', formalRegularExpressions, {
  '': false,
  'a': false,
  'ac': true,
  'abc': true,
  'abbbc': true,
  'abbbbb': false
});

