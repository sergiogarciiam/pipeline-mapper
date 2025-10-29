import path from 'path';
import * as assert from 'assert';
import { PipelineProcessor } from '../pipeline/PipelineProcesor';
import fs from 'fs/promises';

describe('PipelineProcessor', () => {
  const fixturesDir = path.resolve(__dirname, '__fixtures__');
  const expectedDir = path.resolve(__dirname, '__expected__');
  const processor = new PipelineProcessor(fixturesDir);

  const cases = [
    'base',
    'complex',
    'extends-multiple',
    'extends-single',
    'hidden-jobs',
    'include-multiple',
    'include-single',
    'missing-include',
    'needs-basic',
    'needs-missing',
    'include-order/include-order-correct',
  ];

  for (const name of cases) {
    it(`should process ${name}.yml correctly`, async () => {
      const filePath = path.join(fixturesDir, `${name}.yml`);
      if (name === 'extends-cycle') {
        await assert.rejects(() => processor.process(filePath), /cyclic/i);
      } else {
        const result = await processor.process(filePath);
        const expectedPath = path.join(expectedDir, `${name}.json`);
        const expected = JSON.parse(await fs.readFile(expectedPath, 'utf8'));
        assert.deepStrictEqual(result, expected, `Mismatch in ${name}`);
      }
    });
  }
});
