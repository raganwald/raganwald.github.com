console.log('01-base.js');

function error(m) {
  console.log(m);
  throw m;
}

function peek(stack) {
  return stack[stack.length - 1];
}

function shuntingYard (
  infixExpression,
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

  const input = infixExpression.split('');
  const operatorStack = [];
  const reversePolishRepresentation = [];
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

          reversePolishRepresentation.push(escapedValue(valueSymbol));
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

        reversePolishRepresentation.push(representationOf(op));
      }

      if (peek(operatorStack) === '(') {
        operatorStack.pop();
        awaitingValue = false;
      } else {
        error('Unbalanced parentheses');
      }
    } else if (isPrefix(symbol)) {
      if (awaitingValue) {
        const { precedence } = operatorsMap.get(symbol);

        // pop higher-precedence operators off the operator stack
        while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
          const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

          if (precedence < opPrecedence) {
            const op = operatorStack.pop();

            reversePolishRepresentation.push(representationOf(op));
          } else {
            break;
          }
        }

        operatorStack.push(symbol);
        awaitingValue = awaitsValue(symbol);
      } else {
        // value catenation

        input.unshift(symbol);
        input.unshift(defaultOperator);
        awaitingValue = false;
      }
    } else if (isCombinator(symbol)) {
      const { precedence } = operatorsMap.get(symbol);

      // pop higher-precedence operators off the operator stack
      while (isCombinator(symbol) && operatorStack.length > 0 && peek(operatorStack) !== '(') {
        const opPrecedence = operatorsMap.get(peek(operatorStack)).precedence;

        if (precedence < opPrecedence) {
          const op = operatorStack.pop();

          reversePolishRepresentation.push(representationOf(op));
        } else {
          break;
        }
      }

      operatorStack.push(symbol);
      awaitingValue = awaitsValue(symbol);
    } else if (awaitingValue) {
      // as expected, go straight to the output

      reversePolishRepresentation.push(representationOf(symbol));
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
      reversePolishRepresentation.push(opSymbol);
    } else {
      error(`Don't know how to push operator ${op}`);
    }
  }

  return reversePolishRepresentation;
}

function stateMachine (representationList, {
  operators,
  toValue
}) {
  const functions = new Map(
    Object.entries(operators).map(
      ([key, { symbol, fn }]) => [symbol, fn]
    )
  );

  const stack = [];

  for (const element of representationList) {
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
    error(`should only be one value to return, but there were ${stack.length} values on the stack`);
  } else {
    return stack[0];
  }
}

// ----------

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
      fn: function factorial (a, memo = 1) {
        if (a < 2) {
          return a * memo;
        } else {
          return factorial(a - 1, a * memo);
        }
      }
    }
  },
  defaultOperator: '*',
  toValue: n => +n
};

// ----------

function evaluate (expression, definition) {
  return stateMachine(
    shuntingYard(
      expression, definition
    ),
    definition
  );
}

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

// A state aggregator maps a set of states
// (such as the two states forming part of the product
// of two finite-state recognizers) to a new state.
class StateAggregator {
  constructor () {
    this.map = new Map();
    this.inverseMap = new Map();
  }

  stateFromSet (...states) {
    const materialStates = states.filter(s => s != null);

    if (materialStates.some(ms => this.inverseMap.has(ms))) {
      error(`Surprise! Aggregating an aggregate!!`);
    }

    if (materialStates.length === 0) {
      error('tried to get an aggregate state name for no states');
    } else if (materialStates.length === 1) {
      // do not need a new state name
      return materialStates[0];
    } else {
      const key = materialStates.sort().map(s=>`(${s})`).join('');

      if (this.map.has(key)) {
        return this.map.get(key);
      } else {
        const [newState] = names();

        this.map.set(key, newState);
        this.inverseMap.set(newState, new Set(materialStates));

        return newState;
      }
    }
  }

  setFromState (state) {
    if (this.inverseMap.has(state)) {
      return this.inverseMap.get(state);
    } else {
      return new Set([state]);
    }
  }
}

