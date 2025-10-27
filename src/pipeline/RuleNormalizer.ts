import { Rule } from '../utils/types';
import { RuleStrategy } from './rules/RuleStrategy';
import { IfRuleStrategy } from './rules/IfRuleStrategy';
import { ExistsRuleStrategy } from './rules/ExistsRuleStrategy';
import { ChangesRuleStrategy } from './rules/ChangesRuleStrategy';

export class RuleNormalizer {
  private strategies: RuleStrategy[] = [
    new IfRuleStrategy(),
    new ExistsRuleStrategy(),
    new ChangesRuleStrategy(),
  ];

  normalize(rules: any[]): Rule[] {
    if (!rules) return [];
    const result: Rule[] = [];

    for (const rule of rules) {
      const strategy = this.strategies.find((s) => s.supports(rule));
      if (strategy) result.push(...strategy.normalize(rule));
      else result.push({ type: 'unknown', when: rule.when || 'on_success' });
    }

    return result;
  }
}
