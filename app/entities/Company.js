import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';

export class Model extends BaseModel {
  urlRoot() {
    return '/api/subjects/individuals';
  }
}

export class Collection extends BaseCollection {
  url() {
    return '/api/subjects/individuals';
  }
}
