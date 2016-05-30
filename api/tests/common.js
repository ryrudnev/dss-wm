import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import config from '../core/config';

// init chai
chai.use(chaiAsPromised);
export const should = chai.should();

export function connectDB(done) {
  if (mongoose.connection.readyState) {
    return done();
  }
  mongoose.connect(config.mongodb.url, err => {
    if (err) return done(err);
    done();
  });
}

export function dropDB(done) {
  if (!mongoose.connection.readyState) {
    return done();
  }
  mongoose.connection.db.dropDatabase((/* err */) => {
    mongoose.connection.close(done);
  });
}
