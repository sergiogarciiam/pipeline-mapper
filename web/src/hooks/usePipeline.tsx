import { useEffect, useState } from 'react';
import type { PipelineData, SelectedRule, Job } from '../utils/types';
import {
  CHANGES_RULE_TYPE,
  DEFAULT_RULE_TYPE,
  EXISTS_RULE_TYPE,
  IF_RULE_TYPE,
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

      for (const selectedRule of selectedRules) {
        for (const rule of job.rules) {
          if (rule.when === NEVER_WHEN) {
            return false;
          }
          if (rule.type === DEFAULT_RULE_TYPE) {
            return true;
          } else if (rule.type === IF_RULE_TYPE) {
            const expectedValue = `${selectedRule.variable} ${selectedRule.expression} ${selectedRule.value}`;
            if (rule.value === expectedValue) {
              return true;
            }
          } else if (
            (rule.type === EXISTS_RULE_TYPE || rule.type === CHANGES_RULE_TYPE) &&
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
