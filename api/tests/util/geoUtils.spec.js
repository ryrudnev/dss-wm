import { expect } from '../common';

import { getGeoDistance, getSimpleDistance, getFasterDistance } from '../../util/geoUtils';

// testing by http://www.garmin.com.ua/tools/calc.php

describe('geoUtils', () => {
  context('getGeoDistance([lat1, lon1], [lat2, lon2], unit)', () => {
    it('calculate distance (M)', () => {
      expect(Math.round(getGeoDistance([55.45, 37.37], [59.53, 30.15], 'M'))).to.eql(389);
    });
    it('calculate distance (N)', () => {
      expect(Math.round(getGeoDistance([55.45, 37.37], [59.53, 30.15], 'N'))).to.eql(337);
    });
    it('calculate distance (K)', () => {
      expect(Math.round(getGeoDistance([55.45, 37.37], [59.53, 30.15], 'K'))).to.eql(625);
    });
  });
  context('getSimpleDistance([lat1, lon1], [lat2, lon2])', () => {
    it('calculate distance', () => {
      expect(Math.round(getSimpleDistance([55.45, 37.37], [59.53, 30.15]))).to.eql(625);
    });
  });
  context('getFasterDistance([lat1, lon1], [lat2, lon2])', () => {
    it('calculate distance', () => {
      expect(Math.round(getFasterDistance([55.45, 37.37], [59.53, 30.15]))).to.eql(625);
    });
  });
});
