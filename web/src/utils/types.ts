export type Rule =
  | {
      type: 'if';
      variable: string;
      expression: string | undefined;
      value: string | undefined;
      when: string;
    }
  | {
      type: 'changes';
      value: string;
      when: string;
    }
  | {
      type: 'exists';
      value: string;
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
    }
  | {
      type: 'error';
      when: string;
    };

export interface SelectedRule {
  type: string;
  variable: string;
  expression: string | undefined;
  value: string | undefined;
  id?: string;
}

export interface Job {
  stage?: string;
  rules: Rule[];
  needs: string[];
  missingNeeds: string[];
  postNeeds: string[];
  extends: string[];
  missingExtends: string[];
  isDisabled: boolean;
  needsErrors: string[];
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
  missingIncludes: string[];
}

export type ViewMode = 'stages' | 'needs';
