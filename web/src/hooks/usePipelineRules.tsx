import { useState } from "react";
import type { PipelineData, Rules } from "../utils/types";

export function usePipelineRules(initialPipeline: PipelineData) {
  const [pipelineData, setPipelineData] =
    useState<PipelineData>(initialPipeline);

  const applyRules = (rules: Record<string, string>) => {
    const newPipelineData = { ...pipelineData };

    Object.entries(newPipelineData).forEach(([key, job]) => {
      if (typeof job === "object" && job !== null && "rules" in job) {
        const jobRules = job.rules as Array<Rules>;

        const shouldRun = jobRules.some((rule) => {
          if (rule.if) {
            return Object.entries(rules).some(
              ([varName, varValue]) =>
                rule.if?.includes(varName) && Boolean(varValue)
            );
          }
          return false;
        });
        newPipelineData[key] = { ...job, disabled: !shouldRun };
      }
    });

    setPipelineData(newPipelineData);
  };

  return { pipelineData, setPipelineData, applyRules };
}
