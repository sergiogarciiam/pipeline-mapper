export type Rules =
  | {
      type: 'if';
      value: string;
      when: string;
    }
  | {
      type: 'changes';
      value: string[];
      when: string;
    }
  | {
      type: 'exists';
      value: string[];
      when: string;
    }
  | {
      type: 'unknown';
      value?: null;
      when: string;
    }
  | {
      type: 'default';
      when: string;
    };

export interface SelectedRule {
  type: string;
  variable: string;
  expression: string;
  value: string;
}

export interface Job {
  stage?: string;
  rules: Rules[];
  needs?: string[];
  noExistNeeds?: string[];
  extends?: string[];
  noExistExtends?: string[];
  isDisabled?: boolean;
  needsErrors?: string[];
  includePath: string;
  needGroup: number | null;
}

export interface PipelineData {
  stages: string[];
  needsGroups: number[];
  hiddenJobs?: string[];
  jobs: {
    [jobName: string]: Job;
  };
  include: string[];
  noExistInclude: string[];
}

export type ViewMode = 'stages' | 'needs';
