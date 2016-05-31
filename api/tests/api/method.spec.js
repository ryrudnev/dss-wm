/* eslint-disable max-len */

import supertest from 'supertest';
import { start, finish, expect } from '../common';
import { genToken } from '../../controllers/auth.controller';
import app from '../../core/app';

describe('/api/methods', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));

  context('GET /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/methods/individuals')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('have not access for role "user" if are not specified entities', done => {
      supertest(app)
        .get('/api/methods/individuals')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get methods\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have not access for role "user" if are specified incorrect entities', done => {
      supertest(app)
        .get('/api/methods/individuals?forSubjects=["e1"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get methods\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have access rights for role "user" if are specified correct entities', done => {
      supertest(app)
        .get('/api/methods/individuals?forSubjects=["e5"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', subjectFid: 'e5', title: 'Сжигание' },
          ]);
          done();
        });
    });
    it('have access rights for role "admin"', done => {
      supertest(app)
        .get('/api/methods/individuals')
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data');
          done();
        });
    });
    it('get methods for subjects with types and subject expanding', done => {
      supertest(app)
        .get('/api/methods/individuals?forSubjects=["e5"]&expand=["types","subject"]&limit=1')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([{
            costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', subjectFid: 'e5', title: 'Сжигание',
            subject: { budget: '12356.0', coordinates: '[48.74862044225773,44.66869053100585]', fid: 'e5', title: 'ОАО ЛесВАЛ' },
            types: [
              { fid: 'Utilization', title: 'Утилизация' },
            ],
          }]);
          done();
        });
    });
  });
  context('POST /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .post('/api/methods/individuals')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('create method (role "admin")', done => {
      supertest(app)
        .post('/api/methods/individuals')
        .send({ title: 'Тестовые метод', costOnWeight: 15, costOnDistance: 16, costByService: 17, type: 'Utilization', forSubject: 'e5' })
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({ fid: 'a1' });
          done();
        });
    });
    it('can not create method without subject (role "user")', done => {
      supertest(app)
        .post('/api/methods/individuals')
        .send({ title: 'Тестовые метод', costOnWeight: 15, costOnDistance: 16, costByService: 17, type: 'Utilization' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'create method\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('can create method for subject (role "user")', done => {
      supertest(app)
        .post('/api/methods/individuals')
        .send({ title: 'Тестовые метод', costOnWeight: 15, costOnDistance: 16, costByService: 17, type: 'Utilization', forSubject: 'e5' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({ fid: 'a1' });
          done();
        });
    });
  });
  context('PUT /individuals/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .put('/api/methods/individuals/w5')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('can not update method if are specified incorrect subject for role "user"', done => {
      supertest(app)
        .put('/api/methods/individuals/um1')
        .send({ title: 'Тестовые метод', costOnWeight: 15, costOnDistance: 16, costByService: 17, type: 'Utilization' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'update method\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('update method when role is "user"', done => {
      supertest(app)
        .put('/api/methods/individuals/um1')
        .send({ title: 'Тестовые метод', costOnWeight: 15, costOnDistance: 16, costByService: 17, type: 'Utilization', forSubject: 'e5' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({ boolean: true });
          done();
        });
    });
  });
  context('DELETE /individuals/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .delete('/api/methods/individuals/um1')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('delete method when role is "user"', done => {
      supertest(app)
        .delete('/api/methods/individuals/um1?forSubject=e5')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({ boolean: true });
          done();
        });
    });
  });
  context('GET /individuals/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/methods/individuals/um1')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('get method with types and subject expanding', done => {
      supertest(app)
        .get('/api/methods/individuals/um1?forSubject=e5&expand=["types","subject"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({
            costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', subjectFid: 'e5', title: 'Сжигание',
            subject: { budget: '12356.0', coordinates: '[48.74862044225773,44.66869053100585]', fid: 'e5', title: 'ОАО ЛесВАЛ' },
            types: [
              { fid: 'Utilization', title: 'Утилизация' },
            ],
          });
          done();
        });
    });
  });
  context('GET /types/', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/methods/types')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({
            code: 401,
            success: false,
            message: 'Token could not be authenticated',
          });
          done();
        });
    });
    it('get types', done => {
      supertest(app)
        .get('/api/methods/types?limit=1')
        .expect(200)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'Recycling', title: 'Переработка' },
          ]);
          done();
        });
    });
  });
});
