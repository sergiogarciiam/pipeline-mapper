import { useEffect, useState } from 'react';
import type { PipelineData, SelectedRule, Job, Rule } from '../utils/types';
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

    const updatedPipeline: PipelineData = structuredClone(pipelineData);

    Object.values(updatedPipeline.jobs).forEach((job) => {
      job.isDisabled = selectedRules.length > 0 ? !matchesSelectedRules(selectedRules, job) : false;
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

function matchesSelectedRules(selectedRules: SelectedRule[], job: Job): boolean {
  if (job.rules.length === 0) {
    return true;
  }

  const neverRules = job.rules.filter((r) => r.when === NEVER_WHEN);
  const normalRules = job.rules.filter((r) => r.when !== NEVER_WHEN);

  // If any “never” rule applies, disable the job
  if (
    neverRules.some(
      (rule) =>
        rule.type === DEFAULT_TYPE_RULE ||
        selectedRules.some((sel) => ruleMatchesSelected(rule, sel)),
    )
  ) {
    return false;
  }

  // If any "normal" rule applies, enable the job
  if (
    normalRules.some(
      (rule) =>
        rule.type === DEFAULT_TYPE_RULE ||
        selectedRules.some((sel) => ruleMatchesSelected(rule, sel)),
    )
  ) {
    return true;
  }

  return false;
}

function ruleMatchesSelected(rule: Rule, selectedRule: SelectedRule): boolean {
  switch (rule.type) {
    case IF_TYPE_RULE: {
      const sameVariable = rule.variable === selectedRule.variable;
      const sameExpression = rule.expression === selectedRule.expression;
      const sameValue = rule.value === selectedRule.value;

      return (
        (sameVariable && !rule.expression && !rule.value) ||
        (sameVariable && sameExpression && sameValue)
      );
    }

    case CHANGES_TYPE_RULE:
    case EXISTS_TYPE_RULE:
      return rule.value === selectedRule.value;

    default:
      return false;
  }
}
