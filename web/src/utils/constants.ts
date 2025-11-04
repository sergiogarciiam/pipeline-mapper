export const DEFAULT_TYPE_RULE = 'default';
export const IF_TYPE_RULE = 'if';
export const CHANGES_TYPE_RULE = 'changes';
export const EXISTS_TYPE_RULE = 'exists';
export const ERROR_IF_TYPE_RULE = 'error';

export const RULES_TYPES = [IF_TYPE_RULE, CHANGES_TYPE_RULE, EXISTS_TYPE_RULE];
export const IF_RULES_VARIABLES = [
  '$CI_COMMIT_BRANCH',
  '$CI_COMMIT_TAG',
  '$CI_PIPELINE_SOURCE',
  '$CI_JOB_NAME',
  '$CI_JOB_STAGE',
  '$CI_PROJECT_NAME',
  '$CI_PROJECT_PATH',
  '$CI_PROJECT_NAMESPACE',
  '$CI_PIPELINE_ID',
  '$CI_PIPELINE_IID',
  '$CI_COMMIT_SHA',
  '$CI_COMMIT_SHORT_SHA',
  '$CI_COMMIT_MESSAGE',
  '$CI_MERGE_REQUEST_ID',
  '$CI_MERGE_REQUEST_IID',
  '$CI_MERGE_REQUEST_SOURCE_BRANCH_NAME',
  '$CI_MERGE_REQUEST_TARGET_BRANCH_NAME',
];
export const RULES_EXPRESSIONS = ['==', '!=', '=~', '!~', '>', '<', '>=', '<='];

export const NEVER_WHEN = 'never';

export const DEFAULT_RULE = {
  type: RULES_TYPES[0],
  variable: IF_RULES_VARIABLES[0],
  expression: RULES_EXPRESSIONS[0],
  value: '',
};

export const STAGES_VAR = 'stages';
export const NEEDS_VAR = 'needs';

export const NO_STAGE_DEFINED_COLUMN = 'No stage';
