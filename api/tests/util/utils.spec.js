import '../common';

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
} from '../../util/utils';

describe('utils', () => {
  describe('isArray(obj)', () => {
    it('should array when value is array', () => {
      isArray([]).should.equal(true);
    });
    it('should not array when value is object', () => {
      isArray({ a: 1 }).should.equal(false);
    });
  });
  describe('isObject(obj)', () => {
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
  describe('isFunction(obj)', () => {
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
  describe('isBool(obj)', () => {
    it('should bool when value is boolean', () => {
      isBool(false).should.equal(true);
    });
    it('should not bool when value is number', () => {
      isBool(0).should.equal(false);
    });
  });
  describe('Deffered()', () => {
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
  describe('flatten(list)', () => {
    it('should flatten an array', () => {
      const list = [['one', ['two', ['three', 'four'], 'five']], []];
      flatten(list).should.eql(['one', 'two', 'three', 'four', 'five']);
    });
  });
  describe('arrayIndexOf(arr, val)', () => {
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
  describe('intersectSet(a, b)', () => {
    it('should intersect two set as not empty set', () => {
      const res = intersectSet(new Set([1, 2, 3]), new Set([2, 3, 4]));
      Array.from(res).should.eql([2, 3]);
    });
    it('should intersect two set as empty set', () => {
      const res = intersectSet(new Set([1, 5, 11, 3]), new Set([12, 13, 4]));
      Array.from(res).should.eql([]);
    });
  });
  describe('containsSet(a, b)', () => {
    it('should a contains b', () => {
      containsSet(new Set([2, 3]), new Set([2, 3, 4, 5])).should.eql(true);
    });
    it('should a not contains b', () => {
      containsSet(new Set([12]), new Set([2, 3, 4, 5])).should.eql(false);
    });
  });
  describe('equalSet(a, b)', () => {
    it('should a equal b', () => {
      equalSet(new Set([2, 3]), new Set([2, 3])).should.eql(true);
    });
    it('should a not equal b', () => {
      containsSet(new Set([12]), new Set([2, 3, 4])).should.eql(false);
    });
  });
  describe('getEqualKeySetmap(setmap, key)', () => {
    it('should get equal key of setmap', () => {
      const setmap = new Map;
      setmap.set(new Set([1, 3, 5]), 1);
      setmap.set(new Set(), 2);
      setmap.set(new Set([1, 5]), 3);
      const key = new Set([1, 5]);
      const res = getEqualKeySetmap(setmap, key);
      Array.from(res).should.eql([1, 5]);
      res.should.not.equal(key);
    });
    it('should a not equal b', () => {
      containsSet(new Set([12]), new Set([2, 3, 4])).should.eql(false);
    });
  });
});
