import _debug from 'debug';
import { Deferred } from '../util/utils';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const debug = _debug('app:counter');

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
  const dfd = new Deferred();
  Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { upsert: true },
      (err, doc) => {
        if (err) {
          debug(`Generating unique ID error for ${name}`);
          debug(`${err}`);
          return dfd.reject(err);
        }
        const uid = doc.seq;
        debug(`Generated unique ID for ${name} = ${uid}`);
        dfd.resolve(uid);
      }
  );
  return dfd.promise;
}

export function genIdForSchema(schemaName, field = '_id') {
  return (next) => {
    if (this.isNew) {
      genUid(`${schemaName}Id`).then(id => {
        this[field] = id;
        next();
      });
    } else {
      next();
    }
  };
}
