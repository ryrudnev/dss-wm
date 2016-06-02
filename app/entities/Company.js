import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';
import { tryParseJson } from '../util/utils';

export class Model extends BaseModel {
  idAttribute = 'fid'

  defaults() {
    return {
      title: null,
      coordinates: null,
      budget: null,
      fid: null,
    };
  }

  parse(resp) {
    const attrs = super.parse(resp);
    if ('coordinates' in attrs) attrs.coordinates = tryParseJson(attrs.coordinates);
    if ('budget' in attrs) attrs.budget = +attrs.budget;
    return attrs;
  }

  urlRoot() {
    return '/api/subjects/individuals';
  }
}

export class Collection extends BaseCollection {
  model = Model

  constructor(options) {
    super(options);

    this.subtypesParam('Company');
  }

  url() {
    return '/api/subjects/individuals';
  }
}
