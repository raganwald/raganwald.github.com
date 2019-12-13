console.log('01-evaluating-regular-expressions.js')

function error(m) {
  console.log(m);
  throw m;
}

const arithmetic = {
  operators: {
    '+': {
      symbol: Symbol('+'),
      type: 'infix',
      precedence: 1,
      fn: (a, b) => a + b
    },
    '-': {
      symbol: Symbol('-'),
      type: 'infix',
      precedence: 1,
      fn: (a, b) => a - b
    },
    '*': {
      symbol: Symbol('*'),
      type: 'infix',
      precedence: 3,
      fn: (a, b) => a * b
    },
    '/': {
      symbol: Symbol('/'),
      type: 'infix',
      precedence: 2,
      fn: (a, b) => a / b
    },
    '!': {
      symbol: Symbol('!'),
      type: 'postfix',
      precedence: 4,
      fn: function factorial(a, memo = 1) {
        if (a < 2) {
          return a * memo;
        } else {
          return factorial(a - 1, a * memo);
        }
      }
    }
  }
};

function peek(stack) {
  return stack[stack.length - 1];
}

function shuntingYardFirstCut(inputString, {
  operators
}) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const {
          symbol
        } = operatorsMap.get(something);

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
  const isPostfix =
    symbol => typeOf(symbol) === 'postfix';
  const isCombinator =
    symbol => isInfix(symbol) || isPostfix(symbol);

  const input = inputString.split('');
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
      // value catenation
      error(`values ${peek(outputQueue)} and ${symbol} cannot be catenated`);
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
      const {
        precedence
      } = operatorsMap.get(symbol);

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
      awaitingValue = isInfix(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      outputQueue.push(representationOf(symbol));
      awaitingValue = false;
    } else {
      // value catenation
      error(`values ${peek(outputQueue)} and ${symbol} cannot be catenated`);
    }
  }

  // pop remaining symbols off the stack and push them
  while (operatorStack.length > 0) {
    const op = operatorStack.pop();

    if (operatorsMap.has(op)) {
      const {
        symbol: opSymbol
      } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function shuntingYardSecondCut(inputString, {
  operators,
  defaultOperator
}) {
  const operatorsMap = new Map(
    Object.entries(operators)
  );

  const representationOf =
    something => {
      if (operatorsMap.has(something)) {
        const {
          symbol
        } = operatorsMap.get(something);

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

    if (symbol === '(' && awaitingValue) {
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
      const {
        precedence
      } = operatorsMap.get(symbol);

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
      const {
        symbol: opSymbol
      } = operatorsMap.get(op);
      outputQueue.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return outputQueue;
}

function deepEqual(obj1, obj2) {
  function isPrimitive(obj) {
    return (obj !== Object(obj));
  }

  if (obj1 === obj2) // it's just the same object. No need to compare.
    return true;

  if (isPrimitive(obj1) && isPrimitive(obj2)) // compare primitives
    return obj1 === obj2;

  if (Object.keys(obj1).length !== Object.keys(obj2).length)
    return false;

  // compare objects with same number of keys
  for (let key in obj1) {
    if (!(key in obj2)) return false; //other object doesn't have this prop
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

const pp = value => value instanceof Array ? value.map(x => x.toString()) : value;

function verify(fn, tests, ...additionalArgs) {
  try {
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = fn(example, ...additionalArgs);

        if (deepEqual(actual, expected)) {
          return 'pass';
        } else {
          return `fail: ${JSON.stringify({ example, expected: pp(expected), actual: pp(actual) })}`;
        }
      }
    )

    const failures = outcomes.filter(result => result !== 'pass');
    const numberOfFailures = failures.length;
    const numberOfPasses = numberOfTests - numberOfFailures;

    if (numberOfFailures === 0) {
      console.log(`All ${numberOfPasses} tests passing`);
    } else {
      console.log(`${numberOfFailures} tests failing: ${failures.join('; ')}`);
    }
  } catch (error) {
    console.log(`Failed to validate: ${error}`)
  }
}

function evaluatePostfixExpression (expression, {
  operators,
  toValue
}) {
  const functions = new Map(
    Object.entries(operators).map(
      ([key, { symbol, fn }]) => [symbol, fn]
    )
  );

  const stack = [];

  for (const element of expression) {
    if (typeof element === 'string') {
      stack.push(toValue(element));
    } else if (functions.has(element)) {
      const fn = functions.get(element);
      const arity = fn.length;

      if (stack.length < arity) {
        error(`Not enough values on the stack to use ${element}`)
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
  if (stack.length === 0) {
    return undefined;
  } else if (stack.length > 1) {
    error(`should only be one value to return, but there were ${stack.length}values on the stack`);
  } else {
    return stack[0];
  }
}

function evaluateFirstCut(expression, configuration) {
  return evaluatePostfixExpression(
    shuntingYardSecondCut(
      expression, configuration
    ),
    configuration
  );
}

// ----------

verify(shuntingYardFirstCut, {
  '3': ['3'],
  '2+3': ['2', '3', arithmetic.operators['+'].symbol],
  '4!': ['4', arithmetic.operators['!'].symbol],
  '3*2+4!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['!'].symbol, arithmetic.operators['+'].symbol],
  '(3*2+4)!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['+'].symbol, arithmetic.operators['!'].symbol]
}, arithmetic);

const arithmeticB = {
  operators: arithmetic.operators,
  defaultOperator: '*'
};

verify(shuntingYardSecondCut, {
  '3': ['3'],
  '2+3': ['2', '3', arithmetic.operators['+'].symbol],
  '4!': ['4', arithmetic.operators['!'].symbol],
  '3*2+4!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['!'].symbol, arithmetic.operators['+'].symbol],
  '(3*2+4)!': ['3', '2', arithmetic.operators['*'].symbol, '4', arithmetic.operators['+'].symbol, arithmetic.operators['!'].symbol],
  '2(3+4)5': ['2', '3', '4', arithmeticB.operators['+'].symbol, '5', arithmeticB.operators['*'].symbol, arithmeticB.operators['*'].symbol],
  '3!2': ['3', arithmeticB.operators['!'].symbol, '2', arithmeticB.operators['*'].symbol]
}, arithmeticB);

const arithmeticC = {
  operators: arithmetic.operators,
  defaultOperator: '*',
  toValue: string => Number.parseInt(string, 10)
};

verify(evaluateFirstCut, {
  '': undefined,
  '3': 3,
  '2+3': 5,
  '4!': 24,
  '3*2+4!': 30,
  '(3*2+4)!': 3628800,
  '2(3+4)5': 70,
  '3!2': 12
}, arithmeticC);

