import stardog from '../services/stardog';
import { qFidAs, qSort, qLimitOffset, axiomWithPrefix } from '../util/owlUtils';
import { flatten } from '../util/utils';

export default {
  // Select all individuals of Waste entity by options
  selectIndividis({ types, forSubject, sort, offset, limit } = {}) {
    const qselect = `
      SELECT DISTINCT ${qFidAs('?waste', '?fid')} ?amount ?title
    `;

    const qtype = flatten([':SpecificWaste', types]).reduce((res, val) => {
      const axiom = axiomWithPrefix(val);
      return !!axiom ? `${res} ; a ${axiom}` : res;
    }, '');

    const subject = axiomWithPrefix(forSubject);
    const qsubject = forSubject ?
        `?subject :hasWaste ?waste FILTER(?subject = ${subject})` : '';

    const query = `
      ${qselect} WHERE {
        ?waste :amount ?amount ; :title ?title ${qtype} ${qsubject}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Waste entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT DISTINCT ${qFidAs('?waste', '?fid')} ?amount ?title
      WHERE {
        ?waste a ?type ; :amount ?amount ; :title ?title
        FILTER(?type = :SpecificWaste && ?waste = ${axiomWithPrefix(fid)})
        LIMIT 1 OFFSET 0
      }
    `;

    return new Promise(resolve => {
      stardog.query({ query }).then(resp => {
        const res = resp.success && !resp.data.length ? {
          success: false,
          code: 404,
          message: 'Not found',
          data: null,
        } : { ...resp, data: resp.data[0] };
        resolve(res);
      });
    });
  },

  // Select all types of Waste entity by options
  selectTypes({ types, sort, offset, limit } = {}) {
    const qselect = `
      SELECT DISTINCT ${qFidAs('?type', '?fid')} ?title
    `;

    const qtype = flatten([':SpecificWaste', types]).reduce((res, val) => {
      const axiom = axiomWithPrefix(val);
      return !!axiom ? `${res} ; rdfs:subClassOf ${axiom}` : res;
    }, '');

    const query = `
      ${qselect} WHERE {
        ?type rdfs:label ?title ${qtype}
        FILTER(?type != :SpecificWaste)
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all subtypes of specific type of Waste entity by options
  selectSubTypes({ individs, types, sort, offset, limit }) {
    let qfilter = '';

    if (individs) {
      qfilter = `{
        SELECT ?type ?w WHERE {
          ?waste a ?type
          FILTER (?waste IN (${flatten([individs]).map(axiomWithPrefix).join()}))
        }
      }`;
    } else if (types) {
      qfilter = `FILTER (?type IN (${flatten([types]).map(axiomWithPrefix).join()}))`;
    }

    if (!qfilter) {
      return new Promise((resolve) => {
        resolve({
          success: false,
          code: 404,
          message: 'Not found',
          data: null,
        });
      });
    }

    const qselect = `
      SELECT DISTINCT ${qFidAs('?subtype', '?subtypeFid')} ?title
      ${individs ? qFidAs('?waste', '?wasteFid') : ''}
    `;

    const evidences = [
      ':Composition',
      ':Hazardous',
      ':Processable',
      ':Substance',
      ':SpecificWaste',
    ];

    const qbody = evidences.reduce((res, val, i) => {
      let q = i > 0 ? `${res}UNION` : res;
      q += `{
        ?type rdfs:subClassOf ?subtype .
        ?subtype rdfs:subClassOf ${val} ; rdfs:label ?title
        FILTER(?subtype != ${val})
      }`;
      return q;
    }, '');

    const query = `
      ${qselect} WHERE {
        ${qbody} ${qfilter}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all individuals of Origin entity
  selectOrigins() {
    const query = `
      SELECT ?fid ?title WHERE {
        ?fid a :Origin ; :title ?title
    }`;
    return stardog.query({ query });
  },

  // Select all individuals of HazardClass entity
  selectHazardClasses() {
    const query = `
      SELECT ?fid ?title WHERE {
        ?fid a :HazardClass ; :title ?title
    }`;
    return stardog.query({ query });
  },

  // Select all individuals of AggregateState entity
  selectAggregateStates() {
    const query = `
      SELECT ?fid ?title WHERE {
        ?fid a :AggregateState ; :title ?title
    }`;
    return stardog.query({ query });
  },
};
