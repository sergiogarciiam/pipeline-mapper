import type { SelectedRule } from "../utils/types";
import { EXPRESSIONS, RULES, VARIABLES } from "../utils/variables";

interface RulesProps {
  selectedRule: SelectedRule;
  setSelectedRule: React.Dispatch<React.SetStateAction<SelectedRule>>;
}

const Rules = ({ selectedRule, setSelectedRule }: RulesProps) => {
  return (
    <div>
      <select
        value={selectedRule.type}
        onChange={(e) =>
          setSelectedRule({ ...selectedRule, type: e.target.value })
        }
      >
        {RULES.map((rule) => (
          <option key={rule} className="app__rule" value={rule}>
            {rule}
          </option>
        ))}
      </select>
      <select
        value={selectedRule.variable}
        onChange={(e) =>
          setSelectedRule({ ...selectedRule, variable: e.target.value })
        }
        disabled={selectedRule.type !== "if"}
      >
        {VARIABLES.map((variable) => (
          <option key={variable} className="app__rule" value={variable}>
            {variable}
          </option>
        ))}
      </select>
      <select
        value={selectedRule.expression}
        onChange={(e) =>
          setSelectedRule({ ...selectedRule, expression: e.target.value })
        }
        disabled={selectedRule.type !== "if"}
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
        value={selectedRule.value}
        onChange={(e) =>
          setSelectedRule({ ...selectedRule, value: e.target.value })
        }
      />
    </div>
  );
};

export default Rules;
