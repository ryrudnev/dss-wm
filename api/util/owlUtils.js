import { flatten } from './utils';

// Extract the name of axiom without prefix
export function axiomWithoutPrefix(a) {
  if (a == null) { return null; }
  const res = `${a}`.match(/^.*(#|:)(\w+)\W*$/);
  return res == null ? a : res[2];
}

// Add prefix to the name of axiom
export function axiomWithPrefix(a, prefix = '') {
  return !!a ? `${prefix}:${axiomWithoutPrefix(a)}` : null;
}

// Remove Uri prefix of axiom in SPARQL query
export function qFidAs(fid, as) {
  return `(REPLACE(STR(?${fid}), '^.*(#|/)', '') as ?${as})`;
}

// Create sort conditional for SPARQL query
export function qSort(options) {
  const qsort = flatten([options]).reduce((res, val) => {
    if (typeof val !== 'string') { return res; }

    const s = val.replace(/\+|-/g, '');
    if (!s) { return res; }

    return `${res} ${val.startsWith('-') ? `DESC(?${s})` : `?${s}`}`;
  }, '');
  return (!!qsort ? `ORDER BY${qsort}` : qsort).trim();
}

// Create limit and offset conditional for SPARQL query
export function qLimitOffset(limit, offset) {
  const qoffset = offset !== undefined ? `OFFSET ${+offset}` : '';
  const qlimit = limit !== undefined ? `LIMIT ${+limit}` : '';
  return `${qoffset} ${qlimit}`.trim();
}

// Create type conditional for SPARQL query
export function qType([s, p], types) {
  return flatten([types]).reduce((res, val) => {
    const axiom = axiomWithPrefix(val);
    if (!axiom) { return res; }
    return `${res}${res.length ? ';' : `?${s}`} ${p} ${axiom} `;
  }, '').trim();
}

// Create type restriction conditional for SPARQL query
export function qTypeRestrict([prop, p], values) {
  return flatten([values]).reduce((res, val) => {
    const axiom = axiomWithPrefix(val);
    if (!axiom) { return res; }
    const cond = `[ rdf:type owl:Restriction ;
                    owl:onProperty ${axiomWithPrefix(prop)} ;
                    ${p} ${axiom}
                  ]`;
    return `${res}${res.length ? ', ' : ''} ${cond}`;
  }, '').trim();
}

// Create IN filter conditional for SPARQL query
export function qInFilter([s, p, o, invert = false], filters) {
  if (!filters) { return ''; }
  const params = [];
  flatten([filters]).forEach(f => {
    const a = axiomWithPrefix(f);
    if (a != null) { params.push(a); }
  });
  const cond = !!p && !!o ? `?${s} ${p} ?${o} ` : '';
  return params.length ? `${cond}FILTER(?${invert ? o : s} IN (${params.join()}))`.trim() : '';
}

// Create NOT IN filter conditional for SPARQL query
export function qNotInFilter([s, p, o, invert = false], filters) {
  if (!filters) { return ''; }
  const params = [];
  flatten([filters]).forEach(f => {
    const a = axiomWithPrefix(f);
    if (a != null) { params.push(`?${invert ? o : s} != ${a}`); }
  });
  const cond = !!p && !!o ? `?${s} ${p} ?${o} ` : '';
  return params.length ? `${cond}FILTER(${params.join(' && ')})`.trim() : '';
}
