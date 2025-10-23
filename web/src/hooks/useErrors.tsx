import { useEffect, useState } from 'react';
import type { Job, PipelineData } from '../utils/types';

export function useErrors(pipelineData: PipelineData, selectedJobId: string | null) {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const newErrors: string[] = [];

    const jobsToCheck = selectedJobId ? [selectedJobId] : Object.keys(pipelineData.jobs);

    jobsToCheck.forEach((jobName) => {
      const job = pipelineData.jobs[jobName];
      if (job) {
        collectJobErrors(pipelineData, job, jobName, newErrors);
      }
    });

    if (!selectedJobId) {
      pipelineData.noExistInclude.forEach((include) => {
        newErrors.push(`Include "${include}" doesn't exist`);
      });
    }

    setErrors(newErrors);
  }, [pipelineData, selectedJobId]);

  return errors;
}

function collectJobErrors(pipelineData: PipelineData, job: Job, jobName: string, errors: string[]) {
  if (!job.stage) {
    errors.push(`Job "${jobName}" has no stage defined`);
  } else if (!pipelineData.stages.includes(job.stage)) {
    errors.push(`Job "${jobName}" has undefined stage "${job.stage}"`);
  }

  appendArrayErrors(job.noExistNeeds, `needs undefined job`, jobName, errors);
  appendArrayErrors(job.needsErrors, `needs undefined job with the new rules`, jobName, errors);
  appendArrayErrors(job.noExistExtends, `extends undefined template`, jobName, errors);
}

function appendArrayErrors(
  arr: string[] | undefined,
  message: string,
  jobName: string,
  errors: string[],
) {
  if (Array.isArray(arr)) {
    arr.forEach((item) => errors.push(`Job "${jobName}" ${message} "${item}"`));
  }
}
