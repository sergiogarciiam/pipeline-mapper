import { useEffect, useState } from "react";
import type { PipelineData, SelectedRule } from "../utils/types";

export function usePipeline(
  pipelineData: PipelineData | undefined,
  selectedRules: SelectedRule[]
) {
  const [newPipelineData, setNewPipelineData] = useState(pipelineData);

  useEffect(() => {
    const updatedPipeline: PipelineData = JSON.parse(
      JSON.stringify(pipelineData)
    );

    if (selectedRules.length === 0) {
      for (const [, job] of Object.entries(updatedPipeline.jobs)) {
        job.isDisabled = false;
        job.needsErrors = [];
      }
      setNewPipelineData(updatedPipeline);
      return;
    }

    for (const [, job] of Object.entries(updatedPipeline.jobs)) {
      let matchesAnyRule = false;

      if (job.rules.length === 0) {
        job.isDisabled = false;
        continue;
      }

      for (const selectedRule of selectedRules) {
        for (const rule of job.rules) {
          switch (rule.type) {
            case "if": {
              const expectedValue = `${selectedRule.variable} ${selectedRule.expression} "${selectedRule.value}"`;
              if (rule.value === expectedValue && rule.when !== "never") {
                matchesAnyRule = true;
              }
              break;
            }
            case "exists":
            case "changes":
              if (
                rule.value?.includes(selectedRule.value) &&
                rule.when !== "never"
              ) {
                matchesAnyRule = true;
              }
              break;
          }

          if (matchesAnyRule) break;
        }
        if (matchesAnyRule) break;
      }

      job.isDisabled = !matchesAnyRule;
    }

    for (const [, job] of Object.entries(updatedPipeline.jobs)) {
      if (job.isDisabled) continue;
      const needsErrors: string[] = [];

      job.needs?.forEach((need) => {
        if (updatedPipeline.jobs[need]?.isDisabled) {
          needsErrors.push(need);
        }
      });

      job.needsErrors = needsErrors;
    }

    setNewPipelineData(updatedPipeline);
  }, [pipelineData, selectedRules]);

  return [newPipelineData] as const;
}
