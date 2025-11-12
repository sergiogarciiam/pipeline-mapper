import type { RawRule, Rule } from '../utils/types';
import type { RuleStrategy } from './rules/RuleStrategy';
import { IfRuleStrategy } from './rules/IfRuleStrategy';
import { ExistsRuleStrategy } from './rules/ExistsRuleStrategy';
import { ChangesRuleStrategy } from './rules/ChangesRuleStrategy';
import { WhenRuleStrategy } from './rules/WhenRuleStrategy';
import { DEFAULT_WHEN, UNKNOWN_TYPE_RULE } from '../utils/constants';

export class RuleNormalizer {
  private strategies: RuleStrategy[] = [
    new IfRuleStrategy(),
    new ExistsRuleStrategy(),
    new ChangesRuleStrategy(),
    new WhenRuleStrategy(),
  ];

  normalize(rules: RawRule[]): Rule[] {
    if (!rules) {
      return [];
    }
    const result: Rule[] = [];

    for (const rule of rules) {
      const strategy = this.strategies.find((s) => s.supports(rule));
      if (strategy) {
        result.push(...strategy.normalize(rule));
      } else {
        result.push({ type: UNKNOWN_TYPE_RULE, when: rule.when || DEFAULT_WHEN });
      }
    }

    return result;
  }
}
