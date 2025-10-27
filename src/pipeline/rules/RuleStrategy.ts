import { Rule } from '../../utils/types';

export interface RuleStrategy {
  supports(rule: any): boolean;
  normalize(rule: any): Rule[];
}
