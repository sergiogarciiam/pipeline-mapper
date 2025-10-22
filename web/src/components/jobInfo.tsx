import type { PipelineData } from '../utils/types';

const JobInfo = ({
  activeJobId,
  pipelineData,
}: {
  activeJobId: string | null;
  pipelineData: PipelineData;
}) => {
  return (
    <div className="app__footer-job-info">
      {activeJobId ? (
        <>
          <h2>{activeJobId}</h2>
          <div className="app__footer-job-info-list">
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
            <div className="app__footer-rules">
              <strong>Rules:</strong>
              {pipelineData.jobs[activeJobId] &&
              pipelineData.jobs[activeJobId].rules &&
              pipelineData.jobs[activeJobId].rules.length > 0 ? (
                <ul>
                  {pipelineData.jobs[activeJobId].rules?.map((rule, index) => (
                    <li key={index}>
                      {rule.type} <code>{rule.value}</code>, then <code>{rule.when}</code>
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
