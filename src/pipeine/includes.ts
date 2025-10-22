import fs from 'fs';
import path from 'path';
import * as YAML from 'yaml';
import { processData } from './parser';
import { PipelineData } from '../utils/types';

export async function processIncludes(
  data: PipelineData,
  baseDir: string,
  visited: Set<string> = new Set(),
): Promise<PipelineData> {
  const includes = Array.isArray(data.include) ? data.include : [];
  let merged = { ...data };

  for (const inc of includes) {
    const resolved = path.resolve(baseDir, inc);
    if (visited.has(resolved)) {
      continue;
    }

    visited.add(resolved);

    if (!fs.existsSync(resolved)) {
      merged.noExistInclude.push(inc);
      continue;
    }

    const content = fs.readFileSync(resolved, 'utf8');
    const parsed = YAML.parse(content);
    const includedData = processData(parsed, inc);
    const recursive = await processIncludes(includedData, path.dirname(resolved), visited);

    merged = mergePipelines(merged, recursive);
  }

  return merged;
}

function mergePipelines(a: PipelineData, b: PipelineData): PipelineData {
  return {
    ...a,
    ...b,
    jobs: { ...b.jobs, ...a.jobs },
    stages: [...new Set([...(a.stages || []), ...(b.stages || [])])],
    hiddenJobs: [...new Set([...(a.hiddenJobs || []), ...(b.hiddenJobs || [])])],
    include: [...new Set([...(a.include || []), ...(b.include || [])])],
    noExistInclude: [...new Set([...(a.noExistInclude || []), ...(b.noExistInclude || [])])],
  };
}
