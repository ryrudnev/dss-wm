import { flatten } from './utils';

// Extract the name of axiom without prefix
export function axiomWithoutPrefix(a) {
  return !!a ? `${a}`.replace(/^.*(#|\/|:)/g, '') : null;
}

// Add prefix to the name of axiom
export function axiomWithPrefix(a) {
  return !!a ? `:${axiomWithoutPrefix(a)}` : null;
}

// Remove Uri prefix of axiom in SPARQL query
export function qFidAs(fid, as) {
  return `(REPLACE(STR(?${fid}), '^.*(#|/)', '') as ?${as})`;
}

// Create sort conditional for SPARQL query
export function qSort(options) {
  const qsort = flatten([options]).reduce((res, val) => {
    if (typeof val !== 'string') {
      return res;
    }

    const s = val.replace(/\+|-/g, '');
    if (!s) {
      return res;
    }

    return `${res} ${val.startsWith('-') ? `DESC(?${s})` : `?${s}`}`;
  }, '');

  return !!qsort ? `ORDER BY ${qsort}` : qsort;
}

// Create limit and offset conditional for SPARQL query
export function qLimitOffset(limit, offset) {
  const qoffset = offset !== undefined ? `OFFSET ${+offset}` : '';
  const qlimit = limit !== undefined ? `LIMIT ${+limit}` : '';
  return `${qoffset} ${qlimit}`;
}

// Create type conditional for SPARQL query
export function qType([s, p], types) {
  return flatten([types]).reduce((res, val) => {
    const axiom = axiomWithPrefix(val);
    if (!axiom) {
      return res;
    }
    return `${res}${res.length ? ';' : `?${s}`} ${p} ${axiom} `;
  }, '');
}

// Create type restriction conditional for SPARQL query
export function qTypeRestrict([prop, p], values) {
  return flatten([values]).reduce((res, val) => {
    const axiom = axiomWithPrefix(val);
    if (!axiom) {
      return res;
    }
    const cond = `[ rdf:type owl:Restriction ;
                    owl:onProperty ${axiomWithPrefix(prop)} ;
                    ${p} ${axiom}
                  ]`;
    return `${res}${res.length ? ', ' : ''} ${cond}`;
  }, '');
}

// Create IN filter conditional for SPARQL query
export function qInFilter([s, p, o, invert = false], filters = void 0) {
  if (!filters) {
    return '';
  }
  const params = flatten([filters]).map(axiomWithPrefix).join();
  const cond = !!p && !!o ? `?${s} ${p} ?${o} ` : '';
  return params.length ? `${cond}FILTER(?${invert ? o : s} IN (${params}))` : '';
}

// Create NOT IN filter conditional for SPARQL query
export function qNotInFilter([s, p, o, invert = false], filters = void 0) {
  if (!filters) {
    return '';
  }
  const cond = !!p && !!o ? `?${s} ${p} ?${o} ` : '';
  const params = flatten([filters]).map(
      val => `?${invert ? o : s} != ${axiomWithPrefix(val)}`
  ).join(' && ');
  return params.length ? `${cond}FILTER(${params})` : '';
}