// NOTA BENE: `product` is "unsafe" in that it
// recycles some of the states from its input
// descriptions
function product (a, b, P = new StateAggregator()) {
  const {
    stateMap: aStateMap,
    start: aStart
  } = validatedAndProcessed(a);
  const {
    stateMap: bStateMap,
    start: bStart
  } = validatedAndProcessed(b);

  // R is a collection of states "remaining" to be analyzed
  // it is a map from the product's state name to the individual states
  // for a and b
  const R = new Map();

  // T is a collection of states already analyzed
  // it is a map from a product's state name to the transitions
  // for that state
  const T = new Map();

  // seed R
  const start = P.stateFromSet(aStart, bStart);
  R.set(start, [aStart, bStart]);

  while (R.size > 0) {
    const [[abState, [aState, bState]]] = R.entries();
    const aTransitions = aState != null ? (aStateMap.get(aState) || []) : [];
    const bTransitions = bState != null ? (bStateMap.get(bState) || []) : [];

    let abTransitions = [];

    if (T.has(abState)) {
      error(`Error taking product: T and R both have ${abState} at the same time.`);
    }

    if (aTransitions.length === 0 && bTransitions.length == 0) {
      // dead end for both
      // will add no transitions
      // we put it in T just to avoid recomputing this if it's referenced again
      T.set(abState, []);
    } else if (aTransitions.length === 0) {
      const aTo = null;
      abTransitions = bTransitions.map(
        ({ consume, to: bTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
      );
    } else if (bTransitions.length === 0) {
      const bTo = null;
      abTransitions = aTransitions.map(
        ({ consume, to: aTo }) => ({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo })
      );
    } else {
      // both a and b have transitions
      const aConsumeToMap =
        aTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );
      const bConsumeToMap =
        bTransitions.reduce(
          (acc, { consume, to }) => (acc.set(consume, to), acc),
          new Map()
        );

      for (const { from, consume, to: aTo } of aTransitions) {
        const bTo = bConsumeToMap.has(consume) ? bConsumeToMap.get(consume) : null;

        if (bTo != null) {
          bConsumeToMap.delete(consume);
        }

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
      }

      for (const [consume, bTo] of bConsumeToMap.entries()) {
        const aTo = null;

        abTransitions.push({ from: abState, consume, to: P.stateFromSet(aTo, bTo), aTo, bTo });
      }
    }

    T.set(abState, abTransitions);

    for (const { to, aTo, bTo } of abTransitions) {
      // more work remaining?
      if (!T.has(to) && !R.has(to)) {
        R.set(to, [aTo, bTo]);
      }
    }

    R.delete(abState);
  }

  const accepting = [];

  const transitions =
    [...T.values()].flatMap(
      tt => tt.map(
        ({ from, consume, to }) => ({ from, consume, to })
      )
    );

  return { start, accepting, transitions };

}

function union2 (a, b) {
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

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => P.stateFromSet(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => P.stateFromSet(aState, bAcceptingState))
    );

  const allAcceptingStates =
    [...new Set([...statesAAccepts, ...statesBAccepts])];

  const { stateSet: reachableStates } = validatedAndProcessed(productAB);
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return { start, accepting, transitions };
}

const keyS =
  (transitions, accepting) => {
    const stringifiedTransitions =
      transitions
        .map(({ consume, to }) => `${consume}-->${to}`)
        .sort()
        .join(', ');
    const acceptingSuffix = accepting ? '-->*' : '';

    return `[${stringifiedTransitions}]${acceptingSuffix}`;
  };

function mergeEquivalentStates (description) {
  searchForDuplicate: while (true) {
    let {
      start,
      transitions: allTransitions,
      accepting,
      states,
      stateMap,
      acceptingSet
    } = validatedAndProcessed(description);

    const statesByKey = new Map();

    for (const state of states) {
      const stateTransitions = stateMap.get(state) || [];
      const isAccepting = acceptingSet.has(state);
      const key = keyS(stateTransitions, isAccepting);

      if (statesByKey.has(key)) {
        // found a dup!
        const originalState = statesByKey.get(key);

        if (start === state) {
          // point start to original
          start = originalState;
        }

        // remove duplicate's transitions
        allTransitions = allTransitions.filter(
          ({ from }) => from !== state
        );

        // rewire all former incoming transitions
        allTransitions = allTransitions.map(
          ({ from, consume, to }) => ({
            from, consume, to: (to === state ? originalState : to)
          })
        );

        if (isAccepting) {
          // remove state from accepting
          accepting = accepting.filter(s => s !== state)
        }

        // reset description
        description = { start, transitions: allTransitions, accepting };

        // and then start all over again
        continue searchForDuplicate;
      } else {
        statesByKey.set(key, state);
      }
    }
    // no duplicates found
    break;
  }

  return description;
}

