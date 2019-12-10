function nonhalting (alphabet, description) {
  const descriptionWithoutHaltedState = avoidReservedNames(["halted"], description);

  const {
    states,
    stateMap,
    start,
    transitions,
    accepting
  } = validatedAndProcessed(descriptionWithoutHaltedState);

  const alphabetList = [...alphabet];
  const statesWithHalted = states.concat(["halted"])

  const toHalted =
    statesWithHalted.flatMap(
      state => {
        const consumes =
          (stateMap.get(state) || [])
      		  .map(({ consume }) => consume);
        const consumesSet = new Set(consumes);
        const haltsWhenConsumes =
          alphabetList.filter(a => !consumesSet.has(a));

        return haltsWhenConsumes.map(
          consume => ({ "from": state, consume, "to": "halted" })
        );
      }
    );

  return reachableFromStart({
    start,
    transitions: transitions.concat(toHalted),
    accepting
  });
}

function complementation (alphabet, description) {
  const nonhaltingDescription = nonhalting(alphabet, description);

  const {
    states,
    start,
    transitions,
    acceptingSet
  } = validatedAndProcessed(nonhaltingDescription);

  const accepting = states.filter(state => !acceptingSet.has(state));

  return { start, transitions, accepting }
}

// ----------

verify(nonhalting('1234567890', binary), {
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

const numberButNotBinary = complementation('1234567890', binary);

verify(complementation('1234567890', binary), {
  '': true,
  '0': false,
  '1': false,
  '01': true,
  '10': false,
  '2': true,
  'two': false
});