import type { RuleStrategy } from './RuleStrategy';
import type { IfRawRule, Rule } from '../../utils/types';
import { DEFAULT_WHEN, IF_TYPE_RULE, UNKNOWN_TYPE_RULE } from '../../utils/constants';

export class IfRuleStrategy implements RuleStrategy {
  supports(rule: IfRawRule) {
    return typeof rule.if === 'string';
  }

  normalize(rule: IfRawRule): Rule[] {
    const when = rule.when || DEFAULT_WHEN;
    if (rule.if.includes('&&') || rule.if.includes('(')) {
      return [{ type: UNKNOWN_TYPE_RULE, when }];
    }
    return rule.if.split('||').map((c: string) => ({
      type: IF_TYPE_RULE,
      value: c.trim(),
      when,
    }));
  }
}
