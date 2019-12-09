console.log('08-render.js');

const extended = {
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

    // extended operators

    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => union2merged(emptyString(), a)
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => catenation2(a, zeroOrMore(a))
    }
  },
  defaultOperator: '→',
  toValue (string) {
    return literal(string);
  }
};

function p (expr) {
  if (expr.length === 1) {
    return expr;
  } else if (expr[0] === '`') {
    return expr;
  } else {
    return `(${expr})`;
  }
};

function atomic ({ operator, fn = () => operator }) {
  const symbol = Symbol(operator);
  const type = 'atomic';

  return { symbol, type, fn };
}

function infix ({  operator, precedence, fn = (a, b) => `${p(a)}${operator}${p(b)}` }) {
  const symbol = Symbol(operator);
  const type = 'infix';

  return { symbol, type, precedence, fn };
}

function postfix ({ operator, precedence, fn = a => `${p(a)}${operator}` }) {
  const symbol = Symbol(operator);
  const type = 'postfix';

  return { symbol, type, precedence, fn };
}

function reconstitute ({ operators: originalOperators, defaultOperator }, etcOperators = {}) {

  const factories = { atomic, infix, postfix };

  const operators = etcOperators;

  for (const [operator, { symbol, type, precedence }] of Object.entries(originalOperators)) {
    operators[operator] = factories[type]({ operator, precedence });
  }

  const needsToBeEscaped = new Set([Object.keys(originalOperators)]);

  function toValue (string) {
    if (needsToBeEscaped.has(string)) {
      return '`' + string;
    } else {
      return string;
    }
  };

  return { operators, defaultOperator, toValue };
}

function render (expression, etcOperators = {}) {
  return evaluateB(expression, reconstitute(formalRegularExpressions, etcOperators));
}

const quantifications = {
  '?': postfix({ operator: '?', precedence: 30, fn: a => `ε|${p(a)}` }),
  '+': postfix({ operator: '+', precedence: 30, fn: a => `${p(a)}${p(a)}*` })
};

// ----------

verifyEvaluateB('(R|r)eg(ε|gie(ε|ee*!))', formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

verifyEvaluateB('(R|r)eg(gie(e+!)?)?', extended, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

verifyEvaluateB(render('(R|r)eg(ε|gie(ε|ee*!))'), formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

verifyEvaluateB(render('(R|r)eg(gie(e+!)?)?', quantifications), formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

