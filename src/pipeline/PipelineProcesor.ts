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
    const noProcessedPipeline = YAML.parse(yamlContent);
    const rootName = path.basename(filePath);
    const initialPipeline = this.extractPipelineData(noProcessedPipeline, rootName);
    const pipelineWithIncludes = await this.resolveIncludes(
      initialPipeline,
      path.dirname(filePath),
    );
    const pipelineWithNeeds = this.resolveNeedsForAllJobs(pipelineWithIncludes);
    const pipelineWithExtends = this.resolveExtendsForAllJobs(pipelineWithNeeds);
    const pipelineWithNeedsGroups = this.resolveNeedsGroups(pipelineWithExtends);
    const finalpipelineWithoutHiddenJobs = this.removeHiddenJobs(pipelineWithNeedsGroups);
    return finalpipelineWithoutHiddenJobs;
  }

  // #region STEP 1: Extract initial pipeline data
  private extractPipelineData(noProcessedPipeline: PipelineData, includePath: string) {
    const stages = noProcessedPipeline.stages || [];
    const needsGroups: number[] = [];
    const hiddenJobs = Object.keys(noProcessedPipeline).filter((k) => k.startsWith('.'));
    const include = noProcessedPipeline.include || [];
    const noExistInclude: string[] = [];
    const jobs: Record<string, Job> = {};

    Object.keys(noProcessedPipeline).forEach((name) => {
      if (this.isJob(name)) {
        const job = this.processJob(name, noProcessedPipeline, includePath);
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
    return !reserved.includes(name);
  }

  private processJob(
    jobName: string,
    noProcessedPipeline: Record<string, any>,
    includePath: string,
    resolvedJobs: Record<string, Job> = {},
  ): Job | null {
    if (resolvedJobs[jobName]) {
      return resolvedJobs[jobName];
    }

    const job = noProcessedPipeline[jobName];
    if (!job || typeof job !== 'object') {
      return null;
    }

    const processedJob: Job = {
      stage: job.stage,
      rules: this.ruleNormalizer.normalize(job.rules),
      needs: job.needs ? [].concat(job.needs) : [],
      noExistNeeds: [],
      extends: job.extends ? [].concat(job.extends) : [],
      noExistExtends: [],
      needGroup: null,
      includePath,
    };

    resolvedJobs[jobName] = processedJob;
    return processedJob;
  }
  // #endregion

  // #region STEP 2: Resolve includes
  private async resolveIncludes(
    initialPipeline: PipelineData,
    baseDir: string,
    visited: Set<string> = new Set(),
  ): Promise<PipelineData> {
    const includes = Array.isArray(initialPipeline.include) ? initialPipeline.include : [];
    let merged = { ...initialPipeline };

    for (const include of includes) {
      let includePath: string | undefined;

      if (typeof include === 'string') {
        includePath = include;
      } else if (include && typeof include === 'object' && include.local) {
        includePath = (include as { local: string }).local;
      } else if (include && typeof include === 'object' && include.file) {
        includePath = include.file;
      }

      if (!includePath) {
        continue;
      }

      const resolved = path.resolve(baseDir, includePath);
      if (visited.has(resolved)) {
        continue;
      }

      visited.add(resolved);

      if (!fs.existsSync(resolved)) {
        merged.noExistInclude.push(include);
        continue;
      }

      const content = fs.readFileSync(resolved, 'utf8');
      const noProcessedPipeline = YAML.parse(content);
      const includedData = this.extractPipelineData(noProcessedPipeline, includePath);
      const expandedInclude = await this.resolveIncludes(
        includedData,
        path.dirname(resolved),
        visited,
      );

      merged = this.mergePipelines(merged, expandedInclude);
    }

    return merged;
  }

  private mergePipelines(base: PipelineData, included: PipelineData): PipelineData {
    return {
      ...base,
      ...included,
      jobs: { ...base.jobs, ...included.jobs },
      stages: [...new Set([...(base.stages || []), ...(included.stages || [])])],
      hiddenJobs: [...new Set([...(base.hiddenJobs || []), ...(included.hiddenJobs || [])])],
      include: [...new Set([...(base.include || []), ...(included.include || [])])],
      noExistInclude: [
        ...new Set([...(base.noExistInclude || []), ...(included.noExistInclude || [])]),
      ],
    };
  }
  // #endregion

  // #region STEP 3: Resolve extends
  private resolveExtendsForAllJobs(pipeline: PipelineData): PipelineData {
    const resolvedJobs: Record<string, Job> = {};

    for (const jobName of Object.keys(pipeline.jobs)) {
      this.resolveJobExtends(jobName, pipeline.jobs, resolvedJobs, []);
    }

    return { ...pipeline, jobs: resolvedJobs };
  }

  private resolveJobExtends(
    jobName: string,
    allJobs: Record<string, Job>,
    resolvedJobs: Record<string, Job>,
    stack: string[],
  ): Job | null {
    if (resolvedJobs[jobName]) return resolvedJobs[jobName];
    const job = allJobs[jobName];
    if (!job) return null;

    if (stack.includes(jobName)) {
      throw new Error(`Cyclic extends detected: ${[...stack, jobName].join(' -> ')}`);
    }

    stack.push(jobName);
    const child: Job = {
      ...job,
      rules: [...job.rules],
      needs: [...job.needs],
      noExistNeeds: [...job.noExistNeeds],
      extends: [...job.extends],
      noExistExtends: [...job.noExistExtends],
    };

    for (let i = child.extends.length - 1; i >= 0; i--) {
      const parentName = child.extends[i];
      const parentJob = this.resolveJobExtends(parentName, allJobs, resolvedJobs, stack);
      if (!parentJob) {
        child.noExistExtends.push(parentName);
        continue;
      }
      this.mergeJobInheritance(child, parentJob);
    }
    stack.pop();
    resolvedJobs[jobName] = child;
    return child;
  }

  private mergeJobInheritance(child: Job, parent: Job): void {
    if (child.rules.length === 0) {
      child.rules = parent.rules;
    }

    if (child.needs.length === 0) {
      child.needs = parent.needs;
      child.noExistNeeds = parent.noExistNeeds;
    }

    if (!child.stage && parent.stage) {
      child.stage = parent.stage;
    }

    child.noExistExtends = [...new Set([...parent.noExistExtends, ...child.noExistExtends])];
  }
  // #endregion

  // #region STEP 4: Resolve needs
  private resolveNeedsForAllJobs(pipeline: PipelineData): PipelineData {
    const resolvedJobs: Record<string, Job> = {};

    for (const jobName of Object.keys(pipeline.jobs)) {
      this.resolveJobNeeds(jobName, pipeline.jobs, resolvedJobs);
    }

    return { ...pipeline, jobs: resolvedJobs };
  }

  private resolveJobNeeds(
    jobName: string,
    allJobs: Record<string, Job>,
    resolvedJobs: Record<string, Job>,
  ): Job | null {
    if (resolvedJobs[jobName]) return resolvedJobs[jobName];
    const job = allJobs[jobName];
    if (!job) return null;

    const { validNeeds, missingNeeds } = this.getValidAndMissingNeeds(job, allJobs);

    const resolvedJob: Job = {
      ...job,
      needs: validNeeds,
      noExistNeeds: missingNeeds,
    };

    resolvedJobs[jobName] = resolvedJob;
    return resolvedJob;
  }

  private getValidAndMissingNeeds(job: Job, allJobs: Record<string, Job>) {
    const valid: string[] = [];
    const missing: string[] = [];

    for (const need of job.needs || []) {
      const name = typeof need === 'string' ? need : (need as { job: string }).job;
      if (!allJobs[name]) missing.push(name);
      else valid.push(name);
    }

    return { validNeeds: valid, missingNeeds: missing };
  }
  // #endregion

  // #region STEP 5: Resolve needs groups
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

  // #region STEP 6: Remove hidden jobs
  private removeHiddenJobs(pipeline: PipelineData): PipelineData {
    const visibleJobs: Record<string, Job> = {};

    for (const [jobName, job] of Object.entries(pipeline.jobs)) {
      if (!pipeline.hiddenJobs.includes(jobName)) {
        visibleJobs[jobName] = job;
      }
    }

    return {
      ...pipeline,
      jobs: visibleJobs,
    };
  }
  // #endregion
}
