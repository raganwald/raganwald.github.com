// 02-automate.js

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

    return function (string) {
      let state = start;
      let unconsumed = string;

      while (unconsumed !== '') {
        const transitionsForThisState = stateMap.get(state) || [];
        const transition =
        	transitionsForThisState.find(
            ({ consume }) => consume === unconsumed[0]
        	);

        if (transition == null) {
          // the machine stops
        	break;
        }

        const { to } = transition;
        unconsumed = unconsumed.substring(1);

        state = to;
      }

      // machine has reached a terminal state.
      if (unconsumed === '') {
        // reached the end. do we accept?
        return acceptingSet.has(state);
      } else {
        // stopped before reaching the end is a fail
        return false;
      }
    }
  }
}

function verify (description, tests) {
  try {
    const recognizer = automate(description);
    const testList = Object.entries(tests);
    const numberOfTests = testList.length;

    const outcomes = testList.map(
      ([example, expected]) => {
        const actual = recognizer(example);
        if (actual === expected) {
          return 'pass';
        } else {
          return `fail: ${JSON.stringify({ example, expected, actual })}`;
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
  } catch(error) {
    console.log(`Failed to validate the description: ${error}`)
  }
}

// ----------

const binary = {
  "start": "start",
  "transitions": [
    { "from": "start", "consume": "0", "to": "zero" },
    { "from": "start", "consume": "1", "to": "notZero" },
    { "from": "notZero", "consume": "0", "to": "notZero" },
    { "from": "notZero", "consume": "1", "to": "notZero" }
  ],
  "accepting": ["zero", "notZero"]
};

verify(binary, {
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

const reg = {
  "start": "empty",
  "accepting": ["reg"],
  "transitions": [
    { "from": "empty", "consume": "r", "to": "r" },
    { "from": "empty", "consume": "R", "to": "r" },
    { "from": "r", "consume": "e", "to": "re" },
    { "from": "r", "consume": "E", "to": "re" },
    { "from": "re", "consume": "g", "to": "reg" },
    { "from": "re", "consume": "G", "to": "reg" }
  ]
};

verify(reg, {
  '': false,
  'r': false,
  'R': false,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

const uppercase = {
  "start": "uppercase",
  "accepting": ["uppercase"],
  "transitions": [
    { "from": "uppercase", "consume": "A", "to": "uppercase" },
    { "from": "uppercase", "consume": "B", "to": "uppercase" },
    { "from": "uppercase", "consume": "C", "to": "uppercase" },
    { "from": "uppercase", "consume": "D", "to": "uppercase" },
    { "from": "uppercase", "consume": "E", "to": "uppercase" },
    { "from": "uppercase", "consume": "F", "to": "uppercase" },
    { "from": "uppercase", "consume": "G", "to": "uppercase" },
    { "from": "uppercase", "consume": "H", "to": "uppercase" },
    { "from": "uppercase", "consume": "I", "to": "uppercase" },
    { "from": "uppercase", "consume": "J", "to": "uppercase" },
    { "from": "uppercase", "consume": "K", "to": "uppercase" },
    { "from": "uppercase", "consume": "L", "to": "uppercase" },
    { "from": "uppercase", "consume": "M", "to": "uppercase" },
    { "from": "uppercase", "consume": "N", "to": "uppercase" },
    { "from": "uppercase", "consume": "O", "to": "uppercase" },
    { "from": "uppercase", "consume": "P", "to": "uppercase" },
    { "from": "uppercase", "consume": "Q", "to": "uppercase" },
    { "from": "uppercase", "consume": "R", "to": "uppercase" },
    { "from": "uppercase", "consume": "S", "to": "uppercase" },
    { "from": "uppercase", "consume": "T", "to": "uppercase" },
    { "from": "uppercase", "consume": "U", "to": "uppercase" },
    { "from": "uppercase", "consume": "V", "to": "uppercase" },
    { "from": "uppercase", "consume": "W", "to": "uppercase" },
    { "from": "uppercase", "consume": "X", "to": "uppercase" },
    { "from": "uppercase", "consume": "Y", "to": "uppercase" },
    { "from": "uppercase", "consume": "Z", "to": "uppercase" }
  ]
};

verify(uppercase, {
  '': true,
  'r': false,
  'R': true,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});
