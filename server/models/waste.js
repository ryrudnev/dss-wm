import {
    qSort,
    qType,
    qFidAs,
    qForSubject,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import stardog from '../services/stardog';
import { flatten } from '../util/utils';

export default {
  // Select all individuals of Waste entity by options
  selectIndivids({ types, forSubject, sort, offset = 0, limit = 30 } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('?waste', '?fid')} ?amount ?title WHERE {
        ?waste :amount ?amount ; :title ?title ${qType('a', [':SpecificWaste', types])} .
        ${qForSubject(':hasWaste', '?waste', forSubject)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Waste entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT ${qFidAs('?waste', '?fid')} ?amount ?title
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

  // Select all types of Waste entity by options
  selectTypes({ types, sort, offset = 0, limit = 30 } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('?type', '?fid')} ?title WHERE {
        ?type rdfs:label ?title ${qType('rdfs:subClassOf', [':SpecificWaste', types])}
        FILTER(?type != :SpecificWaste)
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all subtypes of specific type of Waste entity by options
  selectSubTypes({ individs, types, sort, offset, limit }) {
    let qfilter = '';

    if (individs) {
      qfilter = `{
        SELECT ?type ?waste ?w WHERE {
          ?waste a ?type
          FILTER (?waste IN (${flatten([individs]).map(axiomWithPrefix).join()}))
        }
      }`;
    } else if (types) {
      qfilter = `
        FILTER (?type IN (${flatten([types]).map(axiomWithPrefix).join()}))
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
      SELECT DISTINCT ${qFidAs('?subtype', '?fid')} ?title
      ${individs ? qFidAs('?waste', '?wasteFid') : ''}
    `;

    const evidences = [
      ':Composition',
      ':Hazardous',
      ':Processable',
      ':Substance',
    ];

    if (individs) {
      evidences.push(':SpecificWaste');
    }

    const qbody = evidences.reduce((res, val, i) => {
      let q = i > 0 ? `${res}UNION` : res;
      q += `{
        ?type rdfs:subClassOf ?subtype .
        ?subtype rdfs:subClassOf ${val} ; rdfs:label ?title
        FILTER(?subtype != ${val})
      }`;
      return q;
    }, '');

    const query = `
      ${qselect} WHERE {
        ${qbody} ${qfilter}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all individuals of Origin entity
  selectOrigins({ sort, offset = 0, limit = 30 } = {}) {
    const query = `
      SELECT ${qFidAs('?origin', '?fid')} ?title WHERE {
        ?origin a :Origin ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },

  // Select all individuals of HazardClass entity
  selectHazardClasses({ sort, offset = 0, limit = 30 } = {}) {
    const query = `
      SELECT ${qFidAs('?class', '?fid')} ?title WHERE {
        ?class a :HazardClass ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },

  // Select all individuals of AggregateState entity
  selectAggregateStates({ sort, offset = 0, limit = 30 } = {}) {
    const query = `
      SELECT ${qFidAs('?state', '?fid')} ?title WHERE {
        ?state a :AggregateState ; :title ?title
    } ${qSort(sort)} ${qLimitOffset(limit, offset)}`;
    return stardog.query({ query });
  },
};