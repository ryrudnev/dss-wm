import { axiomWithPrefix } from '../util/owlUtils';
import { Deferred } from '../util/utils';
import stardog from '../services/stardog';
import uidCounter from '../services/counter';

export default class RdfStorage {
  // Base type of entity
  get entity() {
    throw new Error('Method not implemented');
  }

  // Base type of entity as axiom with prefix
  get entityWithPrefix() {
    return axiomWithPrefix(this.entity);
  }

  constructor() {
    if (this.constructor === RdfStorage) {
      throw new TypeError('Cannot construct RdfStorage instances directly');
    }
  }

  // Execute a query to Stardog platform and handle response before to next promises chain
  // cb(response, next, error)
  static execWithHandle(query, cb) {
    const dfd = new Deferred();
    RdfStorage.exec(query).then(resp => {
      if (cb) {
        cb(resp, dfd.resolve.bind(dfd), dfd.reject.bind(dfd));
      } else {
        dfd.resolve(resp);
      }
    }).catch(resp => dfd.reject(resp));
    return dfd.promise;
  }

  // Execute a query to Stardog platform. Returned promise
  static exec(query) {
    return stardog.query({ query });
  }

  // Check exists individual of entity
  individExists(individ, falseAsReject = false) {
    const query = `
      ASK { ${axiomWithPrefix(individ)} a ${this.entityWithPrefix} ; :title ?title }
    `;
    if (!falseAsReject) {
      return RdfStorage.exec(query);
    }
    return RdfStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        return next(resp);
      }
      return error({
        success: false,
        code: 404,
        message: `Individual ${individ} of ${this.entity} entity is not exists`,
        data: null,
      });
    });
  }

  // Check exists type of entity
  typeExists(type, falseAsReject = false) {
    const query = `
      ASK {
        ${axiomWithPrefix(type)} rdfs:subClassOf ${this.entityWithPrefix} ; rdfs:label ?title
    }`;
    if (!falseAsReject) {
      return stardog.query({ query });
    }
    return RdfStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        return next(resp);
      }
      return error({
        success: false,
        code: 404,
        message: `Type ${type} of ${this.entity} entity is not exists`,
        data: null,
      });
    });
  }

  // Create a new individual of entity
  createIndivid(type, data = {}) {
    return uidCounter.generateUid().then(uid => {
      const fid = axiomWithPrefix(uid);
      const qdata = Object.keys(data).reduce((res, key) => {
        const reduced = this.createIndividReducer(key, data[key], fid);
        return !!reduced ? `${res} ${reduced}` : res;
      }, '');
      const query = `INSERT DATA {
        ${fid} a ${axiomWithPrefix(type || this.entity)} .
        ${qdata.trim()}
      }`;
      return RdfStorage.execWithHandle(query,
          (resp, next) => next({ ...resp, data: { fid: uid } })
      );
    });
  }

  // Update the individual of entity
  updateIndivid(fid, data) {
    let [qinsert, qwhere] = ['', ''];

    Object.keys(data || {}).forEach((key) => {
      const [insert, where] = this.updateIndividReducer(key, data[key], fid);
      if (!!insert) {
        qinsert = `${qinsert} ${insert}`;
      }
      if (!!where) {
        qwhere = `${qwhere} ${where}`;
      }
    });

    const query = `DELETE {
        ${qwhere.trim()}
      } INSERT {
        ${qinsert.trim()}
      } WHERE {
        ?ind a ${this.entityWithPrefix} .
        ${qwhere}
        FILTER(?ind = ${axiomWithPrefix(fid)})
    }`;
    return RdfStorage.exec(query);
  }

  // Delete the individual of entity
  deleteIndivid(fid, falseAsReject = false) {
    const query = `DELETE { ?s ?p ?o }
      WHERE { ?s ?p ?o FILTER(?s = ${axiomWithPrefix(fid)}) }`;
    if (!falseAsReject) {
      return RdfStorage.exec(query);
    }
    return RdfStorage.execWithHandle(query, (resp, next, error) => {
      if (resp.data.boolean) {
        return next(resp);
      }
      return error({
        success: false,
        code: 500,
        message: `Deleting individual ${fid} of ${this.entity} entity is failed`,
        data: null,
      });
    });
  }

  // Select all individuals of entity by options
  selectIndivids(/* options = {} */) {
    throw new Error('Method not implemented');
  }

  // Select the individual of entity by FID
  selectIndividByFid(/* fid */) {
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
}
