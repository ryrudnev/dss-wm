/* eslint-disable max-len */

import supertest from 'supertest';
import { start, finish, expect } from '../common';
import User from '../../models/user.model';
import { genToken } from '../../controllers/auth.controller';
import app from '../../core/app';

describe('/api/subject', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));

  context('GET /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/subjects/individuals')
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
        .get('/api/subjects/individuals')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get subjects\' You must specify enterprises (forSubject)');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have not access for role "user" if are specified incorrect entities', done => {
      supertest(app)
        .get('/api/subjects/individuals?fids=["e1"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'get subjects\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('have access rights for role "user" if are specified correct entities', done => {
      supertest(app)
        .get('/api/subjects/individuals?fids=["e5"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            {
              budget: '12356.0',
              coordinates: '[48.74862044225773,44.66869053100585]',
              fid: 'e5',
              title: 'ОАО ЛесВАЛ',
            },
          ]);
          done();
        });
    });
    it('have access rights for role "admin"', done => {
      supertest(app)
        .get('/api/subjects/individuals')
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
    it('get subjects with methods, waste, types and located expanding', done => {
      supertest(app)
        .get('/api/subjects/individuals?fids=["e5"]&expand=["types","waste","methods","located"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            {
              budget: '12356.0',
              coordinates: '[48.74862044225773,44.66869053100585]',
              fid: 'e5',
              locations: [
                { fid: 'r6', title: 'Поволжский' },
                { fid: 'c4', title: 'Волжский' },
                { fid: 's1', title: 'Россия' },
              ],
              methods: [
                { costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', title: 'Сжигание' },
              ],
              title: 'ОАО ЛесВАЛ',
              types: [
                { fid: 'Company', title: 'Предприятие' },
              ],
              waste: [
                { amount: '0.05', fid: 'w11', title: 'Газеты' },
                { amount: '53.0', fid: 'w17', title: 'Трубы большие' },
                { amount: '1.53', fid: 'w2', title: 'Брусья' },
              ],
            },
          ]);
          done();
        });
    });
  });
  context('POST /individuals', () => {
    it('not credentials', done => {
      supertest(app)
        .post('/api/subjects/individuals')
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
    it('create subjects (role "admin")', done => {
      supertest(app)
        .post('/api/subjects/individuals')
        .send({ title: 'Тестовое предприятие', coordinates: [15, 15], budget: 0, type: 'Company' })
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
    it('create subjects (role "user")', done => {
      supertest(app)
        .post('/api/subjects/individuals')
        .send({ title: 'Тестовое предприятие', coordinates: [15, 15], budget: 0, type: 'Company' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({ fid: 'a1' });

          // Check user in db
          User.findOne({ username: 'test' }, (error, user) => {
            if (error) { return done(error); }
            expect(user).has.property('subjects').that.is.to.eql(['e6', 'e5', 'a1']);
            done();
          });
        });
    });
  });
  context('PUT /individuals/:fid', () => {
    it('not credentials', done => {
      supertest(app)
        .put('/api/subjects/individuals/e3')
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
    it('can not update subject if are specified incorrect entities for role "user"', done => {
      supertest(app)
        .put('/api/subjects/individuals/e3')
        .send({ title: 'Тестовое предприятие', coordinates: [15, 15], budget: 0, type: 'City' })
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'update subject\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('can not update subject when it is not exists', done => {
      supertest(app)
        .put('/api/subjects/individuals/test')
        .send({ title: 'Тестовое предприятие', coordinates: [15, 15], budget: 0, type: 'City' })
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Individual test of Subject entity is not exists');
          expect(res.body).has.property('code').that.is.to.eql(404);
          expect(res.body).has.property('data').that.is.to.eql(null);
          done();
        });
    });
    it('update subject when role is "user"', done => {
      supertest(app)
        .put('/api/subjects/individuals/e5')
        .send({ title: 'Тестовое предприятие', coordinates: [15, 15], budget: 0, type: 'City' })
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
        .delete('/api/subjects/individuals/e3')
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
    it('can not update subject when it is not exists', done => {
      supertest(app)
        .delete('/api/subjects/individuals/test')
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .expect(404)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Individual test of Subject entity is not exists');
          expect(res.body).has.property('code').that.is.to.eql(404);
          expect(res.body).has.property('data').that.is.to.eql(null);
          done();
        });
    });
    it('can not delete subject if are specified incorrect entities for role "user"', done => {
      supertest(app)
        .delete('/api/subjects/individuals/e3')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'delete subject\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('delete subject when role is "user"', done => {
      supertest(app)
        .delete('/api/subjects/individuals/e5')
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
        .get('/api/subjects/individuals/e3')
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
    it('have not access for role "user" if are specified incorrect fid', done => {
      supertest(app)
        .get('/api/subjects/individuals/e1')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'read subject\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('get subject with methods, waste, types and located expanding', done => {
      supertest(app)
        .get('/api/subjects/individuals/e5?expand=["types","waste","methods","located"]')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({
            budget: '12356.0',
            coordinates: '[48.74862044225773,44.66869053100585]',
            fid: 'e5',
            locations: [
              { fid: 'r6', title: 'Поволжский' },
              { fid: 'c4', title: 'Волжский' },
              { fid: 's1', title: 'Россия' },
            ],
            methods: [
              { costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', title: 'Сжигание' },
            ],
            title: 'ОАО ЛесВАЛ',
            types: [
              { fid: 'Company', title: 'Предприятие' },
            ],
            waste: [
              { amount: '0.05', fid: 'w11', title: 'Газеты' },
              { amount: '53.0', fid: 'w17', title: 'Трубы большие' },
              { amount: '1.53', fid: 'w2', title: 'Брусья' },
            ],
          });
          done();
        });
    });
  });
  context('GET /types/', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/subjects/types')
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
        .get('/api/subjects/types')
        .expect(200)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql([
            { fid: 'City', title: 'Населенный пункт' },
            { fid: 'Company', title: 'Предприятие' },
            { fid: 'Municipal', title: 'Муниципальный субъект' },
            { fid: 'Region', title: 'Регион' },
            { fid: 'State', title: 'Государство' },
          ]);
          done();
        });
    });
  });
  context('GET /individuals/:fid/search-strategy', () => {
    it('not credentials', done => {
      supertest(app)
        .get('/api/subjects/individuals/e5/search-strategy')
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
    it('have not access for role "user" if are specified incorrect fid', done => {
      supertest(app)
        .get('/api/subjects/individuals/e1/search-strategy')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(false);
          expect(res.body).has.property('message').that.is.to.eql('Access denied. You don\'t have permission to \'read subject\' Has no available enterprises for you');
          expect(res.body).has.property('code').that.is.to.eql(403);
          expect(res.body).has.not.property('data');
          done();
        });
    });
    it('search strategy', done => {
      supertest(app)
        .get('/api/subjects/individuals/e5/search-strategy')
        .expect(200)
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('data').that.is.to.eql({
            strategies: [
              {
                strategy: {
                  bestCost: 2689.939395256738,
                  bestMethod: {
                    costOnWeight: '1000.0',
                    fid: 'rm2',
                    subject: {
                      budget: '35647.0',
                      coordinates: '[48.77574410796487,44.77941211914055]',
                      fid: 'e4',
                      methodFid: 'rm2',
                      title: 'ООО Трубный завод',
                    },
                    title: 'Использовать как вторичное сырье',
                  },
                  bestTransportation: {
                    costOnDistance: '666.0',
                    costOnWeight: '666.0',
                    fid: 'tm2',
                    subject: {
                      budget: '5500.0',
                      coordinates: '[48.566745271705706,44.428192941894515]',
                      fid: 'e8',
                      methodFid: 'tm2',
                      title: 'ОАО Шиномонтаж у Рафика',
                    },
                    title: 'Транспортировка на газеле',
                  },
                  ownMethods: [{
                    costByService: '4500.0',
                    costOnWeight: '1000.0',
                    fid: 'um1',
                    title: 'Сжигание',
                  }],
                },
                totalAmount: 1.58,
                waste: [
                  {
                    amount: '0.05',
                    fid: 'w11',
                    subjectFid: 'e5',
                    title: 'Газеты',
                  },
                  {
                    amount: '1.53',
                    fid: 'w2',
                    subjectFid: 'e5',
                    title: 'Брусья',
                  },
                ],
              },
              {
                strategy: {
                  bestCost: 47043.11691863608,
                  bestMethod: {
                    costByService: '1400.0',
                    costOnWeight: '500.0',
                    fid: 'um3',
                    subject: {
                      budget: '222222.0',
                      coordinates: '[48.64964756215051,44.37291797851556]',
                      fid: 'm6',
                      methodFid: 'um3',
                      title: 'МУП Свалка',
                    },
                    title: 'Сжигание',
                  },
                  bestTransportation: {
                    costByService: '3000.0',
                    costOnDistance: '999.0',
                    costOnWeight: '300.0',
                    fid: 'tm5',
                    subject: {
                      budget: '36777.0',
                      coordinates: '[48.798458765071125,44.6194237158203]',
                      fid: 'e6',
                      methodFid: 'tm5',
                      title: 'ЭколСейв',
                    },
                    title: 'Транспортировка на поезде',
                  },
                  ownMethods: [{
                    costByService: '4500.0',
                    costOnWeight: '1000.0',
                    fid: 'um1',
                    title: 'Сжигание',
                  }],
                },
                totalAmount: 53,
                waste: [{ amount: '53.0', fid: 'w17', subjectFid: 'e5', title: 'Трубы большие' }],
              },
            ],
            subject: {
              budget: '12356.0',
              coordinates: '[48.74862044225773,44.66869053100585]',
              fid: 'e5',
              title: 'ОАО ЛесВАЛ',
            },
            totalBestCost: 49733.05631389282,
          });
          done();
        });
    });
  });
});
