import {
    qSort,
    qType,
    qFidAs,
    qInFilter,
    qLimitOffset,
    axiomWithPrefix,
    axiomWithoutPrefix,
} from '../util/owlUtils';
import { Deferred, intersectSet, getEqualKeySetmap, onError } from '../util/utils';
import { getGeoDistance } from '../util/geoUtils';
import { TRANSPORT_METHOD, calcMethodCost } from './method.model';
import stardog from '../services/stardog';
import uidCounter from '../services/counter';

// Constant of base type of Subject entity
export const SUBJECT_TYPE = 'Subject';

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
    const curKey = new Set((wasteMethodTypes[curWaste.fid] || []).map(w => w.fid));
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

export default {
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

    const strategy = [];
    // Methods type as Set of their keys.
    const ownMethodTypes = new Set(Object.keys(ownMethods));
    const methodTypes = new Set(Object.keys(methods));
    // Cached all available transportation
    const transportation = methods[TRANSPORT_METHOD];

    for (const [group, waste] of groupWaste(ownWaste, wasteMethods)) {
      // Calculate total amount of all own waste for the current group
      const totalAmount = waste.reduce((prev, val) => prev + +val.amount, 0);

      if (!group.size) {  // No available waste management methods for group of waste
        strategy.push({ waste, totalAmount: totalAmount.toFixed(3) });
        continue;
      }

      const curStrategy = {};
      // The current group of waste can transportation
      const canTransport = group.has(TRANSPORT_METHOD);

      if (canTransport && ownMethodTypes.has(TRANSPORT_METHOD)) {
        curStrategy.ownTransportations = ownMethods[TRANSPORT_METHOD];
      }

      // Other own waste management methods for the current group of waste
      const ownAvailableMethodTypes = intersectSet(group, ownMethodTypes);
      ownAvailableMethodTypes.delete(TRANSPORT_METHOD); // without type of transportation
      if (ownAvailableMethodTypes.size) {
        curStrategy.ownMethods = [...ownAvailableMethodTypes].reduce(
            (prev, methodType) => [...prev, ...ownMethods[methodType]], []
        );
      }

      // Try to find the best way of waste management method from other a subjects,
      // if the waste can be transported
      if (!canTransport || !methodTypes.has(TRANSPORT_METHOD)) {
        strategy.push({
          waste,
          totalAmount: totalAmount.toFixed(3),
          strategy: curStrategy,
        });
        continue;
      }

      const availableMethodTypes = intersectSet(group, methodTypes);
      availableMethodTypes.delete(TRANSPORT_METHOD); // without type of transportation

      // Find best method from other a subjects by a cost
      let [bestTransportation, bestMethod, bestCost] = [];
      [...availableMethodTypes].forEach(methodType => {
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
        curStrategy.bestTransportation = bestTransportation;
        curStrategy.bestMethod = bestMethod;
        curStrategy.bestCost = bestCost.toFixed(2);
      }

      strategy.push({
        waste,
        totalAmount: totalAmount.toFixed(3),
        strategy: curStrategy,
      });
    }
    // Results of searching algorithm of waste management strategy
    const result = { subject, strategy };

    // Get best total cost of uses best waste management methods for all group of waste
    const totalBestCost = strategy.reduce((total, v) =>
        (!v.strategy || !v.strategy.bestCost ? total : +total + +v.strategy.bestCost), null
    );

    if (totalBestCost) {
      result.totalBestCost = totalBestCost.toFixed(2);
    }

    return result;
  },

  // Check exists individual of Subject entity
  individExists(individ, falseAsReject = false) {
    const query = `
      ASK { ${axiomWithPrefix(individ)} a ${axiomWithPrefix(SUBJECT_TYPE)} ; :title ?title }
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
        message: `Individual ${individ} of Subject entity is not exists`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Check exists type of Subject entity
  typeExists(type, falseAsReject = false) {
    const query = `
      ASK {
       ${axiomWithPrefix(type)} rdfs:subClassOf ${axiomWithPrefix(SUBJECT_TYPE)} ; rdfs:label ?title
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
        message: `Type ${type} of Subject entity is not exists`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Create a new individual of Subject entity
  createIndivid(type = SUBJECT_TYPE, data = {}) {
    return uidCounter.generateUid().then(uid => {
      const fid = axiomWithPrefix(uid);
      const qdata = Object.keys(data).reduce((prev, key) => {
        switch (key) {
          case 'title':
            return `${prev} ${fid} :title "${data[key]}" .`;
          case 'coordinates':
            return `${prev} ${fid} :coordinates "${
                Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]
                }" .`;
          case 'budget':
            return `${prev} ${fid} :budget ${+data[key]} .`;
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

  // Update the individual of Subject entity
  updateIndivid(fid, data) {
    let [qinsert, qwhere] = ['', ''];
    Object.keys(data || {}).forEach((key) => {
      const pred = axiomWithPrefix(key);
      switch (key) {
        case 'title':
          qwhere = `${qwhere} ?s ${pred} ?${key} .`;
          qinsert = `${qinsert} ?s ${pred} "${data[key]}" .`;
          break;
        case 'coordinates':
          qwhere = `${qwhere} ?s ${pred} ?${key} .`;
          qinsert = `${qinsert} ?s ${pred} "${
              Array.isArray(data[key]) ? JSON.stringify(data[key]) : data[key]
              }" .`;
          break;
        case 'budget':
          qwhere = `${qwhere} ?s ${pred} ?${key} .`;
          qinsert = `${qinsert} ?s ${pred} ${+data[key]} .`;
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
        ?m a ${axiomWithPrefix(SUBJECT_TYPE)} .
        ${qwhere}
        FILTER(?m = ${axiomWithPrefix(fid)})
    }`;
    return stardog.query({ query });
  },

  // Delete the individual of Subject entity
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
        message: `Deleting individual ${fid} of Subject entity is failed`,
        data: null,
      });
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  },

  // Select all individuals of Subject entity by options
  selectIndivids({ subtypes, byMethods, byWaste, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      ${byMethods ? qFidAs('method', 'methodFid') : ''}
      ${byWaste ? qFidAs('waste', 'wasteFid') : ''}
      WHERE {
        ?subject :title ?title .
        ${qType(['subject', 'a'], [SUBJECT_TYPE, subtypes])}
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        ${qInFilter(['subject', ':hasMethod', 'method', true], byMethods)}
        ${qInFilter(['subject', ':hasWaste', 'waste', true], byWaste)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select the individual of Subject entity by FID
  selectIndividByFid(fid) {
    const query = `
      SELECT DISTINCT ${qFidAs('subject', 'fid')} ?title ?coordinates ?budget
      WHERE {
        ?subject a ?type ; :title ?title
        OPTIONAL { ?subject :coordinates ?coordinates }
        OPTIONAL { ?subject :budget ?budget }
        FILTER(?type = ${axiomWithPrefix(SUBJECT_TYPE)} && ?subject = ${axiomWithPrefix(fid)})
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

  // Select all locations for subjects
  selectLocationsFor({ subtypes, forSubjects, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('location', 'fid')} ?title
      ${qFidAs('subject', 'subjectFid')}
      WHERE {
        ?location :title ?title .
        ${qType(['location', 'a'], [SUBJECT_TYPE, subtypes])} .
        ${qInFilter(['subject', ':locatedIn', 'location'], forSubjects)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },

  // Select all specific types of Subject entity by options
  selectTypes({ individs, types, subtypes, sort, offset, limit } = {}) {
    const query = `
      SELECT DISTINCT ${qFidAs('type', 'fid')} ?title
      ${individs ? qFidAs('subject', 'subjectFid') : ''}
      WHERE {
        ${qType(['type', 'rdfs:subClassOf'], [SUBJECT_TYPE, subtypes])} ; rdfs:label ?title
        FILTER(?type != ${axiomWithPrefix(SUBJECT_TYPE)})
        ${types ? `?subtype rdfs:subClassOf ?type FILTER(?subtype != ?type)
        ${qInFilter(['subtype'], types)}` : ''}
        ${qInFilter(['subject', 'a', 'type'], individs)}
      } ${qSort(sort)} ${qLimitOffset(limit, offset)}
    `;

    return stardog.query({ query });
  },
};
