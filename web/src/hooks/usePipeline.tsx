import { useEffect, useState } from 'react';
import type { PipelineData, SelectedRule, Job } from '../utils/types';

export function usePipeline(pipelineData: PipelineData | undefined, selectedRules: SelectedRule[]) {
  const [newPipelineData, setNewPipelineData] = useState(pipelineData);

  useEffect(() => {
    if (!pipelineData) return;

    const updatedPipeline: PipelineData = JSON.parse(JSON.stringify(pipelineData));

    const matchesSelectedRules = (job: Job): boolean => {
      if (job.rules.length === 0) return true;

      for (const selectedRule of selectedRules) {
        for (const rule of job.rules) {
          if (rule.when === 'never') continue;

          if (rule.type === 'if') {
            const expectedValue = `${selectedRule.variable} ${selectedRule.expression} "${selectedRule.value}"`;
            if (rule.value === expectedValue) return true;
          } else if (
            (rule.type === 'exists' || rule.type === 'changes') &&
            rule.value?.includes(selectedRule.value)
          ) {
            return true;
          }
        }
      }

      return false;
    };

    Object.values(updatedPipeline.jobs).forEach((job) => {
      job.isDisabled = selectedRules.length > 0 ? !matchesSelectedRules(job) : false;
      job.needsErrors = [];
    });

    Object.values(updatedPipeline.jobs).forEach((job) => {
      if (!job.isDisabled && job.needs?.length) {
        job.needsErrors = job.needs.filter((need) => updatedPipeline.jobs[need]?.isDisabled);
      }
    });

    setNewPipelineData(updatedPipeline);
  }, [pipelineData, selectedRules]);

  return [newPipelineData] as const;
}
