import { useState } from "react";
import type { SelectedRule } from "../utils/types";
import RuleForm from "./ruleForm";
import { DEFAULT_RULE } from "../utils/variables";

interface RulesProps {
  selectedRule: SelectedRule | null;
  setSelectedRule: React.Dispatch<React.SetStateAction<SelectedRule | null>>;
}

const Rules = ({ selectedRule, setSelectedRule }: RulesProps) => {
  const [newSelectedRule, setNewSelectedRule] = useState(selectedRule);
  const [newRule, setNewRule] = useState(false);

  const handleAddRule = () => {
    setNewSelectedRule(DEFAULT_RULE);
    setNewRule(true);
  };

  const handleRemoveRule = () => {
    setNewRule(false);
    setSelectedRule(null);
  };

  return (
    <div>
      {newRule && (
        <RuleForm
          newSelectedRule={newSelectedRule as SelectedRule}
          setNewSelectedRule={
            setNewSelectedRule as React.Dispatch<
              React.SetStateAction<SelectedRule>
            >
          }
          handleRemoveRule={handleRemoveRule}
        ></RuleForm>
      )}
      <button onClick={handleAddRule}>Add new rule</button>
      <button onClick={() => setSelectedRule(newSelectedRule)}>
        Apply rules
      </button>
    </div>
  );
};

export default Rules;
