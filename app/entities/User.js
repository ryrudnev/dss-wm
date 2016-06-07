import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';

export class Model extends BaseModel {
  urlRoot() {
    return `${this.apiUrl()}/auth/users`;
  }

  defaults() {
    return {
      id: null,
      email: '',
      username: '',
      role: '',
      subjects: [],
    };
  }
}

export class Collection extends BaseCollection {
  model = Model

  constructor(options) {
    super(options);

    this.model = Model;
  }

  url() {
    return `${this.apiUrl()}/auth/users`;
  }
}
