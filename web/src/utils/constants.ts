export const DEFAULT_RULE_TYPE = 'default';
export const IF_RULE_TYPE = 'if';
export const CHANGES_RULE_TYPE = 'changes';
export const EXISTS_RULE_TYPE = 'exists';

export const RULES = [IF_RULE_TYPE, CHANGES_RULE_TYPE, EXISTS_RULE_TYPE];
export const VARIABLES = ['$CI_COMMIT_BRANCH', '$CI_PIPELINE_SOURCE', '$CI_COMMIT_TAG'];
export const EXPRESSIONS = ['==', '!=', '=~', '!~', '>', '<', '>=', '<='];

export const NEVER_WHEN = 'never';

export const DEFAULT_RULE = {
  type: RULES[0],
  variable: VARIABLES[0],
  expression: EXPRESSIONS[0],
  value: '',
};

export const STAGES_VAR = 'stages';
export const NEEDS_VAR = 'needs';

export const NO_STAGE_DEFINED_COLUMN = 'No stage';
