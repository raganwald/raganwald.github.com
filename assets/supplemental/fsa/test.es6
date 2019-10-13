function automate({
  start,
  accepting,
  transitions
}) {
  // map from from states to the transitions defined for that from state
  const stateMap =
    transitions
    .reduce(
      (acc, transition) => {
        const {
          from
        } = transition;

        if (from === accepting) {
          console.log(`Transition ${JSON.stringify(transition)} is a transition from the accepting state. This is not allowed.`)
          return;
        }

        if (!acc.has(from)) {
          acc.set(from, []);
        }
        acc.get(from).push(transition);

        return acc;
      },
      new Map()
    );

  // given a starting state defined by { internal, external, string },
  // returns a set of next states
  function performTransition({
    string,
    external,
    internal
  }) {
    const transitionsForThisState = stateMap.get(internal);

    if (transitionsForThisState == null) {
      // a deliberate fail
      return [];
    }

    return transitionsForThisState
      .reduce(
        (acc, {
          consume,
          pop,
          push,
          to
        }) => {

          let string2 = string;
          if (consume === '') {
            if (string !== '') return acc; // not a match
          } else if (consume != null) {
            if (string === '') return acc; // not a match
            if (string[0] !== consume) return acc; // not a match

            string2 = string.substring(1); // match and consume
          }

          const external2 = external.slice(0);
          if (pop != null) {
            if (external2.pop() !== pop) return acc; // not a match
          }
          if (push != null) {
            external2.push(push);
          }

          const internal2 = (to != null) ? to : internal;

          acc.push({
            string: string2,
            external: external2,
            internal: internal2
          });

          return acc;
        }, []
      );
  }

  return function(string) {
    let currentStates = [{
      string,
      external: [],
      internal: start
    }];

    while (currentStates.length > 0) {
      currentStates = currentStates.flatMap(performTransition);

      if (currentStates.some(({
          internal
        }) => internal === accepting)) {
        return true;
      }
    }

    return false;
  }
}

function test(description, examples) {
  const recognizer = automate(description);

  for (const example of examples) {
    console.log(`'${example}' => ${recognizer(example)}`);
  }
}

function statesOf(description) {
  return description
    .transitions
    .reduce(
      (states, {
        from,
        to
      }) => {
        if (from != null) states.add(from);
        if (to != null) states.add(to);
        return states;
      },
      new Set([description.start, description.accepting])
    );
}

function renameStates(nameMap, description) {
  const translate =
    before =>
    (nameMap[before] != null) ? nameMap[before] : before;

  return {
    start: translate(description.start),
    accepting: translate(description.accepting),
    transitions: description.transitions.map(
      ({
        from,
        consume,
        pop,
        to,
        push
      }) => {
        const transition = {
          from: translate(from)
        };
        if (consume != null) transition.consume = consume;
        if (pop != null) transition.pop = pop;
        if (to != null) transition.to = translate(to);
        if (push != null) transition.push = push;

        return transition;
      }
    )
  };
}

function resolveCollisions(taken, description) {
  const takenNames = new Set(taken);
  const descriptionNames = statesOf(description);

  const nameMap = {};

  for (const descriptionName of descriptionNames) {
    let name = descriptionName;
    let counter = 2;
    while (takenNames.has(name)) {
      name = `${descriptionName}-${counter++}`;
    }
    if (name !== descriptionName) {
      nameMap[descriptionName] = name;
    }
    takenNames.add(name);
  }

  return renameStates(nameMap, description);
}

function prepareSecondForCatenation(start, accepting, first, second) {
  const uncollidedSecond = resolveCollisions(statesOf(first), second);

  const acceptingSecond =
    uncollidedSecond.accepting === accepting ?
    uncollidedSecond :
    renameStates({
      [uncollidedSecond.accepting]: accepting
    }, uncollidedSecond);

  return acceptingSecond;
}

function union(...descriptions) {
  function binaryUnion(first, second) {
    const start = "start";
    const accepting = "accepting";

    const conformingFirst = renameStates({
        [first.start]: start,
        [first.accepting]: accepting
      },
      first
    );

    const renamedSecond = resolveCollisions(statesOf(conformingFirst), second);

    const conformingSecond = renameStates({
        [renamedSecond.start]: start,
        [renamedSecond.accepting]: accepting
      },
      renamedSecond
    );

    return {
      start,
      accepting,
      transitions: conformingFirst
        .transitions
        .concat(
          conformingSecond.transitions
        )
    };
  }

  return descriptions.reduce(binaryUnion);
}

function stackablesOf(description) {
  return description
    .transitions
    .reduce(
      (stackables, {
        push,
        pop
      }) => {
        if (push != null) stackables.add(push);
        if (pop != null) stackables.add(pop);
        return stackables;
      },
      new Set()
    );
}

