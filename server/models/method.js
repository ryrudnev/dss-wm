import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import stardog from '../services/stardog';

export default {
  // Select all individuals of Method entity by options
  selectIndivids({ forSubjects, forNotSubjects, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?method :title ?title .
        ${qType(['method', 'a'], [':Method', subtypes])}
        OPTIONAL { ?method :costOnWeight ?costOnWeight }
        OPTIONAL { ?method :costOnDistance ?costOnDistance }
        OPTIONAL { ?method :costByService ?costByService }
        ${qInFilter(['subject', ':hasMethod', 'method'], forSubjects)}
        ${qNotInFilter(['subject', ':hasMethod', 'method'], forNotSubjects)}
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

  // Select all specific types of Method entity by options
  selectTypes({ forWaste, individs, types, subtypes, sort, offset, limit } = {}) {
    if (forWaste) {
      const query = `
       SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
          ${qFidAs('waste', 'wasteFid')}
          WHERE {
            ?waste a ?wasteType .
            ?wasteType rdfs:subClassOf :SpecificWaste ,
                       [ rdf:type owl:Restriction ;
                         owl:onProperty :hasMethod ;
                         owl:someValuesFrom ?type
                       ] .
            ?type rdfs:label ?title .
            ${qInFilter(['waste'], forWaste)}
          } ${qSort(sort)} ${qLimitOffset(limit, offset)}
      `;
      return stardog.query({ query });
    }

    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('method', 'methodFid') : ''}
      WHERE {
        ${qType(['type', 'rdfs:subClassOf'], [':Method', subtypes])} ; rdfs:label ?title
        FILTER(?type != :Method)
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['method', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
