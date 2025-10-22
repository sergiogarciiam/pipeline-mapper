import { PipelineData, Job } from '../utils/types';
import { processJob } from './jobProcessor';

export function processData(data: PipelineData, includePath: string) {
  const stages = data.stages || [];
  const hiddenJobs = Object.keys(data).filter((k) => k.startsWith('.'));
  const include = data.include || [];
  const noExistInclude: string[] = [];
  const jobs: Record<string, Job> = {};

  Object.keys(data).forEach((name) => {
    if (isJob(name)) {
      const job = processJob(name, data, includePath);
      if (job) {
        jobs[name] = job;
      }
    }
  });

  return { stages, jobs, hiddenJobs, include, noExistInclude };
}

function isJob(name: string): boolean {
  const reserved = [
    'stages',
    'variables',
    'include',
    'default',
    'image',
    'services',
    'before_script',
    'after_script',
    'types',
  ];
  return !reserved.includes(name) && !name.startsWith('.');
}
