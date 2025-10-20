export interface Rule {
  type: "if" | "exists" | "changes" | "unknown";
  value?: any;
  when: string;
}

export interface Job {
  stage?: string;
  rules: Rule[];
  needs: string[];
  noExistNeeds: string[];
  extends: string[];
  noExistExtends: string[];
  includePath: string;
}

export interface PipelineData {
  stages: string[];
  jobs: Record<string, Job>;
  hiddenJobs: string[];
  include: string[];
  noExistInclude: string[];
}
