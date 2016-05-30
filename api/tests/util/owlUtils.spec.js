import '../common';

import {
  axiomWithoutPrefix,
  axiomWithPrefix,
  qFidAs,
  qSort,
  qLimitOffset,
  qType,
  qTypeRestrict,
  qInFilter,
  qNotInFilter,
} from '../../util/owlUtils';

describe('owlUtils', () => {
  context('axiomWithoutPrefix(a)', () => {
    it('should axiom without prefix when a value with prefix', () => {
      axiomWithoutPrefix('<http://localhost/owl/wm#hasMethod>').should.equal('hasMethod');
    });
    it('should axiom without prefix when a value without prefix', () => {
      axiomWithoutPrefix('a').should.equal('a');
    });
  });
  context('axiomWithPrefix(a)', () => {
    it('should axiom with prefix when a value with prefix', () => {
      axiomWithPrefix('<http://localhost/owl/wm#hasMethod>', 'owl').should.equal('owl:hasMethod');
    });
    it('should axiom with prefix when a value without prefix', () => {
      axiomWithPrefix('a').should.equal(':a');
    });
  });
  context('qFidAs(fid, as)', () => {
    it('should removed an prefix of axiom for SPARQL', () => {
      qFidAs('fid', 'id').should.equal('(REPLACE(STR(?fid), \'^.*(#|/)\', \'\') as ?id)');
    });
  });
  context('qSort(options)', () => {
    it('should create empty sort conditional for SPARQL', () => {
      qSort([1, 2, '']).should.equal('');
    });
    it('should create sort conditional for SPARQL', () => {
      qSort(['a', '-c', '-b']).should.equal('ORDER BY ?a DESC(?c) DESC(?b)');
    });
  });
  context('qLimitOffset(options)', () => {
    it('should create limit and offset conditional for SPARQL', () => {
      qLimitOffset(15, 1).should.equal('OFFSET 1 LIMIT 15');
    });
  });
  context('qType([s, p], types)', () => {
    it('should create type conditional for SPARQL', () => {
      qType(['subject', 'a'], ['Method', ['Storage', 'Util', '', undefined]])
        .should.equal('?subject a :Method ; a :Storage ; a :Util');
    });
  });
  context('qTypeRestrict([prop, p], values)', () => {
    it('should type restriction conditional for SPARQL', () => {
      qTypeRestrict(['hasAggregateState', 'owl:hasValue'], ['solid', undefined, 'gas'])
        .should.equal(`[ rdf:type owl:Restriction ;
                    owl:onProperty :hasAggregateState ;
                    owl:hasValue :solid
                  ],  [ rdf:type owl:Restriction ;
                    owl:onProperty :hasAggregateState ;
                    owl:hasValue :gas
                  ]`);
    });
  });
  context('qInFilter([s, p, o, invert = false], filters)', () => {
    it('should create empty IN filter conditional for SPARQL', () => {
      qInFilter(['subject', ':hasWaste', 'waste'], []).should.equal('');
    });
    it('should create IN filter conditional for SPARQL', () => {
      qInFilter(['subject', ':hasWaste', 'waste'], ['es1', '', undefined, 'es6'])
        .should.equal('?subject :hasWaste ?waste FILTER(?subject IN (:es1,:es6))');
    });
    it('should create IN filter conditional for SPARQL (invert)', () => {
      qInFilter(['subject', ':hasWaste', 'waste', true], ['es1', '', undefined, 'es6'])
        .should.equal('?subject :hasWaste ?waste FILTER(?waste IN (:es1,:es6))');
    });
    it('should create IN filter conditional for SPARQL (only s)', () => {
      qInFilter(['subject'], ['es1', '', undefined, 'es6'])
        .should.equal('FILTER(?subject IN (:es1,:es6))');
    });
  });
  context('qNotInFilter([s, p, o, invert = false], filters)', () => {
    it('should create empty NOT IN filter conditional for SPARQL', () => {
      qNotInFilter(['subject', ':hasWaste', 'waste'], []).should.equal('');
    });
    it('should create NOT IN filter conditional for SPARQL', () => {
      qNotInFilter(['subject', ':hasWaste', 'waste'], ['es1', '', undefined, 'es6'])
        .should.equal('?subject :hasWaste ?waste FILTER(?subject != :es1 && ?subject != :es6)');
    });
    it('should create NOT IN filter conditional for SPARQL (invert)', () => {
      qNotInFilter(['subject', ':hasWaste', 'waste', true], ['es1', '', undefined, 'es6'])
        .should.equal('?subject :hasWaste ?waste FILTER(?waste != :es1 && ?waste != :es6)');
    });
    it('should create NOT IN filter conditional for SPARQL (only s)', () => {
      qNotInFilter(['subject'], ['es1', '', undefined, 'es6'])
        .should.equal('FILTER(?subject != :es1 && ?subject != :es6)');
    });
  });
});
