import RdfBaseStorage from './rdfbase.storage';
import { TRANSPORT_METHOD, calcMethodCost } from './method.storage';
import { intersectSet, getEqualKeySetmap } from '../util/utils';
import { getGeoDistance } from '../util/geoUtils';
import {
    qFidAs,
    qSort,
    qType,
    qInFilter,
    qLimitOffset,
    axiomWithPrefix,
} from '../util/owlUtils';
import { __ } from '../core/translations';

// Key = {reciver.fid}, Value = [distance, amount: {cost, method}]
const cachedDistances = new Map();

// Get valid distance from subject or null
function distance({ coordinates }) {
  if (!coordinates) {
    return null;
  } else if (Array.isArray(coordinates)) {
    return coordinates;
  }

  try {
    return JSON.parse(coordinates);
  } catch (err) {
    return null;
  }
}

// Group waste by their available methods
function groupWaste(waste, wasteMethodTypes) {
  const wasteMap = new Map();
  for (const curWaste of waste) {
    const curKey = new Set(Array.from(wasteMethodTypes[curWaste.fid]).map(w => w.fid));
    const existingKey = getEqualKeySetmap(wasteMap, curKey);
    if (!existingKey) {
      wasteMap.set(curKey, [curWaste]);
    } else {
      wasteMap.set(existingKey, [...wasteMap.get(existingKey), curWaste]);
    }
  }
  return wasteMap;
}

// Get best transport by a cost
// Distance and best transportation is cached in a map
function getBestTransport(source, reciver, wasteAmount, transportations) {
  let cached = cachedDistances.get(reciver.fid) || {};

  const bestTransport = cached[wasteAmount];
  if (bestTransport) {
    return bestTransport;
  }

  let dist;
  if (cached.distance) {
    dist = cached.distance;
  } else {
    dist = getGeoDistance(distance(source), distance(reciver));
    cachedDistances.set(reciver.fid, (cached = { distance: dist }));
  }

  let [cost, method] = [];
  transportations.forEach(t => {
    const c = (+t.costOnDistance || 0) * (dist / 100) + calcMethodCost(wasteAmount, t);
    if (cost === undefined || cost >= c) {
      cost = c;
      method = t;
    }
  });

  cached[wasteAmount] = { cost, method };
  cachedDistances.set(reciver.fid, cached);
  return cached[wasteAmount];
}

