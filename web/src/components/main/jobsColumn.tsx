import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { Job, PipelineData } from '../../utils/types';
import JobNode from './jobNode';
import { NO_STAGE_DEFINED_COLUMN } from '../../utils/constants';

interface JobsColumnProps {
  column: string | number;
  pipelineData: PipelineData;
  jobRefs: RefObject<Record<string, HTMLDivElement>>;
  selectedJobId: string | null;
  setSelectedJobId: Dispatch<SetStateAction<string | null>>;
  hoveredJobId: string | null;
  setHoveredJobId: Dispatch<SetStateAction<string | null>>;
}

const JobsColumn = ({
  column,
  pipelineData,
  jobRefs,
  selectedJobId,
  setSelectedJobId,
  hoveredJobId,
  setHoveredJobId,
}: JobsColumnProps) => {
  const jobs = pipelineData.jobs || {};

  const isStageGroup = typeof column === 'string';
  const isUndefinedStageGroup = isStageGroup && column === NO_STAGE_DEFINED_COLUMN;

  const filteredJobs = Object.entries(jobs).filter(([, job]) =>
    isUndefinedStageGroup
      ? !job.stage
      : isStageGroup
        ? job.stage === column
        : job.needGroup === column,
  );

  return (
    <div className="flex flex-col gap-2 !p-5 border-[var(--mixed-bg-darker)] rounded-sm border-2 h-fit w-fit">
      <h2>{isStageGroup ? `${column}` : null}</h2>

      {filteredJobs.map(([jobName, job]) => (
        <JobNode
          key={jobName}
          ref={(el) => {
            if (el) jobRefs.current[jobName] = el;
          }}
          jobId={jobName}
          jobData={job as Job}
          selectedJobId={selectedJobId}
          setSelectedJobId={setSelectedJobId}
          hoveredJobId={hoveredJobId}
          setHoveredJobId={setHoveredJobId}
        />
      ))}
    </div>
  );
};

export default JobsColumn;
