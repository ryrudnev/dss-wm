import RdfStorage from './rdf.storage';
import {
    qFidAs,
    qSort,
    qType,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';

class WasteStorage extends RdfStorage {
  get entity() {
    return 'Waste';
  }

  createIndividReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} :title "${value}" .`;
      case 'amount':
        return `${fid} ${axiomWithPrefix(key)} ${+value} .`;
      case 'forSubject':
        return `${axiomWithPrefix(value)} :hasMethod ${fid} .`;
      default:
        return '';
    }
  }

  updateIndividReducer(key, value) {
    switch (key) {
      case 'title':
        return [`?ind :title "${value}" .`, '?ind :title ?title .'];
      case 'amount':
        return [`?ind :amount ${+value} .`, '?ind :amount ?amount .'];
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
      SELECT DISTINCT ${qFidAs('waste', 'fid')} ?amount ?title
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?waste :amount ?amount ; :title ?title .
        ${qType(['waste', 'a'], [':SpecificWaste', subtypes])} .
        ${qInFilter(['subject', ':hasWaste', 'waste'], forSubjects)}
        ${qNotInFilter(['subject', ':hasMethod', 'method'], forNotSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfStorage.exec(query);
  }

  selectIndividByFid(fid) {
    const query = `
      SELECT ${qFidAs('waste', 'fid')} ?amount ?title
      WHERE {
        ?waste a ?type ; :amount ?amount ; :title ?title
        FILTER(?type = :SpecificWaste && ?waste = ${axiomWithPrefix(fid)})
      } LIMIT 1 OFFSET 0
    `;
    return RdfStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.length) {
        return next({ ...resp, data: resp.data[0] });
      }
      return error({
        success: false,
        code: 404,
        message: 'Not found',
        data: null,
      });
    });
  }

  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    if (!individs && !types) {
      const query = `
        SELECT DISTINCT ${qFidAs('type', 'fid')} ?title WHERE {
          ${qType(['type', 'rdfs:subClassOf'], [':SpecificWaste', subtypes])} ; rdfs:label ?title
          FILTER(?type != :SpecificWaste)
        } ${qSort(sort)} ${qLimitOffset(limit, offset)}
      `;
      return RdfStorage.exec(query);
    }

    const evidences = [
      'Composition',
      'Hazardous',
      'Processable',
      'Substance',
      'SpecificWaste',
      'Waste',
    ];

    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?type rdfs:subClassOf ${this.entityWithPrefix} OPTIONAL { ?type rdfs:label ?title } .
        ${qInFilter(['waste', 'a', 'type'], individs)}
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qNotInFilter(['type'], evidences)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfStorage.exec(query);
  }

  // Select all individuals of Origin entity
  selectOrigins({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('origin', 'fid')} ?title WHERE {
        ?origin a :Origin ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfStorage.exec(query);
  }

  // Select all individuals of HazardClass entity
  selectHazardClasses({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('class', 'fid')} ?title WHERE {
        ?class a :HazardClass ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfStorage.exec(query);
  }

  // Select all individuals of AggregateState entity
  selectAggregateStates({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('state', 'fid')} ?title WHERE {
        ?state a :AggregateState ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfStorage.exec(query);
  }
}

export default new WasteStorage();
