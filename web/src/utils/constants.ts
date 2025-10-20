import type { PipelineData } from "./types";

export const EXAMPLE: PipelineData = {
  stages: ["setup", "lint", "build", "test", "deploy", "monitor", "cleanup"],
  jobs: {
    generate_docs: {
      stage: "build",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "main"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "./example2.yml",
    },
    code_quality: {
      stage: "lint",
      rules: [
        {
          type: "if",
          value: "$CI_COMMIT_BRANCH =~ /^release\\//",
          when: "manual",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "./example2.yml",
    },
    cleanup_temp: {
      stage: "cleanup",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "./example2.yml",
    },
    setup_db: {
      stage: "setup",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "develop"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "./example1.yml",
    },
    seed_data: {
      stage: "setup",
      rules: [
        {
          type: "if",
          value: "$CI_COMMIT_BRANCH =~ /^feature\\//",
          when: "manual",
        },
      ],
      needs: ["setup_db"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "./example1.yml",
    },
    install: {
      stage: "setup",
      rules: [
        {
          type: "if",
          value: '$CI_PIPELINE_SOURCE == "merge_request_event"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [".setup_template"],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    lint: {
      stage: "lint",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "develop"',
          when: "delayed",
        },
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "main"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [".templates"],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    build_app: {
      rules: [
        {
          type: "unknown",
          when: "delayed",
        },
      ],
      needs: ["install"],
      noExistNeeds: ["abc"],
      extends: [".build_template"],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    build_docs: {
      rules: [
        {
          type: "unknown",
          when: "delayed",
        },
      ],
      needs: ["install"],
      noExistNeeds: ["abc"],
      extends: [".build_template"],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    build_docker: {
      stage: "build",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "main"',
          when: "on_success",
        },
      ],
      needs: ["build_app"],
      noExistNeeds: ["noNeed"],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    unit_tests: {
      stage: "test",
      rules: [
        {
          type: "if",
          value: '$CI_PIPELINE_SOURCE == "push"',
          when: "manual",
        },
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "develop"',
          when: "manual",
        },
      ],
      needs: ["build_app", "lint"],
      noExistNeeds: ["nop"],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    integration_tests: {
      stage: "test",
      rules: [
        {
          type: "if",
          value: "$CI_COMMIT_BRANCH =~ /^feature\\//",
          when: "delayed",
        },
      ],
      needs: ["build_docker"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    smoke_tests: {
      stage: "test",
      rules: [
        {
          type: "changes",
          value: ["src/frontend/**/*", "package.json", "package-lock.json"],
          when: "on_success",
        },
      ],
      needs: ["integration_tests"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    deploy_staging: {
      stage: "deploy",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "develop"',
          when: "on_success",
        },
      ],
      needs: ["smoke_tests"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    deploy_prod: {
      stage: "deploy",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "main"',
          when: "always",
        },
        {
          type: "if",
          value: "$CI_COMMIT_TAG",
          when: "manual",
        },
      ],
      needs: ["smoke_tests"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    deploy_hotfix: {
      stage: "deploy",
      rules: [
        {
          type: "if",
          value: "$CI_COMMIT_BRANCH =~ /^hotfix\\//",
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    monitoring: {
      stage: "monitor",
      rules: [
        {
          type: "if",
          value: '$CI_PIPELINE_SOURCE == "schedule"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    cleanup: {
      stage: "cleanup",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    orphan_job: {
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    ghost_job: {
      stage: "ghost",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    variable_job: {
      stage: "build",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    matrix_build: {
      stage: "build",
      rules: [
        {
          type: "if",
          value: '$CI_COMMIT_BRANCH == "main"',
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
    noExtendsExist: {
      stage: "build",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [".templates"],
      noExistExtends: [".non_existent_template"],
      includePath: "test.gitlab.yml",
    },
    noRule: {
      stage: "build",
      rules: [
        {
          type: "unknown",
          when: "always",
        },
      ],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
      includePath: "test.gitlab.yml",
    },
  },
  hiddenJobs: [
    ".templates",
    ".base_rules",
    ".build_template",
    ".setup_template",
  ],
  include: ["./example1.yml", "./example2.yml", "./noExist.yml"],
  noExistInclude: ["./noExist.yml"],
};
