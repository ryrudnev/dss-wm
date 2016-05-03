import mongoose from 'mongoose';
import { flatten, isObject, omit } from '../../util/utils';

const EXTRACT_REGEX = /^(\w+):(\w+)$/;

const { Schema } = mongoose;

const ScopeSchema = new Schema({
  _id: { type: String, unique: true, required: true },
  desc: String,
});

ScopeSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  versionKey: false,
  transform(doc, ret /* , options */) {
    return { ...omit(ret, ['_id']), id: ret._id };
  },
});

const extract = (key) => {
  if (!key) {
    return {};
  }
  const ext = EXTRACT_REGEX.exec(key);
  return ext ? { action: ext[1], scope: ext[2] } : { scope: key };
};

export function scopesToObj(scopes) {
  return flatten([scopes]).reduce((prev, item) => {
    if (!isObject(item)) {
      return prev;
    }
    const { scope, action } = extract(item._id);
    if (!prev[scope]) {
      prev[scope] = [];
    }
    prev[scope].push({ action, desc: item.desc });
    return prev;
  }, {});
}

export function objToScopes(obj) {
  return Object.keys(obj).reduce((prev, key) => {
    if (!obj[key]) {
      return prev;
    }
    for (const item of obj[key]) {
      prev.push({ _id: `${item.action}:${key}`, desc: item.desc });
    }
    return prev;
  }, []);
}

ScopeSchema.statics.getByScope = function (scope, cb) {
  return this.find({ _id: new RegExp(`^\w+:${scope}$`) }, cb);
};

ScopeSchema.statics.getByAction = function (action, cb) {
  return this.find({ _id: new RegExp(`^${action}:\w+$`) }, cb);
};

export default mongoose.model('Scope', ScopeSchema);
