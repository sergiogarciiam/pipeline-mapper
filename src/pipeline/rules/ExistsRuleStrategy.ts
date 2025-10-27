import { RuleStrategy } from './RuleStrategy';
import { Rule } from '../../utils/types';
import { DEFAULT_WHEN, EXISTS_TYPE_RULE } from '../../utils/constants';

export class ExistsRuleStrategy implements RuleStrategy {
  supports(rule: any) {
    return !!rule.exists;
  }

  normalize(rule: any): Rule[] {
    const when = rule.when || DEFAULT_WHEN;
    const values = Array.isArray(rule.exists) ? rule.exists : [rule.exists];
    return values.map((value: string) => ({ type: EXISTS_TYPE_RULE, value, when }));
  }
}
