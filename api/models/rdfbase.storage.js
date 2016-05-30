import { axiomWithPrefix } from '../util/owlUtils';
import { Deferred } from '../util/utils';
import Counter from '../models/counter.model';
import stardog from '../core/stardog';
import { __ } from '../core/translations';

function exec(query) {
  return stardog.query({ query });
}

function execWithHandle(query, cb) {
  const dfd = new Deferred();
  exec(query).then(resp => {
    if (cb) {
      cb(resp, dfd.resolve.bind(dfd), dfd.reject.bind(dfd));
    } else { dfd.resolve(resp); }
  }).catch(resp => dfd.reject(resp));
  return dfd.promise;
}

// Common update method for a individual and type
function update(cond, cb, fid, data) {
  let [qinsert, qwhere] = ['', ''];
  Object.keys(data || {}).forEach((key) => {
    const [insert, where] = cb(key, data[key], fid);
    if (!!insert) { qinsert = `${qinsert} ${insert}`; }
    if (!!where) { qwhere = `${qwhere} ${where}`; }
  });
  const query = `DELETE {
        ${qwhere.trim()}
      } INSERT {
        ${qinsert.trim()}
      } WHERE {
        ${cond}
        ${qwhere.trim()}
        FILTER(?ind = ${axiomWithPrefix(fid)})
    }`;
  return exec(query);
}

export default class RdfBaseStorage {
  // Base type of entity
  get entity() {
    throw new Error('Method not implemented');
  }

  // Base type of entity as axiom with prefix
  get entityWithPrefix() {
    return axiomWithPrefix(this.entity);
  }

  constructor() {
    if (this.constructor === RdfBaseStorage) {
      throw new TypeError('Cannot construct RdfBaseStorage instances directly');
    }
  }

  // Execute a query to Stardog platform and handle response before to next promises chain
  // cb(response, next, error)
  static execWithHandle(query, cb) {
    return execWithHandle(query, cb);
  }

  // Execute a query to Stardog platform. Returned promise
  static exec(query) {
    return exec(query);
  }

  // Check exists individual of entity
  individExists(individ, { falseAsReject } = {}) {
    const query = `
      ASK { ${axiomWithPrefix(individ)} a ${this.entityWithPrefix} ; :title ?title }
    `;
    if (!falseAsReject) { return exec(query); }
    return execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        next(resp);
      } else {
        error({
          code: 404,
          message: __('Individual %s of %s entity is not exists', individ, this.entity),
          data: null,
        });
      }
    });
  }

  // Check exists type of entity
  typeExists(type, { falseAsReject } = {}) {
    const query = `
      ASK {
        ${axiomWithPrefix(type)} rdfs:subClassOf ${this.entityWithPrefix} ; rdfs:label ?title
    }`;
    if (!falseAsReject) { return stardog.query({ query }); }
    return execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        next(resp);
      } else {
        error({
          code: 404,
          message: __('Type %s of %s entity is not exists', type, this.entity),
          data: null,
        });
      }
    });
  }

  // Create a new individual of entity
  createIndivid(type, data = {}) {
    return Counter.genUid().then(id => {
      const fid = axiomWithPrefix(id);
      const qdata = Object.keys(data).reduce((res, key) => {
        const reduced = this.createIndividReducer(key, data[key], fid);
        return !!reduced ? `${res} ${reduced}` : res;
      }, '');
      const query = `INSERT DATA {
        ${fid} a ${axiomWithPrefix(type || this.entity)} .
        ${qdata.trim()}
      }`;
      return execWithHandle(query, (resp, next) => next({ ...resp, data: { fid: id } }));
    });
  }

  // Create a new type of entity
  createType(subtype, data = {}) {
    return Counter.genUid().then(id => {
      const fid = axiomWithPrefix(id);
      const qdata = Object.keys(data).reduce((res, key) => {
        const reduced = this.createTypeReducer(key, data[key], fid);
        return !!reduced ? `${res} ${reduced}` : res;
      }, '');
      const query = `INSERT DATA {
        ${fid} a owl:Class ; rdfs:subClassOf ${axiomWithPrefix(subtype)} .
        ${qdata.trim()}
      }`;
      return execWithHandle(query, (resp, next) => next({ ...resp, data: { fid: id } }));
    });
  }

  // Update the individual of entity
  updateIndivid(fid, data = {}) {
    return update(`?ind a ${this.entityWithPrefix} .`,
      this.updateIndividReducer.bind(this), fid, data);
  }

  // Update the type of entity
  updateType(fid, data = {}) {
    return update('', this.updateTypeReducer.bind(this), fid, data);
  }

  // Delete the individual of entity
  deleteIndivid(fid, options = {}) {
    let cond;
    try {
      cond = this.deleteReducer(fid, options);
    } catch (e) {
      cond = '';
    }

    const { falseAsReject } = options;
    const query = `DELETE { ?s ?p ?o }
      WHERE {
        ?s ?p ?o FILTER(?s = ${axiomWithPrefix(fid)})
        ${cond}
      }`;
    if (!falseAsReject) {
      return exec(query);
    }
    return execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        next(resp);
      } else {
        error({
          code: 500,
          message: __('Deleting %s of %s entity is failed', fid, this.entity),
          data: null,
        });
      }
    });
  }

  // Delete the type of entity
  deleteType(fid, options = {}) {
    return this.deleteIndivid(fid, options);
  }

  // delete data reducer. Returned string
  deleteReducer(/* fid, options = {} */) {
    throw new Error('Method not implemented');
  }

  // Select all individuals of entity by options
  selectIndivids(/* options = {} */) {
    throw new Error('Method not implemented');
  }

  // Select the individual of entity by FID
  selectIndividByFid(/* fid, options = {} */) {
    throw new Error('Method not implemented');
  }

  // Select all specific types of entity by options
  selectTypes(/* options = {} */) {
    throw new Error('Method not implemented');
  }

  // createIndivid data reducer. Returned string
  createIndividReducer(/* key, value, fid */) {
    throw new Error('Method not implemented');
  }

  // updateIndivid data reducer. Returned [insert:string, where:string]
  updateIndividReducer(/* key, value, fid */) {
    throw new Error('Method not implemented');
  }

  // createType data reducer. Returned string
  createTypeReducer(/* key, value */) {
    throw new Error('Method not implemented');
  }

  // updateType data reducer. Returned [insert:string, where:string]
  updateTypeReducer(/* key, value */) {
    throw new Error('Method not implemented');
  }
}
