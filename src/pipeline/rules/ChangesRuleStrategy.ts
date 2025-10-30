import type { RuleStrategy } from './RuleStrategy';
import type { ChangesRawRule, Rule } from '../../utils/types';
import { CHANGES_TYPE_RULE, DEFAULT_WHEN } from '../../utils/constants';

export class ChangesRuleStrategy implements RuleStrategy {
  supports(rule: ChangesRawRule) {
    return !!rule.changes;
  }

  normalize(rule: ChangesRawRule): Rule[] {
    const when = rule.when || DEFAULT_WHEN;
    const values = Array.isArray(rule.changes) ? rule.changes : [rule.changes];
    return values.map((value: string) => ({ type: CHANGES_TYPE_RULE, value, when }));
  }
}
