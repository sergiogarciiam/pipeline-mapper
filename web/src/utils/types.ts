export interface Rules {
  type?: string;
  value?: string;
  when?: string;
}

export interface SelectedRule {
  type: string;
  variable: string;
  expression: string;
  value: string;
}

export interface Job {
  stage?: string;
  rules?: Rules[];
  needs?: string[];
  noExistNeeds?: string[];
  extends?: string[];
  noExistExtends?: string[];
  undefined?: boolean;
}

export interface PipelineData {
  stages: string[];
  hiddenJobs?: string[];
  jobs: {
    [jobName: string]: Job;
  };
}
