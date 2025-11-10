import type { RuleStrategy } from './RuleStrategy';
import type { IfRawRule, Rule } from '../../utils/types';
import {
  DEFAULT_WHEN,
  ERROR_IF_TYPE_RULE,
  IF_TYPE_RULE,
  UNKNOWN_TYPE_RULE,
} from '../../utils/constants';

export class IfRuleStrategy implements RuleStrategy {
  supports(rule: IfRawRule) {
    return typeof rule.if === 'string';
  }

  normalize(rule: IfRawRule): Rule[] {
    const when = rule.when || DEFAULT_WHEN;

    if (rule.if.includes('&&') || rule.if.includes('(')) {
      return [{ type: UNKNOWN_TYPE_RULE, when }];
    }

    const ifRules = rule.if.split('||');
    return ifRules.map((c: string) => {
      const trimmed = c.trim();
      const match = trimmed.match(
        /^\s*(\$?\w+|["'][^"']+["'])\s*(==|!=|=~|!~|>=|<=|>|<)?\s*(.*)?$/,
      );

      if (!match) {
        return { type: ERROR_IF_TYPE_RULE, value: trimmed, when };
      }

      const [, variable, expression, value] = match;

      const hasExpression = !!expression;
      const hasValue = !!(value && value.trim());

      if ((hasExpression && !hasValue) || (!hasExpression && hasValue)) {
        return { type: ERROR_IF_TYPE_RULE, value: trimmed, when };
      }

      return {
        type: IF_TYPE_RULE,
        variable,
        expression: expression || undefined,
        value: value?.trim() || undefined,
        when,
      };
    });
  }
}
