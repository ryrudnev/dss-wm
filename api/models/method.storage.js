import RdfBaseStorage from './rdfbase.storage';
import {
    qFidAs,
    qSort,
    qType,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import { __ } from '../core/translations';

class MethodStorage extends RdfBaseStorage {
  get entity() {
    return 'Method';
  }

  deleteReducer(fid, { forSubject }) {
    return forSubject ? `${axiomWithPrefix(forSubject)} :hasMethod ?s` : '';
  }

  createIndividReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} :title "${value}" .`;
      case 'costOnWeight':
      case 'costOnDistance':
      case 'costByService':
        return `${fid} ${axiomWithPrefix(key)} ${+value} .`;
      case 'forSubject':
        return `${axiomWithPrefix(value)} :hasMethod ${fid} .`;
      default:
        return '';
    }
  }

  updateIndividReducer(key, value) {
    const pred = axiomWithPrefix(key);
    switch (key) {
      case 'title':
        return [`?ind :title "${value}" .`, '?ind :title ?title .'];
      case 'costOnWeight':
      case 'costOnDistance':
      case 'costByService':
        return [`?ind ${pred} ${+value} .`, `?ind ${pred} ?${key} .`];
      case 'forSubject':
        return [`${axiomWithPrefix(value)} :hasMethod ?ind .`, '?subject :hasMethod ?ind .'];
      case 'type':
        return [`?ind a ${axiomWithPrefix(value)} .`, '?ind a ?type .'];
      default:
        return [];
    }
  }

  selectIndivids({ forSubjects, forNotSubjects, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?method :title ?title .
        ${qType(['method', 'a'], [this.entity, subtypes])}
        OPTIONAL { ?method :costOnWeight ?costOnWeight }
        OPTIONAL { ?method :costOnDistance ?costOnDistance }
        OPTIONAL { ?method :costByService ?costByService }
        ${qInFilter(['subject', ':hasMethod', 'method'], forSubjects)}
        ${qNotInFilter(['subject', ':hasMethod', 'method'], forNotSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }

  selectIndividByFid(fid, { forSubject } = {}) {
    const query = `
      SELECT ${qFidAs('method', 'fid')} ?title
      ?costOnWeight ?costOnDistance ?costByService
      ${forSubject ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?method a ?type ; :title ?title
        OPTIONAL { ?method :costOnWeight ?costOnWeight }
        OPTIONAL { ?method :costOnDistance ?costOnDistance }
        OPTIONAL { ?method :costByService ?costByService }
        ${qInFilter(['subject', ':hasMethod', 'method'], forSubject)}
        FILTER(?type = ${this.entityWithPrefix} && ?method = ${axiomWithPrefix(fid)})
      } LIMIT 1 OFFSET 0
    `;
    return RdfBaseStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.length > 0) {
        next({ ...resp, data: resp.data[0] });
      } else { error({ code: 404, message: __('Not found'), data: null }); }
    });
  }

  selectTypes({ forWaste, individs, types, subtypes, sort, offset, limit } = {}) {
    if (individs && subtypes) {
      const query = `
        SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
        ${qFidAs('method', 'methodFid')}
        WHERE {
          ?type rdfs:subClassOf ${this.entityWithPrefix} ; rdfs:label ?title.
          ?method a ?type
          ${qInFilter(['method'], individs)}
        } ${qSort(sort)} ${qLimitOffset(limit, offset)}
      `;
      return RdfBaseStorage.exec(query, false);
    }

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
      return RdfBaseStorage.exec(query);
    }
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('method', 'methodFid') : ''}
      WHERE {
        ${qType(['type', 'rdfs:subClassOf'], [this.entity, subtypes])} ; rdfs:label ?title
        FILTER(?type != ${this.entityWithPrefix})
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['method', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }

  selectTypeByFid(fid) {
    const query = `
      SELECT ${qFidAs('type', 'fid')} ?title
      WHERE {
        ?type rdfs:label ?title ; rdfs:subClassOf ${this.entityWithPrefix}
        ${qInFilter(['type'], fid)}
      }
    `;
    return RdfBaseStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.length > 0) {
        next({ ...resp, data: resp.data[0] });
      } else { error({ code: 404, message: __('Not found'), data: null }); }
    });
  }

  createTypeReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} rdfs:label "${value}"@ru .`;
      default:
        return '';
    }
  }

  updateTypeReducer(key, value) {
    switch (key) {
      case 'title':
        return [`?ind rdfs:label "${value}"@ru .`, '?ind rdfs:label ?title .'];
      default:
        return [];
    }
  }
}

export default new MethodStorage();

// Constant of transportation method type
export const TRANSPORT_METHOD = 'Transportation';

// Calculate uses cost of waste management method
export function calcMethodCost(wasteAmount, { costOnWeight, costByService }) {
  return (+costByService || 0) + (+wasteAmount || 0) * (+costOnWeight || 0);
}
