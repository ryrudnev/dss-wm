/* eslint-disable max-len */

import { start, finish, expect } from '../common';
import Subject from '../../models/subject.storage';

describe('subject.storage', function () {
  this.timeout(30 * 1000); // delay

  beforeEach(done => start(done));

  afterEach(done => finish(done));

  context('selectIndivids(options)', () => {
    it('should select individs by default', done => {
      Subject.selectIndivids([]).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { coordinates: '[48.71628703777461,44.511760148437475]', fid: 'c1', title: 'Волгоград' },
          { fid: 'r6', title: 'Поволжский' },
          { coordinates: '[50.027651924763234,45.466391499999986]', fid: 'c2', title: 'Николаевск' },
          { coordinates: '[55.72504493415047,37.64696099999997]', fid: 'c3', title: 'Москва' },
          { fid: 'r3', title: 'Центральный' },
          { coordinates: '[48.83164722621903,44.76705249999995]', fid: 'c4', title: 'Волжский' },
          { budget: '74342.0', coordinates: '[48.74873396109339,44.52672657226556]', fid: 'e1', title: 'ООО Бетонный завод' },
          { budget: '450000.0', coordinates: '[48.65237733649906,44.35781177734368]', fid: 'e2', title: 'ОАО УТИЛЗ' },
          { budget: '13000.0', coordinates: '[48.51730311744379,44.36742481445307]', fid: 'e3', title: 'ООО Народный транспорт' },
          { budget: '35647.0', coordinates: '[48.77574410796487,44.77941211914055]', fid: 'e4', title: 'ООО Трубный завод' },
          { budget: '12356.0', coordinates: '[48.74862044225773,44.66869053100585]', fid: 'e5', title: 'ОАО ЛесВАЛ' },
          { budget: '36777.0', coordinates: '[48.798458765071125,44.6194237158203]', fid: 'e6', title: 'ЭколСейв' },
          { budget: '22000.0', coordinates: '[48.74189399082321,44.46252521728513]', fid: 'e7', title: 'Магнит' },
          { budget: '5500.0', coordinates: '[48.566745271705706,44.428192941894515]', fid: 'e8', title: 'ОАО Шиномонтаж у Рафика' },
          { budget: '15320.0', coordinates: '[48.745131190115714,44.46506825390617]', fid: 'm1', title: 'Начальная школа №1' },
          { budget: '55000.0', coordinates: '[48.71269809854965,44.521308812530435]', fid: 'm2', title: 'ВолгГТУ' },
          { budget: '10000.0', coordinates: '[48.67223994605612,44.47667685452262]', fid: 'm3', title: 'Химический завод' },
          { budget: '78000.0', coordinates: '[48.7001243265668,44.862496225585886]', fid: 'm4', title: 'Лесопилка УПТ' },
          { budget: '5000.0', coordinates: '[48.77869391108022,44.436776010742115]', fid: 'm5', title: 'Автотранспортное депо №19' },
          { budget: '222222.0', coordinates: '[48.64964756215051,44.37291797851556]', fid: 'm6', title: 'МУП Свалка' },
          { budget: '43000.0', coordinates: '[48.80772881724398,44.5500725195312]', fid: 'm7', title: 'ОАО Мельница' },
          { fid: 'r1', title: 'Северный' },
          { coordinates: '[60,100]', fid: 's1', title: 'Россия' },
          { fid: 'r10', title: 'Восточно-Сибирский' },
          { fid: 'r11', title: 'Дальневосточный' },
          { fid: 'r12', title: 'Калининградская область' },
          { fid: 'r2', title: 'Северо-Западный' },
          { fid: 'r4', title: 'Волго-Вятский' },
          { fid: 'r5', title: 'Центрально-Черноземный' },
          { fid: 'r7', title: 'Северо-Кавказский' },
          { fid: 'r8', title: 'Уральский' },
          { fid: 'r9', title: 'Западно-Сибирский' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only for fids', done => {
      Subject.selectIndivids({ fids: ['e1', 'e2', ''] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { budget: '74342.0', coordinates: '[48.74873396109339,44.52672657226556]', fid: 'e1', title: 'ООО Бетонный завод' },
          { budget: '450000.0', coordinates: '[48.65237733649906,44.35781177734368]', fid: 'e2', title: 'ОАО УТИЛЗ' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only by subtypes', done => {
      Subject.selectIndivids({ subtypes: 'City' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { coordinates: '[48.71628703777461,44.511760148437475]', fid: 'c1', title: 'Волгоград' },
          { coordinates: '[50.027651924763234,45.466391499999986]', fid: 'c2', title: 'Николаевск' },
          { coordinates: '[55.72504493415047,37.64696099999997]', fid: 'c3', title: 'Москва' },
          { coordinates: '[48.83164722621903,44.76705249999995]', fid: 'c4', title: 'Волжский' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only by methods', done => {
      Subject.selectIndivids({ byMethods: ['tm1', 'sm2', ''] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { budget: '222222.0', coordinates: '[48.64964756215051,44.37291797851556]', fid: 'm6', title: 'МУП Свалка', methodFid: 'tm1' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs only by waste', done => {
      Subject.selectIndivids({ byWaste: ['w14', 'w15', ''] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { budget: '450000.0', coordinates: '[48.65237733649906,44.35781177734368]', fid: 'e2', title: 'ОАО УТИЛЗ', wasteFid: 'w14' },
          { budget: '35647.0', coordinates: '[48.77574410796487,44.77941211914055]', fid: 'e4', title: 'ООО Трубный завод', wasteFid: 'w15' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select individs with modificators (limit, offset and sort)', done => {
      Subject.selectIndivids({ subtypes: 'City', limit: 2, offset: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { coordinates: '[55.72504493415047,37.64696099999997]', fid: 'c3', title: 'Москва' },
          { coordinates: '[48.83164722621903,44.76705249999995]', fid: 'c4', title: 'Волжский' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectIndividByFid(fid)', () => {
    it('should not select individ', done => {
      Subject.selectIndividByFid('test').then(() => {
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
      Subject.selectIndividByFid('c3').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({
          coordinates: '[55.72504493415047,37.64696099999997]',
          fid: 'c3',
          title: 'Москва',
        });
        done();
      }).catch(err => done(err));
    });
  });
  context('selectLocationsFor(options)', () => {
    it('should select locations for subjects by subtypes with modificators (limit and sort)', done => {
      Subject.selectLocationsFor({ subtypes: ['Region'], forSubjects: 'e5', limit: 2, sort: 'fid' }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { subjectFid: 'e5', fid: 'r6', title: 'Поволжский' },
        ]);
        done();
      }).catch(err => done(err));
    });
  });
  context('selectTypes(options)', () => {
    it('should select types by default', done => {
      Subject.selectTypes().then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'City', title: 'Населенный пункт' },
          { fid: 'Company', title: 'Предприятие' },
          { fid: 'Municipal', title: 'Муниципальный субъект' },
          { fid: 'Region', title: 'Регион' },
          { fid: 'State', title: 'Государство' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by individs', done => {
      Subject.selectTypes({ individs: ['e6'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Company', subjectFid: 'e6', title: 'Предприятие' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by types', done => {
      Subject.selectTypes({ types: ['Company'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([]);
        done();
      }).catch(err => done(err));
    });
    it('should select types by subtypes', done => {
      Subject.selectTypes({ subtypes: ['Company'] }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql([
          { fid: 'Company', title: 'Предприятие' },
        ]);
        done();
      }).catch(err => done(err));
    });
    it('should select types with modificators (limit, offset and sort)', done => {
      Subject.selectTypes({ types: 'Company', limit: 2, offset: 2, sort: 'fid' }).then(results => {
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
      Subject.individExists('e8').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should individ not exists', done => {
      Subject.individExists('test').then(results => {
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
      Subject.typeExists('City').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        done();
      }).catch(err => done(err));
    });
    it('should type not exists', done => {
      Subject.typeExists('test').then(results => {
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
      Subject.createIndivid('Company', {
        title: 'Тестовое предприятие',
        coordinates: [15, 15],
        budget: 0,
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ fid: 1 });
        // check in db
        Subject.selectIndividByFid(1).then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({
            fid: '1',
            title: 'Тестовое предприятие',
            coordinates: '[15,15]',
            budget: '0',
          });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('updateIndivid(fid, data)', () => {
    it('should update an existing individ', done => {
      Subject.updateIndivid('e3', {
        title: 'Тестовое предприятие',
        coordinates: [15, 15],
        budget: 0,
        type: 'City',
      }).then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Subject.selectIndividByFid('e3').then(res => {
          expect(res).has.property('success').that.is.to.eql(true);
          expect(res).has.property('code').that.is.to.eql(200);
          expect(res).has.property('message').that.is.to.eql('OK');
          expect(res).has.property('data').that.is.to.eql({
            fid: 'e3',
            title: 'Тестовое предприятие',
            coordinates: '[15,15]',
            budget: '0',
          });
          done();
        }).catch(err => done(err));
      }).catch(err => done(err));
    });
  });
  context('deleteIndivid(fid, options)', () => {
    it('should delete an existing individ', done => {
      Subject.deleteIndivid('e8').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Subject.individExists('e8').then(res => {
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
      Subject.deleteType('Company').then(results => {
        expect(results).has.property('success').that.is.to.eql(true);
        expect(results).has.property('code').that.is.to.eql(200);
        expect(results).has.property('message').that.is.to.eql('OK');
        expect(results).has.property('data').that.is.to.eql({ boolean: true });
        // check in db
        Subject.typeExists('Company').then(res => {
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
