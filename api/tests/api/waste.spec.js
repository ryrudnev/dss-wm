/* eslint-disable max-len */

import supertest from 'supertest';
import { start, finish, expect } from '../common';
import { genToken } from '../../controllers/auth.controller';
import app from '../../core/app';

describe('/api/waste', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));

  context('GET /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/waste/individuals')
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
        .get('/api/waste/individuals')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get waste\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have not access for role "user" if are specified incorrect entities', done => {
      supertest(app)
        .get('/api/waste/individuals?forSubjects=["e1"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get waste\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have access rights for role "user" if are specified correct entities', done => {
      supertest(app)
        .get('/api/waste/individuals?forSubjects=["e5"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { amount: '0.05', fid: 'w11', subjectFid: 'e5', title: 'Газеты' },
            { amount: '53.0', fid: 'w17', subjectFid: 'e5', title: 'Трубы большие' },
            { amount: '1.53', fid: 'w2', subjectFid: 'e5', title: 'Брусья' },
          ]);
          done();
        });
    });
    it('have access rights for role "admin"', done => {
      supertest(app)
        .get('/api/waste/individuals')
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
    it('get waste for subjects with types and subject expanding', done => {
      supertest(app)
        .get('/api/waste/individuals?forSubjects=["e5"]&expand=["types","subject"]&limit=1')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([{
            amount: '0.05',
            fid: 'w11',
            subjectFid: 'e5',
            title: 'Газеты',
            subject: { budget: '12356.0', coordinates: '[48.74862044225773,44.66869053100585]', fid: 'e5', title: 'ОАО ЛесВАЛ' },
            types: [
              { fid: 'ConsumptionWaste', title: 'Бытовые отходы' },
              { fid: 'ProductionWaste', title: 'Промышленные отходы' },
              { fid: 'HarmlessWaste', title: 'Практически неопасные отходы' },
              { fid: 'SolidWaste', title: 'Твердые отходы' },
              { fid: 'RecyclableWaste', title: 'Перерабатываемые отходы' },
              { fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
              { fid: 'UtilableWaste', title: 'Утилизируемые отходы' },
              { fid: 'SW1', title: 'Отходы бумажных изделий' },
            ],
          }]);
          done();
        });
    });
  });
  context('POST /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .post('/api/waste/individuals')
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
    it('create waste (role "admin")', done => {
      supertest(app)
        .post('/api/waste/individuals')
        .send({ title: 'Тестовые отходы', amount: 15, forSubject: 'e5', type: 'SW2' })
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
    it('can not create waste without subject (role "user")', done => {
      supertest(app)
        .post('/api/waste/individuals')
        .send({ title: 'Тестовые отходы', amount: 15, type: 'SW2' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'create waste\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('can create waste for subject (role "user")', done => {
      supertest(app)
        .post('/api/waste/individuals')
        .send({ title: 'Тестовые отходы', amount: 15, forSubject: 'e5', type: 'SW2' })
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
        .put('/api/waste/individuals/w5')
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
    it('can not update waste if are specified incorrect subject for role "user"', done => {
      supertest(app)
        .put('/api/waste/individuals/w2')
        .send({ title: 'Тестовые отходы', amount: 15, type: 'SW2' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'update waste\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('update waste when role is "user"', done => {
      supertest(app)
        .put('/api/waste/individuals/w2')
        .send({ title: 'Тестовые отходы', amount: 15, forSubject: 'e5', type: 'SW2' })
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
        .delete('/api/waste/individuals/w2')
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
    it('delete waste when role is "user"', done => {
      supertest(app)
        .delete('/api/waste/individuals/w2?forSubject=e5')
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
        .get('/api/waste/individuals/w2')
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
    it('get waste with types and subject expanding', done => {
      supertest(app)
        .get('/api/waste/individuals/w11?forSubject=e5&expand=["types","subject"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({
            amount: '0.05',
            fid: 'w11',
            subjectFid: 'e5',
            title: 'Газеты',
            subject: { budget: '12356.0', coordinates: '[48.74862044225773,44.66869053100585]', fid: 'e5', title: 'ОАО ЛесВАЛ' },
            types: [
              { fid: 'ConsumptionWaste', title: 'Бытовые отходы' },
              { fid: 'ProductionWaste', title: 'Промышленные отходы' },
              { fid: 'HarmlessWaste', title: 'Практически неопасные отходы' },
              { fid: 'SolidWaste', title: 'Твердые отходы' },
              { fid: 'RecyclableWaste', title: 'Перерабатываемые отходы' },
              { fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
              { fid: 'UtilableWaste', title: 'Утилизируемые отходы' },
              { fid: 'SW1', title: 'Отходы бумажных изделий' },
            ],
          });
          done();
        });
    });
  });
  context('GET /types/', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/waste/types')
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
        .get('/api/waste/types?limit=1')
        .expect(200)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'SW1', title: 'Отходы бумажных изделий' },
          ]);
          done();
        });
    });
  });
  context('POST /types/', () => {
    it('not credentials', done => {
      supertest(app)
        .post('/api/waste/types')
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
    it('have not access for role "user"', done => {
      supertest(app)
        .post('/api/waste/types')
        .expect(403)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'create waste type\'');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('create a new waste type', done => {
      supertest(app)
        .post('/api/waste/types')
        .send({
          title: 'Тестовые отходы', aggregateState: 'solid', hazardClass: 'fourthClass',
          origin: ['production', 'medical'], method: ['Transportation'],
        })
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
  });
  context('PUT /types/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .put('/api/waste/types/SW7')
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
    it('have not access for role "user"', done => {
      supertest(app)
        .put('/api/waste/types/SW7')
        .expect(403)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'update waste type\'');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('update exists waste type', done => {
      supertest(app)
        .put('/api/waste/types/SW7')
        .send({
          title: 'Тестовые отходы', aggregateState: 'solid', hazardClass: 'fourthClass',
          origin: ['production', 'medical'], method: ['Transportation'],
        })
        .set({ Authorization: `JWT ${genToken('admin')}` })
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
  context('DELETE /types/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .delete('/api/waste/types/SW7')
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
    it('have not access for role "user"', done => {
      supertest(app)
        .delete('/api/waste/types/SW7')
        .expect(403)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'delete waste type\'');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('delete exists waste type', done => {
      supertest(app)
        .delete('/api/waste/types/SW7')
        .set({ Authorization: `JWT ${genToken('admin')}` })
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
  context('GET /origins', () => {
    it('get origins', done => {
      supertest(app)
        .get('/api/waste/origins?limit=2&offset=2')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'medical', title: 'Медецинское' },
            { fid: 'production', title: 'Промышленное' },
          ]);
          done();
        });
    });
  });
  context('GET /hazard-classes', () => {
    it('get hazard classes', done => {
      supertest(app)
        .get('/api/waste/hazard-classes?limit=2&offset=2')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'fourthClass', title: '4 класс' },
            { fid: 'secondClass', title: '2 класс' },
          ]);
          done();
        });
    });
  });
  context('GET /aggregate-states', () => {
    it('get aggregate states', done => {
      supertest(app)
        .get('/api/waste/aggregate-states?limit=2&offset=2')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'solid', title: 'Твердый' },
          ]);
          done();
        });
    });
  });
});
