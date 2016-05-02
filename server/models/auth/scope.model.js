import mongoose from 'mongoose';
import { flatten, isObject } from '../../util/utils';

const KEY = '_id';
const EXTRACT_REGEX = /^(\w+):(\w+)$/;

const { Schema } = mongoose;

const ScopeSchema = new Schema({
  [KEY]: { type: String, unique: true, required: true },
  desc: String,
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
    const { scope, action } = extract(item[KEY]);
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
      prev.push({ [KEY]: `${item.action}:${key}`, desc: item.desc });
    }
    return prev;
  }, []);
}

ScopeSchema.virtual('extracted').get(function () {
  return extract(this[KEY]);
});

ScopeSchema.statics.getByScope = function (scope, cb) {
  return this.find({ [KEY]: new RegExp(`^\w+:${scope}$`) }, cb);
};

ScopeSchema.statics.getByAction = function (action, cb) {
  return this.find({ [KEY]: new RegExp(`^${action}:\w+$`) }, cb);
};

export default mongoose.model('Scope', ScopeSchema);
