export interface Rule {
  type: 'if' | 'exists' | 'changes' | 'unknown' | 'default';
  value?: any;
  when: string;
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
  noExistNeeds: string[];
  extends: string[];
  noExistExtends: string[];
  includePath: string;
  needGroup: number | null;
}

export interface PipelineData {
  stages: string[];
  needsGroups: number[];
  jobs: Record<string, Job>;
  hiddenJobs: string[];
  include: IncludeItem[];
  noExistInclude: IncludeItem[];
}
