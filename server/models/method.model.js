import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
    axiomWithoutPrefix,
} from '../util/owlUtils';
import { Deferred, onError } from '../util/utils';
import stardog from '../services/stardog';
import uidCounter from '../services/counter';

// Constant of base type of Method entity
export const METHOD_TYPE = 'Method';

// Constant of transportation method type
export const TRANSPORT_METHOD = 'Transportation';

// Calculate uses cost of waste management method
export function calcMethodCost(wasteAmount, { costOnWeight, costByService }) {
  return (+costByService || 0) + (+wasteAmount || 0) * (+costOnWeight || 0);
}

export default {
  // Check exists individual of Method entity
  individExists(individ, falseAsReject = false) {
    const query = `
      ASK { ${axiomWithPrefix(individ)} a ${axiomWithPrefix(METHOD_TYPE)} ; :title ?title }
    `;
    if (!falseAsReject) {
      return stardog.query({ query });
    }

    const dfd = new Deferred();
    stardog.query({ query }).then(resp => {
      if (resp.data.boolean) {
        return dfd.resolve(resp);
      }
      return dfd.reject({
        success: false,
        code: 404,
        message: `Individual ${individ} of Method entity is not exists`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Check exists type of Method entity
  typeExists(type, falseAsReject = false) {
    const query = `
      ASK {
        ${axiomWithPrefix(type)} rdfs:subClassOf ${axiomWithPrefix(METHOD_TYPE)} ; rdfs:label ?title
    }`;
    if (!falseAsReject) {
      return stardog.query({ query });
    }

    const dfd = new Deferred();
    stardog.query({ query }).then(resp => {
      if (resp.data.boolean) {
        return dfd.resolve(resp);
      }
      return dfd.reject({
        success: false,
        code: 404,
        message: `Type ${type} of Method entity is not exists`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Create a new individual of Method entity
  createIndivid(type = METHOD_TYPE, data = {}) {
    return uidCounter.generateUid().then(uid => {
      const fid = axiomWithPrefix(uid);
      const qdata = Object.keys(data).reduce((prev, key) => {
        switch (key) {
          case 'title':
            return `${prev} ${fid} :title "${data[key]}" .`;
          case 'costOnWeight':
          case 'costOnDistance':
          case 'costByService':
            return `${prev} ${fid} ${axiomWithPrefix(key)} ${+data[key]} .`;
          case 'forSubject':
            return `${prev} ${axiomWithPrefix(data[key])} :hasMethod ${fid} .`;
          default: return prev;
        }
      }, '');
      const query = `INSERT DATA {
        ${fid} a ${axiomWithPrefix(type)} .
        ${qdata}
      }`;

      const dfd = new Deferred();
      stardog.query({ query }).then(resp => {
        dfd.resolve({ ...resp, data: { fid: axiomWithoutPrefix(fid) } });
      }).catch(resp => dfd.reject(resp));
      return dfd.promise;
    });
  },

  // Update the individual of Method entity
  updateIndivid(fid, data) {
    let [qinsert, qwhere] = ['', ''];
    Object.keys(data || {}).forEach((key) => {
      const pred = axiomWithPrefix(key);
      switch (key) {
        case 'title':
          qwhere = `${qwhere} ?m ${pred} ?${key} .`;
          qinsert = `${qinsert} ?m ${pred} "${data[key]}" .`;
          break;
        case 'costOnWeight':
        case 'costOnDistance':
        case 'costByService':
          qwhere = `${qwhere} ?m ${pred} ?${key} .`;
          qinsert = `${qinsert} ?m ${pred} ${+data[key]} .`;
          break;
        case 'forSubject':
          qwhere = `${qwhere} ?subject :hasMethod ?m .`;
          qinsert = `${qinsert} ${axiomWithPrefix(data[key])} :hasMethod ?m .`;
          break;
        case 'type':
          qwhere = `${qwhere} ?m a ?${key} .`;
          qinsert = `${qinsert} ?m a ${axiomWithPrefix(data[key])} .`;
          break;
        default:
      }
    });

    if (!qinsert || !qwhere) {
      return onError({
        code: 500,
        success: false,
        message: `Not valid condition to update the individual ${fid}`,
        data: null,
      });
    }

    const query = `DELETE {
        ${qwhere}
      } INSERT {
        ${qinsert}
      } WHERE {
        ?m a ${axiomWithPrefix(METHOD_TYPE)} .
        ${qwhere}
        FILTER(?m = ${axiomWithPrefix(fid)})
    }`;
    return stardog.query({ query });
  },

  // Delete the individual of Method entity
  deleteIndivid(fid, falseAsReject = false) {
    const query = `DELETE { ?s ?p ?o }
      WHERE { ?s ?p ?o FILTER(?s = ${axiomWithPrefix(fid)}) }`;
    if (!falseAsReject) {
      return stardog.query({ query });
    }

    const dfd = new Deferred();
    stardog.query({ query }).then(resp => {
      if (resp.data.boolean) {
        return dfd.resolve(resp);
      }
      return dfd.reject({
        success: false,
        code: 500,
        message: `Deleting individual ${fid} of Method entity is failed`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Select all individuals of Method entity by options
  selectIndivids({ forSubjects, forNotSubjects, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?method :title ?title .
        ${qType(['method', 'a'], [METHOD_TYPE, subtypes])}
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
        FILTER(?type = ${axiomWithPrefix(METHOD_TYPE)} && ?method = ${axiomWithPrefix(fid)})
      } LIMIT 1 OFFSET 0
    `;

    const dfd = new Deferred();
    stardog.query({ query }).then(resp => {
      if (!resp.data.length) {
        dfd.reject({
          success: false,
          code: 404,
          message: 'Not found',
          data: null,
        });
      } else {
        dfd.resolve({ ...resp, data: resp.data[0] });
      }
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
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
        ${qType(['type', 'rdfs:subClassOf'], [METHOD_TYPE, subtypes])} ; rdfs:label ?title
        FILTER(?type != ${axiomWithPrefix(METHOD_TYPE)})
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['method', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
