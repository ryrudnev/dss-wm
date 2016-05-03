import mongoose from 'mongoose';
import { omit } from '../../util/utils';

const { Schema } = mongoose;

const RoleSchema = new Schema({
  _id: { type: String, unique: true, required: true },
  desc: String,
  scopes: [{ type: String, ref: 'Scope' }],
});

RoleSchema.set('toJSON', {
  getters: true,
  virtuals: true,
  versionKey: false,
  transform(doc, ret /* , options */) {
    return { ...omit(ret, ['_id']), id: ret._id };
  },
});

export default mongoose.model('Role', RoleSchema);
