import stardog from '../services/stardog';
import { qFidAs, qSort, qLimitOffset, axiomWithPrefix } from '../util/owlUtils';
import { flatten } from '../util/utils';

export default {
  // Select all individuals of waste by options
  selectIndividis({ types, forSubject, sort, offset, limit } = {}) {
    const qselect = `
      SELECT DISTINCT ${qFidAs('?w', '?fid')} ?amount ?title
    `;

    const qtype = flatten([':SpecificWaste', types]).reduce((res, val) => {
      const axiom = axiomWithPrefix(val);
      return !!axiom ? `${res} ; a ${axiom}` : res;
    }, '');

    const subject = axiomWithPrefix(forSubject);
    const qsubject = forSubject ? `?s :hasWaste ?w FILTER(?s = ${subject})` : '';

    const query = `
      ${qselect} WHERE {
        ?w :amount ?amount ; :title ?title ${qtype} ${qsubject}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select individual of waste by fid
  selectIndividByFid(fid) {
    const query = `
      SELECT DISTINCT ${qFidAs('?w', '?fid')} ?amount ?title
      WHERE {
        ?w a ?wtype ; :amount ?amount ; :title ?title
        FILTER(?wtype = :SpecificWaste && ?w = ${axiomWithPrefix(fid)})
      }
    `;

    return stardog.query({ query });
  },

  // Select all waste types
  selectTypes({ types, sort, offset, limit } = {}) {
    const qselect = `
      SELECT DISTINCT ${qFidAs('?wtype', '?fid')} ?title
    `;

    const qtype = flatten([':SpecificWaste', types]).reduce((res, val) => {
      const axiom = axiomWithPrefix(val);
      return !!axiom ? `${res} ; rdfs:subClassOf ${axiom}` : res;
    }, '');

    const query = `
      ${qselect} WHERE {
        ?wtype rdfs:label ?title ${qtype}
        FILTER(?wtype != :SpecificWaste)
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  selectTypeByFid() {

  },
};
