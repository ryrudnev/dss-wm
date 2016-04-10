import { flatten } from '../util/utils';

// Extract the name of axiom without prefix
export function axiomWithoutPrefix(a) {
  return a ? a.replace(/^.*(#|\/|:)/g, '') : null;
}

// Add prefix to the name of axiom
export function axiomWithPrefix(a) {
  return a ? `:${axiomWithoutPrefix(a)}` : null;
}

// Remove Uri prefix of axiom in SPARQL
export function qFidAs(fid, as) {
  return `(REPLACE(STR(${fid}), '^.*(#|/)', '') as ${as})`;
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
