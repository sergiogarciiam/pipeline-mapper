import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { SelectedRule } from '../../utils/types';
import { DEFAULT_RULE } from '../../utils/constants';
import RuleForm from './ruleForm';
import { v4 as uuidv4 } from 'uuid';

interface RulesProps {
  selectedRules: SelectedRule[];
  setSelectedRules: React.Dispatch<React.SetStateAction<SelectedRule[]>>;
  setSelectedJobId: Dispatch<SetStateAction<string | null>>;
}

const Rules = ({ selectedRules, setSelectedRules, setSelectedJobId }: RulesProps) => {
  useEffect(() => {
    setSelectedJobId(null);
  }, [selectedRules, setSelectedJobId]);

  const handleAddRule = () => {
    setSelectedRules((prev) => [...prev, { ...DEFAULT_RULE, id: uuidv4() }]);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = selectedRules.filter((_, i) => i !== index);
    setSelectedRules(newRules);
  };

  const handleUpdateRule = (index: number, updatedRule: SelectedRule) => {
    setSelectedRules((prev) => prev.map((rule, i) => (i === index ? updatedRule : rule)));
  };

  return (
    <div className="flex flex-col gap-4 h-[150px] w-2/5 overflow-y-auto relative p-2.5">
      <div className="sticky top-0 flex justify-between items-center bg-[var(--mixed-bg-darker)] !pb-2 rounded-sm">
        <h2>Rules</h2>
        <div className="flex gap-2">
          <button onClick={handleAddRule}>Add new rule</button>
        </div>
      </div>
      {selectedRules.length !== 0 &&
        selectedRules.map((rule, index) => (
          <RuleForm
            key={rule.id}
            newSelectedRule={rule}
            setNewSelectedRule={(updatedRule) => handleUpdateRule(index, updatedRule)}
            handleRemoveRule={() => handleRemoveRule(index)}
          />
        ))}
    </div>
  );
};

export default Rules;
