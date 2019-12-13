console.log('03-compiled-building-blocks.js');

const names = (() => {
  let i = 0;

  return function * names () {
    while (true) yield `G${++i}`;
  };
})();

function emptySet () {
  const [start] = names();

  return {
    start,
    "transitions": [],
    "accepting": []
  };
}

function emptyString () {
  const [start] = names();

  return {
    start,
    "transitions": [],
    "accepting": [start]
  };
}

function literal (symbol) {
  const [start, recognized] = names();

  return {
    start,
    "transitions": [
      { "from": start, "consume": symbol, "to": recognized }
    ],
    "accepting": [recognized]
  };
}

function shuntingYardC (
  inputString,
  {
    operators,
    defaultOperator,
    escapeSymbol = '`',
    escapedValue = string => string
  }
) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const { symbol } = operatorsMap.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const typeOf =
    symbol => operatorsMap.has(symbol) ? operatorsMap.get(symbol).type : 'value';
  const isInfix =
    symbol => typeOf(symbol) === 'infix';
  const isPrefix =
    symbol => typeOf(symbol) === 'prefix';
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPrefix(symbol) || isPostfix(symbol);
  const awaitsValue =
    symbol => isInfix(symbol) || isPrefix(symbol);

  const input = inputString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === escapeSymbol) {
      if (input.length === 0) {
        error('Escape symbol ${escapeSymbol} has no following symbol');
      } else {
        const valueSymbol = input.shift();

        if (awaitingValue) {
          // push the escaped value of the symbol

          outputQueue.push(escapedValue(valueSymbol));
        } else {
          // value catenation

          input.unshift(valueSymbol);
          input.unshift(escapeSymbol);
          input.unshift(defaultOperator);
        }
        awaitingValue = false;
      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = awaitsValue(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(representationOf(symbol));
      awaitingValue = false;
    } else {
      // value catenation

      input.unshift(symbol);
      input.unshift(defaultOperator);
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operatorsMap.has(op)) {
      const { symbol: opSymbol } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function evaluateB (expression, configuration) {
  return evaluatePostfixExpression(
    shuntingYardC(
      expression, configuration
    ),
    configuration
  );
}

function verifyEvaluateA (expression, configuration, examples) {
  return verify(
    automate(evaluateA(expression, configuration)),
    examples
  );
}

function verifyEvaluateB (expression, configuration, examples) {
  return verify(
    automate(evaluateB(expression, configuration)),
    examples
  );
}

const regexA = {
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
    }
  },
  defaultOperator: undefined,
  toValue (string) {
    return literal(string);
  }
};

// ----------

verifyRecognizer(emptySet(), {
  '': false,
  '0': false,
  '1': false
});

verifyRecognizer(emptyString(), {
  '': true,
  '0': false,
  '1': false
});

verifyRecognizer(literal('0'), {
  '': false,
  '0': true,
  '1': false,
  '01': false,
  '10': false,
  '11': false
});

const emptySetRecognizer = evaluateA('∅', regexA);
const emptyStringRecognizer = evaluateA('ε', regexA);
const rRecognizer = evaluateA('r', regexA);

verifyRecognizer(emptySetRecognizer, {
  '': false,
  '0': false,
  '1': false
});

verifyRecognizer(emptyStringRecognizer, {
  '': true,
  '0': false,
  '1': false
});

verifyRecognizer(rRecognizer, {
  '': false,
  'r': true,
  'R': false,
  'reg': false,
  'Reg': false
});

verifyEvaluateA('∅', regexA, {
  '': false,
  '0': false,
  '1': false
});

verifyEvaluateA('ε', regexA, {
  '': true,
  '0': false,
  '1': false
});

verifyEvaluateA('r', regexA, {
  '': false,
  'r': true,
  'R': false,
  'reg': false,
  'Reg': false
});

verifyEvaluateB('∅', regexA, {
  '': false,
  '∅': false,
  'ε': false
});

verifyEvaluateB('`∅', regexA, {
  '': false,
  '∅': true,
  'ε': false
});

verifyEvaluateB('ε', regexA, {
  '': true,
  '∅': false,
  'ε': false
});

verifyEvaluateB('`ε', regexA, {
  '': false,
  '∅': false,
  'ε': true
});

