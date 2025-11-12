import type { SelectedRule } from '../../utils/types';
import {
  RULES_EXPRESSIONS,
  IF_TYPE_RULE,
  RULES_TYPES,
  IF_RULES_VARIABLES,
} from '../../utils/constants';
import { TrashIcon } from '../other/icons';

interface RuleFormProps {
  newSelectedRule: SelectedRule;
  setNewSelectedRule: (rule: SelectedRule) => void;
  handleRemoveRule: () => void;
}

const RuleForm = ({ newSelectedRule, setNewSelectedRule, handleRemoveRule }: RuleFormProps) => {
  const isCustomVariable = !IF_RULES_VARIABLES.includes(newSelectedRule.variable);
  return (
    <form className="w-fit flex justify-between !p-1 bg-[var(--mixed-bg-lighter)] rounded-sm gap-2">
      <div className="flex gap-2 h-fit">
        <select
          value={newSelectedRule.type}
          onChange={(e) => setNewSelectedRule({ ...newSelectedRule, type: e.target.value })}
        >
          {RULES_TYPES.map((rule) => (
            <option key={rule} value={rule}>
              {rule}
            </option>
          ))}
        </select>

        <div className="flex flex-col gap-2">
          <select
            value={newSelectedRule.variable}
            onChange={(e) => setNewSelectedRule({ ...newSelectedRule, variable: e.target.value })}
            disabled={newSelectedRule.type !== IF_TYPE_RULE}
            className="disabled:bg-[var(--vscode-input-disabledBackground)] disabled:text-[var(--vscode-disabledForeground)] disabled:opacity-25"
          >
            {IF_RULES_VARIABLES.map((variable) => (
              <option key={variable} value={variable}>
                {variable}
              </option>
            ))}
            <option value={isCustomVariable ? newSelectedRule.variable : ''}>
              Custom variable...
            </option>
          </select>
          <input
            type="text"
            disabled={!isCustomVariable}
            placeholder='e.g. "$SKIP_BUILD" or "$SKIP_DEPLOY"'
            value={isCustomVariable ? newSelectedRule.variable : ''}
            onChange={(e) =>
              setNewSelectedRule({
                ...newSelectedRule,
                variable: e.target.value,
              })
            }
            className="disabled:bg-[var(--vscode-input-disabledBackground)] disabled:text-[var(--vscode-disabledForeground)] disabled:opacity-25"
          />
        </div>

        <select
          value={newSelectedRule.expression}
          onChange={(e) =>
            setNewSelectedRule({
              ...newSelectedRule,
              expression: e.target.value,
            })
          }
          disabled={newSelectedRule.type !== IF_TYPE_RULE}
          className="disabled:bg-[var(--vscode-input-disabledBackground)] disabled:text-[var(--vscode-disabledForeground)] disabled:opacity-25"
        >
          {RULES_EXPRESSIONS.map((expression) => (
            <option key={expression} value={expression}>
              {expression}
            </option>
          ))}
        </select>

        <input
          placeholder={
            newSelectedRule.type === IF_TYPE_RULE ? 'e.g. "main" or "true"' : 'Enter value'
          }
          value={newSelectedRule.value || ''}
          onChange={(e) => setNewSelectedRule({ ...newSelectedRule, value: e.target.value })}
        />
      </div>
      <button type="button" onClick={handleRemoveRule}>
        <TrashIcon></TrashIcon>
      </button>
    </form>
  );
};

export default RuleForm;
