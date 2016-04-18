import RdfBaseStorage from './rdfbase.storage';
import {
    qFidAs,
    qSort,
    qType,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
    qTypeRestrict,
} from '../util/owlUtils';

class WasteStorage extends RdfBaseStorage {
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

  createTypeReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} rdfs:label "${value}"@ru .`;
      case 'aggregateState':
        return `${fid} rdfs:subClassOf
          ${qTypeRestrict(['hasAggregateState', 'owl:hasValue'], value)} .`;
      case 'hazardClass':
        return `${fid} rdfs:subClassOf
          ${qTypeRestrict(['hasHazardClass', 'owl:hasValue'], value)} .`;
      case 'origin':
        return `${fid} rdfs:subClassOf
          ${qTypeRestrict(['hasOrigin', 'owl:hasValue'], value)} .`;
      case 'method':
        return `${fid} rdfs:subClassOf
          ${qTypeRestrict(['hasMethod', 'owl:someValuesFrom'], value)} .`;
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

  updateTypeReducer(key, value) {
    switch (key) {
      case 'title':
        return [`?ind rdfs:label "${value}"@ru .`, '?ind rdfs:label ?title .'];
      case 'aggregateState':
        return [
          `?ind rdfs:subClassOf ${qTypeRestrict(['hasAggregateState', 'owl:hasValue'], value)} .`,
          `?ind rdfs:subClassOf ?_aggregateState .
           ?_aggregateState a owl:Restriction ; owl:onProperty :hasAggregateState ;
           owl:hasValue ?aggregateState .`,
        ];
      case 'hazardClass':
        return [
          `?ind rdfs:subClassOf ${qTypeRestrict(['hasHazardClass', 'owl:hasValue'], value)} .`,
          `?ind rdfs:subClassOf ?_hazardClass .
           ?_hazardClass a owl:Restriction ; owl:onProperty :hasHazardClass ;
           owl:hasValue ?hazardClass .`,
        ];
      case 'origin':
        return [
          `?ind rdfs:subClassOf ${qTypeRestrict(['hasOrigin', 'owl:hasValue'], value)} .`,
          `?ind rdfs:subClassOf ?_origin .
           ?_origin a owl:Restriction ; owl:onProperty :hasOrigin ;
           owl:hasValue ?origin .`,
        ];
      case 'method':
        return [
          `?ind rdfs:subClassOf ${qTypeRestrict(['hasMethod', 'owl:someValuesFrom'], value)} .`,
          `?ind rdfs:subClassOf ?_method .
           ?_method a owl:Restriction ; owl:onProperty :hasMethod ;
           owl:someValuesFrom ?method .`,
        ];
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
    return RdfBaseStorage.exec(query);
  }

  selectIndividByFid(fid) {
    const query = `
      SELECT ${qFidAs('waste', 'fid')} ?amount ?title
      WHERE {
        ?waste a ?type ; :amount ?amount ; :title ?title
        FILTER(?type = :SpecificWaste && ?waste = ${axiomWithPrefix(fid)})
      } LIMIT 1 OFFSET 0
    `;
    return RdfBaseStorage.execWithHandle(query, (resp, next, error) => {
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
      return RdfBaseStorage.exec(query);
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
    return RdfBaseStorage.exec(query);
  }

  // Select all individuals of Origin entity
  selectOrigins({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('origin', 'fid')} ?title WHERE {
        ?origin a :Origin ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfBaseStorage.exec(query);
  }

  // Select all individuals of HazardClass entity
  selectHazardClasses({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('class', 'fid')} ?title WHERE {
        ?class a :HazardClass ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfBaseStorage.exec(query);
  }

  // Select all individuals of AggregateState entity
  selectAggregateStates({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('state', 'fid')} ?title WHERE {
        ?state a :AggregateState ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return RdfBaseStorage.exec(query);
  }
}

export default new WasteStorage();
