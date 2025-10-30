import type { RuleStrategy } from './RuleStrategy';
import type { ExistsRawRule, Rule } from '../../utils/types';
import { DEFAULT_WHEN, EXISTS_TYPE_RULE } from '../../utils/constants';

export class ExistsRuleStrategy implements RuleStrategy {
  supports(rule: ExistsRawRule) {
    return !!rule.exists;
  }

  normalize(rule: { when: string; exists: string }): Rule[] {
    const when = rule.when || DEFAULT_WHEN;
    const values = Array.isArray(rule.exists) ? rule.exists : [rule.exists];
    return values.map((value: string) => ({ type: EXISTS_TYPE_RULE, value, when }));
  }
}
