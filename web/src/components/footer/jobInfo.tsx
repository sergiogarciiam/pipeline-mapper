import type { Dispatch, SetStateAction } from 'react';
import type { PipelineData, Rule, SelectedRule } from '../../utils/types';
import { DEFAULT_RULE_TYPE } from '../../utils/constants';

interface JobInfoProps {
  activeJobId: string | null;
  pipelineData: PipelineData;
  setSelectedRules: Dispatch<SetStateAction<SelectedRule[]>>;
}

const JobInfo = ({ activeJobId, pipelineData, setSelectedRules }: JobInfoProps) => {
  const handleAddRule = (rule: Rule) => {
    const selectedRule = getSelectedRule(rule);
    setSelectedRules((prev) => [...prev, selectedRule]);
  };

  const getSelectedRule = (rule: Rule) => {
    switch (rule.type) {
      case 'if': {
        const [variable, expression, value] = rule.value.split(' ');
        return { type: rule.type, variable, expression, value };
      }
      case 'changes':
      case 'exists':
        return { type: rule.type, variable: '', expression: '', value: rule.value };
      case 'unknown':
      case 'default':
        return { type: rule.type, variable: '', expression: '', value: '' };
    }
  };

  return (
    <div className="flex flex-col gap-2 !p-2 h-full w-full overflow-y-auto transition duration-200">
      {activeJobId ? (
        <>
          <h2>{activeJobId}</h2>
          <div className="!ml-3">
            <p>
              <strong>Include:</strong>{' '}
              {pipelineData.jobs[activeJobId] ? pipelineData.jobs[activeJobId].includePath : 'N/A'}
            </p>
            <p>
              <strong>Stage:</strong>{' '}
              {pipelineData.jobs[activeJobId] ? pipelineData.jobs[activeJobId].stage : 'N/A'}
            </p>
            <p>
              <strong>Extends:</strong>{' '}
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].extends &&
              pipelineData.jobs[activeJobId].extends.length > 0
                ? pipelineData.jobs[activeJobId].extends?.join(', ')
                : 'N/A'}
            </p>
            <p>
              <strong>Needs:</strong>{' '}
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].needs &&
              pipelineData.jobs[activeJobId].needs.length > 0
                ? pipelineData.jobs[activeJobId].needs?.join(', ')
                : 'N/A'}
            </p>
            <div>
              <strong>Rules:</strong>
              {pipelineData.jobs[activeJobId] && pipelineData.jobs[activeJobId].rules.length > 0 ? (
                <ul className="!ml-5 flex flex-col gap-2">
                  {pipelineData.jobs[activeJobId].rules?.map((rule, index) => (
                    <li key={index} className="flex gap-2">
                      <p>
                        {rule.type} {'value' in rule && <code>{rule.value}</code>}, then{' '}
                        <code>{rule.when}</code>
                      </p>
                      {rule.type !== DEFAULT_RULE_TYPE && (
                        <button
                          className="!p-0 !px-1 text-xs justify-self-start"
                          onClick={() => handleAddRule(rule)}
                        >
                          Add rule
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                ' N/A'
              )}
            </div>
          </div>
        </>
      ) : (
        <h2>No job selected</h2>
      )}
    </div>
  );
};

export default JobInfo;
