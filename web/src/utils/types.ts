export interface Rules {
  type?: string;
  value?: string;
  when?: string;
}

export interface Job {
  stage?: string;
  rules?: Rules[];
  needs?: string[];
  extends?: string[];
  extendsUndefined?: string[];
}

export interface PipelineData {
  stages: string[];
  hiddenJobs?: string[];
  jobs: {
    [stage: string]: {
      [jobName: string]: Job;
    };
  };
}