function union2merged (a, b) {
  return mergeEquivalentStates(
    union2(a, b)
  );
}

function epsilonCatenate (a, b) {
  const joinTransitions =
    a.accepting.map(
      from => ({ from, to: b.start })
    );

  return {
    start: a.start,
    accepting: b.accepting,
    transitions:
      a.transitions
        .concat(joinTransitions)
        .concat(b.transitions)
  };
}

function removeEpsilonTransitions ({ start, accepting, transitions }) {
  const acceptingSet = new Set(accepting);
  const transitionsWithoutEpsilon =
    transitions
      .filter(({ consume }) => consume != null);
  const stateMapWithoutEpsilon = toStateMap(transitionsWithoutEpsilon);
  const epsilonMap =
    transitions
      .filter(({ consume }) => consume == null)
      .reduce(
          (acc, { from, to }) => {
            const toStates = acc.has(from) ? acc.get(from) : new Set();

            toStates.add(to);
            acc.set(from, toStates);
            return acc;
          },
          new Map()
        );

  const epsilonQueue = [...epsilonMap.entries()];
  const epsilonFromStatesSet = new Set(epsilonMap.keys());

  const outerBoundsOnNumberOfRemovals = transitions.length;
  let loops = 0;

  while (epsilonQueue.length > 0 && loops++ <= outerBoundsOnNumberOfRemovals) {
    let [epsilonFrom, epsilonToSet] = epsilonQueue.shift();
    const allEpsilonToStates = [...epsilonToSet];

    // special case: We can ignore self-epsilon transitions (e.g. a-->a)
    const epsilonToStates = allEpsilonToStates.filter(
      toState => toState !== epsilonFrom
    );

    // we defer resolving destinations that have epsilon transitions
    const deferredEpsilonToStates = epsilonToStates.filter(s => epsilonFromStatesSet.has(s));
    if (deferredEpsilonToStates.length > 0) {
      // defer them
      epsilonQueue.push([epsilonFrom, deferredEpsilonToStates]);
    } else {
      // if nothing to defer, remove this from the set
      epsilonFromStatesSet.delete(epsilonFrom);
    }

    // we can immediately resolve destinations that themselves don't have epsilon transitions
    const immediateEpsilonToStates = epsilonToStates.filter(s => !epsilonFromStatesSet.has(s));
    for (const epsilonTo of immediateEpsilonToStates) {
      const source =
        stateMapWithoutEpsilon.get(epsilonTo) || [];
      const potentialToMove =
        source.map(
          ({ consume, to }) => ({ from: epsilonFrom, consume, to })
        );
      const existingTransitions = stateMapWithoutEpsilon.get(epsilonFrom) || [];

      // filter out duplicates
      const needToMove = potentialToMove.filter(
        ({ consume: pConsume, to: pTo }) =>
          !existingTransitions.some(
            ({ consume: eConsume, to: eTo }) => pConsume === eConsume && pTo === eTo
          )
      );
      // now add the moved transitions
      stateMapWithoutEpsilon.set(epsilonFrom, existingTransitions.concat(needToMove));

      // special case!
      if (acceptingSet.has(epsilonTo)) {
        acceptingSet.add(epsilonFrom);
      }
    }
  }

  if (loops > outerBoundsOnNumberOfRemovals) {
    error("Attempted to remove too many epsilon transitions. Investigate possible loop.");
  } else {
    return {
      start,
      accepting: [...acceptingSet],
      transitions: [
        ...stateMapWithoutEpsilon.values()
      ].flatMap( tt => tt )
    };
  }
}

