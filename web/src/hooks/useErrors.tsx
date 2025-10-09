import { useEffect, useState } from "react";
import type { Job, PipelineData } from "../utils/types";

export function useErrors(pipelineData: PipelineData, jobSelected: string) {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const newErrors: string[] = [];

    if (jobSelected !== "") {
      const selectedJob = pipelineData.jobs[jobSelected];

      if (selectedJob) {
        fillErrorsArray(pipelineData, selectedJob, newErrors, jobSelected);
      }
    } else {
      Object.keys(pipelineData.jobs).forEach((jobName: string) => {
        const job = pipelineData.jobs[jobName];
        fillErrorsArray(pipelineData, job, newErrors, jobName);
      });
    }

    setErrors(newErrors);
  }, [pipelineData, jobSelected]);

  return errors;
}

function fillErrorsArray(
  pipelineData: PipelineData,
  job: Job,
  newErrors: string[],
  jobName: string
) {
  if (!job.stage) {
    newErrors.push(`Job "${jobName}" has no stage defined`);
  } else if (!pipelineData.stages.includes(job.stage)) {
    newErrors.push(`Job "${jobName}" has undefined stage "${job.stage}"`);
  }

  if (Array.isArray(job.noExistNeeds)) {
    job.noExistNeeds.forEach((need) => {
      newErrors.push(`Job "${jobName}" needs undefined job "${need}"`);
    });
  }
  if (Array.isArray(job.noExistExtends)) {
    job.noExistExtends.forEach((extend) => {
      newErrors.push(`Job "${jobName}" extends undefined template "${extend}"`);
    });
  }

  if (Array.isArray(job.needsErrors)) {
    job.needsErrors.forEach((need) => {
      newErrors.push(
        `Job "${jobName}" needs undefined job "${need}" with the new rules`
      );
    });
  }
}
