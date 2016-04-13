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
  // Select all individuals of Waste entity by options
  selectIndivids({ forSubjects, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('waste', 'fid')} ?amount ?title
      ${forSubjects ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?waste :amount ?amount ; :title ?title .
        ${qType(['waste', 'a'], [':SpecificWaste', subtypes])} .
        ${qInFilter(['subject', ':hasWaste', 'waste'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Waste entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT ${qFidAs('waste', 'fid')} ?amount ?title
      WHERE {
        ?waste a ?type ; :amount ?amount ; :title ?title
        FILTER(?type = :SpecificWaste && ?waste = ${axiomWithPrefix(fid)})
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

  // Select all specific types of Waste entity by options
  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    if (!individs && !types) {
      const query = `
        SELECT DISTINCT ${qFidAs('type', 'fid')} ?title WHERE {
          ${qType(['type', 'rdfs:subClassOf'], [':SpecificWaste', subtypes])} ; rdfs:label ?title
          FILTER(?type != :SpecificWaste)
        } ${qSort(sort)} ${qLimitOffset(limit, offset)}
      `;
      return stardog.query({ query });
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
        ?type rdfs:subClassOf :Waste OPTIONAL { ?type rdfs:label ?title } .
        ${qInFilter(['waste', 'a', 'type'], individs)}
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qNotInFilter(['type'], evidences)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all individuals of Origin entity
  selectOrigins({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('origin', 'fid')} ?title WHERE {
        ?origin a :Origin ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },

  // Select all individuals of HazardClass entity
  selectHazardClasses({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('class', 'fid')} ?title WHERE {
        ?class a :HazardClass ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },

  // Select all individuals of AggregateState entity
  selectAggregateStates({ sort, offset, limit } = {}) {
    const query = `
      SELECT ${qFidAs('state', 'fid')} ?title WHERE {
        ?state a :AggregateState ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },
};
