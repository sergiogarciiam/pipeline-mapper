import type { RuleStrategy } from './RuleStrategy';
import type { RawRule, Rule } from '../../utils/types';
import { DEFAULT_TYPE_RULE, DEFAULT_WHEN } from '../../utils/constants';

export class WhenRuleStrategy implements RuleStrategy {
  supports(rule: RawRule) {
    return rule.when !== undefined && rule.if === undefined;
  }

  normalize(rule: RawRule): Rule[] {
    return [{ type: DEFAULT_TYPE_RULE, when: rule.when || DEFAULT_WHEN }];
  }
}
