export interface Rules {
  if?: string;
  changes?: string[];
  when?: string;
}

export interface Job {
  stage?: string;
  image?: string;
  needs?: string[];
  script?: string[];
  artifacts?: {
    paths?: string[];
    expire_in?: string;
    reports?: {
      junit?: string;
      coverage_report?: {
        coverage_format: string;
        path: string;
      };
    };
  };
  cache?: {
    paths: string[];
  };
  coverage?: string;
  allow_failure?: boolean;
  only?: string[];
  environment?: {
    name: string;
  };
  when?: string;
  rules?: Rules[];
  tags?: string[];
  before_script?: string[];
  after_script?: string[];
  extends?: string | string[];
  disabled?: boolean;
}

export interface PipelineData {
  variables?: Record<string, string>;
  stages: string[];
  [key: string]: Job | string[] | Record<string, string> | undefined;
}
