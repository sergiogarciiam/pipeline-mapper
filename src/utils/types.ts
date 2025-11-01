export interface Rule {
  type: 'if' | 'exists' | 'changes' | 'unknown' | 'default';
  value?: string;
  when: string;
}

export interface RawRule {
  if?: string;
  exists?: string | string[];
  changes?: string | string[];
  when?: string;
}

export interface IfRawRule {
  if: string;
  when?: string;
}

export interface ExistsRawRule {
  exists: string | string[];
  when?: string;
}

export interface ChangesRawRule {
  changes: string | string[];
  when?: string;
}

export type IncludeItem =
  | string
  | {
      local?: string;
      file?: string;
    };

export interface Job {
  stage?: string;
  rules: Rule[];
  needs: string[];
  missingNeeds: string[];
  postNeeds: string[];
  extends: string[];
  missingExtends: string[];
  includePath: string;
  needGroup: number | null;
}

export interface PipelineData {
  stages: string[];
  needsGroups: number[];
  jobs: Record<string, Job>;
  hiddenJobs: string[];
  include: IncludeItem[];
  missingIncludes: IncludeItem[];
}
