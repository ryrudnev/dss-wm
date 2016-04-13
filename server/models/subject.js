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
  // Select all individuals of Subject entity by options
  selectIndivids({ types, byMethods, byWaste, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      ${byMethods ? qFidAs('method', 'methodFid') : ''}
      ${byWaste ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?subject :title ?title ${qType('a', [':Subject', types])}
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        ${qInFilter(['subject', ':hasMethod', 'method', true], byMethods)}
        ${qInFilter(['subject', ':hasWaste', 'waste', true], byWaste)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Subject entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      WHERE {
        ?subject a ?type ; :title ?title
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        FILTER(?type = :Subject && ?subject = ${axiomWithPrefix(fid)})
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

  // Select all locations for subjects
  selectLocationsFor({ types, forSubjects, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('location', 'fid')} ?title
      ${qFidAs('subject', 'subjectFid')}
      WHERE {
        ?location :title ?title ${qType(['a'], [':Subject', types])} .
        ${qInFilter(['subject', ':locatedIn', 'location'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all types of Subject entity by options
  selectTypes({ types, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title WHERE {
        ?type rdfs:label ?title ${qType(['rdfs:subClassOf'], [':Subject', types])}
        FILTER(?type != :Subject)
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all subtypes of specific type of Subject entity by options
  selectSubTypes({ individs, types, sort, offset, limit }) {
    let qfilter = '';

    if (individs) {
      qfilter = `{
        SELECT ?type ?subject ?w WHERE {
          ${qInFilter(['subject', 'a', 'type'], individs)}
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
      ${individs ? qFidAs('subject', 'subjectFid') : ''}
    `;

    const query = `
      ${qselect} WHERE {
        ?type rdfs:subClassOf ?subtype .
        ?subtype rdfs:subClassOf :Subject ; rdfs:label ?title
        FILTER(?subtype != :Subject)
        ${qfilter}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
