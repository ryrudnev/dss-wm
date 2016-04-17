import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qNotInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import { Deferred } from '../util/utils';
import stardog from '../services/stardog';

// Constant of base type of Waste entity
export const WASTE_TYPE = 'Waste';

export default {
  // Check exists individual of Waste entity
  individExists(individ) {
    const query = `
      ASK { ${axiomWithPrefix(individ)} a ${axiomWithPrefix(WASTE_TYPE)} }
    `;
    return stardog.query({ query });
  },

  // Check exists type of Waste entity
  typeExists(type) {
    const query = `
      ASK { ${axiomWithPrefix(type)} rdfs:subClassOf ${axiomWithPrefix(WASTE_TYPE)} }
    `;
    return stardog.query({ query });
  },

  // Select all individuals of Waste entity by options
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

    const dfd = new Deferred();
    stardog.query({ query }).then(resp => {
      if (!resp.data.length) {
        dfd.reject({ success: false, code: 404, message: 'Not found', data: null });
      } else {
        dfd.resolve({ ...resp, data: resp.data[0] });
      }
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
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
        ?type rdfs:subClassOf ${axiomWithPrefix(WASTE_TYPE)} OPTIONAL { ?type rdfs:label ?title } .
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
