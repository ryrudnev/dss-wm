import mongoose from 'mongoose';
import { omit } from '../../util/utils';

const { Schema } = mongoose;

const ScopeSchema = new Schema({
  _id: { type: String, unique: true, required: true },
  // TODO: make a subscopes support
  // parent: { type: String, ref: 'Scope' },
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

export function fromObjectToScopes(obj) {
  return Object.keys(obj).reduce((prev, key) => {
    if (!obj[key]) {
      return prev;
    }
    for (const item of obj[key]) {
      prev.push({ _id: item.action ? `${item.action}:${key}` : key, desc: item.desc });
    }
    return prev;
  }, []);
}

export default mongoose.model('Scope', ScopeSchema);
