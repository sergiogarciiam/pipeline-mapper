import { useEffect, useState } from "react";
import type { PipelineData } from "../utils/types";

export function useErrors(pipelineData: PipelineData, jobSelected: string) {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const newErrors: string[] = [];

    if (jobSelected !== "") {
      const selectedJob = Object.keys(pipelineData.jobs)
        .map((stage) => pipelineData.jobs[stage][jobSelected])
        .find((job) => job !== undefined);

      if (selectedJob) {
        if (Array.isArray(selectedJob.extendsUndefined)) {
          selectedJob.extendsUndefined.forEach((ext) => {
            newErrors.push(
              `Job "${jobSelected}" extends undefined template "${ext}"`
            );
          });
        }
      }
    } else {
      Object.keys(pipelineData.jobs).forEach((stage: string) => {
        const jobs = pipelineData.jobs[stage];

        if (stage === "undefined") {
          Object.keys(jobs).forEach((jobId: string) => {
            const job = jobs[jobId];
            newErrors.push(
              `Job "${jobId}" has an undefined stage "${job.stage}"`
            );
          });
        }

        if (stage === "none") {
          Object.keys(jobs).forEach((jobId: string) => {
            newErrors.push(`Job "${jobId}" hasn't got a stage defined`);
          });
        }

        Object.keys(jobs).forEach((jobId: string) => {
          const job = jobs[jobId];

          if (Array.isArray(job.extendsUndefined)) {
            job.extendsUndefined.forEach((ext) => {
              newErrors.push(
                `Job "${jobId}" extends undefined template "${ext}"`
              );
            });
          }
        });
      });
    }

    setErrors(newErrors);
  }, [pipelineData, jobSelected]);

  return errors;
}