function reachableFromStart ({ start, accepting: allAccepting, transitions: allTransitions }) {
  const stateMap = toStateMap(allTransitions, true);
  const reachableMap = new Map();
  const R = new Set([start]);

  while (R.size > 0) {
    const [state] = [...R];
    R.delete(state);
    const transitions = stateMap.get(state) || [];

    // this state is reachable
    reachableMap.set(state, transitions);

    const reachableFromThisState =
      transitions.map(({ to }) => to);

    const unprocessedReachableFromThisState =
      reachableFromThisState
        .filter(to => !reachableMap.has(to) && !R.has(to));

    for (const reachableState of unprocessedReachableFromThisState) {
      R.add(reachableState);
    }
  }

  const transitions = [...reachableMap.values()].flatMap(tt => tt);

  // prune unreachable states from the accepting set
  const reachableStates = new Set(
    [start].concat(
      transitions.map(({ to }) => to)
    )
  );

  const accepting = allAccepting.filter( state => reachableStates.has(state) );

  return {
    start,
    transitions,
    accepting
  };
}

// NOTA BENE: `powerset` is unsafe:
// it recycle some of its input states
function powerset (description, P = new StateAggregator()) {
  const {
    start: nfaStart,
    acceptingSet: nfaAcceptingSet,
    stateMap: nfaStateMap
  } = validatedAndProcessed(description, true);

  // the final set of accepting states
  const dfaAcceptingSet = new Set();

  // R is the work "remaining" to be analyzed
  // organized as a set of states to process
  const R = new Set([ nfaStart ]);

  // T is a collection of states already analyzed
  // it is a map from the state name to the transitions
  // from that state
  const T = new Map();

  while (R.size > 0) {
    const [stateName] = [...R];
    R.delete(stateName);

    // all powerset states represent sets of state,
    // with the degenerate case being a state that only represents
    // itself. stateSet is the full set represented
    // by stateName
    const stateSet = P.setFromState(stateName);

    // get the aggregate transitions across all states
    // in the set
    const aggregateTransitions =
      [...stateSet].flatMap(s => nfaStateMap.get(s) || []);

    // a map from a symbol consumed to the set of
    // destination states
    const symbolToStates =
      aggregateTransitions
        .reduce(
          (acc, { consume, to }) => {
            const toStates = acc.has(consume) ? acc.get(consume) : new Set();

            toStates.add(to);
            acc.set(consume, toStates);
            return acc;
          },
          new Map()
        );

    const dfaTransitions = [];

  	for (const [consume, toStates] of symbolToStates.entries()) {
      const toStatesName = P.stateFromSet(...toStates);

      dfaTransitions.push({ from: stateName, consume, to: toStatesName });

      const hasBeenDone = T.has(toStatesName);
      const isInRemainingQueue = R.has(toStatesName)

      if (!hasBeenDone && !isInRemainingQueue) {
        R.add(toStatesName);
      }
    }

    T.set(stateName, dfaTransitions);

    const anyStateIsAccepting =
      [...stateSet].some(s => nfaAcceptingSet.has(s));

    if (anyStateIsAccepting) {
      dfaAcceptingSet.add(stateName);
    }

  }

  return {
    start: nfaStart,
    accepting: [...dfaAcceptingSet],
    transitions:
      [...T.values()]
        .flatMap(tt => tt)
  };
}

function catenation2 (a, b) {
  return powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(a, b)
      )
    )
  );
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

function toStateMap (transitions, allowNFA = false) {
  return transitions
      .reduce(
        (acc, transition) => {
          let {
            from,
            consume,
            to
          } = transition;

          if (from == null) {
            error(
              `Transition ${JSON.stringify(transition)} does not have a from state. ` +
              `This is not allowed.`
            );
          }

          if (consume == null) {
            error(
               `Transition ${JSON.stringify(transition)} does not consume a token. ` +
              `ε-transitions are not allowed.`
            );
          }

          if (to == null) {
            error(
              `Transition ${JSON.stringify(transition)} does not have a to state. ` +
              `This is not allowed.`
            );
          }

          if (!acc.has(from)) {
            acc.set(from, []);
          }

          const existingTransitions = acc.get(from);

          for (const { consume: existingConsume, to: existingTo } of existingTransitions) {
            if (consume === existingConsume && to === existingTo) {
              console.log(
                `Transition ${JSON.stringify(transition)} already exists. ` +
                `Duplicates will be ignored. Please avoid this in future.`
              )
              return acc;
            }
            if (!allowNFA && consume === existingConsume) {
              error(
                `Transition ${JSON.stringify(transition)} creates non-determinism ` +
                `between ${to} and ${existingTo}. ` +
                `This is not allowed.`
              );
            }
          }

          existingTransitions.push(transition);

          return acc;
        },
        new Map()
      );
}

