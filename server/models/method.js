import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import stardog from '../services/stardog';

export default {
  // Select all individuals of Method entity by options
  selectIndivids({ types, forSubjects, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?method :title ?title ${qType(['a'], [':Method', types])}
        OPTIONAL { ?method :costOnWeight ?costOnWeight }
        OPTIONAL { ?method :costOnDistance ?costOnDistance }
        OPTIONAL { ?method :costByService ?costByService }
        ${qInFilter(['subject', ':hasMethod', 'method'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Method entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      WHERE {
        ?method a ?type ; :title ?title
        OPTIONAL { ?method :costOnWeight ?costOnWeight }
        OPTIONAL { ?method :costOnDistance ?costOnDistance }
        OPTIONAL { ?method :costByService ?costByService }
        FILTER(?type = :Method && ?method = ${axiomWithPrefix(fid)})
      } LIMIT 1 OFFSET 0
    `;

    return new Promise((resolve, reject) => {
      stardog.query({ query }).then(resp => {
        if (!resp.data.length) {
          reject({ success: false, code: 404, message: 'Not found', data: null });
        } else {
          resolve({ ...resp, data: resp.data[0] });
        }
      }, resp => reject(resp));
    });
  },

  // Select all types of Method entity by options
  selectTypes({ types, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title WHERE {
        ?type rdfs:label ?title ${qType(['rdfs:subClassOf'], [':Method', types])}
        FILTER(?type != :Method)
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all subtypes of specific type of Method entity by options
  selectSubTypes({ individs, types, sort, offset, limit }) {
    let qfilter = '';

    if (individs) {
      qfilter = `{
        SELECT ?type ?method ?w WHERE {
          ${qInFilter(['method', 'a', 'type'], individs)}
        }
      }`;
    } else if (types) {
      qfilter = `
        ${qInFilter(['type'], types)}
        FILTER (?type != ?subtype)
      `;
    }

    if (!qfilter) {
      return new Promise((resolve, reject) => {
        reject({
          success: false,
          code: 404,
          message: 'Not found',
          data: null,
        });
      });
    }

    const qselect = `
      SELECT DISTINCT ${qFidAs('subtype', 'fid')} ?title
      ${individs ? qFidAs('method', 'methodFid') : ''}
    `;

    const query = `
      ${qselect} WHERE {
        ?type rdfs:subClassOf ?subtype .
        ?subtype rdfs:subClassOf :Method ; rdfs:label ?title
        FILTER(?subtype != :Method)
        ${qfilter}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
