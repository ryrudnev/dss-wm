import { Model as BaseModel, Collection as BaseCollection } from '../base/entity';

export class Model extends BaseModel {
  urlRoot() {
    return '/api/user';
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
  constructor(options) {
    super(options);

    this.model = Model;
  }

  url() {
    return '/api/users';
  }
}