import type { RawRule, Rule } from '../utils/types';
import type { RuleStrategy } from './rules/RuleStrategy';
import { IfRuleStrategy } from './rules/IfRuleStrategy';
import { ExistsRuleStrategy } from './rules/ExistsRuleStrategy';
import { ChangesRuleStrategy } from './rules/ChangesRuleStrategy';
import { WhenRuleStrategy } from './rules/WhenRuleStrategy';

export class RuleNormalizer {
  private strategies: RuleStrategy[] = [
    new WhenRuleStrategy(),
    new IfRuleStrategy(),
    new ExistsRuleStrategy(),
    new ChangesRuleStrategy(),
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
        result.push({ type: 'unknown', when: rule.when || 'on_success' });
      }
    }

    return result;
  }
}
