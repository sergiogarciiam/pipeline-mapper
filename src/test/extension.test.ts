import * as assert from 'assert';
import { analyzeNeeds, processJob } from '../pipeine/jobProcessor';

describe('Job processing utilities', () => {
  const mockData = {
    jobA: { stage: 'build', rules: [{ if: 'branch == main' }], needs: ['jobB'] },
    jobB: { stage: 'test', rules: [{ exists: 'file.txt' }] },
    jobC: { stage: 'deploy', extends: 'jobA', rules: [{ changes: ['src/**'] }], needs: ['jobX'] },
  };

  describe('analyzeNeeds', () => {
    it('should separate valid and missing needs', () => {
      const { validNeeds, missingNeeds } = analyzeNeeds(mockData.jobC, mockData);
      assert.deepStrictEqual(validNeeds, ['jobA']);
      assert.deepStrictEqual(missingNeeds, ['jobX']);
    });
  });

  describe('processJob', () => {
    it('should throw on cyclic extends', () => {
      const cyclicData = {
        a: { extends: 'b', stage: 'build', rules: [] },
        b: { extends: 'a', stage: 'test', rules: [] },
      };
      assert.throws(() => processJob('a', cyclicData, '/path'), /Cyclic extends detected/);
    });
  });
});
