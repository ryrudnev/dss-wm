/* eslint-disable max-len */

import supertest from 'supertest';
import { start, finish, expect } from '../common';
import User from '../../models/user.model';
import { genToken } from '../../controllers/auth.controller';
import app from '../../core/app';

describe('/api/auth', function () {
  this.timeout(30 * 1000); // delay

  before(done => start(done));

  after(done => finish(done));

  context('/token', () => {
    it('not credentials', done => {
      supertest(app)
        .post('/api/auth/token')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 401, success: false, message: 'Authentication failed. User not found' });
          done();
        });
    });
    it('given an incorrect username or password', done => {
      supertest(app)
        .post('/api/auth/token')
        .send({ username: 'test', password: 'qwerty' })
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 401, success: false, message: 'Authentication failed. Wrong password' });
          done();
        });
    });
    it('should return the token when an user has successfully logged', done => {
      supertest(app)
        .post('/api/auth/token')
        .send({ username: 'test', password: 'test' })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('user').that.is.to.eql({ id: 2, username: 'test', role: 'user', subjects: ['e6', 'e5'] });
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          expect(res.body).has.property('token').that.to.match(/^JWT/);
          done();
        });
    });
  });
  context('/signup', () => {
    it('unknown token', done => {
      supertest(app)
        .post('/api/auth/signup')
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 401, success: false, message: 'Token could not be authenticated' });
          done();
        });
    });
    it('no access rights', done => {
      supertest(app)
        .post('/api/auth/signup')
        .set({ Authorization: `JWT ${genToken('test')}` })
        .expect(403)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 403, success: false, message: 'Access denied. You don\'t have permission to \'create user\'' });
          done();
        });
    });
    it('no data to create a new user', done => {
      supertest(app)
        .post('/api/auth/signup')
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .expect(401)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 401, success: false, message: 'You must specify a username and password' });
          done();
        });
    });
    it('should not create a new user when username already exists', done => {
      supertest(app)
        .post('/api/auth/signup')
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .send({ username: 'test', password: 'test' })
        .expect(500)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).to.eql({ code: 500, success: false, message: 'This an username already exists in the system' });
          done();
        });
    });
    it('should create a new user', done => {
      supertest(app)
        .post('/api/auth/signup')
        .set({ Authorization: `JWT ${genToken('admin')}` })
        .send({ username: 'test2', password: 'test', role: 'user', subjects: ['e15'] })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) { throw err; }
          expect(res.body).has.property('user').that.is.to.eql({ id: 3, username: 'test2', role: 'user', subjects: ['e15'] });
          expect(res.body).has.property('success').that.is.to.eql(true);
          expect(res.body).has.property('message').that.is.to.eql('OK');
          expect(res.body).has.property('code').that.is.to.eql(200);
          // Check user in db
          User.findOne({ username: 'test2' }, (error, user) => {
            if (error) { return done(error); }
            expect(user).has.property('_id').that.is.to.eql(3);
            expect(user).has.property('role').that.is.to.eql('user');
            expect(user).has.property('subjects').that.is.to.eql(['e15']);
            done();
          });
        });
    });
  });
});
