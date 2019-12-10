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