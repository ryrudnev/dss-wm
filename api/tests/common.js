import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import mongoose from 'mongoose';
import stardog from '../core/stardog';
import config from '../core/config';
import dummyData from '../dummy.data';

// init chai
chai.use(chaiAsPromised);
export const should = chai.should();

export const expect = chai.expect;

function connectDB(done) {
  if (mongoose.connection.readyState) { return done(); }
  mongoose.Promise = Promise;
  mongoose.connect(config.mongodb.url, { promiseLibrary: Promise }, err => {
    if (err) { return done(err); }
    dummyData(done);
  });
}

function dropDB(done) {
  if (!mongoose.connection.readyState) { return done(); }
  mongoose.connection.db.dropDatabase(err => {
    if (err) { return done(err); }
    mongoose.connection.close(done);
  });
}

export function setupStardog(done) {
  stardog.checkDb().then(() => done()).catch(err => done(err));
}

export function start(done) {
  connectDB(() => setupStardog(done));
}

export function finish(done) {
  dropDB(done);
}
