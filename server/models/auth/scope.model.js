import mongoose from 'mongoose';
import { flatten, isObject } from '../../util/utils';

const { Schema } = mongoose;

const KEY = '_id';
const EXTRACT_REGEX = /^(\w+):(\w+)$/;

const extract = (key) => {
  if (!key) {
    return {};
  }
  const ext = EXTRACT_REGEX.exec(key);
  return ext ? { action: ext[1], scope: ext[2] } : { scope: key };
};

export function scopesToObj(scopes, withDesc) {
  return flatten([scopes]).reduce((prev, it) => {
    const cur = prev;
    if (!isObject(it)) {
      return cur;
    }
    const { scope, action } = extract(it[KEY]);
    if (!cur[scope]) {
      cur[scope] = [];
    }
    cur[scope].push(withDesc ? { action, desc: it.desc } : action);
    return cur;
  }, {});
}

export function objToScopes(obj) {
  return Object.keys(obj).reduce((prev, k) => {
    const cur = prev;
    if (!obj[k]) {
      return cur;
    }
    for (const a of obj[k]) {
      cur.push(isObject(a) ? { [KEY]: `${a.action}:${k}`, desc: a.desc } : { [KEY]: `${a}:${k}` });
    }
    return cur;
  }, []);
}

const ScopeSchema = new Schema({
  [KEY]: { type: String, unique: true, required: true },
  desc: String,
});

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
