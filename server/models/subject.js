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

  // Generate waste management strategy for a subject
  // {
  //  subject, - the waste management subject to which the generated strategy
  //  ownWaste, - the subject's waste:
  //           [{fid, title, amount}, ...]
  //  wasteMethods, - acceptable waste management methods for the types of waste:
  //                  {wasteFid: [{title, fid}, ...], ...}
  //  ownMethods, - the subject's waste management methods:
  //                [{fid, title, costOnWeight, costOnDistance, costByService}, ...]
  //  methods, - all available waste management methods:
  //             {methodTypeFid: [
  //                {fid, title, costOnWeight, costByService,
  //                  subject: {fid, title, coordinates, budget}
  //                },
  //                ...], ...},
  // Returned value:
  // [
  //   {
  //     waste: {fid, title, amount},
  //     bestTransportation: {
  //        subject, method, cost
  //     } || null,
  //     ownTransportation: {} || null,
  //     bestMethod: {
  //       subject, method, cost
  //     } || null,
  //     ownMethod: {} || null,
  //     bestCost: integer || null
  //   }, ...
  // ]
  genStrategy({ subject, ownWaste, wasteMethods, ownMethods, methods }) {

  }
};
