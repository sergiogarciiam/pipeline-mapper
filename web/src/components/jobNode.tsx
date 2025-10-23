import { forwardRef, type Dispatch, type SetStateAction } from 'react';
import type { Job } from '../utils/types';
import { DangerIcon } from '../utils/icons';

interface JobNodeProps {
  jobId: string;
  jobData: Job;
  selectedJobId: string | null;
  setSelectedJobId: Dispatch<SetStateAction<string | null>>;
  hoveredJobId: string | null;
  setHoveredJobId: Dispatch<SetStateAction<string | null>>;
}
const JobNode = forwardRef<HTMLDivElement, JobNodeProps>(
  ({ jobId, jobData, selectedJobId, setSelectedJobId, hoveredJobId, setHoveredJobId }, ref) => {
    const hasNoExistExtends = jobData.noExistExtends && jobData.noExistExtends.length > 0;
    const hasNoExistNeeds = jobData.noExistNeeds && jobData.noExistNeeds.length > 0;
    const hasNeedsErrors = jobData.needsErrors && jobData.needsErrors.length > 0;
    const isWrongStage = !jobData.stage;

    const isSelected = selectedJobId === jobId;
    const isBlurred =
      (selectedJobId && selectedJobId !== jobId) ||
      (!selectedJobId && hoveredJobId && hoveredJobId !== jobId);

    const handleClick = () => {
      setSelectedJobId(isSelected ? null : jobId);
    };

    return (
      <div
        ref={ref}
        className={`
          border border-gray-300 rounded-sm !p-2 !my-1 cursor-pointer transition duration-200
          ${isSelected ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)] filter blur-0 opacity-100' : ''}
          ${isBlurred ? 'filter blur-[2px] opacity-50' : ''}
          ${jobData.isDisabled ? 'opacity-30' : ''}
        `}
        onMouseEnter={() => !selectedJobId && setHoveredJobId(jobId)}
        onMouseLeave={() => setHoveredJobId(null)}
        onClick={handleClick}
      >
        <div className="job-node__content">
          {jobId}
          {(hasNoExistNeeds || hasNoExistExtends || hasNeedsErrors || isWrongStage) && (
            <DangerIcon />
          )}
        </div>
      </div>
    );
  },
);

export default JobNode;
