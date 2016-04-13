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
  selectIndivids({ subtypes, byMethods, byWaste, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      ${byMethods ? qFidAs('method', 'methodFid') : ''}
      ${byWaste ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?subject :title ?title .
        ${qType(['subject', 'a'], [':Subject', subtypes])}
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
  selectLocationsFor({ subtypes, forSubjects, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('location', 'fid')} ?title
      ${qFidAs('subject', 'subjectFid')}
      WHERE {
        ?location :title ?title .
        ${qType(['location', 'a'], [':Subject', subtypes])} .
        ${qInFilter(['subject', ':locatedIn', 'location'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all specific types of Subject entity by options
  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ${qType(['type', 'rdfs:subClassOf'], [':Subject', subtypes])} ; rdfs:label ?title
        FILTER(?type != :Subject)
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['subject', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
