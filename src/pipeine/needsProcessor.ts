import { Job, PipelineData } from '../utils/types';

export function processNeedsGroups(piplineData: PipelineData): PipelineData {
  const [resolvedJobsWithGroups, needsGroupsMax] = assignNeedGroups(piplineData.jobs);
  const needsGroups = Array.from({ length: needsGroupsMax + 1 }, (_, i) => i);

  return {
    ...piplineData,
    needsGroups,
    jobs: resolvedJobsWithGroups,
  };
}

export function assignNeedGroups(resolvedJobs: Record<string, Job>): [Record<string, Job>, number] {
  const jobs = Object.entries(resolvedJobs);
  const jobGroups: Record<string, number> = {};
  let depGroups: number[] = [];

  for (const [jobName, job] of jobs) {
    if (!job.needs || job.needs.length === 0) {
      jobGroups[jobName] = 0;
    }
  }

  let updated = true;
  while (updated) {
    updated = false;

    for (const [jobName, job] of jobs) {
      if (jobGroups[jobName] !== undefined) continue;

      const dependencies = job.needs?.filter((n) => resolvedJobs[n]);
      if (!dependencies || dependencies.length === 0) {
        jobGroups[jobName] = 0;
        updated = true;
        continue;
      }

      depGroups = dependencies.map((n) => jobGroups[n]).filter((g) => g !== undefined);

      if (depGroups.length === dependencies.length) {
        jobGroups[jobName] = Math.max(...depGroups) + 1;
        updated = true;
      }
    }
  }

  for (const [jobName, job] of jobs) {
    job.needGroup = jobGroups[jobName] ?? 0;
  }

  const needsGroupsMax = Math.max(...Object.values(jobGroups));

  return [resolvedJobs, needsGroupsMax];
}
