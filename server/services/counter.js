import _debug from 'debug';
import { Deferred } from '../util/utils';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const debug = _debug('app:counter');

// A helpful model of uid-counter needed for generating an unique ID of axiom
// in ontological knowledge bases in the stardog platform
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const counter = mongoose.model('Counter', CounterSchema);

export default {
  generateUid() {
    debug('Generating a new unique ID');
    const dfd = new Deferred();
    counter.findByIdAndUpdate('uid', { $inc: { seq: 1 } }, { upsert: true, new: true },
        (err, doc) => {
          if (err) {
            debug('Generating unique ID error');
            debug(`${err}`);
            return dfd.reject(err);
          }
          const uid = doc.seq;
          debug(`Generated unique ID: ${uid}`);
          dfd.resolve(uid);
        }
    );
    return dfd.promise;
  },
};