class SubjectStorage extends RdfBaseStorage {
  get entity() {
    return 'Subject';
  }

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
  // {
  //   subject: {fid, title, coordinates, budget},
  //   strategy: [
  //      {
  //         waste: [{fid, title, amount}..., ]
  //         totalAmount: integer
  //         strategy: {
  //            ownTransportations: [{method}...,],
  //            ownMethods: [{method}...,],
  //            bestTransportation: {subject, method, cost},
  //            bestMethod: {subject, method, cost},
  //            bestCost: integer,
  //         }
  //      }, ...
  //   ],
  //   totalBestCost: integer
  // }
  genStrategy({ subject, ownWaste, wasteMethods, ownMethods, methods }) {
    // Clear cache of calculated distance for a subjects.
    cachedDistances.clear();

    const coordinates = distance(subject);
    if (!coordinates) { // Can not calculate distance!
      return null;
    }
    // The subject as source for calculating distance
    const source = { coordinates };

    const strategies = [];
    // Methods type as Set of their keys.
    const ownMethodTypes = new Set(Object.keys(ownMethods));
    const methodTypes = new Set(Object.keys(methods));
    // Cached all available transportation
    const transportation = methods[TRANSPORT_METHOD];

    for (const [group, waste] of groupWaste(ownWaste, wasteMethods)) {
      // Calculate total amount of all own waste for the current group
      const totalAmount = waste.reduce((prev, val) => prev + +val.amount, 0);

      if (!group.size) {  // No available waste management methods for group of waste
        strategies.push({ waste, totalAmount });
        continue;
      }

      const strategy = {};
      // The current group of waste can transportation
      const canTransport = group.has(TRANSPORT_METHOD);

      if (canTransport && ownMethodTypes.has(TRANSPORT_METHOD)) {
        strategy.ownTransportations = ownMethods[TRANSPORT_METHOD];
      }

      // Other own waste management methods for the current group of waste
      const ownAvailableMethodTypes = intersectSet(group, ownMethodTypes);
      ownAvailableMethodTypes.delete(TRANSPORT_METHOD); // without type of transportation
      if (ownAvailableMethodTypes.size) {
        console.log(ownAvailableMethodTypes);
        strategy.ownMethods = Array.from(ownAvailableMethodTypes).reduce(
            (prev, methodType) => [...prev, ...ownMethods[methodType]], []
        );
      }

      // Try to find the best way of waste management method from other a subjects,
      // if the waste can be transported
      if (!canTransport || !methodTypes.has(TRANSPORT_METHOD)) {
        strategies.push({ waste, totalAmount, strategy });
        continue;
      }

      const availableMethodTypes = intersectSet(group, methodTypes);
      availableMethodTypes.delete(TRANSPORT_METHOD); // without type of transportation

      // Find best method from other a subjects by a cost
      let [bestTransportation, bestMethod, bestCost] = [];
      Array.from(availableMethodTypes).forEach(methodType => {
        methods[methodType].forEach(method => {
          const transport = getBestTransport(source, method.subject, totalAmount, transportation);
          const cost = calcMethodCost(totalAmount, method) + transport.cost;
          if (bestCost === undefined || bestCost >= cost) {
            bestTransportation = transport.method;
            bestMethod = method;
            bestCost = cost;
          }
        });
      });

      if (bestCost !== undefined) {
        Object.assign(strategy, { bestTransportation, bestMethod, bestCost });
      }

      strategies.push({ waste, totalAmount, strategy });
    }

    // Results of searching algorithm of waste management strategy
    return {
      subject,
      strategies,
      // Get best total cost of uses best waste management methods for all group of waste
      totalBestCost: strategies.reduce((total, v) =>
          (!v.strategy || !v.strategy.bestCost ? total : total + v.strategy.bestCost), null
      ),
    };
  }

  createIndividReducer(key, value, fid) {
    switch (key) {
      case 'title':
        return `${fid} :title "${value}" .`;
      case 'coordinates':
        return `${fid} :coordinates "${
            Array.isArray(value) ? JSON.stringify(value) : value
            }" .`;
      case 'budget':
        return `${fid} :budget ${+value} .`;
      default:
        return '';
    }
  }

  updateIndividReducer(key, value) {
    switch (key) {
      case 'title':
        return [`?ind :title "${value}" .`, '?ind :title ?title .'];
      case 'coordinates':
        return [`?ind :coordinates "${
            Array.isArray(value) ? JSON.stringify(value) : value}" .`,
          '?ind :coordinates ?coordinates .'];
      case 'budget':
        return [`?ind :budget ${+value} .`, '?ind :budget ?budget .'];
      case 'type':
        return [`?ind a ${axiomWithPrefix(value)} .`, `?ind a ?${key} .`];
      default:
        return [];
    }
  }

  selectIndivids({ fids, subtypes, byMethods, byWaste, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      ${byMethods ? qFidAs('method', 'methodFid') : ''}
      ${byWaste ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?subject :title ?title .
        ${qType(['subject', 'a'], [this.entity, subtypes])}
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        ${qInFilter(['subject', void 0, void 0], fids)}
        ${qInFilter(['subject', ':hasMethod', 'method', true], byMethods)}
        ${qInFilter(['subject', ':hasWaste', 'waste', true], byWaste)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }

  selectIndividByFid(fid) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      WHERE {
        ?subject a ?type ; :title ?title
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        FILTER(?type = ${this.entityWithPrefix} && ?subject = ${axiomWithPrefix(fid)})
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

  selectLocationsFor({ subtypes, forSubjects, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('location', 'fid')} ?title
      ${qFidAs('subject', 'subjectFid')}
      WHERE {
        ?location :title ?title .
        ${qType(['location', 'a'], [this.entity, subtypes])} .
        ${qInFilter(['subject', ':locatedIn', 'location'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }

  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ${qType(['type', 'rdfs:subClassOf'], [this.entity, subtypes])} ; rdfs:label ?title
        FILTER(?type != ${this.entityWithPrefix})
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['subject', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;
    return RdfBaseStorage.exec(query);
  }
}

export default new SubjectStorage();
