import { useEffect, useState } from 'react';
import type { SelectedRule } from '../../utils/types';
import { DEFAULT_RULE } from '../../utils/constants';
import RuleForm from './ruleForm';

interface RulesProps {
  selectedRules: SelectedRule[];
  setSelectedRules: React.Dispatch<React.SetStateAction<SelectedRule[]>>;
}

const Rules = ({ selectedRules, setSelectedRules }: RulesProps) => {
  const [newSelectedRules, setNewSelectedRules] = useState(selectedRules);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const isDifferent = JSON.stringify(newSelectedRules) !== JSON.stringify(selectedRules);
    setHasChanges(isDifferent);
  }, [newSelectedRules, selectedRules]);

  const handleAddRule = () => {
    setNewSelectedRules((prev) => [...prev, DEFAULT_RULE]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = newSelectedRules.filter((_, i) => i !== index);
    setNewSelectedRules(newRules);
  };

  const handleUpdateRule = (index: number, updatedRule: SelectedRule) => {
    setNewSelectedRules((prev) => prev.map((rule, i) => (i === index ? updatedRule : rule)));
  };

  const handleApplyRules = () => {
    setSelectedRules(newSelectedRules);
  };

  return (
    <div className="flex flex-col gap-4 h-[150px] w-2/5 overflow-y-auto relative p-2.5">
      <div className="sticky top-0 flex justify-between items-center bg-[var(--mixed-bg-darker)] !pb-2 rounded-sm">
        <h2>Rules</h2>
        <div className="flex gap-2">
          <button onClick={handleApplyRules} disabled={!hasChanges}>
            Apply rules
          </button>
          <button onClick={handleAddRule}>Add new rule</button>
        </div>
      </div>
      {newSelectedRules.length !== 0 &&
        newSelectedRules.map((rule, index) => (
          <RuleForm
            key={index}
            newSelectedRule={rule}
            setNewSelectedRule={(updatedRule) => handleUpdateRule(index, updatedRule)}
            handleRemoveRule={() => handleRemoveRule(index)}
          />
        ))}
    </div>
  );
};

export default Rules;
