console.log('10-equivalence.js');

function numerify (description) {
  // nota bene: labels all states 1..n
  const stateList = [undefined].concat([...allStatesFor(description)]);
  const n = state => stateList.indexOf(state);

  return {
    start: n(description.start),
    transitions:
      description.transitions.map(
        ({ from, consume, to }) => ({ from: n(from), consume, to: n(to) })
      ),
    accepting:
      description.accepting.map(
        state => n(state)
      )
  }
}

function regularExpression (description) {
  const prunedAndNumbered =
    numerify(
      reachableFromStart(
        mergeEquivalentStates(
          description
        )
      )
    );
  const {
    start,
    transitions,
    accepting,
    acceptingSet,
    stateSet
  } = validatedAndProcessed(prunedAndNumbered);

  // ...TBD

  function expression({ from, via, to }) {
    // ... TBD
  }
};

// ----------

verify(regularExpression, new Map([
  [emptySet(), emptySet()]
]);