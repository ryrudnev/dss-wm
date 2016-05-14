import mongoose from 'mongoose';
import md5 from 'md5';
import { pick, omit } from '../util/utils';

const { Schema } = mongoose;

const StrategySchema = new Schema({
  _id: { type: String, unique: true },
  created: { type: Date, default: Date.now },
  subject: {
    title: String,
    coordinates: String,
    budget: Number,
    fid: String,
  },
  strategies: [],
  totalBestCost: Number,
});

StrategySchema.pre('save', function (next) {
  if (this.isNew || this.isModified('subject') || this.isModified('strategies')) {
    const raw = JSON.stringify(pick(this, ['subject', 'strategies']));
    this._id = md5(raw);
  }
  return next();
});

StrategySchema.set('toJSON', {
  getters: true,
  virtuals: true,
  versionKey: false,
  transform(doc, ret /* , options */) {
    return { ...omit(ret, ['_id']), id: ret._id };
  },
});

export default mongoose.model('Strategy', StrategySchema);