function isolatedStack(start, accepting, description) {
  const stackables = stackablesOf(description);

  // this is an FSA, nothing to see here
  if (stackables.size === 0) return description;

  // this is a PDA, make sure we clean the stack up
  let sentinel = "sentinel";
  let counter = 2;
  while (stackables.has(sentinel)) {
    sentinel = `${sentinel}-${counter++}`;
  }

  const renamed = resolveCollisions([start, accepting], description);

  const pushSentinel = {
    from: start,
    push: sentinel,
    to: renamed.start
  };

  const popStackables =
    [...stackables].map(
      pop => ({
        from: renamed.accepting,
        pop
      })
    );

  const popSentinel = {
    from: renamed.accepting,
    pop: sentinel,
    to: accepting
  };

  return {
    start,
    accepting,
    transitions: [
      pushSentinel,
      ...renamed.transitions,
      ...popStackables,
      popSentinel
    ]
  };
}

function isPushdown(description) {
  return stackablesOf(description).size > 0
};

function prepareFirstForCatenation(start, accepting, first, second) {
  const safeFirst =
    (isPushdown(first) && isPushdown(second)) ? isolatedStack(start, accepting, first) : first;

  const nameMap = {
    [safeFirst.accepting]: second.start,
    [safeFirst.start]: start
  };
  const {
    transitions
  } =
  renameStates(nameMap, first);

  return {
    start,
    accepting,
    transitions: transitions.map(
      ({
        from,
        consume,
        pop,
        to,
        push
      }) => {
        const transition = {
          from
        };
        if (consume != null && consume !== "") transition.consume = consume;
        if (pop != null) transition.pop = pop;
        if (to != null) transition.to = to;
        if (push != null) transition.push = push;

        return transition;
      }
    )
  };
}

function catenation(...descriptions) {
  function binaryCatenation(first, second) {
    const start = "start";
    const accepting = "accepting";

    const catenatableSecond = prepareSecondForCatenation(start, accepting, first, second);
    const catenatableFirst = prepareFirstForCatenation(start, accepting, first, catenatableSecond);

    return {
      start: start,
      accepting: accepting,
      transitions: catenatableFirst.transitions
        .concat(catenatableSecond.transitions)
    };
  }

  return descriptions.reduce(binaryCatenation);
}

function symbol(s) {
  return {
    start: "start",
    accepting: "accepting",
    transitions: [{
      from: "start",
      consume: s,
      to: s
    }, {
      from: s,
      consume: "",
      to: "accepting"
    }]
  };
}

function any(charset) {
  return union(
    ...charset
    .split('')
    .map(symbol)
  );
}

const EMPTY = {
  start: "start",
  accepting: "accepting",
  transitions: [{
    from: "start",
    consume: "",
    to: "accepting"
  }]
};

function zeroOrMore(description) {
  const {
    start,
    accepting,
    transitions
  } = description;

  const loopsBackToStart = ({
    start,
    accepting,
    transitions: transitions.map(
      ({
        from,
        consume,
        pop,
        to,
        push
      }) => {
        const transition = {
          from
        };
        if (pop != null) transition.pop = pop;
        if (push != null) transition.push = push;
        if (to === accepting && consume === "") {
          transition.to = start
        } else {
          if (consume != null) transition.consume = consume;
          if (to != null) transition.to = to;
        }

        return transition;
      }
    )
  });

  return union(EMPTY, loopsBackToStart);
}

// console.log(union(symbol('0'), symbol('1'), symbol('2')))
// console.log(any("10"))

// const binary = union(
//   any("0"),
//   catenation(
//     any("1"),
//     zeroOrMore(any("01"))
//   )
// );

// test(binary, [
//   '', '0', '1', '00', '01', '10', '11',
//   '000', '001', '010', '011', '100',
//   '101', '110', '111',
//   '10100011011000001010011100101110111'
// ]);

function string(str = "") {
  return catenation(
    ...str
    .split('')
    .map(symbol)
    .concat([EMPTY])
  );
}

// test(string("r"), [
//   '', 'r', 'reg'
// ]);

function oneOrMore(description) {
  return catenation(description, zeroOrMore(description));
}

function zeroOrOne(recognizer) {
  return union(EMPTY, recognizer);
}

function permute(...descriptions) {
  function permuteArray(permutation) {
    const length = permutation.length,
      result = [permutation.slice()],
      c = new Array(length).fill(0);

    let i = 1;

    while (i < length) {
      if (c[i] < i) {
        const k = i % 2 && c[i];
        const p = permutation[i];
        permutation[i] = permutation[k];
        permutation[k] = p;
        ++c[i];
        i = 1;
        result.push(permutation.slice());
      } else {
        c[i] = 0;
        ++i;
      }
    }
    return result;
  }

  return union(
    ...permuteArray(descriptions).map(
      elements => catenation(...elements)
    )
  )
}

///////////////////////////////////////////////////////////////////////

let startMap = symbol('{');
let endMap = symbol('}');

let whitespace = oneOrMore(any(' \t\r\n'));
let optionalWhitespace = zeroOrOne(whitespace);

let colon = symbol(':');

let startLabel = union(
  catenation(string('start'), optionalWhitespace, colon),
  catenation(string('"start"'), optionalWhitespace, colon),
  catenation(string("'start'"), optionalWhitespace, colon)
);

