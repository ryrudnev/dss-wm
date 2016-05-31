/* eslint-disable max-len */

import { start, finish, expect } from '../common';
import Method from '../../models/method.storage';

describe('method.storage', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));

  context('selectIndivids(options)', () => {
    it('should select individs by default', done => {
      Method.selectIndivids().then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          {
            costByService: '5000.0',
            costOnWeight: '301.0',
            fid: 'rm1',
            title: 'Использовать как вторичное сырье',
          },
          {
            costByService: '2500.0',
            costOnDistance: '450.0',
            costOnWeight: '600.0',
            fid: 'tm6',
            title: 'Транспортировка на грузовой машине',
          },
          { costOnWeight: '1000.0', fid: 'rm2', title: 'Использовать как вторичное сырье' },
          { costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', title: 'Сжигание' },
          { costByService: '1500.0', costOnWeight: '400.0', fid: 'rm3', title: 'Переработка' },
          {
            costByService: '3000.0',
            costOnDistance: '999.0',
            costOnWeight: '300.0',
            fid: 'tm5',
            title: 'Транспортировка на поезде',
          },
          {
            costByService: '9000.0',
            costOnWeight: '2500.0',
            fid: 'um2',
            title: 'Расщепление в кислоте',
          },
          {
            costByService: '5000.0',
            costOnDistance: '899.0',
            costOnWeight: '1000.0',
            fid: 'tm4',
            title: 'Транспортировка на вертолете',
          },
          {
            costOnDistance: '666.0',
            costOnWeight: '666.0',
            fid: 'tm2',
            title: 'Транспортировка на газеле',
          },
          {
            costByService: '6666.0',
            costOnWeight: '777.0',
            fid: 'um4',
            title: 'Расщепление электролизом',
          },
          {
            costByService: '2500.0',
            costOnDistance: '400.0',
            costOnWeight: '350.0',
            fid: 'tm3',
            title: 'Транспортировка на камазе',
          },
          {
            costByService: '500.0',
            costOnDistance: '300.0',
            costOnWeight: '450.0',
            fid: 'tm1',
            title: 'Транспортировка на газеле',
          },
          { costByService: '1400.0', costOnWeight: '500.0', fid: 'um3', title: 'Сжигание' },
          { costOnWeight: '560.0', fid: 'sm1', title: 'Закапывание' },
          {
            costByService: '4500.0',
            costOnWeight: '780.0',
            fid: 'sm2',
            title: 'Захоронение в контейнере',
          },
          { costByService: '1500.0', costOnWeight: '450.0', fid: 'sm3', title: 'Закапывание' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only for subjects', done => {
      Method.selectIndivids({ forSubjects: ['e1', 'e2', ''] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          {
            costByService: '5000.0',
            costOnWeight: '301.0',
            fid: 'rm1',
            title: 'Использовать как вторичное сырье',
            subjectFid: 'e2',
          },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only for not subjects', done => {
      Method.selectIndivids({
        forNotSubjects: [
          'e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8',
          'm3', 'm4', 'm5', 'm6', 'm7', 'test1', 'test2',
        ],
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { costByService: '4500.0', costOnWeight: '1000.0', fid: 'um1', title: 'Сжигание' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only by subtypes', done => {
      Method.selectIndivids({ subtypes: 'Transportation' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          {
            costByService: '2500.0',
            costOnDistance: '450.0',
            costOnWeight: '600.0',
            fid: 'tm6',
            title: 'Транспортировка на грузовой машине',
          },
          {
            costByService: '3000.0',
            costOnDistance: '999.0',
            costOnWeight: '300.0',
            fid: 'tm5',
            title: 'Транспортировка на поезде',
          },
          {
            costByService: '5000.0',
            costOnDistance: '899.0',
            costOnWeight: '1000.0',
            fid: 'tm4',
            title: 'Транспортировка на вертолете',
          },
          {
            costOnDistance: '666.0',
            costOnWeight: '666.0',
            fid: 'tm2',
            title: 'Транспортировка на газеле',
          },
          {
            costByService: '2500.0',
            costOnDistance: '400.0',
            costOnWeight: '350.0',
            fid: 'tm3',
            title: 'Транспортировка на камазе',
          },
          {
            costByService: '500.0',
            costOnDistance: '300.0',
            costOnWeight: '450.0',
            fid: 'tm1',
            title: 'Транспортировка на газеле',
          },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs with modificators (limit, offset and sort)', done => {
      Method.selectIndivids({
        subtypes: 'Transportation',
        limit: 2,
        offset: 2,
        sort: 'fid',
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          {
            costByService: '2500.0',
            costOnDistance: '400.0',
            costOnWeight: '350.0',
            fid: 'tm3',
            title: 'Транспортировка на камазе',
          },
          {
            costByService: '5000.0',
            costOnDistance: '899.0',
            costOnWeight: '1000.0',
            fid: 'tm4',
            title: 'Транспортировка на вертолете',
          },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectIndividByFid(fid, options)', () => {
    it('should not select individ', done => {
      Method.selectIndividByFid('test').then(() => {
        throw new Error('Individ must not exists');
      }).catch(results => {
        const { code, message, data } = results;
        expect(code).to.eql(404);
        expect(message).to.eql('Not found');
        expect(data).to.eql(null);
        done();
      });
    });
    it('should select individ', done => {
      Method.selectIndividByFid('tm3').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({
          costByService: '2500.0',
          costOnDistance: '400.0',
          costOnWeight: '350.0',
          fid: 'tm3',
          title: 'Транспортировка на камазе',
        });
        done();
      }).catch(err => done(err));
    });
    it('should select individ for subject', done => {
      Method.selectIndividByFid('tm4', { forSubject: 'e7' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({
          costByService: '5000.0',
          costOnDistance: '899.0',
          costOnWeight: '1000.0',
          fid: 'tm4',
          subjectFid: 'e7',
          title: 'Транспортировка на вертолете',
        });
        done();
      }).catch(err => done(err));
    });
  });
  context('selectTypes(options)', () => {
    it('should select types by default', done => {
      Method.selectTypes().then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Recycling', title: 'Переработка' },
          { fid: 'Transportation', title: 'Транспортировка' },
          { fid: 'Utilization', title: 'Утилизация' },
          { fid: 'Storage', title: 'Захоронение' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types for waste', done => {
      Method.selectTypes({ forWaste: ['w3'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Recycling', title: 'Переработка', wasteFid: 'w3' },
          { fid: 'Transportation', title: 'Транспортировка', wasteFid: 'w3' },
          { fid: 'Utilization', title: 'Утилизация', wasteFid: 'w3' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by individs', done => {
      Method.selectTypes({ individs: ['tm1'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Transportation', title: 'Транспортировка', methodFid: 'tm1' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by types', done => {
      Method.selectTypes({ types: ['Utilization'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by subtypes', done => {
      Method.selectTypes({ subtypes: ['Recycling'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Recycling', title: 'Переработка' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types with modificators (limit, offset and sort)', done => {
      Method.selectTypes({ types: 'Recycling', limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([]);
        done();
      }).catch(err => done(err));
    });
  });
  context('individExists(individ)', () => {
    it('should individ exists', done => {
      Method.individExists('tm1').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should individ not exists', done => {
      Method.individExists('test').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: false });
        done();
      }).catch(err => done(err));
    });
  });
  context('typeExists(individ)', () => {
    it('should type exists', done => {
      Method.typeExists('Utilization').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should type not exists', done => {
      Method.typeExists('test').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: false });
        done();
      }).catch(err => done(err));
    });
  });
  context('createIndivid(type, data)', () => {
    it('should create a new individ', done => {
      Method.createIndivid('Utilization', {
        title: 'Тестовые отходы',
        costOnWeight: 15, costOnDistance: 16, costByService: 17,
        forSubject: 'e5',
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ fid: 'a1' });
        // check in db
        Method.selectIndividByFid('a1', 'e5').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({
            fid: 'a1',
            title: 'Тестовые отходы',
            costOnWeight: '15', costOnDistance: '16', costByService: '17',
          });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('updateIndivid(fid, data)', () => {
    it('should update an existing individ', done => {
      Method.updateIndivid('tm4', {
        title: 'Тестовые отходы',
        costOnWeight: 15, costOnDistance: 16, costByService: 17,
        forSubject: 'e7',
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Method.selectIndividByFid('tm4').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({
            fid: 'tm4',
            title: 'Тестовые отходы',
            costOnWeight: '15', costOnDistance: '16', costByService: '17',
          });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('deleteIndivid(fid, options)', () => {
    it('should delete an existing individ', done => {
      Method.deleteIndivid('tm1').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Method.individExists('tm1').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({ boolean: false });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('deleteType(fid, options)', () => {
    it('should delete an existing type', done => {
      Method.deleteType('Utilization').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Method.typeExists('Utilization').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({ boolean: false });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
});
