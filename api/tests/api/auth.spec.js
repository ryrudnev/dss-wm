import { setup, drop } from '../common';
import supertest from 'supertest';
import app from '../../core/app';

describe('/api/auth', function () {
  this.timeout(30 * 1000);

  before(done => setup(done));

  after(done => drop(done));

  context('/token', () => {
    it('not credentials', done => {
      supertest(app).post('/api/auth/token').expect(401).end(() => done());
    });
  });
});
