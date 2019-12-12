console.log('08-transpiler.js');

function dup (a) {
  const {
    start: oldStart,
    transitions: oldTransitions,
    accepting: oldAccepting,
    allStates
  } = validatedAndProcessed(a);

  const map = new Map(
    [...allStates].map(
      old => [old, names().next().value]
    )
  );

  const start = map.get(oldStart);
  const transitions =
    oldTransitions.map(
      ({ from, consume,  to }) => ({ from: map.get(from), consume, to: map.get(to) })
    );
  const accepting =
    oldAccepting.map(
      state => map.get(state)
    )

  return { start, transitions, accepting };
}

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
      fn: a => catenation2(a, zeroOrMore(dup(a)))
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

const toValueExpr = string => {
  if ('∅ε|→*()'.indexOf(string) >= 0) {
    return '`' + string;
  } else {
    return string;
  }
};

const transpile0to0 = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    }
  },
  defaultOperator: '→',
  escapeSymbol: '`',
  toValue: toValueExpr
};

const transpile1to0q = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    },
    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    }
  },
  defaultOperator: '→',
  escapeSymbol: '`',
  toValue: toValueExpr
};

const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const UNDERSCORE ='_';
const PUNCTUATION = `~!@#$%^&*()_+=-\`-={}|[]\\:";'<>?,./`;
const WHITESPACE = ' \t\r\n';

const TOTAL_ALPHABET = ALPHA + DIGITS + PUNCTUATION + WHITESPACE;

const dotExpr =
  TOTAL_ALPHABET
    .split('')
    .map(toValueExpr)
    .join('|');

const transpile1to0qd = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    },
    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    },
    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: () => dotExpr
    }
  },
  defaultOperator: '→',
  escapeSymbol: '`',
  toValue: toValueExpr
};

const digitsExpression = DIGITS.split('').join('|');
const wordExpression = (ALPHA + DIGITS + UNDERSCORE).split('').join('|');
const whitespaceExpression = WHITESPACE.split('').join('|');

const digitsSymbol = Symbol('`d');
const wordSymbol = Symbol('`w');
const whitespaceSymbol = Symbol('`s');

const transpile1to0qs = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    },
    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    },
    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: () => dotExpr
    },
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: () => digitsExpression
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: () => wordExpression
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: () => whitespaceExpression
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
  toValue: toValueExpr
};

function times (a, b) {
  const n = Number.parseInt(b, 10);

  if (typeof n === "number") {
    return `(${new Array(n).fill(p(a)).join('')})`;
  } else {
    error(`Can't parse ${a}⊗${b}, because ${b} does not appear to be a number.`);
  }
}

const transpile1to0qsm = {
  operators: {
    '∅': {
      symbol: Symbol('∅'),
      type: 'atomic',
      fn: () => '∅'
    },
    'ε': {
      symbol: Symbol('ε'),
      type: 'atomic',
      fn: () => 'ε'
    },
    '|': {
      symbol: Symbol('|'),
      type: 'infix',
      precedence: 10,
      fn: (a, b) => `${p(a)}|${p(b)}`
    },
    '→': {
      symbol: Symbol('→'),
      type: 'infix',
      precedence: 20,
      fn: (a, b) => `${p(a)}→${p(b)}`
    },
    '*': {
      symbol: Symbol('*'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}*`
    },
    '?': {
      symbol: Symbol('?'),
      type: 'postfix',
      precedence: 30,
      fn: a => `ε|${p(a)}`
    },
    '+': {
      symbol: Symbol('+'),
      type: 'postfix',
      precedence: 30,
      fn: a => `${p(a)}${p(a)}*`
    },
    '.': {
      symbol: Symbol('.'),
      type: 'atomic',
      fn: () => dotExpr
    },
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: () => digitsExpression
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: () => wordExpression
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: () => whitespaceExpression
    },
    '⊗': {
      symbol: Symbol('⊗'),
      type: 'infix',
      precedence: 25,
      fn: times
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
  toValue: toValueExpr
};

function evaluate (
  expression,
  compilerConfiguration = formalRegularExpressions,
  transpilerConfiguration = transpile1to0qsm
) {
  const formalExpression = evaluateB(expression, transpilerConfiguration);
  const finiteStateRecognizer = evaluateB(formalExpression, compilerConfiguration);

  return finiteStateRecognizer;
}

function verifyEvaluate (expression, ...args) {
  const examples = args[args.length - 1];
  const configs = args.slice(0, args.length - 2);

  return verify(
    automate(evaluate(expression, ...configs)),
    examples
  );
}

// ----------

const reggieLevel0 = '(R|r)eg(ε|gie(ε|ee*!))';

verifyEvaluateB(reggieLevel0, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const reggieLevel1 = '(R|r)eg(gie(e+!)?)?';

verifyEvaluateB(reggieLevel1, extended, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const reggieCompiledToLevel0 = evaluateB(reggieLevel0, transpile0to0);

verifyEvaluateB(reggieCompiledToLevel0, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const reggieCompiledToLevel0q = evaluateB(reggieLevel1, transpile1to0q);

verifyEvaluateB(reggieCompiledToLevel0q, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const anyLevel1 = 'a.*y';

const anyCompiledToLevel0qd = evaluateB(anyLevel1, transpile1to0qd);

verifyEvaluateB(anyCompiledToLevel0qd, formalRegularExpressions, {
  '': false,
  'ay': true,
  'away': true,
  'a!?y': true,
  'a y': true,
  'archaeoastronomy': true,
  'a14y': true,
  'Anthropomorphically': false
});

const phoneNumberLevel1qs = '((1( |-))?`d`d`d( |-))?`d`d`d( |-)`d`d`d`d';
const phoneNumberCompiledToLevel0qs = evaluateB(phoneNumberLevel1qs, transpile1to0qs);

verifyEvaluateB(phoneNumberCompiledToLevel0qs, formalRegularExpressions, {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});

verifyEvaluate(phoneNumberLevel1qs, {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});

const phoneNumberLevel1qsm = '((1( |-))?`d⊗3( |-))?`d⊗3( |-)`d⊗4';
const phoneNumberCompiledToLevel0qsm = evaluateB(phoneNumberLevel1qsm, transpile1to0qsm);

verifyEvaluateB(phoneNumberCompiledToLevel0qsm, formalRegularExpressions, {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});

