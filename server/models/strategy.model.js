import mongoose from 'mongoose';
import md5 from 'md5';
import { pick } from '../util/utils';

const { Schema } = mongoose;

const Strategy = new Schema({
  created: { type: Date, default: Date.now },
  subject: {
    title: String,
    coordinates: String,
    budget: Number,
    fid: String,
  },
  strategies: [],
  totalBestCost: Number,
  hash: { type: String, unique: true },
});

Strategy.pre('save', function (next) {
  if (this.isNew || this.isModified('subject') || this.isModified('strategies')) {
    const raw = JSON.stringify(pick(this, ['subject', 'strategies']));
    this.hash = md5(raw);
  }
  return next();
});

export default mongoose.model('Strategy', Strategy);
