// 11-building-blocks.js

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
