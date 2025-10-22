import { Job, Rule } from '../utils/types';

export function processJob(
  jobName: string,
  data: Record<string, any>,
  includePath: string,
  resolvedJobs: Record<string, Job> = {},
  stack: string[] = [],
): Job | null {
  if (resolvedJobs[jobName]) {
    return resolvedJobs[jobName];
  }

  const job = data[jobName];
  if (!job || typeof job !== 'object') {
    return null;
  }

  const { validNeeds, missingNeeds } = analyzeNeeds(job, data);

  const processed: Job = {
    stage: job.stage,
    rules: normalizeRules(job.rules),
    needs: validNeeds,
    noExistNeeds: missingNeeds,
    extends: normalizeExtends(job.extends),
    noExistExtends: [],
    includePath,
  };

  if (job.extends) {
    resolveExtendsHierarchy(processed, data, includePath, resolvedJobs, stack);
  }

  resolvedJobs[jobName] = processed;
  return processed;
}

export function analyzeNeeds(
  job: any,
  data: Record<string, any>,
): { validNeeds: string[]; missingNeeds: string[] } {
  const validNeeds: string[] = [];
  const missingNeeds: string[] = [];

  for (const need of job.needs || []) {
    const needName = typeof need === 'string' ? need : need.job;
    if (!needName) {
      continue;
    }
    if (!data[needName]) {
      missingNeeds.push(needName);
    } else {
      validNeeds.push(needName);
    }
  }

  return {
    validNeeds: [...new Set(validNeeds)],
    missingNeeds: [...new Set(missingNeeds)],
  };
}

export function normalizeRules(rules: any[]): Rule[] {
  if (!rules) {
    return [];
  }

  const normalized: Rule[] = [];

  rules.forEach((rule) => {
    const when = rule.when || 'on_success';

    if (typeof rule.if === 'string') {
      if (rule.if.includes('&&') || rule.if.includes('(') || rule.if.includes(')')) {
        normalized.push({ type: 'unknown', when });
      } else {
        const conditions = rule.if.split('||').map((c: string) => c.trim());
        conditions.forEach((condition: string) => {
          normalized.push({ type: 'if', value: condition, when });
        });
      }
    } else if (rule.exists) {
      const values = Array.isArray(rule.exists) ? rule.exists : [rule.exists];
      values.forEach((value: string) => normalized.push({ type: 'exists', value, when }));
    } else if (rule.changes) {
      const values = Array.isArray(rule.changes) ? rule.changes : [rule.changes];
      values.forEach((value: string) => normalized.push({ type: 'changes', value, when }));
    } else {
      normalized.push({ type: 'unknown', when });
    }
  });

  return normalized;
}

export function normalizeExtends(extendsField: any): string[] {
  if (!extendsField) {
    return [];
  }

  return Array.isArray(extendsField) ? extendsField : [extendsField];
}

export function resolveExtendsHierarchy(
  processed: Job,
  data: Record<string, any>,
  includePath: string,
  resolvedJobs: Record<string, Job>,
  stack: string[],
) {
  const parents = Array.isArray(processed.extends) ? processed.extends : [processed.extends];
  const validParents: string[] = [];

  for (const parent of parents) {
    if (stack.includes(parent)) {
      throw new Error(`Cyclic extends detected: ${stack.join(' -> ')} -> ${parent}`);
    }

    stack.push(parent);
    const parentJob = processJob(parent, data, includePath, resolvedJobs, stack);

    if (!parentJob) {
      processed.noExistExtends.push(parent);
      stack.pop();
      continue;
    }

    validParents.push(parent);
    mergeJobInheritance(processed, parentJob);
    stack.pop();
  }

  processed.extends = [...new Set(validParents)];
}

export function mergeJobInheritance(child: Job, parent: Job): void {
  const parentRules = Array.isArray(parent.rules) ? parent.rules : normalizeRules(parent.rules);

  child.rules = [...parentRules, ...child.rules];
  child.needs = [...new Set([...parent.needs, ...child.needs])];
  child.noExistNeeds = [...new Set([...parent.noExistNeeds, ...child.noExistNeeds])];
  child.noExistExtends = [...new Set([...parent.noExistExtends, ...child.noExistExtends])];
}
