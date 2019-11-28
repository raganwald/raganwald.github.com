// 12-building-blocks.js

const EMPTY_SET = {
  "start": "empty",
  "transitions": [],
  "accepting": []
};

const EMPTY_STRING = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

function just1 (symbol) {
  return {
    "start": "empty",
    "transitions": [
      { "from": "empty", "consume": symbol, "to": "recognized" }
    ],
    "accepting": ["recognized"]
  };
}

function just (str = "") {
  const recognizers = str.split('').map(just1);

  return catenation(...recognizers);
}

function any (str = "") {
  const recognizers = str.split('').map(just1);

  return union(...recognizers);
}

// ----------

verify(EMPTY_SET, {
  '': false,
  '0': false,
  '1': false
});

verify(EMPTY_STRING, {
  '': true,
  '0': false,
  '1': false
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
