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

verify(productUnion(reg, uppercase), {
  '': true,
  'r': false,
  'R': true,
  'Reg': true,
  'REG': true,
  'Reginald': false,
  'REGINALD': true
});

verify(productIntersection(reg, uppercase), {
  '': false,
  'r': false,
  'R': false,
  'Reg': false,
  'REG': true,
  'Reginald': false,
  'REGINALD': false
});

const zeroes = {
  "start": 'empty',
  "accepting": ['zeroes'],
  "transitions": [
    { "from": 'empty', "consume": '0', "to": 'zeroes' },
    { "from": 'zeroes', "consume": '0', "to": 'zeroes' }
  ]
};

const nondeterministic =
  reachableFromStart(
    removeEpsilonTransitions(
      epsilonCatenate(zeroes, binary)
    )
  );

const deterministic = powerset(nondeterministic);

verify(deterministic, {
  '': false,
  '0': false,
  '1': false,
  '00': true,
  '01': true,
  '10': false,
  '11': false,
  '000': true,
  '001': true,
  '010': true,
  '011': true,
  '100': false,
  '101': false,
  '110': false,
  '111': false
})

verify(EMPTY, {
  '': true,
  '0': false,
  '1': false,
  '01': false,
  '10': false
});

verify(just1('0'), {
  '': false,
  '0': true,
  '1': false,
  '01': false,
  '10': false,
  '11': false
});

const reginald = catenation(
  just1('r'),
  just1('e'),
  just1('g'),
  just1('i'),
  just1('n'),
  just1('a'),
  just1('l'),
  just1('d')
);

verify(reginald, {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});

verify(just(''), {
  '': true,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': false,
  'reginaldus': false
});

verify(just('r'), {
  '': false,
  'r': true,
  'reg': false,
  'reggie': false,
  'reginald': false,
  'reginaldus': false
});

verify(just('reginald'), {
  '': false,
  'r': false,
  'reg': false,
  'reggie': false,
  'reginald': true,
  'reginaldus': false
});

verify(any(), {
  '': false,
  'r': false,
  'reg': false
});

verify(any('r'), {
  '': false,
  'r': true,
  'reg': false
});

const capitalArrReg = catenation(any('Rr'), just('eg'));

verify(capitalArrReg, {
  '': false,
  'r': false,
  'R': false,
  'reg': true,
  'Reg': true,
  'REG': false,
  'Reginald': false
});

const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '1234567890';

const dot = any(ALPHANUMERIC);

const rSomethingG = catenation(any('Rr'), dot, any('Gg'));

verify(rSomethingG, {
  '': false,
  'r': false,
  're': false,
  'Reg': true,
  'Rog': true,
  'RYG': true,
  'Rej': false
});

verify(kleeneStar(any('Aa')), {
  '': true,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

verify(kleenePlus(any('Aa')), {
  '': false,
  'a': true,
  'aa': true,
  'Aa': true,
  'AA': true,
  'aaaAaAaAaaaAaa': true,
  ' a': false,
  'a ': false,
  'eh?': false
});

const regMaybeReginald = catenation(
  just('reg'),
  optional(just('inald'))
);

verify(regMaybeReginald, {
  '': false,
  'r': false,
  're': false,
  'reg': true,
  'reggie': false,
  'reginald': true
});

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