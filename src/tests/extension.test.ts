import path from 'path';
import * as assert from 'assert';
import { PipelineProcessor } from '../pipeline/PipelineProcesor';
import fs from 'fs/promises';

type TestGroup = {
  name: string;
  dir: string;
  cases: string[];
  skip?: boolean;
  errorCases?: string[];
};

const testGroups: TestGroup[] = [
  {
    name: 'Extends Testing',
    dir: 'extends',
    cases: ['extends-base', 'extends-missing', 'extends-multi', 'extends-repeat'],
    errorCases: ['extends-cycle.yml'],
  },
  {
    name: 'Needs Testing',
    dir: 'needs',
    cases: ['needs-base', 'needs-missing', 'needs-multi', 'needs-repeat'],
    errorCases: ['needs-cycle.yml'],
  },
  {
    name: 'Includes Testing',
    dir: 'includes',
    cases: ['includes-base', 'includes-multi', 'includes-repeat'],
    errorCases: ['includes-cycle.yml', 'includes-missing'],
  },
  {
    name: 'Rules Testing',
    dir: 'rules',
    cases: ['rules-base', 'rules-multi', 'rules-errors'],
  },
];

for (const group of testGroups) {
  const describeFn = group.skip ? describe.skip : describe;
  describeFn(group.name, () => {
    const fixturesDir = path.resolve(__dirname, `__fixtures__/${group.dir}`);
    const expectedDir = path.resolve(__dirname, `__expected__/${group.dir}`);
    const processor = new PipelineProcessor(fixturesDir);

    for (const testCase of group.cases) {
      it(`should process ${testCase}.yml correctly`, async () => {
        const filePath = path.join(fixturesDir, `${testCase}.yml`);
        const result = await processor.process(filePath);
        const expectedPath = path.join(expectedDir, `${testCase}.json`);
        const expected = JSON.parse(await fs.readFile(expectedPath, 'utf8'));
        assert.deepStrictEqual(result, expected, `Mismatch in ${testCase}`);
      });
    }
    if (group.errorCases) {
      for (const errorCase of group.errorCases) {
        it(`should throw error for ${errorCase}`, async () => {
          const filePath = path.join(fixturesDir, errorCase);
          await assert.rejects(() => processor.process(filePath));
        });
      }
    }
  });
}
