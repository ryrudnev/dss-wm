import { Model as BaseModel, Collection as BaseCollection } from '../core/Entity';

export class Model extends BaseModel {
  idAttribute = 'fid'

  urlRoot() {
    return `${this.apiUrl()}/waste/individuals`;
  }

  defaults() {
    return {
      title: '',
      amount: '',
    };
  }

  forSubjectParam(value) {
    return this._defineParam('forSubject', value);
  }

  save(attrs, options = {}) {
    if (this.forSubjectParam()) this.set('forSubject', this.forSubjectParam());
    return BaseModel.prototype.save.call(this, attrs, options);
  }

  destroy(options = {}) {
    options.url = `${this.urlRoot()}/${this.get('fid')}?forSubject=${this.forSubjectParam()}`;
    return BaseModel.prototype.destroy.call(this, options);
  }
}

export class Collection extends BaseCollection {
  model = Model

  url() {
    return `${this.apiUrl()}/waste/individuals`;
  }
}
