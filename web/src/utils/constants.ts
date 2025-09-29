export const EXAMPLE = {
  variables: {
    APP_VERSION: "1.0.0",
    NODE_VERSION: "16",
  },
  stages: ["prepare", "build", "test", "quality", "deploy"],
  install_dependencies: {
    stage: "prepare",
    image: "node:${NODE_VERSION}",
    cache: {
      paths: ["node_modules/"],
    },
    script: ["npm install"],
    artifacts: {
      paths: ["node_modules/"],
    },
  },
  build_app: {
    stage: "build",
    image: "node:${NODE_VERSION}",
    needs: ["install_dependencies"],
    script: ["npm run build"],
    artifacts: {
      paths: ["dist/"],
      expire_in: "1 week",
    },
  },
  unit_tests: {
    stage: "test",
    image: "node:${NODE_VERSION}",
    needs: ["build_app"],
    script: ["npm run test:unit"],
    coverage: "/Coverage: \\d+\\.\\d+%/",
    artifacts: {
      reports: {
        junit: "test-results.xml",
        coverage_report: {
          coverage_format: "cobertura",
          path: "coverage/cobertura-coverage.xml",
        },
      },
    },
  },
  integration_tests: {
    stage: "test",
    image: "node:${NODE_VERSION}",
    needs: ["build_app"],
    script: ["npm run test:integration"],
    allow_failure: true,
  },
  code_quality: {
    stage: "quality",
    image: "sonarsource/sonar-scanner-cli",
    needs: ["unit_tests"],
    script: ["sonar-scanner"],
    only: ["main", "develop"],
  },
  deploy_staging: {
    stage: "deploy",
    image: "alpine",
    needs: ["unit_tests", "integration_tests", "code_quality"],
    script: ['echo "Deploying to staging..."', "./deploy.sh staging"],
    environment: {
      name: "staging",
    },
    only: ["develop"],
  },
  deploy_production: {
    stage: "deploy",
    image: "alpine",
    needs: ["unit_tests", "integration_tests", "code_quality"],
    script: ['echo "Deploying to production..."', "./deploy.sh production"],
    environment: {
      name: "production",
    },
    when: "manual",
    only: ["main"],
    rules: [
      {
        if: "$CI_COMMIT_TAG =~ /^v\\d+\\.\\d+\\.\\d+$/",
      },
    ],
  },
  ".base_job": {
    tags: ["docker"],
    before_script: ['echo "Preparing environment..."'],
    after_script: ['echo "Cleaning up..."'],
  },
  custom_job: {
    extends: ".base_job",
    stage: "build",
    script: ['echo "Running custom job"'],
  },
};
