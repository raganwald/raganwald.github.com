function union (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      reachableFromStart(
        powerset(
          removeEpsilonTransitions(
            epsilonUnion(a, b)
          )
        )
      )
    );

  return union(ab, ...rest);
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

  const ab = mergeEquivalentStates({ start, accepting, transitions });

  return intersection(ab, ...rest);
}

function catenation (a, ...args) {
  if (args.length === 0) {
    return a;
  }

  const [b, ...rest] = args;

  const ab =
    mergeEquivalentStates(
      powerset(
        reachableFromStart(
          removeEpsilonTransitions(
            epsilonCatenate(a, b)
          )
        )
      )
    );

  return catenation(ab, ...rest);
}
