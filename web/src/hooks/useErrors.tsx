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
      pipelineData.missingIncludes.forEach((include) => {
        newErrors.push(`Include "${include}" doesn't exist`);
      });
    }

    setErrors(newErrors);
  }, [pipelineData, selectedJobId]);

  return errors;
}

function collectJobErrors(pipelineData: PipelineData, job: Job, jobName: string, errors: string[]) {
  if (job.stage && !pipelineData.stages.includes(job.stage)) {
    errors.push(`Job "${jobName}" has undefined stage "${job.stage}"`);
  }

  appendArrayErrors({
    jobNamesErrors: job.needsErrors,
    preMessage: `needs undefined job`,
    postMessage: 'due to new pipeline rules',
    jobName,
    errors,
  });
  appendArrayErrors({
    jobNamesErrors: job.missingNeeds,
    preMessage: `needs undefined job`,
    jobName,
    errors,
  });
  appendArrayErrors({
    jobNamesErrors: job.postNeeds,
    preMessage: `needs job`,
    postMessage: "because it's in a later stage",
    jobName,
    errors,
  });
  appendArrayErrors({
    jobNamesErrors: job.missingExtends,
    preMessage: `extends undefined`,
    jobName,
    errors,
  });
}

function appendArrayErrors(data: {
  jobNamesErrors: string[] | undefined;
  preMessage: string;
  postMessage?: string;
  jobName: string;
  errors: string[];
}) {
  const { jobNamesErrors, preMessage, jobName, errors, postMessage } = data;
  if (Array.isArray(jobNamesErrors)) {
    jobNamesErrors.forEach((jobNameError) =>
      errors.push(`Job "${jobName}" ${preMessage} "${jobNameError}" ${postMessage}`),
    );
  }
}
