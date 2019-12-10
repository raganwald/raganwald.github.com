// 13 - regular-expression.js

const specialSymbols = new Set('\\()*|'.split(''));

function quote (symbol) {
  if (specialSymbols.has(symbol)) {
    return `\\${symbol}`;
  } else {
    return symbol;
  }
}

function unionOf (...expressions) {
  let undegenerateExprs = [...new Set(
    expressions.filter(
      expr => expr !== '∅'
    )
  )];

  if (undegenerateExprs.length === 0) {
    // degenerate case
    return '∅';
  } else if (undegenerateExprs.length === 1) {
    return undegenerateExprs[0];
  } else {
    return `(${ undegenerateExprs.join('|') })`;
  }
}

function catenationOf (...expressions) {
  const undegenerateExprs = expressions.filter(
    expr => expr !== 'ε'
  );

  if (undegenerateExprs.some(expr => expr === '∅')) {
    return '∅';
  } else if (undegenerateExprs.length === 0) {
    return 'ε';
  } else if (undegenerateExprs.length === 1) {
    return undegenerateExprs[0];
  } else {
    return `(${ undegenerateExprs.join('') })`;
  }
}

function kleeneStarOf (expression) {
  if (expression === '∅' || expression === 'ε') {
    // degenerate cases
    return expression;
  } else {
  	return expression + '*';
  }
}

function regularExpression (description) {
  const {
    start,
    transitions,
    accepting,
    acceptingSet,
    stateSet
  } = validatedAndProcessed(description);

  // nota bene: labels all states 1..n
  const stateList = [undefined].concat([...allStates(description)]);
  const p = stateList.indexOf(start);
  const qq = accepting.map(a => stateList.indexOf(a));
  const k = stateList.length - 1;

  if (qq.length === 0) {
    return '∅';
  } else {
    const nonEmptyExpression =
      unionOf(...qq.map( q => L(p, q, k) ));

    if (acceptingSet.has(start)) {
      return unionOf('ε', nonEmptyExpression);
    } else {
      return nonEmptyExpression;
    }
  }

  // the regular expression for all the paths from state number p to state number q going through
  // any states from 1..k
  function L (p, q, k) {
    if (k === 0) {
      // degenerate case, doesn't go through any other states
      // just look for direct transitions
      const pqTransitions = transitions.filter(
        ({ from, to }) => from === stateList[p] && to === stateList[q]
      );

      const pqDirectExpressions =
        pqTransitions.map(
          ({ consume }) => quote(consume)
        );

      if (p === q) {
        return unionOf('ε',  ...pqDirectExpressions);
      } else {
        return unionOf(...pqDirectExpressions);
      }
    } else {
      const pq = L(p, q, k-1);

      const pk = L(p, k, k-1);
      const kk = kleeneStarOf(L(k, k, k-1));
      const kq = L(k, q, k-1);
      const pkkq = catenationOf(pk, kk, kq);

      const pqMaybeThroughK = unionOf(pq, pkkq);

      return pqMaybeThroughK;
    }
  }
}