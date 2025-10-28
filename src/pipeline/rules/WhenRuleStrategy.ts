import { RuleStrategy } from './RuleStrategy';
import { Rule } from '../../utils/types';
import { DEFAULT_TYPE_RULE, DEFAULT_WHEN } from '../../utils/constants';

export class WhenRuleStrategy implements RuleStrategy {
  supports(rule: any) {
    return rule.when !== undefined && rule.if === undefined;
  }

  normalize(rule: any): Rule[] {
    return [{ type: DEFAULT_TYPE_RULE, when: rule.when || DEFAULT_WHEN }];
  }
}
