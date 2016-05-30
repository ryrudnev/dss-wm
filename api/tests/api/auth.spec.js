import { dropDB, connectDB } from '../common';
import supertest from 'supertest';
import app from '../../server';

describe('/api/auth', function () {
  this.timeout(30 * 1000);

  before(done => connectDB(done));

  after(done => dropDB(done));

  context('/token', () => {
    it('not credentials', done => {
      supertest(app).post('/api/auth/token').expect(401).end(() => done());
    });
  });
});
