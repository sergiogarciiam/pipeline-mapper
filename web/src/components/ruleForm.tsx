import type { SelectedRule } from "../utils/types";
import { EXPRESSIONS, RULES, VARIABLES } from "../utils/variables";

interface RuleFormProps {
  newSelectedRule: SelectedRule;
  setNewSelectedRule: React.Dispatch<React.SetStateAction<SelectedRule>>;
  handleRemoveRule: () => void;
}

const RuleForm = ({
  newSelectedRule,
  setNewSelectedRule,
  handleRemoveRule,
}: RuleFormProps) => {
  return (
    <div>
      <select
        value={newSelectedRule.type}
        onChange={(e) =>
          setNewSelectedRule({ ...newSelectedRule, type: e.target.value })
        }
      >
        {RULES.map((rule) => (
          <option key={rule} className="app__rule" value={rule}>
            {rule}
          </option>
        ))}
      </select>
      <select
        value={newSelectedRule.variable}
        onChange={(e) =>
          setNewSelectedRule({ ...newSelectedRule, variable: e.target.value })
        }
        disabled={newSelectedRule.type !== "if"}
      >
        {VARIABLES.map((variable) => (
          <option key={variable} className="app__rule" value={variable}>
            {variable}
          </option>
        ))}
      </select>
      <select
        value={newSelectedRule.expression}
        onChange={(e) =>
          setNewSelectedRule({ ...newSelectedRule, expression: e.target.value })
        }
        disabled={newSelectedRule.type !== "if"}
      >
        {EXPRESSIONS.map((expression) => (
          <option key={expression} className="app__rule" value={expression}>
            {expression}
          </option>
        ))}
      </select>
      <input
        className="app__rule app__rule--value"
        placeholder="Rule value"
        value={newSelectedRule.value}
        onChange={(e) =>
          setNewSelectedRule({ ...newSelectedRule, value: e.target.value })
        }
      />

      <button onClick={handleRemoveRule}>Remove rule</button>
    </div>
  );
};

export default RuleForm;
