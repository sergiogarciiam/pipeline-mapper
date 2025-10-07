import { useEffect, useState } from "react";
import type { PipelineData, SelectedRule } from "../utils/types";

export function usePipeline(
  pipelineData: PipelineData,
  selectedRule: SelectedRule
) {
  const [newPipelineData, setNewPipelineData] =
    useState<PipelineData>(pipelineData);

  useEffect(() => {
    Object.keys(pipelineData.jobs).forEach((jobId) => {
      const job = pipelineData.jobs[jobId];
      if (job.rules && job.rules.length > 0) {
        const hasNeverRule = job.rules.find((rule) => {
          if (rule.when && rule.when === "never") {
            if (
              rule.type === selectedRule.type &&
              rule.value ===
                `${selectedRule.variable} ${selectedRule.expression} "${selectedRule.value}"`
            ) {
              return true;
            }
          } else {
            return false;
          }
        });
        if (hasNeverRule) {
          setNewPipelineData((prevData) => ({
            ...prevData,
            jobs: {
              ...prevData.jobs,
              [jobId]: {
                ...prevData.jobs[jobId],
                undefined: true,
              },
            },
          }));
        } else {
          setNewPipelineData((prevData) => ({
            ...prevData,
            jobs: {
              ...prevData.jobs,
              [jobId]: {
                ...prevData.jobs[jobId],
                undefined: false,
              },
            },
          }));
        }
      }
    });
  }, [pipelineData, selectedRule]);

  return [newPipelineData];
}
