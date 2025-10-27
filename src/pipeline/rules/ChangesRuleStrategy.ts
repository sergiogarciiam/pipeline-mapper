import { RuleStrategy } from './RuleStrategy';
import { Rule } from '../../utils/types';
import { CHANGES_TYPE_RULE, DEFAULT_WHEN } from '../../utils/constants';

export class ChangesRuleStrategy implements RuleStrategy {
  supports(rule: any) {
    return !!rule.changes;
  }

  normalize(rule: any): Rule[] {
    const when = rule.when || DEFAULT_WHEN;
    const values = Array.isArray(rule.changes) ? rule.changes : [rule.changes];
    return values.map((value: string) => ({ type: CHANGES_TYPE_RULE, value, when }));
  }
}
