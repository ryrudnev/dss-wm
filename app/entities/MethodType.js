import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';

export class Model extends BaseModel {
  idAttribute = 'fid'

  urlRoot() {
    return `${this.apiUrl()}/methods/types`;
  }

  defaults() {
    return {
      title: '',
    };
  }
}

export class Collection extends BaseCollection {
  model = Model

  url() {
    return `${this.apiUrl()}/methods/types`;
  }
}
