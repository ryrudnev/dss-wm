import mongoose from 'mongoose';

const { Schema } = mongoose;

// A helpful model of uid-counter needed for generating an unique ID for entity
// (for example an axiom of ontological knowledge base generated via the stardog platform)
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

CounterSchema.statics.genUid = function (name = 'uid') {
  return this.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { upsert: true, new: true })
    .exec().then(doc => Promise.resolve(doc.seq));
};

export default mongoose.model('Counter', CounterSchema);
