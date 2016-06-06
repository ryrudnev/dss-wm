import Backbone from 'backbone';
import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';
import { tryParseJson } from '../util/utils';

export class Model extends BaseModel {
  idAttribute = 'fid'

  defaults() {
    return {
      type: 'Company',
      title: '',
      coordinates: [],
      budget: '',
    };
  }

  parse(resp) {
    const attrs = super.parse(resp);
    if ('coordinates' in attrs) attrs.coordinates = tryParseJson(attrs.coordinates);
    if ('budget' in attrs) attrs.budget = +attrs.budget;
    return attrs;
  }

  urlRoot() {
    return `${this.apiUrl()}/subjects/individuals`;
  }

  searchStrategy(options = {}) {
    options.url = `${this.urlRoot()}/${this.get('fid')}/search-strategy`;
    return this.sync('read', this, options);
  }

  relations = [
    {
      type: Backbone.Many,
      key: 'methods',
      collectionType: () => require('./Method').Collection, // eslint-disable-line
      isTransient: true,
    },
    {
      type: Backbone.Many,
      key: 'waste',
      collectionType: () => require('./Waste').Collection, // eslint-disable-line
      isTransient: true,
    },
  ]
}

export class Collection extends BaseCollection {
  model = Model

  constructor(options) {
    super(options);

    this.subtypesParam('Company');
  }

  url() {
    return `${this.apiUrl()}/subjects/individuals`;
  }
}
