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
import { __ } from '../core/translations';

class WasteStorage extends RdfBaseStorage {
  get entity() {
    return 'Waste';
  }

  deleteReducer(fid, { forSubject }) {
    return forSubject ? `${axiomWithPrefix(forSubject)} :hasWaste ?s` : '';
  }

  createIndividReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} :title "${value}" .`;
      case 'amount':
        return `${fid} ${axiomWithPrefix(key)} ${+value} .`;
      case 'forSubject':
        return `${axiomWithPrefix(value)} :hasWaste ${fid} .`;
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
      case 'origins':
        return `${fid} rdfs:subClassOf
          ${qTypeRestrict(['hasOrigin', 'owl:hasValue'], value)} .`;
      case 'methods':
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
        return [`${axiomWithPrefix(value)} :hasWaste ?ind .`, '?subject :hasWaste ?ind .'];
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
      case 'origins':
        return [
          `?ind rdfs:subClassOf ${qTypeRestrict(['hasOrigin', 'owl:hasValue'], value)} .`,
          `?ind rdfs:subClassOf ?_origin .
           ?_origin a owl:Restriction ; owl:onProperty :hasOrigin ;
           owl:hasValue ?origin .`,
        ];
      case 'methods':
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
        ${qNotInFilter(['subject', ':hasWaste', 'waste'], forNotSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }

  selectIndividByFid(fid, { forSubject } = {}) {
    const query = `
      SELECT ${qFidAs('waste', 'fid')} ?amount ?title
      ${forSubject ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ?waste a ?type ; :amount ?amount ; :title ?title
        FILTER(?type = :SpecificWaste && ?waste = ${axiomWithPrefix(fid)})
        ${qInFilter(['subject', ':hasWaste', 'waste'], forSubject)}
      } LIMIT 1 OFFSET 0
    `;
    return RdfBaseStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.length > 0) {
        next({ ...resp, data: resp.data[0] });
      } else {
        error({ code: 404, message: __('Not found'), data: null });
      }
    });
  }

  selectTypeByFid(fid) {
    const promises = [
      RdfBaseStorage.exec(`
        SELECT ${qFidAs('type', 'fid')} ?title
        WHERE {
          ?type rdfs:label ?title ; rdfs:subClassOf :SpecificWaste ${qInFilter(['type'], fid)}
        }
      `),

      RdfBaseStorage.exec(`
        SELECT ${qFidAs('aggregateState', 'fid')} ?title
        WHERE {
          ?type rdfs:subClassOf :SpecificWaste,
          ${qTypeRestrict(['hasAggregateState', 'owl:hasValue'], '?aggregateState', false)}
          ${qInFilter(['type'], fid)}
          ?aggregateState :title ?title
        }
      `),

      RdfBaseStorage.exec(`
        SELECT ${qFidAs('hazardClass', 'fid')} ?title
        WHERE {
          ?type rdfs:subClassOf :SpecificWaste,
          ${qTypeRestrict(['hasHazardClass', 'owl:hasValue'], '?hazardClass', false)}
          ${qInFilter(['type'], fid)}
          ?hazardClass :title ?title
        }
      `),

      RdfBaseStorage.exec(`
        SELECT ${qFidAs('origin', 'fid')} ?title
        WHERE {
          ?type rdfs:subClassOf :SpecificWaste,
          ${qTypeRestrict(['hasOrigin', 'owl:hasValue'], '?origin', false)}
          ${qInFilter(['type'], fid)}
          ?origin :title ?title
        }
      `),

      RdfBaseStorage.exec(`
        SELECT ${qFidAs('methodType', 'fid')} ?title
        WHERE {
          ?type rdfs:subClassOf :SpecificWaste,
          ${qTypeRestrict(['hasMethod', 'owl:someValuesFrom'], '?methodType', false)}
          ${qInFilter(['type'], fid)}
          ?methodType rdfs:label ?title
        }
      `),
    ];
    return Promise.all(promises).then(results => {
      const [type, aggregate, hazard, origins, methods] = results;

      if (!type.success || !(type.data || []).length) {
        return Promise.reject({ code: 404, message: __('Not found'), data: null });
      }

      const wasteType = {
        ...type.data[0],
        aggregateState: (aggregate.data || [])[0] || null,
        hazardClass: (hazard.data || [])[0] || null,
        origins: origins.data || null,
        methods: methods.data || null,
      };

      return Promise.resolve({ data: wasteType });
    });
  }

  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    if (individs && subtypes) {
      const query = `
        SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
        ${qFidAs('waste', 'wasteFid')}
        WHERE {
          ?type rdfs:subClassOf :SpecificWaste ; rdfs:label ?title.
          ?waste a ?type
          ${qInFilter(['waste'], individs)}
        } ${qSort(sort)} ${qLimitOffset(limit, offset)}
      `;
      return RdfBaseStorage.exec(query, false);
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
        ${qType(['type', 'rdfs:subClassOf'], [this.entity, subtypes])} ; rdfs:label ?title .
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['waste', 'a', 'type'], individs)}
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
