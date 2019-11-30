console.log('13-compiling-formal-regular-expressions.js');

const operatorToPrecedence = new Map(
  Object.entries({
    '|': 1,
    '→': 2,
    '*': 3
  })
);

function peek (stack) {
  return stack[stack.length - 1];
}

function shuntingYardVersion1 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];

  for (const symbol of input) {
    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
    } else {
      outputQueue.push(symbol);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

const binaryOperators = new Set(['→', '|']);

function shuntingYardVersion2 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0) {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

function shuntingYardVersion3 (formalRegularExpressionString) {
  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('∩');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(op);
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (operatorToPrecedence.has(symbol)) {
      const precedence = operatorToPrecedence.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorToPrecedence.get(peek(operatorStack));

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(op);
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = binaryOperators.has(symbol);
    } else if (awaitingValue) {
      // as expected, go striaght to the output

      outputQueue.push(symbol);
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    outputQueue.push(op);
  }

  return outputQueue;
}

const formalOperators = new Map(
  Object.entries({
    '∅': { symbol: Symbol('∅'), precedence: 99, arity: 0, fn: () => EMPTY_SET },
    'ε': { symbol: Symbol('ε'), precedence: 99, arity: 0, fn: () => EMPTY_STRING },
    '|': { symbol: Symbol('|'), precedence: 1, arity: 2, fn: union },
    '→': { symbol: Symbol('→'), precedence: 2, arity: 2, fn: catenation },
    '*': { symbol: Symbol('*'), precedence: 3, arity: 1, fn: kleeneStar }
  })
);

function basicShuntingYard (formalRegularExpressionString, operators = formalOperators) {
  const valueOf =
    something => {
      if (operators.has(something)) {
        const { symbol, arity } = operators.get(something);

        return symbol;
      } else if (typeof something === 'string') {
        return something;
      } else {
        error(`${something} is not a value`);
      }
    };
  const isCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity > 0;
  const isBinaryCombinator =
    symbol => operators.has(symbol) && operators.get(symbol).arity === 2;

  const input = formalRegularExpressionString.split('');
  const operatorStack = [];
  const outputQueue = [];
  let awaitingValue = true;

  while (input.length > 0) {
    const symbol = input.shift();

    if (symbol === '\\') {
      if (input.length === 0) {
        error('Escape character has nothing to follow');
      } else {
        const valueSymbol = input.shift();

        // treat this new symbol as a value,
        // no matter what
        if (awaitingValue) {
          // push the string value of the valueSymbol
          // do not use valueOf

          outputQueue.push(valueSymbol);
          awaitingValue = false;
        } else {
          // implicit catenation

          input.unshift(valueSymbol);
          input.unshift('\\');
          input.unshift('->');
          awaitingValue = false;
        }

      }
    } else if (symbol === '(' && awaitingValue) {
      // opening parenthesis case, going to build
      // a value
      operatorStack.push(symbol);
      awaitingValue = true;
    } else if (symbol === '(') {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    } else if (symbol === ')') {
      // closing parenthesis case, clear the
      // operator stack

      while (operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const op = operatorStack.pop();

        outputQueue.push(valueOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isCombinator(symbol)) {
      const { arity, precedence } = operators.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (arity > 0 && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operators.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          outputQueue.push(valueOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = isBinaryCombinator(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(valueOf(symbol));
      awaitingValue = false;
    } else {
      // implicit catenation

      input.unshift(symbol);
      input.unshift('→');
      awaitingValue = false;
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    
    if (operators.has(op)) {
      const { symbol: opSymbol } = operators.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function rpnToDescription (rpn, operators = formalOperators) {
  const symbols = new Map(
    [...operators.entries()].map(
      ([key, { symbol, arity, fn }]) => [symbol, { arity, fn }]
    )
  );

  if (rpn.length === 0) {
    return EMPTY_SET;
  } else {
    const stack = [];

    for (const element of rpn) {
      if (typeof element === 'string') {
        stack.push(just1(element));
      } else if (symbols.has(element)) {
        const { arity, fn } = symbols.get(element);

        if (stack.length < arity) {
          error(`Not emough values on the stack to use ${element}`)
        } else {
          const args = [];

          for (let counter = 0; counter < arity; ++counter) {
            args.unshift(stack.pop());
          }

          stack.push(fn.apply(null, args))
        }
      } else {
        error(`Don't know what to do with ${element}'`)
      }
    }
    if (stack.length != 1) {
      error(`should only be one value to return, but there were ${stack.length}`);
    } else {
      return stack[0];
    }
  }
}

function toFiniteStateRecognizer (formalRegularExpression, operators = formalOperators) {
  return rpnToDescription(
    basicShuntingYard(formalRegularExpression, operators),
    operators
  );
}

// ----------

const binary2 = union(just1('0'), catenation(just1('1'), kleeneStar(union(just('0'), just('1')))));

verify(binary2, {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true,
  '10100011011000001010011100101110111': true
});

const regMaybeInald = catenation(
  just('r'),
  just('e'),
  just('g'),
  union(
    EMPTY_STRING,
    catenation(
      just('i'),
      just('n'),
      just('a'),
      just('l'),
      just('d')
    )
  )
);

verify(regMaybeInald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

verify(toFiniteStateRecognizer(''), {
  '': false,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('ε'), {
  '': true,
  '0': false,
  '1': false,
  '00': false,
  '01': false,
  '10': false,
  '11': false,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0*'), {
  '': true,
  '0': true,
  '1': false,
  '00': true,
  '01': false,
  '10': false,
  '11': false,
  '000': true,
  '001': false,
  '010': false,
  '011': false,
  '100': false,
  '101': false,
  '110': false,
  '111': false
});

verify(toFiniteStateRecognizer('0|(1(0|1)*)'), {
  '': false,
  '0': true,
  '1': true,
  '00': false,
  '01': false,
  '10': true,
  '11': true,
  '000': false,
  '001': false,
  '010': false,
  '011': false,
  '100': true,
  '101': true,
  '110': true,
  '111': true
});
