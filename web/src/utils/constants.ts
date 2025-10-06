import type { PipelineData } from "./types";

export const EXAMPLE: PipelineData = {
  stages: ["setup", "lint", "build", "test", "deploy", "monitor", "cleanup"],
  jobs: {
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
    },
    build_app: {
      rules: [
        {
          type: "unknown",
          when: "delayed",
        },
      ],
      needs: ["install"],
      noExistNeeds: [],
      extends: [".build_template"],
      noExistExtends: [],
    },
    build_docs: {
      rules: [
        {
          type: "unknown",
          when: "delayed",
        },
      ],
      needs: ["install"],
      noExistNeeds: [],
      extends: [".build_template"],
      noExistExtends: [],
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
    },
    unit_tests: {
      stage: "test",
      rules: [
        {
          type: "if",
          value: '$CI_PIPELINE_SOURCE == "push"',
          when: "manual",
        },
      ],
      needs: ["build_app", "lint"],
      noExistNeeds: ["nop"],
      extends: [],
      noExistExtends: [],
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
    },
    smoke_tests: {
      stage: "test",
      rules: [],
      needs: ["integration_tests"],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
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
    },
    cleanup: {
      stage: "cleanup",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
    },
    orphan_job: {
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
    },
    ghost_job: {
      stage: "ghost",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
    },
    variable_job: {
      stage: "build",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [],
      noExistExtends: [],
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
    },
    noExtendsExist: {
      stage: "build",
      rules: [],
      needs: [],
      noExistNeeds: [],
      extends: [".templates"],
      noExistExtends: [".non_existent_template"],
    },
  },
  hiddenJobs: [
    ".templates",
    ".base_rules",
    ".build_template",
    ".setup_template",
  ],
};
