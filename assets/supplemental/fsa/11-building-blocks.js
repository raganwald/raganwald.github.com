const EMPTY = {
  "start": "empty",
  "transitions": [],
  "accepting": ["empty"]
};

const FAIL = {
  "start": "failure",
  "transitions": [],
  "accepting": []
};

const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyz' +
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '1234567890';

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

  return catenation(EMPTY, ...recognizers);
}

function any (str = "") {
  const recognizers = str.split('').map(just1);

  return union(FAIL, ...recognizers);
}
