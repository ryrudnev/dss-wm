import _debug from 'debug';
import { resolve, reject } from '../util/utils';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const debug = _debug('api:counter');

// A helpful model of uid-counter needed for generating an unique ID for entity
// (for example an axiom of ontological knowledge base generated via the stardog platform)
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', CounterSchema);

export default Counter;

export function genUid(name = 'uid') {
  debug(`Generating a new unique ID for ${name}`);

  return Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { upsert: true }).exec()
      .then(doc => {
        const uid = doc.seq;
        debug(`Generated unique ID for ${name} = ${uid}`);
        return resolve(uid);
      })
      .catch(err => {
        debug(`Generating unique ID error for ${name}`);
        debug(`Reason: ${err}`);
        return reject(err);
      });
}
