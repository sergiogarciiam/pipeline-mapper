export const RULES = ['if', 'changes', 'exists'];

export const VARIABLES = ['$CI_COMMIT_BRANCH', '$CI_PIPELINE_SOURCE', '$CI_COMMIT_TAG'];

export const EXPRESSIONS = ['==', '!=', '=~', '!~', '>', '<', '>=', '<='];

export const DEFAULT_RULE = {
  type: 'if',
  variable: '$CI_COMMIT_BRANCH',
  expression: '==',
  value: '',
};

export const STAGES_VAR = 'stages';
export const NEEDS_VAR = 'needs';
