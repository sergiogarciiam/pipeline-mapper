import { useState } from "react";
import type { SelectedRule } from "../utils/types";
import RuleForm from "./ruleForm";
import { DEFAULT_RULE } from "../utils/variables";

interface RulesProps {
  selectedRules: SelectedRule[];
  setSelectedRules: React.Dispatch<React.SetStateAction<SelectedRule[]>>;
}

const Rules = ({ selectedRules, setSelectedRules }: RulesProps) => {
  const [newSelectedRules, setNewSelectedRules] = useState(selectedRules);

  const handleAddRule = () => {
    setNewSelectedRules((prev) => [...prev, DEFAULT_RULE]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = newSelectedRules.filter((_, i) => i !== index);
    setNewSelectedRules(newRules);
  };

  const handleUpdateRule = (index: number, updatedRule: SelectedRule) => {
    setNewSelectedRules((prev) =>
      prev.map((rule, i) => (i === index ? updatedRule : rule))
    );
  };

  const handleApplyRules = () => {
    setSelectedRules(newSelectedRules);
  };

  return (
    <div className="app__rules-container">
      <div className="app__rules-header">
        <h2>Rules</h2>
        <div>
          <button onClick={handleApplyRules}>Apply rules</button>
          <button onClick={handleAddRule}>Add new rule</button>
        </div>
      </div>
      {newSelectedRules.length !== 0 &&
        newSelectedRules.map((rule, index) => (
          <RuleForm
            key={index}
            newSelectedRule={rule}
            setNewSelectedRule={(updatedRule) =>
              handleUpdateRule(index, updatedRule)
            }
            handleRemoveRule={() => handleRemoveRule(index)}
          />
        ))}
    </div>
  );
};

export default Rules;
