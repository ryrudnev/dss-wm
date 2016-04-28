import mongoose from 'mongoose';

const { Schema } = mongoose;

const KEY = '_id';

const RoleSchema = new Schema({
  [KEY]: { type: String, unique: true, required: true },
  desc: String,
  scopes: [{ type: String, ref: 'Scope' }],
});

export default mongoose.model('Role', RoleSchema);
