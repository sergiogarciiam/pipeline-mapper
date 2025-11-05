import { promises as fsPromises } from 'fs';
import * as path from 'path';
import * as YAML from 'yaml';
import type { IncludeItem, Job, PipelineData, RawJob, RawPipeline } from '../utils/types';
import { RuleNormalizer } from './RuleNormalizer';

export class PipelineProcessor {
  private ruleNormalizer = new RuleNormalizer();
  private pipelineStages: string[] = [];

  constructor(
    private baseDir: string,
    private fs = fsPromises,
    private yaml = YAML,
  ) {}

  async process(filePath: string): Promise<PipelineData> {
    const rootName = path.basename(filePath);

    const content = await this.readFile(filePath);
    const raw = this.parseYamlSafe(content, filePath);

    const initial = this.parseInitialPipeline(raw, rootName);

    const withIncludes = await this.resolveIncludes(initial, path.dirname(filePath));
    const withExtends = this.resolveExtendsForAllJobs(withIncludes);
    const withNeeds = this.resolveNeedsForAllJobs(withExtends);
    const withNeedsGroups = this.resolveNeedsGroups(withNeeds);
    const finalPipeline = this.removeHiddenJobs(withNeedsGroups);

    return finalPipeline;
  }

  // #region HELPERS
  private async readFile(filePath: string) {
    return this.fs.readFile(filePath, 'utf8');
  }

