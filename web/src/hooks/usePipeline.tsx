import { useEffect, useState } from 'react';
import type { PipelineData, SelectedRule, Job } from '../utils/types';
import {
  CHANGES_TYPE_RULE,
  DEFAULT_TYPE_RULE,
  EXISTS_TYPE_RULE,
  IF_TYPE_RULE,
  NEVER_WHEN,
} from '../utils/constants';

export function usePipeline(pipelineData: PipelineData | undefined, selectedRules: SelectedRule[]) {
  const [newPipelineData, setNewPipelineData] = useState(pipelineData);

  useEffect(() => {
    if (!pipelineData) {
      return;
    }

    const updatedPipeline: PipelineData = JSON.parse(JSON.stringify(pipelineData));

    const matchesSelectedRules = (job: Job): boolean => {
      if (job.rules.length === 0) {
        return true;
      }

      if (job.rules.some((rule) => rule.when === NEVER_WHEN)) {
        return false;
      }

      for (const rule of job.rules) {
        if (rule.when === NEVER_WHEN) {
          return false;
        }
        if (rule.type === DEFAULT_TYPE_RULE) {
          return true;
        }

        for (const selectedRule of selectedRules) {
          if (rule.type === IF_TYPE_RULE) {
            if (
              !rule.expression &&
              !rule.value &&
              selectedRule.variable &&
              selectedRule.variable === rule.variable
            ) {
              return true;
            }

            if (
              selectedRule.variable &&
              selectedRule.expression &&
              selectedRule.value &&
              rule.variable === selectedRule.variable &&
              rule.expression === selectedRule.expression &&
              rule.value === selectedRule.value
            ) {
              return true;
            }
          }

          if ((rule.type === CHANGES_TYPE_RULE || rule.type === EXISTS_TYPE_RULE) && rule.value) {
            if (rule.value === selectedRule.value) {
              return true;
            }
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
