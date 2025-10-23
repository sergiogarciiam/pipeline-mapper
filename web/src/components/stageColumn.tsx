import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { Job, PipelineData } from '../utils/types';
import JobNode from './jobNode';

interface StageColumnProps {
  stage: string;
  pipelineData: PipelineData;
  jobRefs: RefObject<{ [key: string]: HTMLDivElement }>;
  selectedJobId: string | null;
  setSelectedJobId: Dispatch<SetStateAction<string | null>>;
  hoveredJobId: string | null;
  setHoveredJobId: Dispatch<SetStateAction<string | null>>;
}

const StageColumn = ({
  stage,
  pipelineData,
  jobRefs,
  selectedJobId,
  setSelectedJobId,
  hoveredJobId,
  setHoveredJobId,
}: StageColumnProps) => {
  const jobs = pipelineData.jobs || {};

  return (
    <div className="flex flex-col gap-2 !p-5 border-[var(--mixed-bg-darker)] rounded-sm border-2 h-fit w-fit">
      <h2>{stage}</h2>
      {Object.keys(jobs).map((jobName) => {
        if (jobs[jobName].stage !== stage) {
          return null;
        }
        return (
          <JobNode
            key={jobName}
            ref={(el) => {
              if (el) jobRefs.current[jobName] = el;
            }}
            jobId={jobName}
            jobData={jobs[jobName] as Job}
            selectedJobId={selectedJobId}
            setSelectedJobId={setSelectedJobId}
            hoveredJobId={hoveredJobId}
            setHoveredJobId={setHoveredJobId}
          />
        );
      })}
    </div>
  );
};
export default StageColumn;
