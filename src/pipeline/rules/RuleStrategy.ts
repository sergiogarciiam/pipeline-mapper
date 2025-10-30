import type { RawRule, Rule } from '../../utils/types';

export interface RuleStrategy {
  supports(rule: RawRule): boolean;
  normalize(rule: RawRule): Rule[];
}
