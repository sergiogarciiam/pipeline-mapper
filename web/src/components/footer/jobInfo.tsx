import type { Dispatch, SetStateAction } from 'react';
import type { PipelineData, Rule, SelectedRule } from '../../utils/types';
import { DEFAULT_TYPE_RULE, ERROR_IF_TYPE_RULE } from '../../utils/constants';

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

  const getSelectedRule = (rule: Rule): SelectedRule => {
    switch (rule.type) {
      case 'if': {
        const { variable, expression, value } = rule;
        return { type: rule.type, variable, expression, value };
      }
      case 'changes':
      case 'exists':
        return { type: rule.type, variable: '', expression: '', value: rule.value };
      default:
        return { type: rule.type, variable: '', expression: '', value: '' };
    }
  };

  const job = activeJobId ? pipelineData.jobs[activeJobId] : null;

  return (
    <div className="flex flex-col gap-2 !p-2 h-full w-full overflow-y-auto transition duration-200">
      {job ? (
        <>
          <h2>{activeJobId}</h2>
          <div className="!ml-3">
            <p>
              <strong>Include:</strong> {job.includePath || 'N/A'}
            </p>
            <p>
              <strong>Stage:</strong> {job.stage || 'N/A'}
            </p>
            <p>
              <strong>Extends:</strong> {job.extends?.length ? job.extends.join(', ') : 'N/A'}
            </p>
            <p>
              <strong>Needs:</strong> {job.needs?.length ? job.needs.join(', ') : 'N/A'}
            </p>

            <div>
              <strong>Rules:</strong>
              {job.rules && job.rules.length > 0 ? (
                <ul className="!ml-5 flex flex-col gap-2">
                  {job.rules
                    .filter((rule) => rule.type !== ERROR_IF_TYPE_RULE)
                    .map((rule, index) => (
                      <li key={index} className="flex gap-2">
                        <p>
                          {rule.type}{' '}
                          <code>
                            {'variable' in rule && rule.variable}{' '}
                            {'expression' in rule && rule.expression}{' '}
                            {'value' in rule && rule.value}
                          </code>
                          , then <code>{rule.when}</code>
                        </p>

                        {rule.type !== DEFAULT_TYPE_RULE && (
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