  private parseYamlSafe(content: string, filePath = '<unknown>') {
    try {
      return this.yaml.parse(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Error parsing YAML in "${filePath}": ${msg}`);
    }
  }
  // #endregion

  // #region STEP 1: Extract initial pipeline data
  private parseInitialPipeline(rawPipeline: RawPipeline, includePath: string) {
    const stages = rawPipeline.stages || [];
    this.pipelineStages = stages;
    const needsGroups: number[] = [];
    const hiddenJobs = Object.keys(rawPipeline).filter((k) => k.startsWith('.'));
    const include = rawPipeline.include || [];
    const missingIncludes: string[] = [];
    const jobs: Record<string, Job> = {};

    for (const key of Object.keys(rawPipeline || {})) {
      if (!this.isReservedKey(key)) {
        const job = this.buildJobFromRaw(key, rawPipeline, includePath, jobs);
        if (job) {
          jobs[key] = job;
        }
      }
    }

    return { stages, needsGroups, jobs, hiddenJobs, include, missingIncludes };
  }

  private isReservedKey(name: string): boolean {
    const reserved = new Set([
      'stages',
      'variables',
      'include',
      'default',
      'image',
      'services',
      'before_script',
      'after_script',
      'types',
    ]);
    return reserved.has(name);
  }

  private buildJobFromRaw(
    jobName: string,
    rawPipeline: RawPipeline,
    includePath: string,
    resolvedJobs: Record<string, Job> = {},
  ): Job | null {
    if (resolvedJobs[jobName]) {
      return resolvedJobs[jobName];
    }

    const rawJob = rawPipeline[jobName] as RawJob;
    if (!rawJob || typeof rawJob !== 'object') {
      return null;
    }

    const processedJob: Job = {
      stage: rawJob.stage,
      rules: this.ruleNormalizer.normalize(rawJob.rules ?? []),
      needs: rawJob.needs ? ([] as string[]).concat(rawJob.needs) : [],
      missingNeeds: [],
      postNeeds: [],
      extends: rawJob.extends ? ([] as string[]).concat(rawJob.extends) : [],
      missingExtends: [],
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
    stack: Set<string> = new Set(),
  ): Promise<PipelineData> {
    const includes = Array.isArray(initialPipeline.include) ? initialPipeline.include : [];
    let merged = { ...initialPipeline } as PipelineData;

    for (const include of includes) {
      const includePath = this.getIncludePath(include);
      if (!includePath) {
        merged.missingIncludes.push(include);
        continue;
      }

      const resolved = this.resolvePath(baseDir, includePath);

      if (stack.has(resolved)) {
        const cycle = [...stack, resolved].join(' -> ');
        throw new Error(`Cyclic includes detected: ${cycle}`);
      }

      if (visited.has(resolved)) {
        continue;
      }
      stack.add(resolved);
      visited.add(resolved);

      const exists = await this.safeStat(resolved);

      if (!exists) {
        merged.missingIncludes.push(include);
        continue;
      }

      const content = await this.readFile(resolved);
      const raw = this.parseYamlSafe(content, resolved);
      const includedData = this.parseInitialPipeline(raw, includePath);
      const expandedInclude = await this.resolveIncludes(
        includedData,
        path.dirname(resolved),
        visited,
        stack,
      );

      merged = this.mergePipelines(merged, expandedInclude);
      stack.delete(resolved);
    }

    return merged;
  }

  private getIncludePath(include: IncludeItem): string | undefined {
    let localPath: string | undefined;

    if (typeof include === 'string') {
      localPath = include;
    } else if (include && typeof include === 'object') {
      localPath = include.local ?? include.file ?? undefined;
    }

    if (localPath && localPath.match(/^(\.\/|\.\.)/)) {
      return undefined;
    }

    return localPath;
  }

  private resolvePath(baseDir: string, includePath: string) {
    if (includePath.startsWith('/')) {
      return path.resolve(baseDir, `./${includePath}`);
    } else {
      return path.resolve(baseDir, includePath);
    }
  }

  private async safeStat(p: string) {
    try {
      await this.fs.stat(p);
      return true;
    } catch {
      return false;
    }
  }

  private mergePipelines(base: PipelineData, included: PipelineData): PipelineData {
    return {
      ...included,
      ...base,
      jobs: { ...included.jobs, ...base.jobs },
      stages: base.stages?.length ? base.stages : included.stages,
      hiddenJobs: [...new Set([...(base.hiddenJobs || []), ...(included.hiddenJobs || [])])],
      include: [...new Set([...(base.include || []), ...(included.include || [])])],
      missingIncludes: [
        ...new Set([...(base.missingIncludes || []), ...(included.missingIncludes || [])]),
      ],
    } as PipelineData;
  }
  // #endregion

  // #region STEP 3: Resolve extends
  private resolveExtendsForAllJobs(pipeline: PipelineData): PipelineData {
    const resolvedJobs: Record<string, Job> = {};

    for (const jobName of Object.keys(pipeline.jobs)) {
      this.resolveJobExtends(jobName, pipeline.jobs, resolvedJobs, new Set());
    }

    return { ...pipeline, jobs: resolvedJobs };
  }

  private resolveJobExtends(
    jobName: string,
    allJobs: Record<string, Job>,
    resolvedJobs: Record<string, Job>,
    stack: Set<string> = new Set(),
  ): Job | null {
    if (resolvedJobs[jobName]) {
      return resolvedJobs[jobName];
    }
    const job = allJobs[jobName];
    if (!job) {
      return null;
    }

    if (stack.has(jobName)) {
      const cycle = [...stack, jobName].join(' -> ');
      throw new Error(`Cyclic extends detected: ${cycle}`);
    }

    stack.add(jobName);

    const child: Job = {
      ...job,
      rules: [...job.rules],
      needs: [...job.needs],
      missingNeeds: [...job.missingNeeds],
      extends: [...job.extends],
      missingExtends: [...job.missingExtends],
    };

    for (let i = child.extends.length - 1; i >= 0; i--) {
      const parentName = child.extends[i];
      const parentJob = this.resolveJobExtends(parentName, allJobs, resolvedJobs, stack);
      if (!parentJob) {
        child.missingExtends.push(parentName);
        continue;
      }
      this.mergeJobInheritance(child, parentJob);
    }

    stack.delete(jobName);
    resolvedJobs[jobName] = child;
    return child;
  }

  private mergeJobInheritance(child: Job, parent: Job): void {
    if (child.rules.length === 0) {
      child.rules = parent.rules;
    }

    if (child.needs.length === 0) {
      child.needs = parent.needs;
      child.missingNeeds = parent.missingNeeds;
      child.postNeeds = parent.postNeeds;
    }

    if (!child.stage && parent.stage) {
      child.stage = parent.stage;
    }

    child.missingExtends = [...new Set([...parent.missingExtends, ...child.missingExtends])];
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
    pipeline: Record<string, Job>,
    resolvedJobs: Record<string, Job>,
    stack: Set<string> = new Set(),
  ): Job | null {
    if (resolvedJobs[jobName]) {
      return resolvedJobs[jobName];
    }
    const job = pipeline[jobName];
    if (!job) {
      return null;
    }

    if (stack.has(jobName)) {
      const cycle = [...stack, jobName].join(' -> ');
      throw new Error(`Cyclic needs detected: ${cycle}`);
    }

    stack.add(jobName);

    const validNeeds: string[] = [];
    const missingNeeds: string[] = [];
    const postNeeds: string[] = [];

    for (const need of job.needs || []) {
      const needName = typeof need === 'string' ? need : (need as { job: string }).job;
      const neededJob = pipeline[needName];

      if (!neededJob) {
        missingNeeds.push(needName);
        continue;
      }

      const stageIndex = (job.stage ? pipeline[jobName].stage : undefined) as string;
      const neededStageIndex = neededJob.stage;
      if (
        stageIndex !== undefined &&
        neededStageIndex !== undefined &&
        this.getStageOrder(stageIndex) < this.getStageOrder(neededStageIndex)
      ) {
        postNeeds.push(needName);
        continue;
      }

      this.resolveJobNeeds(needName, pipeline, resolvedJobs, stack);
      validNeeds.push(needName);
    }

    const resolvedJob: Job = {
      ...job,
      needs: validNeeds,
      missingNeeds: missingNeeds,
      postNeeds: postNeeds,
    };

    resolvedJobs[jobName] = resolvedJob;
    return resolvedJob;
  }

  private getStageOrder(stageName: string): number {
    return this.pipelineStages.indexOf(stageName) ?? 0;
  }
  // #endregion

  // #region STEP 5: Resolve needs groups
  private resolveNeedsGroups(piplineData: PipelineData): PipelineData {
    const [resolvedJobsWithGroups, numberNeedsGroups] = this.calculateJobDependencyLevels(
      piplineData.jobs,
    );
    const needsGroups = Array.from({ length: numberNeedsGroups + 1 }, (_, i) => i);

    return {
      ...piplineData,
      needsGroups,
      jobs: resolvedJobsWithGroups,
    };
  }

  private calculateJobDependencyLevels(jobs: Record<string, Job>): [Record<string, Job>, number] {
    const inDegree: Record<string, number> = {};
    const graph: Record<string, string[]> = {};

    for (const [name, job] of Object.entries(jobs)) {
      const deps = (job.needs || []).filter((n) => jobs[n]);
      graph[name] = deps;
      inDegree[name] = deps.length;
    }

    const queue = Object.keys(jobs).filter((n) => inDegree[n] === 0);
    const group: Record<string, number> = {};
    let maxGroup = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentGroup = group[current] ?? 0;

      for (const [name, job] of Object.entries(jobs)) {
        if (job.needs?.includes(current)) {
          group[name] = Math.max(group[name] ?? 0, currentGroup + 1);
          inDegree[name]--;
          if (inDegree[name] === 0) {
            queue.push(name);
          }
          maxGroup = Math.max(maxGroup, group[name]);
        }
      }
    }

    for (const [n, job] of Object.entries(jobs)) {
      job.needGroup = group[n] ?? 0;
    }

    return [jobs, maxGroup];
  }
  // #endregion

  // #region STEP 6: Remove hidden jobs
  private removeHiddenJobs(pipeline: PipelineData): PipelineData {
    const visibleJobs = Object.fromEntries(
      Object.entries(pipeline.jobs).filter(([name]) => !pipeline.hiddenJobs.includes(name)),
    );

    return {
      ...pipeline,
      jobs: visibleJobs,
    };
  }
  // #endregion
}
