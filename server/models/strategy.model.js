import mongoose from 'mongoose';
import md5 from 'md5';
import { pick } from '../util/utils';

const { Schema } = mongoose;

const Strategy = new Schema({
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

Strategy.pre('save', function (next) {
  if (this.isNew || this.isModified('subject') || this.isModified('strategies')) {
    const raw = JSON.stringify(pick(this, ['subject', 'strategies']));
    this._id = md5(raw);
  }
  return next();
});

export default mongoose.model('Strategy', Strategy);