let singleSymbol = any(
  ` \t\r\n:,[]{}-` +
  '0123456789' +
  'abcdefghijklmnopqrstuvwxyz'
);
let state = oneOrMore(singleSymbol);
let singleQuotedState = catenation(
  symbol("'"),
  state,
  symbol("'")
);
let doubleQuotedState = catenation(
  symbol('"'),
  state,
  symbol('"')
);
let quotedState = union(singleQuotedState, doubleQuotedState);

let startClause = catenation(
  optionalWhitespace, startLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let acceptingLabel = union(
  catenation(string('accepting'), optionalWhitespace, colon),
  catenation(string('"accepting"'), optionalWhitespace, colon),
  catenation(string("'accepting'"), optionalWhitespace, colon)
);

let acceptingClause = catenation(
  optionalWhitespace, acceptingLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let transitionsLabel = union(
  catenation(string('transitions'), optionalWhitespace, colon),
  catenation(string('"transitions"'), optionalWhitespace, colon),
  catenation(string("'transitions'"), optionalWhitespace, colon)
);

let fromLabel = union(
  catenation(string('from'), optionalWhitespace, colon),
  catenation(string('"from"'), optionalWhitespace, colon),
  catenation(string("'from'"), optionalWhitespace, colon)
);

let fromClause = catenation(
  optionalWhitespace, fromLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let singleQuotedSymbol = catenation(
  symbol("'"),
  singleSymbol,
  symbol("'")
);
let doubleQuotedSymbol = catenation(
  symbol('"'),
  singleSymbol,
  symbol('"')
);
let quotedSymbol = union(singleQuotedSymbol, doubleQuotedSymbol);

let consumeLabel = union(
  catenation(string('consume'), optionalWhitespace, colon),
  catenation(string('"consume"'), optionalWhitespace, colon),
  catenation(string("'consume'"), optionalWhitespace, colon)
);

let consumable = union(quotedSymbol, string("''"), string('""'));

let consumeClause = catenation(
  optionalWhitespace, consumeLabel, optionalWhitespace, consumable, optionalWhitespace
);

let popLabel = union(
  catenation(string('pop'), optionalWhitespace, colon),
  catenation(string('"pop"'), optionalWhitespace, colon),
  catenation(string("'pop'"), optionalWhitespace, colon)
);

let popClause = catenation(
  optionalWhitespace, popLabel, optionalWhitespace, quotedSymbol, optionalWhitespace
);

let toLabel = union(
  catenation(string('to'), optionalWhitespace, colon),
  catenation(string('"to"'), optionalWhitespace, colon),
  catenation(string("'to'"), optionalWhitespace, colon)
);

let toClause = catenation(
  optionalWhitespace, toLabel, optionalWhitespace, quotedState, optionalWhitespace
);

let pushLabel = union(
  catenation(string('push'), optionalWhitespace, colon),
  catenation(string('"push"'), optionalWhitespace, colon),
  catenation(string("'push'"), optionalWhitespace, colon)
);

let pushClause = catenation(
  optionalWhitespace, pushLabel, optionalWhitespace, quotedSymbol, optionalWhitespace
);

let comma = symbol(',');

let startsWithFrom = catenation(
  fromClause,
  union(
    permute(
      catenation(comma, optionalWhitespace, consumeClause),
      zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, popClause),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, toClause),
      zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
    )
  )
);

let startsWithConsume = catenation(
  consumeClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithPop = catenation(
  popClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, toClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithTo = catenation(
  toClause,
  permute(
    catenation(comma, optionalWhitespace, fromClause),
    zeroOrOne(catenation(comma, optionalWhitespace, consumeClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
    zeroOrOne(catenation(comma, optionalWhitespace, pushClause))
  )
);

let startsWithPush = catenation(
  pushClause,
  union(
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, consumeClause),
      zeroOrOne(catenation(comma, optionalWhitespace, popClause)),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, popClause),
      zeroOrOne(catenation(comma, optionalWhitespace, toClause))
    ),
    permute(
      catenation(comma, optionalWhitespace, fromClause),
      catenation(comma, optionalWhitespace, toClause)
    )
  )
);

let stateDescription = catenation(
  startMap,
  union(
    startsWithFrom,
    startsWithConsume,
    startsWithPop,
    startsWithTo,
    startsWithPush
  ),
  endMap
);

let stateElement = catenation(
  optionalWhitespace, stateDescription, optionalWhitespace
);

let stateList = catenation(
  symbol('['),
  stateElement,
  zeroOrMore(
    catenation(comma, stateElement)
  ),
  symbol(']')
);

let transitionsClause = catenation(
  transitionsLabel, optionalWhitespace, stateList, optionalWhitespace
);

const description = catenation(
  startMap,
  union(
    catenation(
      startClause,
      permute(
        catenation(comma, acceptingClause),
        catenation(comma, transitionsClause),
      )
    ),
    catenation(
      acceptingClause,
      permute(
        catenation(comma, startClause),
        catenation(comma, transitionsClause),
      )
    ),
    catenation(
      transitionsClause,
      permute(
        catenation(comma, startClause),
        catenation(comma, acceptingClause),
      )
    )
  ),
  endMap
);
