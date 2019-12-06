console.log('07-kleene-star.js');

function kleeneStar (description) {
  const [newStart] = names();

  const {
    start: oldStart,
    transitions: oldTransitions,
    accepting: oldAccepting
  } = description;

  // step one: handle the zero or one case

  const zeroOrOneWithEpsilonTransition = {
    start: newStart,
    transitions:
      [ { "from": newStart, "to": oldStart } ].concat(oldTransitions),
    accepting: oldAccepting.concat([newStart])
  };

  const zeroOrOne = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          zeroOrOneWithEpsilonTransition
        )
      )
    )
  );

  // step two: handle the zero or more case

  const {
    start: zeroOrOneStart,
    transitions: zeroOrOneTransitions,
    accepting: zeroOrOneAccepting
  } = zeroOrOne;

  const zeroOrMoreWithEpsilonTransitions = {
    start: zeroOrOneStart,
    transitions:
      zeroOrOneTransitions.concat(
        zeroOrOneAccepting.map(
          state => ({ from: state, to: zeroOrOneStart })
        )
      ),
    accepting: zeroOrOneAccepting
  };

  const zeroOrMore = reachableFromStart(
    mergeEquivalentStates(
      powerset(
        removeEpsilonTransitions(
          zeroOrMoreWithEpsilonTransitions
        )
      )
    )
  );

  return zeroOrMore;
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
      fn: union2
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
      fn: kleeneStar
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

verifyRecognizer(kleeneStar(Aa), {
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

verifyEvaluateB('(a|A)*', formalRegularExpressions, {
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

verifyEvaluateB('ab*c', formalRegularExpressions, {
  '': false,
  'a': false,
  'ac': true,
  'abc': true,
  'abbbc': true,
  'abbbbb': false
});
