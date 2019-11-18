function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const {
    states: aDeclaredStates,
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const aStates = [''].concat(aDeclaredStates);
  const {
    states: bDeclaredStates,
    accepting: bAccepting
  } = validatedAndProcessed(b);
  const bStates = [''].concat(bDeclaredStates);

  const statesAAccepts =
    aAccepting.flatMap(
      aAcceptingState => bStates.map(bState => abToAB(aAcceptingState, bState))
    );
  const statesBAccepts =
    bAccepting.flatMap(
      bAcceptingState => aStates.map(aState => abToAB(aState, bAcceptingState))
    );
  const allAcceptingStates =
    statesAAccepts.concat(
      statesBAccepts.filter(
        state => statesAAccepts.indexOf(state) === -1
      )
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return union({ start, accepting, transitions }, ...rest);
}

function intersection (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const {
    accepting: aAccepting
  } = validatedAndProcessed(a);
  const {
    accepting: bAccepting
  } = validatedAndProcessed(b);

  const allAcceptingStates =
    aAccepting.flatMap(
      aAcceptingState => bAccepting.map(bAcceptingState => abToAB(aAcceptingState, bAcceptingState))
    );

  const productAB = product(a, b);
  const { stateSet: reachableStates } = validatedAndProcessed(productAB);

  const { start, transitions } = productAB;
  const accepting = allAcceptingStates.filter(state => reachableStates.has(state));

  return intersection({ start, accepting, transitions }, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab = powerset(
    reachableFromStart(
      removeEpsilonTransitions(
        epsilonCatenate(a, b)
      )
    )
  );

  return catenation(ab, ...rest);
}