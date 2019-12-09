console.log('08-transpiler.js');

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
  toValue (string) {
    if ('∅ε|→*'.indexOf(string) >= 0) {
      return '`' + string;
    } else {
      return string;
    }
  }
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
  toValue (string) {
    if ('∅ε|→*'.indexOf(string) >= 0) {
      return '`' + string;
    } else {
      return string;
    }
  }
};

const ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '1234567890';
const UNDERSCORE ='_';
const WORD = ALPHA + DIGITS + UNDERSCORE;
const WHITESPACE = ' \t\r\n';

const DIGITS_EXPR = DIGITS.split('').join('|');
const WORD_EXPR = WORD.split('').join('|');
const WHITESPACE_EXPR = WHITESPACE.split('').join('|');

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
    '__DIGITS__': {
      symbol: digitsSymbol,
      type: 'atomic',
      fn: () => DIGITS_EXPR
    },
    '__WORD__': {
      symbol: wordSymbol,
      type: 'atomic',
      fn: () => WORD_EXPR
    },
    '__WHITESPACE__': {
      symbol: whitespaceSymbol,
      type: 'atomic',
      fn: () => WHITESPACE_EXPR
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
    if ('∅ε|→*'.indexOf(string) >= 0) {
      return '`' + string;
    } else {
      return string;
    }
  }
};

function evaluate (
  expression,
  compilerConfiguration = formalRegularExpressions,
  transpilerConfiguration = transpile1to0qs
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

const beforeLevel0 = '(R|r)eg(ε|gie(ε|ee*!))';

verifyEvaluateB(beforeLevel0, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const afterLevel0 = evaluateB(beforeLevel0, transpile0to0);

verifyEvaluateB(afterLevel0, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const beforeLevel1q = '(R|r)eg(gie(e+!)?)?';
const afterLevel1q = evaluateB(beforeLevel1q, transpile1to0q);

verifyEvaluateB(afterLevel1q, formalRegularExpressions, {
  '': false,
  'r': false,
  'reg': true,
  'Reg': true,
  'Regg': false,
  'Reggie': true,
  'Reggieeeeeee!': true
});

const beforeLevel1qs = '((1( |-))?`d`d`d( |-))?`d`d`d( |-)`d`d`d`d';
const afterLevel1qs = evaluateB(beforeLevel1qs, transpile1to0qs);

verifyEvaluateB(afterLevel1qs, formalRegularExpressions, {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});

verifyEvaluate('((1( |-))?`d`d`d( |-))?`d`d`d( |-)`d`d`d`d', {
  '': false,
  '1234': false,
  '123 4567': true,
  '987-6543': true,
  '416-555-1234': true,
  '1 416-555-0123': true,
  '011-888-888-8888!': false
});
