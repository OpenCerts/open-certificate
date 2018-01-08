const utils = require('./utils');
const {sha3} = require('ethereumjs-util');

describe('utils', () => {
  describe('flattenJson', () => {
    it('flattens deeply nested json object', () => {
      const json = {
        a: 'a',
        b: ['b.0', 'b.1', {b2: 'b.0.b2'}],
        c: {
          c1:'c.c1',
          c2:12.15,
          c3:true,
        }
      }

      const result = utils.flattenJson(json);

      expect(result).to.eql([
        { 'a': 'a' },
        { 'b.0': 'b.0' },
        { 'b.1': 'b.1' },
        { 'b.2.b2': 'b.0.b2' },
        { 'c.c1': 'c.c1' },
        { 'c.c2': 12.15 },
        { 'c.c3': true },
      ]);
    });
  });

  describe('hashArray', () => {
    it('hashes elements in an array and sort them by hash', () => {
      const arr = [
        { 'a': 'a' },
        { 'b.0': 'b.0' },
        { 'b.1': 'b.1' },
        { 'b.2.b2': 'b.0.b2' },
        { 'c.c1': 'c.c1' },
        { 'c.c2': 12.15 },
        { 'c.c3': true },
      ];
      const result = utils.hashArray(arr);

      expect(result).to.eql([
        sha3(JSON.stringify(arr[2])),
        sha3(JSON.stringify(arr[4])),
        sha3(JSON.stringify(arr[5])),
        sha3(JSON.stringify(arr[6])),
        sha3(JSON.stringify(arr[0])),
        sha3(JSON.stringify(arr[3])),
        sha3(JSON.stringify(arr[1])),
      ]);
    });
  });
});