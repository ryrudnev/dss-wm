import chai from 'chai';
chai.should();

import { isArray } from '../../util/utils';

describe('utils', () => {
  describe('isArray', () => {
    it('should array when value is array', () => {
      isArray([]).should.equal(true);
    });
  });
});
