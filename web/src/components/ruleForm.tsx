import type { SelectedRule } from '../utils/types';
import { EXPRESSIONS, RULES, VARIABLES } from '../utils/constants';

interface RuleFormProps {
  newSelectedRule: SelectedRule;
  setNewSelectedRule: (rule: SelectedRule) => void;
  handleRemoveRule: () => void;
}

const RuleForm = ({ newSelectedRule, setNewSelectedRule, handleRemoveRule }: RuleFormProps) => {
  return (
    <div className="w-full flex justify-between !p-1 bg-[var(--mixed-bg-lighter)] rounded-sm">
      <div className="flex gap-2">
        <select
          value={newSelectedRule.type}
          onChange={(e) => setNewSelectedRule({ ...newSelectedRule, type: e.target.value })}
        >
          {RULES.map((rule) => (
            <option key={rule} value={rule}>
              {rule}
            </option>
          ))}
        </select>

        <select
          value={newSelectedRule.variable}
          onChange={(e) => setNewSelectedRule({ ...newSelectedRule, variable: e.target.value })}
          disabled={newSelectedRule.type !== 'if'}
        >
          {VARIABLES.map((variable) => (
            <option key={variable} value={variable}>
              {variable}
            </option>
          ))}
        </select>

        <select
          value={newSelectedRule.expression}
          onChange={(e) =>
            setNewSelectedRule({
              ...newSelectedRule,
              expression: e.target.value,
            })
          }
          disabled={newSelectedRule.type !== 'if'}
        >
          {EXPRESSIONS.map((expression) => (
            <option key={expression} value={expression}>
              {expression}
            </option>
          ))}
        </select>

        <input
          placeholder="Rule value"
          value={newSelectedRule.value || ''}
          onChange={(e) => setNewSelectedRule({ ...newSelectedRule, value: e.target.value })}
        />
      </div>
      <button onClick={handleRemoveRule}>Remove rule</button>
    </div>
  );
};

export default RuleForm;
