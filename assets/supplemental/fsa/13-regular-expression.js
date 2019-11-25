// 13 - regular-expression.js

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
    stateSet
  } = validatedAndProcessed(description);

  // nota bene: labels all states 1..n
  const stateList = [undefined].concat([...allStates(description)]);
  const pStart = stateList.indexOf(start);
  const qAccepting = accepting.map( a => stateList.indexOf(a) );

  if (qAccepting.length === 0) {
    // degenerate case
    return '∅';
  } else if (qAccepting.length === 1) {
    // simple case
    return L(pStart, qAccepting[0], stateList.length);
  } else {
    return unionOf(
      ...qAccepting.map(
        q => L(pStart, q, stateList.length)
      )
    );
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

      const pqTransitionsSymbols =
        pqTransitions.map(
          ({ consume }) => consume
        );

      const emptyStringSymbols = (p === q) ? [ 'ε' ] : [];

      return unionOf(
        ...pqTransitionsSymbols.concat(emptyStringSymbols)
      );
    } else {
      const pq = L(p, q, k-1);
      const pk = L(p, k, k-1);
      const kk = kleeneStarOf(
		L(k, k, k-1)
      );
      const kq = L(k, q, k-1);

      return unionOf(
        pq,
        catenationOf(pk, kk, kq)
      );
    }
  }
}