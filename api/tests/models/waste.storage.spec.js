/* eslint-disable max-len */

import { start, finish, expect } from '../common';
import Waste from '../../models/waste.storage';

import { wasteData, wasteTypes } from '../../owl/test.data';

describe('waste.storage', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));
/*
  context('selectIndivids(options)', () => {
    it('should select individs by default', done => {
      Waste.selectIndivids().then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql(wasteData);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only for subjects', done => {
      Waste.selectIndivids({ forSubjects: ['e1', 'e2', ''] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { amount: '0.9', fid: 'w12', subjectFid: 'e1', title: 'Бумага' },
          { amount: '3.0', fid: 'w13', subjectFid: 'e1', title: 'Масла' },
          { amount: '0.07', fid: 'w4', subjectFid: 'e1', title: 'Карандаши' },
          { amount: '0.87', fid: 'w14', subjectFid: 'e2', title: 'Масла' },
          { amount: '3.7', fid: 'w3', subjectFid: 'e2', title: 'Щепа' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only for not subjects', done => {
      Waste.selectIndivids({ forNotSubjects: [
        'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
        'm3', 'm4', 'm5', 'm6', 'm7', 'test1', 'test2',
      ] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { amount: '4.0', fid: 'w20', title: 'Бутылки' },
          { amount: '1.7', fid: 'w24', title: 'Строительный мусор' },
          { amount: '0.67', fid: 'w22', title: 'Тара' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only by subtypes', done => {
      Waste.selectIndivids({ subtypes: 'SW8' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { amount: '12.0', fid: 'w19', title: 'Тяжелые газы' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs with modificators (limit, offset and sort)', done => {
      Waste.selectIndivids({ subtypes: 'SW5', limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { amount: '4.0', fid: 'w25', title: 'Строительный мусор' },
          { amount: '0.78', fid: 'w26', title: 'Строительный мусор' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectIndividByFid(fid, options)', () => {
    it('should not select individ', done => {
      Waste.selectIndividByFid('test').then(() => {
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
      Waste.selectIndividByFid('w5').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ amount: '1.0', fid: 'w5', title: 'Масла' });
        done();
      }).catch(err => done(err));
    });
    it('should select individ for subject', done => {
      Waste.selectIndividByFid('w2', { forSubject: 'e5' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ amount: '1.53', fid: 'w2', title: 'Брусья', subjectFid: 'e5' });
        done();
      }).catch(err => done(err));
    });
  });
  context('selectTypes(options)', () => {
    it('should select types by default', done => {
      Waste.selectTypes().then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql(wasteTypes);
        done();
      }).catch(err => done(err));
    });
    it('should select types by individs', done => {
      Waste.selectTypes({ individs: ['w1'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { wasteFid: 'w1', fid: 'ConsumptionWaste', title: 'Бытовые отходы' },
          { wasteFid: 'w1', fid: 'ProductionWaste', title: 'Промышленные отходы' },
          { wasteFid: 'w1', fid: 'HarmlessWaste', title: 'Практически неопасные отходы' },
          { wasteFid: 'w1', fid: 'SolidWaste', title: 'Твердые отходы' },
          { wasteFid: 'w1', fid: 'RecyclableWaste', title: 'Перерабатываемые отходы' },
          { wasteFid: 'w1', fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
          { wasteFid: 'w1', fid: 'UtilableWaste', title: 'Утилизируемые отходы' },
          { wasteFid: 'w1', fid: 'SW3', title: 'Деревянные щепки' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by types', done => {
      Waste.selectTypes({ types: ['SW3'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'ConsumptionWaste', title: 'Бытовые отходы' },
          { fid: 'ProductionWaste', title: 'Промышленные отходы' },
          { fid: 'HarmlessWaste', title: 'Практически неопасные отходы' },
          { fid: 'SolidWaste', title: 'Твердые отходы' },
          { fid: 'RecyclableWaste', title: 'Перерабатываемые отходы' },
          { fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
          { fid: 'UtilableWaste', title: 'Утилизируемые отходы' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by subtypes', done => {
      Waste.selectTypes({ subtypes: ['SW3'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([{ fid: 'SW3', title: 'Деревянные щепки' }]);
        done();
      }).catch(err => done(err));
    });
    it('should select types with modificators (limit, offset and sort)', done => {
      Waste.selectTypes({ types: 'SW3', limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'ProductionWaste', title: 'Промышленные отходы' },
          { fid: 'RecyclableWaste', title: 'Перерабатываемые отходы' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectOrigins(options)', () => {
    it('should select origins with modificators (limit, offset and sort)', done => {
      Waste.selectOrigins({ limit: 2, offset: 2 }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'medical', title: 'Медецинское' },
          { fid: 'production', title: 'Промышленное' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectHazardClasses(options)', () => {
    it('should select hazard classes with modificators (limit, offset and sort)', done => {
      Waste.selectHazardClasses({ limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'fourthClass', title: '4 класс' },
          { fid: 'secondClass', title: '2 класс' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectAggregateStates(options)', () => {
    it('should select aggregate states with modificators (limit, offset and sort)', done => {
      Waste.selectAggregateStates({ limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'solid', title: 'Твердый' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('individExists(individ)', () => {
    it('should individ exists', done => {
      Waste.individExists('w15').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should individ not exists', done => {
      Waste.individExists('test').then(results => {
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
      Waste.typeExists('SW2').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should type not exists', done => {
      Waste.typeExists('test').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: false });
        done();
      }).catch(err => done(err));
    });
  });
  */
  context('createIndivid(type, data)', () => {
    it('should create a new individ', done => {
      Waste.createIndivid('SW2', { title: 'Тестовые отходы', amount: 15, forSubject: 'e5' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ fid: 1 });
        // check in db
        Waste.selectIndividByFid(1, 'e5').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({ fid: '1', title: 'Тестовые отходы', amount: '15' });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('createType(subtype, data)', () => {
    it('should create a new type', done => {
      Waste.createType('SpecificWaste', {
        title: 'Тестовые отходы', aggregateState: 'solid', hazardClass: 'fourthClass',
        origin: ['production', 'medical'], method: ['Transportation'],
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ fid: 1 });
        // check in db
        Waste.selectTypes({ types: 1 }).then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql([
            { fid: 'MedicalWaste', title: 'Медицинские отходы' },
            { fid: 'ProductionWaste', title: 'Промышленные отходы' },
            { fid: 'LowHazardousWaste', title: 'Малоопасные отходы' },
            { fid: 'SolidWaste', title: 'Твердые отходы' },
            { fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
          ]);
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('updateIndivid(fid, data)', () => {
    it('should update an existing individ', done => {
      Waste.updateIndivid('w5', { title: 'Тестовые отходы', amount: 15, forSubject: 'e5', type: 'SW3' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Waste.selectIndividByFid('w5', 'e5').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({ fid: 'w5', title: 'Тестовые отходы', amount: '15' });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('updateType(fid, data)', () => {
    it('should update an existing type', done => {
      Waste.updateType('w5', {
        title: 'Тестовые отходы', aggregateState: 'solid', hazardClass: 'fourthClass',
        origin: ['production', 'medical'], method: ['Transportation'],
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Waste.selectTypes({ types: 'w5' }).then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql([
            { fid: 'MedicalWaste', title: 'Медицинские отходы' },
            { fid: 'ProductionWaste', title: 'Промышленные отходы' },
            { fid: 'LowHazardousWaste', title: 'Малоопасные отходы' },
            { fid: 'SolidWaste', title: 'Твердые отходы' },
            { fid: 'TransportableWaste', title: 'Транспортабельные отходы' },
          ]);
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  /*
  context('deleteIndivid(fid, options)', () => {
    it('should update an existing individ', done => {
      Waste.updateIndivid('w5', { title: 'Тестовые отходы', amount: 15, forSubject: 'e5', type: 'SW3' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Waste.selectIndividByFid('w5', 'e5').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({ fid: 'w5', title: 'Тестовые отходы', amount: '15' });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  */
});
