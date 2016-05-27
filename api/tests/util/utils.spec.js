import { should } from '../setup';

import {
    isArray,
    isObject,
    isFunction,
    isBool,
    Deferred,
    flatten,
    arrayIndexOf,
    intersectSet,
    containsSet,
    equalSet,
    getEqualKeySetmap,
    diffArray,
    unionArray,
    uniqueArray,
    intersectArray,
    omit,
    pick,
    joinExpanded,
} from '../../util/utils';

describe('utils', () => {
  context('isArray(obj)', () => {
    it('should array when value is array', () => {
      isArray([]).should.equal(true);
    });
    it('should not array when value is object', () => {
      isArray({ a: 1 }).should.equal(false);
    });
  });
  context('isObject(obj)', () => {
    it('should object when value is array', () => {
      isObject([]).should.equal(true);
    });
    it('should object when value is object', () => {
      isObject({ a: 1 }).should.equal(true);
    });
    it('should not object when value is null', () => {
      isObject(null).should.equal(false);
    });
  });
  context('isFunction(obj)', () => {
    it('should not function when value is array', () => {
      isFunction([]).should.equal(false);
    });
    it('should not function when value is object', () => {
      isFunction({ a: 1 }).should.equal(false);
    });
    it('should function when value is function', () => {
      isFunction(() => {}).should.equal(true);
    });
    it('should function when value is constructor', () => {
      isFunction(Date).should.equal(true);
    });
  });
  context('isBool(obj)', () => {
    it('should bool when value is boolean', () => {
      isBool(false).should.equal(true);
    });
    it('should not bool when value is number', () => {
      isBool(0).should.equal(false);
    });
  });
  context('Deffered()', () => {
    it('resolve', () => {
      const dfd = new Deferred;
      setTimeout(() => dfd.resolve(1), 150);
      return dfd.promise.should.eventually.equal(1);
    });
    it('reject', () => {
      const dfd = new Deferred;
      setTimeout(() => dfd.reject(-1), 150);
      return dfd.promise.should.be.rejectedWith(-1);
    });
  });
  context('flatten(list)', () => {
    it('should flatten an array', () => {
      const list = [['one', ['two', ['three', 'four'], 'five']], []];
      flatten(list).should.eql(['one', 'two', 'three', 'four', 'five']);
    });
  });
  context('arrayIndexOf(arr, val)', () => {
    it('should work as default arrayIndexOf (found index)', () => {
      arrayIndexOf([0, 2, -1], -1).should.eql(2);
    });
    it('should work as default arrayIndexOf (not found index)', () => {
      arrayIndexOf([0, 2, -1], 1).should.eql(-1);
    });
    it('should work with an object', () => {
      arrayIndexOf([0, 2, { a: 2 }, { b: 3, a: 2 }], { b: 3, a: 2 }).should.eql(3);
    });
  });
  context('intersectSet(a, b)', () => {
    it('should intersect two set as not empty set', () => {
      const res = intersectSet(new Set([1, 2, 3]), new Set([2, 3, 4]));
      Array.from(res).should.eql([2, 3]);
    });
    it('should intersect two set as empty set', () => {
      const res = intersectSet(new Set([1, 5, 11, 3]), new Set([12, 13, 4]));
      Array.from(res).should.eql([]);
    });
  });
  context('containsSet(a, b)', () => {
    it('should a contains b', () => {
      containsSet(new Set([2, 3]), new Set([2, 3, 4, 5])).should.eql(true);
    });
    it('should a not contains b', () => {
      containsSet(new Set([12]), new Set([2, 3, 4, 5])).should.eql(false);
    });
  });
  context('equalSet(a, b)', () => {
    it('should a equal b', () => {
      equalSet(new Set([2, 3]), new Set([2, 3])).should.eql(true);
    });
    it('should a not equal b', () => {
      containsSet(new Set([12]), new Set([2, 3, 4])).should.eql(false);
    });
  });
  context('getEqualKeySetmap(setmap, key)', () => {
    let setmap;
    beforeEach(() => {
      setmap = new Map;
      setmap.set(new Set([1, 3, 5]), 1);
      setmap.set(new Set(), 2);
      setmap.set(new Set([1, 5]), 3);
    });
    it('should get equal key of setmap', () => {
      const key = new Set([1, 5]);
      const res = getEqualKeySetmap(setmap, key);
      Array.from(res).should.eql([1, 5]);
      res.should.not.equal(key);
    });
    it('should get null', () => {
      should.equal(getEqualKeySetmap(setmap, new Set([1, 5, 2])), null);
    });
  });
  context('diffArray(a, b)', () => {
    it('should different arrays', () => {
      const a = [1, 2, 'test', 33];
      const b = [3, 5, 1, 'test', 44, 1, 4, 3];
      diffArray(a, b).should.eql([2, 33]);
    });
    it('should equal arrays', () => {
      const a = [1, 2, 'test', 33];
      const b = [1, 2, 'test', 33];
      diffArray(a, b).should.eql([]);
    });
  });
  context('unionArray(a, b)', () => {
    it('should different arrays', () => {
      const a = [1, 2, 'test', 33];
      const b = [3, 5, 1, 'test', 44, 1, 4, 3];
      unionArray(a, b).should.eql([1, 2, 'test', 33, 3, 5, 44, 4, 3]);
    });
    it('should equal arrays', () => {
      const a = [1, 2, 'test', 33];
      const b = [1, 2, 'test', 33];
      unionArray(a, b).should.eql([1, 2, 'test', 33]);
    });
  });
  context('uniqueArray(arr)', () => {
    it('should unique array', () => {
      uniqueArray([1, 2, 'test', { a: 1 }, { a: 1 }, 'tesT', {}, 3, 4, {}])
          .should.eql([1, 2, 'test', { a: 1 }, 'tesT', {}, 3, 4]);
    });
  });
  context('intersectArray(a, b)', () => {
    it('should array as an empty set', () => {
      intersectArray([1, 2, 'test', { a: 1 }, { a: 1 }], ['tesT', {}, 3, 4, {}]).should.eql([]);
    });
    it('should array as not empty set', () => {
      intersectArray([1, 2, 'test', { a: 1 }, {}], ['tesT', {}, 1, 2, {}]).should.eql([1, 2, {}]);
    });
  });
  context('omit(object, ...keys)', () => {
    it('should empty when value is not object', () => {
      omit(null, 'a', 'c').should.eql({});
    });
    it('should an object with excluded keys', () => {
      omit({ a: 1, b: 15, cc: 5, aa: 2 }, ['a', 'aa', 'bb']).should.eql({ b: 15, cc: 5 });
    });
  });
  context('pick(object, ...keys)', () => {
    it('should empty when value is not object', () => {
      pick(undefined, 'a', 'c').should.eql({});
    });
    it('should an object with included keys', () => {
      pick({ a: 1, b: 15, cc: 5, aa: 2 }, ['a', 'aa', 'c']).should.eql({ a: 1, aa: 2 });
    });
  });
  context('joinExpanded(joinField, expanded, isSingle)', () => {
    let expanded = undefined;
    beforeEach(() => {
      expanded = [
        { id: 'a1', value: 2, c: 3 },
        { id: 'a2', value: 25 },
        { id: 'a2', value: 'test', d: 1 },
        { id: 'a3', value: 25 },
        {},
      ];
    });
    it('should joined as not single', () => {
      joinExpanded('id', expanded).should.eql({
        a1: [{ value: 2, c: 3 }],
        a2: [{ value: 25 }, { value: 'test', d: 1 }],
        a3: [{ value: 25 }],
      });
    });
    it('should joined as single', () => {
      joinExpanded('id', expanded, true).should.eql({
        a1: { value: 2, c: 3 },
        a2: { value: 'test', d: 1 },
        a3: { value: 25 },
      });
    });
  });
});
