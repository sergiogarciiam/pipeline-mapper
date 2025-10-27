import * as fs from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import { Job, PipelineData } from '../utils/types';
import { RuleNormalizer } from './RuleNormalizer';

export class PipelineProcessor {
  private ruleNormalizer = new RuleNormalizer();

  constructor(private baseDir: string) {}

  async process(filePath: string): Promise<PipelineData> {
    const yamlContent = fs.readFileSync(filePath, 'utf8');
    const parsed = YAML.parse(yamlContent);
    const rootName = path.basename(filePath);
    const rootFileData = this.extractPipelineData(parsed, rootName);
    const dataWithIncludes = await this.resolveIncludes(rootFileData, path.dirname(filePath));
    const dataWithNeedsGroups = this.resolveNeedsGroups(dataWithIncludes);
    return dataWithNeedsGroups;
  }

  // #region STEP 1: Extract initial pipeline data
  private extractPipelineData(data: PipelineData, includePath: string) {
    const stages = data.stages || [];
    const needsGroups: number[] = [];
    const hiddenJobs = Object.keys(data).filter((k) => k.startsWith('.'));
    const include = data.include || [];
    const noExistInclude: string[] = [];
    const jobs: Record<string, Job> = {};

    Object.keys(data).forEach((name) => {
      if (this.isJob(name)) {
        const job = this.processJob(name, data, includePath);
        if (job) {
          jobs[name] = job;
        }
      }
    });

    return { stages, needsGroups, jobs, hiddenJobs, include, noExistInclude };
  }

  private isJob(name: string): boolean {
    const reserved = [
      'stages',
      'variables',
      'include',
      'default',
      'image',
      'services',
      'before_script',
      'after_script',
      'types',
    ];
    return !reserved.includes(name) && !name.startsWith('.');
  }

  private processJob(
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

    const { validNeeds, missingNeeds } = this.getValidAndMissingNeeds(job, data);

    const processed: Job = {
      stage: job.stage,
      rules: this.ruleNormalizer.normalize(job.rules),
      needs: validNeeds,
      noExistNeeds: missingNeeds,
      extends: job.extends ? [].concat(job.extends) : [],
      noExistExtends: [],
      needGroup: null,
      includePath,
    };

    if (job.extends) {
      this.resolveExtendsHierarchy(processed, data, includePath, resolvedJobs, stack);
    }

    resolvedJobs[jobName] = processed;
    return processed;
  }

  private getValidAndMissingNeeds(job: any, data: any) {
    const valid: string[] = [];
    const missing: string[] = [];

    for (const need of job.needs || []) {
      const name = typeof need === 'string' ? need : need.job;
      if (!data[name]) missing.push(name);
      else valid.push(name);
    }

    return { validNeeds: valid, missingNeeds: missing };
  }

  private resolveExtendsHierarchy(
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
      const parentJob = this.processJob(parent, data, includePath, resolvedJobs, stack);

      if (!parentJob) {
        processed.noExistExtends.push(parent);
        stack.pop();
        continue;
      }

      validParents.push(parent);
      this.mergeJobInheritance(processed, parentJob);
      stack.pop();
    }

    processed.extends = [...new Set(validParents)];
  }

  private mergeJobInheritance(child: Job, parent: Job): void {
    const parentRules = Array.isArray(parent.rules)
      ? parent.rules
      : this.ruleNormalizer.normalize(parent.rules);

    child.rules = [...parentRules, ...child.rules];
    child.needs = [...new Set([...parent.needs, ...child.needs])];
    child.noExistNeeds = [...new Set([...parent.noExistNeeds, ...child.noExistNeeds])];
    child.noExistExtends = [...new Set([...parent.noExistExtends, ...child.noExistExtends])];
  }
  // #endregion

  // #region STEP 2: Resolve includes
  private async resolveIncludes(
    data: PipelineData,
    baseDir: string,
    visited: Set<string> = new Set(),
  ): Promise<PipelineData> {
    const includes = Array.isArray(data.include) ? data.include : [];
    let merged = { ...data };

    for (const include of includes) {
      const resolved = path.resolve(baseDir, include);
      if (visited.has(resolved)) {
        continue;
      }

      visited.add(resolved);

      if (!fs.existsSync(resolved)) {
        merged.noExistInclude.push(include);
        continue;
      }

      const content = fs.readFileSync(resolved, 'utf8');
      const parsed = YAML.parse(content);
      const includedData = this.extractPipelineData(parsed, include);
      const recursive = await this.resolveIncludes(includedData, path.dirname(resolved), visited);

      merged = this.mergePipelines(merged, recursive);
    }

    return merged;
  }

  private mergePipelines(a: PipelineData, b: PipelineData): PipelineData {
    return {
      ...a,
      ...b,
      jobs: { ...b.jobs, ...a.jobs },
      stages: [...new Set([...(a.stages || []), ...(b.stages || [])])],
      hiddenJobs: [...new Set([...(a.hiddenJobs || []), ...(b.hiddenJobs || [])])],
      include: [...new Set([...(a.include || []), ...(b.include || [])])],
      noExistInclude: [...new Set([...(a.noExistInclude || []), ...(b.noExistInclude || [])])],
    };
  }
  // #endregion

  // #region STEP 3: Resolve needs groups
  private resolveNeedsGroups(piplineData: PipelineData): PipelineData {
    const [resolvedJobsWithGroups, numberNeedsGroups] = this.assignNeedGroupsToJobs(
      piplineData.jobs,
    );
    const needsGroups = Array.from({ length: numberNeedsGroups + 1 }, (_, i) => i);

    return {
      ...piplineData,
      needsGroups,
      jobs: resolvedJobsWithGroups,
    };
  }

  private assignNeedGroupsToJobs(resolvedJobs: Record<string, Job>): [Record<string, Job>, number] {
    const jobs = Object.entries(resolvedJobs);
    const jobGroups: Record<string, number> = {};
    let depGroups: number[] = [];

    for (const [jobName, job] of jobs) {
      if (!job.needs || job.needs.length === 0) {
        jobGroups[jobName] = 0;
      }
    }

    let updated = true;
    while (updated) {
      updated = false;

      for (const [jobName, job] of jobs) {
        if (jobGroups[jobName] !== undefined) continue;

        const dependencies = job.needs?.filter((n) => resolvedJobs[n]);
        if (!dependencies || dependencies.length === 0) {
          jobGroups[jobName] = 0;
          updated = true;
          continue;
        }

        depGroups = dependencies.map((n) => jobGroups[n]).filter((g) => g !== undefined);

        if (depGroups.length === dependencies.length) {
          jobGroups[jobName] = Math.max(...depGroups) + 1;
          updated = true;
        }
      }
    }

    for (const [jobName, job] of jobs) {
      job.needGroup = jobGroups[jobName] ?? 0;
    }

    const numberNeedsGroups = Math.max(...Object.values(jobGroups));

    return [resolvedJobs, numberNeedsGroups];
  }
  // #endregion
}