function toAlphabetSet (transitions) {
  return new Set(
    transitions.map(
      ({ consume }) => consume
    )
  )
}

// only handles states in the transition table
function toStateSet (transitions) {
  return new Set(
    transitions.reduce(
      (acc, { from, to }) => {
        acc.add(from);
        acc.add(to);
        return acc;
      },
      new Set()
    )
  )
}

function allStatesFor ({ start, transitions, accepting }) {
  return new Set(
    transitions.reduce(
      (acc, { from, to }) => {
        acc.add(from);
        acc.add(to);
        return acc;
      },
      new Set([start, ...accepting])
    )
  )
}

function validatedAndProcessed ({
  alphabet,
  states,
  start,
  transitions,
  accepting
}, allowNFA = false) {
  const alphabetSet = toAlphabetSet(transitions);
  const stateMap = toStateMap(transitions, allowNFA);
  const stateSet = toStateSet(transitions);
  const acceptingSet = new Set(accepting);
  const allStates = allStatesFor({ start, transitions, accepting });

  // validate alphabet if present
  if (alphabet != null) {
    const declaredAlphabetSet = new Set(alphabet.split(''));

    const undeclaredSymbols =
      [...alphabetSet]
        .filter(
          sym => !declaredAlphabetSet.has(sym)
        )
    	.map(x => `'${x}'`);

    if (undeclaredSymbols.length > 0) {
      error(
        `the symbols ${undeclaredSymbols.join(', ')} are used, but not present in the alphabet`
      );
    }
  } else {
    alphabet = [...alphabetSet].join('');
  }

  // validate states if present
  if (states != null) {
    const declaredStateSet = new Set(states);

    const undeclaredStates =
      [...stateSet]
        .filter(
          state => !declaredStateSet.has(state)
        )
    	.map(x => `'${x}'`);

    if (undeclaredStates.length > 0) {
      error(
        `the states ${undeclaredStates.join(', ')} are used, but not present in the states declaration`
      );
    }

    const unusedStates =
      states
        .filter(
          state => !stateSet.has(state)
        )
    	.map(x => `'${x}'`);

    if (unusedStates.length > 0) {
      error(
        `the states ${unusedStates.join(', ')} are declared, but not used in the transitions`
      );
    }
  } else {
    states = [...stateSet];
  }

  return {
    allStates,
    alphabet,
    alphabetSet,
    states,
    stateSet,
    stateMap,
    start,
    accepting,
    acceptingSet,
    transitions
  };
}

function automate (description) {
  if (description instanceof RegExp) {
    return string => !!description.exec(string)
  } else {
    const {
      stateMap,
      start,
      acceptingSet,
      transitions
    } = validatedAndProcessed(description);

    return function (input) {
      let state = start;

      for (const symbol of input) {
        const transitionsForThisState = stateMap.get(state) || [];
        const transition =
        	transitionsForThisState.find(
            ({ consume }) => consume === symbol
        	);

        if (transition == null) {
          return false;
        }

        state = transition.to;
      }

      // reached the end. do we accept?
      return acceptingSet.has(state);
    }
  }
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
    const testList =
      typeof tests.entries === 'function'
        ? [...tests.entries()]
        : Object.entries(tests);
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

function verifyEvaluate (expression, definition, examples) {
  return verify(
    automate(evaluate(expression, definition)),
    examples
  );
}


// ----------

verifyEvaluate('0|1(0|1)*', formalRegularExpressions, {
  '': false,
  'an odd number of characters': false,
  'an even number of characters': false,
  '0': true,
  '10': true,
  '101': true,
  '1010': true,
  '10101': true
});

