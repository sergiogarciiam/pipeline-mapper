import path from 'path';
import * as assert from 'assert';
import { PipelineProcessor } from '../pipeline/PipelineProcesor';
import fs from 'fs/promises';

type TestGroup = {
  name: string;
  dir: string;
  cases: string[];
  skip?: boolean;
  cycleFile?: string;
};

const testGroups: TestGroup[] = [
  {
    name: 'Extends Testing',
    dir: 'extends',
    cases: ['extends-base', 'extends-missing', 'extends-multi', 'extends-repeat'],
    cycleFile: 'extends-cycle.yml',
  },
  {
    name: 'Needs Testing',
    dir: 'needs',
    cases: ['needs-base', 'needs-missing', 'needs-multi', 'needs-repeat'],
    cycleFile: 'needs-cycle.yml',
  },
  {
    name: 'Includes Testing',
    dir: 'includes',
    cases: ['includes-base', 'includes-missing', 'includes-multi', 'includes-repeat'],
    cycleFile: 'includes-cycle.yml',
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

    it(`should throw error for ${group.cycleFile}`, async () => {
      if (group.cycleFile) {
        const filePath = path.join(fixturesDir, group.cycleFile);
        await assert.rejects(() => processor.process(filePath), /cyclic/i);
      }
    });
  });
}
