import type { PipelineData } from "./types";

export const EXAMPLE: PipelineData = {
  stages: ["setup", "lint", "build", "test", "deploy", "monitor", "cleanup"],
  jobs: {
    setup: {
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
        extends: [".setup_template"],
        extendsUndefined: [],
      },
    },
    lint: {
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
        extends: [".templates"],
        extendsUndefined: [],
      },
    },
    build: {
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
        extends: [],
        extendsUndefined: [],
      },
      variable_job: {
        stage: "build",
        rules: [],
        needs: [],
        extends: [],
        extendsUndefined: [],
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
        extends: [],
        extendsUndefined: [],
      },
      noExtendsExist: {
        stage: "build",
        rules: [],
        needs: [],
        extends: [".templates"],
        extendsUndefined: [".non_existent_template"],
      },
    },
    test: {
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
        extends: [],
        extendsUndefined: [],
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
        extends: [],
        extendsUndefined: [],
      },
      smoke_tests: {
        stage: "test",
        rules: [],
        needs: ["integration_tests"],
        extends: [],
        extendsUndefined: [],
      },
    },
    deploy: {
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
        extends: [],
        extendsUndefined: [],
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
        extends: [],
        extendsUndefined: [],
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
        extends: [],
        extendsUndefined: [],
      },
    },
    monitor: {
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
        extends: [],
        extendsUndefined: [],
      },
    },
    cleanup: {
      cleanup: {
        stage: "cleanup",
        rules: [],
        needs: [],
        extends: [],
        extendsUndefined: [],
      },
    },
    none: {
      build_app: {
        rules: [
          {
            type: "unknown",
            when: "delayed",
          },
        ],
        needs: ["install"],
        extends: [".build_template"],
        extendsUndefined: [],
      },
      build_docs: {
        rules: [
          {
            type: "unknown",
            when: "delayed",
          },
        ],
        needs: ["install"],
        extends: [".build_template"],
        extendsUndefined: [],
      },
      orphan_job: {
        rules: [],
        needs: [],
        extends: [],
        extendsUndefined: [],
      },
    },
    undefined: {
      ghost_job: {
        stage: "ghost",
        rules: [],
        needs: [],
        extends: [],
        extendsUndefined: [],
      },
    },
  },
  hiddenJobs: [
    ".templates",
    ".base_rules",
    ".build_template",
    ".setup_template",
  ],
};
